import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/progress", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name streak coins"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      streak: user.streak,
      coins: user.coins,
    });

  } catch (err) {
    console.error("GET /user/progress error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/update-streak", authMiddleware, async (req, res) => {
  try {
    const { streak } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { streak },
      { new: true }
    ).select("streak");

    res.json({ streak: user.streak });

  } catch (err) {
    console.error("POST /user/update-streak error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-coins", authMiddleware, async (req, res) => {
  try {
    const { coins } = req.body;

    const user = await User.findById(req.user.id);

    user.coins += coins;
    await user.save();

    res.json({ coins: user.coins });

  } catch (err) {
    console.error("POST /user/add-coins error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
