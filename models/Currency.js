import mongoose from "mongoose";

const CurrencySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // USD, LKR, KRW
    symbol: { type: String, required: true }, // $, Rs, ₩
    name: { type: String, required: true }, // US Dollar, Sri Lankan Rupee, South Korean Won
    rateToUSD: { type: Number, required: true, default: 1 }, // how many of this currency = 1 USD
    active: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Currency", CurrencySchema);
