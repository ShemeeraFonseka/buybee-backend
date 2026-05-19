import mongoose from "mongoose";

const ContactContentSchema = new mongoose.Schema(
  {
    // Info cards
    address: {
      type: String,
      default: "Kepungoda, Negombo, Western Province, Sri Lanka",
    },
    phone: { type: String, default: "+94 77 497 9282" },
    email: { type: String, default: "hello@buybee.lk" },
    hours: { type: String, default: "Mon–Fri: 9am – 6pm | Sat: 10am – 4pm" },
    // Hero
    heroTitle: { type: String, default: "We'd love to hear from you" },
    heroSub: {
      type: String,
      default:
        "Have a question, feedback, or just want to say hi? Our team is always here to help.",
    },
    // FAQ
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("ContactContent", ContactContentSchema);
