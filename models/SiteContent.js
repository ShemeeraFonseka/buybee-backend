import mongoose from "mongoose";

/* ── Sub-schemas ── */
const HeroSchema = new mongoose.Schema(
  {
    badge: { type: String, default: "Now live in Sri Lanka & worldwide" },
    titleMain: { type: String, default: "Shop Smarter," },
    titleEmph: { type: String, default: "Live Better" },
    sub: {
      type: String,
      default: "BuyBee brings thousands of products to your fingertips.",
    },
    btnPrimary: { type: String, default: "Shop Now →" },
    btnSecondary: { type: String, default: "How it works" },
  },
  { _id: false },
);

const PromoSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Limited time offer" },
    title: { type: String, default: "Up to 70% off on your first order" },
    sub: {
      type: String,
      default: "New to BuyBee? Use code BEE70 at checkout.",
    },
    code: { type: String, default: "BEE70" },
    btn: { type: String, default: "Claim your discount →" },
    bigNum: { type: String, default: "70%" },
  },
  { _id: false },
);

const StatSchema = new mongoose.Schema({
  num: { type: String, required: true },
  label: { type: String, required: true },
});

const FeatureSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
});

const CategorySchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  name: { type: String, required: true },
  count: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema({
  image: { type: String, default: "" },
  bg: { type: String, default: "#FDE8C8" },
  tag: { type: String, enum: ["hot", "new", "sale"], default: "new" },
  tagLabel: { type: String, default: "New" },
  cat: { type: String, required: true },
  title: { type: String, required: true },
  stars: { type: String, default: "★★★★★" },
  reviews: { type: String, default: "0" },
  price: { type: String, required: true },
  oldPrice: { type: String, default: "" },
});

const TestimonialSchema = new mongoose.Schema({
  text: { type: String, required: true },
  avatar: { type: String, default: "👤" },
  avatarBg: { type: String, default: "#FDE8C8" },
  name: { type: String, required: true },
  role: { type: String, required: true },
});

/* ── Root schema — one document per site ── */
const SiteContentSchema = new mongoose.Schema(
  {
    siteId: { type: String, default: "buybee", unique: true },
    hero: { type: HeroSchema, default: () => ({}) },
    promo: { type: PromoSchema, default: () => ({}) },
    stats: { type: [StatSchema], default: [] },
    features: { type: [FeatureSchema], default: [] },
    categories: { type: [CategorySchema], default: [] },
    products: { type: [ProductSchema], default: [] },
    testimonials: { type: [TestimonialSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("SiteContent", SiteContentSchema);
