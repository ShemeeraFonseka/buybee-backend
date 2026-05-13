import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderConfirmation, sendAdminAlert } from "../utils/mailer.js";

const router = express.Router();

/* ════════════════════════════════════════
   POST /api/orders  — place a new order
   Checks stock, deducts on success
   ════════════════════════════════════════ */
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customer,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      notes,
    } = req.body;

    if (!customer || !items?.length)
      return res
        .status(400)
        .json({ message: "Customer info and items are required" });

    const resolvedPaymentMethod =
      paymentMethod || customer.paymentMethod || "cod";
    const { paymentMethod: _pm, notes: _notes, ...cleanCustomer } = customer;

    const cleanItems = items.map((item) => ({
      productId: item.productId ? String(item.productId) : "",
      title: String(item.title),
      image: item.image || "",
      price: Number(item.price),
      qty: Number(item.qty),
      category: item.category || "",
    }));

    /* ── Step 1: Check stock for every item ── */
    const outOfStock = [];
    const stockUpdates = [];

    for (const item of cleanItems) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId).session(session);
      if (!product) continue;

      if (product.stock < item.qty) {
        outOfStock.push({
          title: product.title,
          requested: item.qty,
          available: product.stock,
        });
      } else {
        stockUpdates.push({ product, qty: item.qty });
      }
    }

    if (outOfStock.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Some items are out of stock",
        outOfStock,
      });
    }

    /* ── Step 2: Deduct stock ── */
    for (const { product, qty } of stockUpdates) {
      product.stock -= qty;
      await product.save({ session });
    }

    /* ── Step 3: Create order ── */
    const [order] = await Order.create(
      [
        {
          customer: cleanCustomer,
          items: cleanItems,
          subtotal: Number(subtotal),
          shippingFee: Number(shippingFee ?? 0),
          discount: Number(discount ?? 0),
          total: Number(total),
          paymentMethod: resolvedPaymentMethod,
          notes: notes || _notes || "",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // Fire emails — don't await
    sendOrderConfirmation(order);
    sendAdminAlert(order);

    res.status(201).json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Order creation error:", err.message);
    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors).map(
        (k) => `${k}: ${err.errors[k].message}`,
      );
      return res.status(400).json({ message: "Validation failed", fields });
    }
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/orders  — list all orders
   ════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 15, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { "customer.firstName": { $regex: search, $options: "i" } },
        { "customer.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      orders,
      total,
      page: Number(page),
      limit: Number(limit),
      statusCounts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/orders/:id
   ════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   PATCH /api/orders/:id  — update status / payment
   Restores stock when order is cancelled
   ════════════════════════════════════════ */
router.patch("/:id", async (req, res) => {
  try {
    const allowed = ["status", "paymentStatus", "notes"];
    const update = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });

    const prevOrder = await Order.findById(req.params.id);
    if (!prevOrder) return res.status(404).json({ message: "Order not found" });

    /* ── Restore stock if cancelling a non-cancelled order ── */
    if (update.status === "cancelled" && prevOrder.status !== "cancelled") {
      for (const item of prevOrder.items) {
        if (!item.productId) continue;
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty },
        });
      }
      console.log(
        `♻️  Stock restored for cancelled order ${prevOrder.orderNumber}`,
      );
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   DELETE /api/orders/:id
   ════════════════════════════════════════ */
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
