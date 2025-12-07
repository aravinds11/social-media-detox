import express from "express";
import Usage from "../models/Usage.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import dayjs from "dayjs";
import axios from "axios";

const router = express.Router();
const FLASK_URL = process.env.FLASK_URL || "http://127.0.0.1:5000";

function computeFeaturesFromApps(apps, totalTimeStr) {
  const totalMinutes =
    parseInt((totalTimeStr || "0m").replace("m", "")) ||
    apps.reduce((s, a) => s + (a.minutes || 0), 0);

  const daily_screen_time = Math.max(0, totalMinutes);

  const sorted = [...apps].sort((a, b) => (b.minutes || 0) - (a.minutes || 0));
  const topUsage = sorted[0] ? sorted[0].minutes || 0 : 0;

  const session_duration = Math.max(
    5,
    Math.round((topUsage * 0.6) + (totalMinutes / Math.max(1, apps.length * 2)))
  );

  const usageSpread = apps.map(a => a.minutes || 0);
  const stdDev = usageSpread.length > 1
    ? Math.sqrt(
        usageSpread.reduce((sum, x) => sum + Math.pow(x - (totalMinutes / apps.length), 2), 0) /
        usageSpread.length
      )
    : 0;

  const app_switches = Math.round(
    Math.min(200, (apps.length * 5) + (stdDev * 0.4))
  );

  const night_activity = Math.round(
    Math.min(totalMinutes, (totalMinutes * 0.35))
  );

  return [
    daily_screen_time,
    session_duration,
    app_switches,
    night_activity
  ];
}

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

router.get("/weekly", authMiddleware, async (req, res) => {
  try {
    const today = dayjs();
    const startOfWeek = today.startOf("week"); 
    const endOfWeek = today.endOf("week");

    const logs = await Usage.find({
      userId: req.user.id,
      date: { $gte: startOfWeek.format("YYYY-MM-DD"), $lte: endOfWeek.format("YYYY-MM-DD") },
    });

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const days = dayNames.map((dayLabel, i) => {
      const dayDate = startOfWeek.add(i, "day").format("YYYY-MM-DD");
      const entry = logs.find((l) => l.date === dayDate);

      if (!entry)
        return { day: dayLabel, minutes: 0, percent: 0 };

      const minutes = parseInt(entry.totalTime.replace("m", "")) || 0;

      const percent = Math.min(Math.floor((minutes / 180) * 100), 100);

      return { day: dayLabel, minutes, percent };
    });

    return res.json({ days });

  } catch (err) {
    console.error("GET /usage/weekly error:", err);
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

    const features = computeFeaturesFromApps(apps, totalTime);

    try {
      const flaskRes = await axios.post(`${FLASK_URL}/analyze`, { usage: features });

      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          usageHistory: {
            usage: features,
            cluster: flaskRes.data.cluster || null,
            prediction: flaskRes.data.prediction || null,
            recommendations: flaskRes.data.recommendations || null,
          },
        },
      });
    } catch (e) {
      console.error("FLASK analyze error:", e.message);
    }

    res.json({ message: "Usage logged successfully" });

  } catch (err) {
    console.error("POST /usage/log error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
