import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import axios from "axios";

const router = express.Router();
const FLASK_URL = process.env.FLASK_URL || "http://127.0.0.1:5000";

router.get("/progress", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email streak coins");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
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

router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("usageHistory");
    if (!user) return res.status(404).json({ message: "User not found" });

    const history = user.usageHistory;
    if (!history || history.length === 0) {
      return res.json({
        error: true,
        message: "No usage history yet",
      });
    }

    const latest = history[history.length - 1];
    const features = latest.usage;

    const flaskRes = await axios.post(`${FLASK_URL}/analyze`, {
      usage: features,
    });

    const data = flaskRes.data.recommendations;

    return res.json({
      error: false,
      cluster_label: data.cluster_label,
      addiction_status: data.addiction_status,
      probability: data.probability,
      usage_score: data.usage_score,
      score_breakdown: data.score_breakdown,
      insights: data.insights,
      suggestions: data.suggestions,
      targeted_tips: data.targeted_tips,
      goals: data.goals,
      alternative_activities: data.alternative_activities,
      encouragement: data.encouragement,
      reclaimable_time: data.reclaimable_time,
    });
  } catch (err) {
    console.error("GET /user/insights error:", err);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

export default router;
