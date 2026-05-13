import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import contentRouter from "./routes/content.js";
import uploadRouter from "./routes/upload.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import currenciesRouter from "./routes/currencies.js";
import posRouter from "./routes/pos.js";
import { protect } from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ── Middleware ── */
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

/* ── Static uploads ── */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── Public routes ── */
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/currencies", currenciesRouter);
app.use("/api/pos", protect, posRouter);

/* ── Protected routes — require login ── */
app.use("/api/upload", protect, uploadRouter);
app.use("/api/users", protect, usersRouter);

/* ── Health check ── */
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

/* ── Connect & start ── */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/buybee";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
