import express from "express";
import ContactContent from "../models/ContactContent.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const DEFAULT_FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 2–5 business days within Sri Lanka. Express delivery is available for select areas.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes! We have a 14-day hassle-free return policy. Items must be in original condition with all packaging.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently we ship within Sri Lanka only. International shipping is coming soon!",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your order is shipped, you'll receive a tracking number via email to monitor your delivery.",
  },
];

const seed = async () => {
  const count = await ContactContent.countDocuments();
  if (count === 0) await ContactContent.create({ faqs: DEFAULT_FAQS });
};

/* GET /api/contact-content — public */
router.get("/", async (req, res) => {
  try {
    await seed();
    const doc = await ContactContent.findOne();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PATCH /api/contact-content — protected, update flat fields */
router.patch("/", protect, async (req, res) => {
  try {
    const doc = await ContactContent.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* POST /api/contact-content/faqs — add faq */
router.post("/faqs", protect, async (req, res) => {
  try {
    const doc = await ContactContent.findOne();
    doc.faqs.push(req.body);
    await doc.save();
    res.json(doc.faqs[doc.faqs.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* PATCH /api/contact-content/faqs/:id */
router.patch("/faqs/:id", protect, async (req, res) => {
  try {
    const doc = await ContactContent.findOne();
    const item = doc.faqs.id(req.params.id);
    if (!item) return res.status(404).json({ message: "FAQ not found" });
    Object.assign(item, req.body);
    await doc.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* DELETE /api/contact-content/faqs/:id */
router.delete("/faqs/:id", protect, async (req, res) => {
  try {
    const doc = await ContactContent.findOne();
    doc.faqs.pull(req.params.id);
    await doc.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
