import express from "express";
import mongoose from "mongoose";
import POSSession from "../models/POSSession.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

/* ════════════════════════════════════════
   GET /api/pos/session/current
   Returns the current open session
   ════════════════════════════════════════ */
router.get("/session/current", async (req, res) => {
  try {
    const session = await POSSession.findOne({ status: "open" }).sort({
      openedAt: -1,
    });
    res.json(session || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/pos/session/open
   Open a new shift
   ════════════════════════════════════════ */
router.post("/session/open", async (req, res) => {
  try {
    const existing = await POSSession.findOne({ status: "open" });
    if (existing)
      return res
        .status(400)
        .json({ message: "A shift is already open", session: existing });

    const { openingCash = 0, terminal = "Main", notes = "" } = req.body;

    const session = await POSSession.create({
      operator: req.user.name,
      operatorId: req.user._id,
      terminal,
      openingCash: Number(openingCash),
      expectedCash: Number(openingCash),
      notes,
      cashMovements: [
        {
          type: "opening",
          amount: Number(openingCash),
          note: "Opening cash",
        },
      ],
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/pos/session/close
   Close current shift
   ════════════════════════════════════════ */
router.post("/session/close", async (req, res) => {
  try {
    const session = await POSSession.findOne({ status: "open" });
    if (!session)
      return res.status(404).json({ message: "No open shift found" });

    const { closingCash = 0, notes = "" } = req.body;

    session.status = "closed";
    session.closedAt = new Date();
    session.closingCash = Number(closingCash);
    if (notes) session.notes = notes;
    session.cashMovements.push({
      type: "closing",
      amount: Number(closingCash),
      note: "Closing cash count",
    });

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/pos/session/cash
   Add cash in/out movement
   ════════════════════════════════════════ */
router.post("/session/cash", async (req, res) => {
  try {
    const session = await POSSession.findOne({ status: "open" });
    if (!session) return res.status(404).json({ message: "No open shift" });

    const { type, amount, note = "" } = req.body;
    if (!["in", "out"].includes(type))
      return res.status(400).json({ message: "type must be in or out" });

    session.cashMovements.push({ type, amount: Number(amount), note });
    session.expectedCash += type === "in" ? Number(amount) : -Number(amount);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/pos/sessions
   List all sessions (admin)
   ════════════════════════════════════════ */
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await POSSession.find().sort({ openedAt: -1 }).limit(30);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/pos/sale
   Process a POS sale — checks stock, creates order, updates session
   ════════════════════════════════════════ */
router.post("/sale", async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const session = await POSSession.findOne({ status: "open" });
    if (!session)
      return res
        .status(400)
        .json({ message: "No open shift — please open a shift first" });

    const {
      items,
      paymentMethod = "cash",
      amountPaid = 0,
      discount = 0,
      customerName = "",
      customerEmail = "",
      customerPhone = "",
      note = "",
    } = req.body;

    if (!items?.length)
      return res.status(400).json({ message: "No items in sale" });

    const cleanItems = [];
    let subtotal = 0;

    /* ── Check & deduct stock ── */
    for (const item of items) {
      const product = await Product.findById(item.productId).session(dbSession);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.qty) {
        throw new Error(
          `Insufficient stock for "${product.title}" (available: ${product.stock})`,
        );
      }
      product.stock -= item.qty;
      await product.save({ session: dbSession });

      const lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      cleanItems.push({
        productId: String(product._id),
        title: product.title,
        image: product.image || "",
        price: product.price,
        qty: item.qty,
        category: product.category || "",
      });
    }

    const discountAmt = Number(discount);
    const total = Math.max(0, subtotal - discountAmt);
    const change =
      paymentMethod === "cash" ? Math.max(0, Number(amountPaid) - total) : 0;

    /* ── Create order ── */
    const [order] = await Order.create(
      [
        {
          customer: {
            firstName: customerName.split(" ")[0] || "POS",
            lastName: customerName.split(" ").slice(1).join(" ") || "Customer",
            email: customerEmail || "pos@buybee.local",
            phone: customerPhone || "—",
            address: "In-store",
            city: "In-store",
            country: "Sri Lanka",
          },
          items: cleanItems,
          subtotal,
          shippingFee: 0,
          discount: discountAmt,
          total,
          paymentMethod: paymentMethod === "cash" ? "cod" : "card",
          paymentStatus: "paid",
          status: "delivered",
          notes: `POS Sale | Shift: ${session._id} | Operator: ${session.operator}${note ? " | " + note : ""}`,
        },
      ],
      { session: dbSession },
    );

    /* ── Update session totals ── */
    session.totalSales += total;
    session.totalOrders += 1;
    if (paymentMethod === "cash") {
      session.totalCash += total;
      session.expectedCash += total;
    } else {
      session.totalCard += total;
    }
    await session.save({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    res
      .status(201)
      .json({
        order,
        change,
        amountPaid: Number(amountPaid),
        sessionId: session._id,
      });
  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("❌ POS sale error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/pos/sales
   Recent POS sales for current session
   ════════════════════════════════════════ */
router.get("/sales", async (req, res) => {
  try {
    const session = await POSSession.findOne({ status: "open" });
    if (!session) return res.json([]);

    const orders = await Order.find({
      notes: { $regex: String(session._id), $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
