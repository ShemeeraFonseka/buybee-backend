import express from "express";
import AboutContent from "../models/AboutContent.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const DEFAULT_STATS = [
  { num: "50K+", label: "Happy Customers" },
  { num: "1.2M+", label: "Products Listed" },
  { num: "98%", label: "Satisfaction Rate" },
  { num: "24/7", label: "Customer Support" },
];
const DEFAULT_VALUES = [
  {
    icon: "🤝",
    title: "Trust First",
    desc: "Every transaction on BuyBee is backed by our buyer protection guarantee.",
  },
  {
    icon: "⚡",
    title: "Speed & Ease",
    desc: "From browsing to doorstep — we obsess over making every step fast and effortless.",
  },
  {
    icon: "🌱",
    title: "Sustainability",
    desc: "We partner with eco-conscious sellers and offset our carbon footprint.",
  },
  {
    icon: "🎯",
    title: "Curated Quality",
    desc: "Our team reviews every seller to ensure you only get the best.",
  },
  {
    icon: "💡",
    title: "Constant Innovation",
    desc: "From AI-powered recommendations to same-day delivery — we never stop building.",
  },
  {
    icon: "❤️",
    title: "Community Driven",
    desc: "BuyBee was built for Sri Lanka, by Sri Lankans. We grow together.",
  },
];
const DEFAULT_TIMELINE = [
  {
    year: "2023",
    title: "The Idea",
    desc: "BuyBee was born from a simple frustration — online shopping in Sri Lanka was too complicated.",
  },
  {
    year: "2024",
    title: "First Launch",
    desc: "We launched with 50 sellers and 5,000 products. Within 3 months, 1,000 customers served.",
  },
  {
    year: "2025",
    title: "Rapid Growth",
    desc: "Expanded to all provinces. Introduced same-day delivery in Colombo and Western Province.",
  },
  {
    year: "2026",
    title: "What's Next",
    desc: "International expansion, new payment options, and smarter shopping powered by AI.",
  },
];
const DEFAULT_TEAM = [
  {
    name: "Shemeera Fonseka",
    role: "Founder & CEO",
    avatar: "S",
    bg: "#FDE8C8",
  },
  {
    name: "Dilshan Perera",
    role: "Head of Technology",
    avatar: "D",
    bg: "#E8F5E9",
  },
  {
    name: "Ayesha Fernando",
    role: "Head of Operations",
    avatar: "A",
    bg: "#E3F2FD",
  },
  {
    name: "Kasun Rajapaksa",
    role: "Head of Marketing",
    avatar: "K",
    bg: "#F3E5F5",
  },
];

const seed = async () => {
  const count = await AboutContent.countDocuments();
  if (count === 0)
    await AboutContent.create({
      stats: DEFAULT_STATS,
      values: DEFAULT_VALUES,
      timeline: DEFAULT_TIMELINE,
      team: DEFAULT_TEAM,
    });
};

/* GET /api/about-content — public */
router.get("/", async (req, res) => {
  try {
    await seed();
    const doc = await AboutContent.findOne();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PATCH /api/about-content — update flat fields */
router.patch("/", protect, async (req, res) => {
  try {
    const doc = await AboutContent.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ── Generic array sub-routes for stats/values/timeline/team ── */
["stats", "values", "timeline", "team"].forEach((arr) => {
  router.post(`/${arr}`, protect, async (req, res) => {
    try {
      const doc = await AboutContent.findOne();
      doc[arr].push(req.body);
      await doc.save();
      res.json(doc[arr][doc[arr].length - 1]);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  router.patch(`/${arr}/:id`, protect, async (req, res) => {
    try {
      const doc = await AboutContent.findOne();
      const item = doc[arr].id(req.params.id);
      if (!item) return res.status(404).json({ message: "Item not found" });
      Object.assign(item, req.body);
      await doc.save();
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  router.delete(`/${arr}/:id`, protect, async (req, res) => {
    try {
      const doc = await AboutContent.findOne();
      doc[arr].pull(req.params.id);
      await doc.save();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
});

export default router;
