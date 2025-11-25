import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/progress", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name streak coins");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      streak: user.streak,
      coins: user.coins,
    });
  } catch (err) {
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
        addictionScore: 0,
        trend: "No AI data available yet",
        cluster: null,
        recommendations: [],
      });
    }

    const latest = history[history.length - 1];
    const clusterLabel = latest.cluster?.label || "unknown";
    const probability =
      latest.prediction?.probability !== undefined
        ? latest.prediction.probability
        : 0;

    const addictionScore = Math.round(probability * 100);

    const trend =
      clusterLabel === "heavy"
        ? "Your usage is high — heavy digital use detected."
        : clusterLabel === "moderate"
        ? "Your usage is moderate — room for improvement."
        : clusterLabel === "light"
        ? "Your usage is healthy and balanced!"
        : "No trend detected.";

    const recs = latest.recommendations?.suggestions || [];

    res.json({
      addictionScore,
      trend,
      cluster: clusterLabel,
      recommendations: recs,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
