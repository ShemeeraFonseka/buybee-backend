import mongoose from "mongoose";

const CashMovementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["opening", "in", "out", "closing"],
      required: true,
    },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
    time: { type: Date, default: Date.now },
  },
  { _id: false },
);

const POSSessionSchema = new mongoose.Schema(
  {
    operator: { type: String, required: true }, // user name
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    terminal: { type: String, default: "Main" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    openingCash: { type: Number, default: 0 },
    closingCash: { type: Number, default: null },
    expectedCash: { type: Number, default: 0 },
    cashMovements: { type: [CashMovementSchema], default: [] },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCash: { type: Number, default: 0 },
    totalCard: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("POSSession", POSSessionSchema);
