import mongoose from "mongoose";

const AboutContentSchema = new mongoose.Schema(
  {
    // Hero
    heroTitle: { type: String, default: "Shopping, reimagined for Sri Lanka" },
    heroSub: {
      type: String,
      default:
        "We started with a simple belief — that everyone deserves a fast, trustworthy, and delightful online shopping experience. That belief became BuyBee.",
    },
    // Mission
    missionTitle: {
      type: String,
      default: "Building Sri Lanka's most trusted marketplace",
    },
    missionBody1: {
      type: String,
      default:
        "BuyBee exists to connect people with the products they love — quickly, safely, and affordably.",
    },
    missionBody2: {
      type: String,
      default:
        "From a single seller in Negombo to thousands of merchants across the island, BuyBee has grown into a community-driven platform.",
    },
    // Stats
    stats: [
      {
        num: { type: String },
        label: { type: String },
      },
    ],
    // Values
    values: [
      {
        icon: { type: String },
        title: { type: String },
        desc: { type: String },
      },
    ],
    // Timeline
    timeline: [
      {
        year: { type: String },
        title: { type: String },
        desc: { type: String },
      },
    ],
    // Team
    team: [
      {
        name: { type: String },
        role: { type: String },
        avatar: { type: String },
        bg: { type: String, default: "#FDE8C8" },
      },
    ],
    // CTA
    ctaTitle: { type: String, default: "Ready to start shopping?" },
    ctaSub: {
      type: String,
      default:
        "Join thousands of happy customers who trust BuyBee for their everyday needs.",
    },
  },
  { timestamps: true },
);

export default mongoose.model("AboutContent", AboutContentSchema);
