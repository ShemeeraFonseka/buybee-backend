import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    category: { type: String, default: "" },
  },
  { _id: false },
);

const ShippingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "Sri Lanka" },
    notes: { type: String, default: "" },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: ShippingSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cod", "card"], default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

/* ─── Generate unique order number with retry on duplicate ─── */
async function generateOrderNumber() {
  const Order = mongoose.model("Order");
  let attempts = 0;

  while (attempts < 10) {
    // Use max orderNumber to determine next — immune to deletions/race conditions
    const last = await Order.findOne({ orderNumber: { $exists: true } })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();

    let next = 1;
    if (last?.orderNumber) {
      const num = parseInt(last.orderNumber.replace("BB-", ""), 10);
      if (!isNaN(num)) next = num + 1;
    }

    const candidate = `BB-${String(next).padStart(5, "0")}`;

    // Check it doesn't already exist
    const exists = await Order.exists({ orderNumber: candidate });
    if (!exists) return candidate;

    attempts++;
  }

  // Final fallback — use timestamp to guarantee uniqueness
  return `BB-${Date.now()}`;
}

OrderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    this.orderNumber = await generateOrderNumber();
  }
});

export default mongoose.model("Order", OrderSchema);
