import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect); // all user routes require login

/* ── GET /api/users ── */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── POST /api/users ── */
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res
      .status(201)
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Email already in use" });
    res.status(400).json({ message: err.message });
  }
});

/* ── PATCH /api/users/:id ── */
router.patch("/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ── DELETE /api/users/:id ── */
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
