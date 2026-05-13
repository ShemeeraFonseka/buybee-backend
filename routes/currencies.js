import express from "express";
import Currency from "../models/Currency.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* ── Default currencies to seed on first run ── */
const DEFAULTS = [
  { code: "USD", symbol: "$", name: "US Dollar", rateToUSD: 1 },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", rateToUSD: 320 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rateToUSD: 1350 },
];

const seedCurrencies = async () => {
  const count = await Currency.countDocuments();
  if (count === 0) await Currency.insertMany(DEFAULTS);
};

/* ════════════════════════════════════════
   GET /api/currencies  — get all (public)
   ════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    await seedCurrencies();
    const currencies = await Currency.find({ active: true }).sort({ code: 1 });
    res.json(currencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   PATCH /api/currencies/:code  — update rate (admin)
   ════════════════════════════════════════ */
router.patch("/:code", protect, async (req, res) => {
  try {
    const { rateToUSD, symbol, name, active } = req.body;
    const currency = await Currency.findOneAndUpdate(
      { code: req.params.code.toUpperCase() },
      {
        ...(rateToUSD !== undefined && { rateToUSD: Number(rateToUSD) }),
        ...(symbol !== undefined && { symbol }),
        ...(name !== undefined && { name }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    );
    res.json(currency);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/currencies/refresh  — fetch live rates (admin)
   Uses exchangerate-api.com free tier (no key needed for USD base)
   ════════════════════════════════════════ */
router.post("/refresh", protect, async (req, res) => {
  try {
    // Free tier endpoint — no API key required
    const response = await fetch("https://open.er-api.com/v6/latest/USD");

    if (!response.ok)
      return res.status(502).json({ message: "Could not fetch live rates" });

    const data = await response.json();
    if (data.result !== "success")
      return res
        .status(502)
        .json({ message: data["error-type"] || "API error" });

    const rates = data.rates;
    const updates = [];

    for (const code of ["LKR", "KRW"]) {
      if (rates[code]) {
        const currency = await Currency.findOneAndUpdate(
          { code },
          { rateToUSD: rates[code], updatedAt: new Date() },
          { new: true },
        );
        if (currency) updates.push(currency);
      }
    }

    // USD always stays 1
    await Currency.findOneAndUpdate(
      { code: "USD" },
      { rateToUSD: 1, updatedAt: new Date() },
      { new: true },
    );

    const all = await Currency.find({ active: true }).sort({ code: 1 });
    res.json({
      message: "Rates updated from live API",
      currencies: all,
      lastUpdated: data.time_last_update_utc,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
