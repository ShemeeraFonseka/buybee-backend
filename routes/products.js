import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* ════════════════════════════════════════
   GET /api/products/low-stock
   Returns products with stock <= threshold
   ════════════════════════════════════════ */
router.get("/low-stock", async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const products = await Product.find({ stock: { $lte: threshold } })
      .sort({ stock: 1 })
      .select("title stock category image bg");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/products
   Query params:
     ?search=   text search
     ?category= filter by category
     ?tag=      filter by tag (hot|new|sale)
     ?sort=     price_asc | price_desc | newest | rating
     ?page=     page number (default 1)
     ?limit=    items per page (default 12)
   ════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      tag,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category && category !== "All") filter.category = category;
    if (tag) filter.tag = tag;

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      rating: { stars: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const items = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Return all unique categories for the filter sidebar
    const categories = await Product.distinct("category");

    res.json({
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      categories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/products/:id
   ════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/products
   ════════════════════════════════════════ */
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   PATCH /api/products/:id
   ════════════════════════════════════════ */
router.patch("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   DELETE /api/products/:id
   ════════════════════════════════════════ */
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
