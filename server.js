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

/* ── CORS — allow localhost + any Vercel deployment ── */
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      // Allow Vercel preview/production deployments
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

/* ── Static uploads ── */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── Public routes ── */
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/currencies", currenciesRouter);

/* ── Protected routes ── */
app.use("/api/upload", protect, uploadRouter);
app.use("/api/users", protect, usersRouter);
app.use("/api/pos", protect, posRouter);

/* ── Health check ── */
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

/* ── MongoDB connection ── */
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/buybee";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

/* ── Local dev server (not used by Vercel) ── */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`),
  );
}

/* ── Vercel needs this export ── */
export default app;
