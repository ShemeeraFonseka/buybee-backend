import express from "express";
import SiteContent from "../models/SiteContent.js";

const router = express.Router();
const SITE_ID = "buybee";

/* ── Seed defaults if no document exists yet ── */
const DEFAULT = {
  siteId: SITE_ID,
  hero: {
    badge: "Now live in Sri Lanka & worldwide",
    titleMain: "Shop Smarter,",
    titleEmph: "Live Better",
    sub: "BuyBee brings thousands of products to your fingertips — from daily essentials to luxury finds — all in one beautiful, fast, and trusted marketplace.",
    btnPrimary: "Shop Now →",
    btnSecondary: "How it works",
  },
  promo: {
    label: "Limited time offer",
    title: "Up to 70% off on your first order",
    sub: "New to BuyBee? Use code BEE70 at checkout and enjoy massive savings on your very first purchase.",
    code: "BEE70",
    btn: "Claim your discount →",
    bigNum: "70%",
  },
  stats: [
    { num: "250K+", label: "Happy customers" },
    { num: "1.2M+", label: "Products listed" },
    { num: "98%", label: "On-time delivery" },
    { num: "15K+", label: "Trusted sellers" },
  ],
  features: [
    {
      icon: "⚡",
      title: "Lightning Fast Delivery",
      desc: "Same-day delivery in major cities. Real-time tracking so you always know where your order is — down to the minute.",
    },
    {
      icon: "🔒",
      title: "Secure Payments",
      desc: "Bank-grade encryption on every transaction. Pay via card, digital wallet, or cash on delivery — your choice, always safe.",
    },
    {
      icon: "🔄",
      title: "Hassle-Free Returns",
      desc: "Not happy? Return it within 30 days, no questions asked. Full refunds processed within 24 hours.",
    },
    {
      icon: "🤖",
      title: "Smart Recommendations",
      desc: "AI-powered discovery finds products you'll love before you even know you want them. Your personal shopper, always on.",
    },
    {
      icon: "💬",
      title: "24/7 Live Support",
      desc: "Real humans available around the clock. Chat, call, or email — we're here whenever you need us, no bots.",
    },
    {
      icon: "🎁",
      title: "BuyBee Rewards",
      desc: "Earn honey points on every purchase. Redeem for discounts, free shipping, or exclusive member-only deals.",
    },
  ],
  categories: [
    { emoji: "📱", name: "Electronics", count: "12,450 products" },
    { emoji: "👗", name: "Fashion", count: "38,200 products" },
    { emoji: "🏠", name: "Home & Living", count: "21,800 products" },
    { emoji: "💄", name: "Beauty & Care", count: "9,640 products" },
    { emoji: "🎮", name: "Gaming", count: "5,320 products" },
    { emoji: "🏋️", name: "Sports & Fitness", count: "14,900 products" },
    { emoji: "📚", name: "Books & Media", count: "7,200 products" },
    { emoji: "🧸", name: "Toys & Kids", count: "6,750 products" },
  ],
  products: [
    {
      image:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
      bg: "#FDE8C8",
      tag: "hot",
      tagLabel: "🔥 Hot",
      cat: "Electronics",
      title: "Wireless Earbuds Pro X",
      stars: "★★★★★",
      reviews: "2.1k",
      price: "$49.99",
      oldPrice: "$79.99",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      bg: "#D4F0E8",
      tag: "new",
      tagLabel: "New",
      cat: "Electronics",
      title: "Smart Watch Series 9",
      stars: "★★★★★",
      reviews: "876",
      price: "$199.99",
      oldPrice: "",
    },
    {
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      bg: "#EDE8FC",
      tag: "sale",
      tagLabel: "−40%",
      cat: "Fashion",
      title: "Air Runner Sneakers",
      stars: "★★★★☆",
      reviews: "1.4k",
      price: "$59.99",
      oldPrice: "$99.99",
    },
    {
      image:
        "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=400&q=80",
      bg: "#FCF0D4",
      tag: "hot",
      tagLabel: "🔥 Hot",
      cat: "Home & Living",
      title: "Premium Coffee Maker",
      stars: "★★★★★",
      reviews: "3.2k",
      price: "$129.99",
      oldPrice: "$159.99",
    },
  ],
  testimonials: [
    {
      text: "BuyBee completely changed how I shop online. The delivery is insanely fast and the app is so clean and easy to use. I've recommended it to everyone I know!",
      avatar: "👩",
      avatarBg: "#FDE8C8",
      name: "Ayesha Perera",
      role: "Verified Buyer · Colombo",
    },
    {
      text: "I was skeptical at first but the seller ratings and buyer protection really work. Had a small issue with my order and support resolved it within 20 minutes. Incredible.",
      avatar: "👨",
      avatarBg: "#D4F0E8",
      name: "Kamal Wijesinghe",
      role: "Verified Buyer · Kandy",
    },
    {
      text: "The rewards program is genuinely great. I've already earned enough points for free shipping for the next 3 months. BuyBee actually rewards loyalty.",
      avatar: "👩",
      avatarBg: "#EDE8FC",
      name: "Nisha Rodrigo",
      role: "Verified Buyer · Galle",
    },
  ],
};

/* ── Helper: get or seed the single site document ── */
const getSite = async () => {
  let doc = await SiteContent.findOne({ siteId: SITE_ID });
  if (!doc) doc = await SiteContent.create(DEFAULT);
  return doc;
};

/* ════════════════════════════════════════
   GET /api/content  —  load all
   ════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const doc = await getSite();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   PATCH /api/content/hero   — update hero
   PATCH /api/content/promo  — update promo
   ════════════════════════════════════════ */
["hero", "promo"].forEach((section) => {
  router.patch(`/${section}`, async (req, res) => {
    try {
      const doc = await getSite();
      Object.assign(doc[section], req.body);
      await doc.save();
      res.json(doc[section]);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
});

/* ════════════════════════════════════════
   Array sections: stats | features | categories | products | testimonials
   POST   /api/content/:section        — add item
   PATCH  /api/content/:section/:id    — update item
   DELETE /api/content/:section/:id    — delete item
   PUT    /api/content/:section/reorder — replace full array
   ════════════════════════════════════════ */
const ARRAY_SECTIONS = [
  "stats",
  "features",
  "categories",
  "products",
  "testimonials",
];

router.post("/:section", async (req, res) => {
  if (!ARRAY_SECTIONS.includes(req.params.section))
    return res.status(404).json({ message: "Unknown section" });
  try {
    const doc = await getSite();
    doc[req.params.section].push(req.body);
    await doc.save();
    const added = doc[req.params.section].at(-1);
    res.status(201).json(added);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:section/:id", async (req, res) => {
  if (!ARRAY_SECTIONS.includes(req.params.section))
    return res.status(404).json({ message: "Unknown section" });
  try {
    const doc = await getSite();
    const item = doc[req.params.section].id(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    Object.assign(item, req.body);
    await doc.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:section/:id", async (req, res) => {
  if (!ARRAY_SECTIONS.includes(req.params.section))
    return res.status(404).json({ message: "Unknown section" });
  try {
    const doc = await getSite();
    const item = doc[req.params.section].id(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.deleteOne();
    await doc.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:section/reorder", async (req, res) => {
  if (!ARRAY_SECTIONS.includes(req.params.section))
    return res.status(404).json({ message: "Unknown section" });
  try {
    const doc = await getSite();
    doc[req.params.section] = req.body;
    await doc.save();
    res.json(doc[req.params.section]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
