import express from "express";
import Usage from "../models/Usage.js";
import authMiddleware from "../middleware/auth.js";
import dayjs from "dayjs";

const router = express.Router();

router.get("/apps", authMiddleware, async (req, res) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");

    const usage = await Usage.findOne({
      userId: req.user.id,
      date: today,
    });

    if (!usage) {
      return res.json({ apps: [] });
    }

    res.json({ apps: usage.apps });

  } catch (err) {
    console.error("GET /usage/apps error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");

    const usage = await Usage.findOne({
      userId: req.user.id,
      date: today,
    });

    if (!usage) {
      return res.json({ totalTime: "0m" });
    }

    res.json({ totalTime: usage.totalTime });

  } catch (err) {
    console.error("GET /usage/today error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/log", authMiddleware, async (req, res) => {
  try {
    const { apps, totalTime } = req.body;

    if (!apps || !Array.isArray(apps)) {
      return res.status(400).json({ message: "Invalid apps array" });
    }

    const today = dayjs().format("YYYY-MM-DD");

    let usage = await Usage.findOne({
      userId: req.user.id,
      date: today,
    });

    if (!usage) {
      usage = new Usage({
        userId: req.user.id,
        date: today,
        apps,
        totalTime,
      });
    } else {
      usage.apps = apps;
      usage.totalTime = totalTime;
    }

    await usage.save();

    res.json({ message: "Usage logged successfully" });

  } catch (err) {
    console.error("POST /usage/log error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
