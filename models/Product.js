import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    tag: { type: String, enum: ["hot", "new", "sale", ""], default: "" },
    tagLabel: { type: String, default: "" },
    stars: { type: Number, default: 5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bg: { type: String, default: "#FDE8C8" },
  },
  { timestamps: true },
);

// Text index for search
ProductSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.model("Product", ProductSchema);
