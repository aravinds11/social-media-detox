import express from "express";
import axios from "axios";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();
const FLASK_URL = process.env.FLASK_URL || "http://127.0.0.1:5000";

router.post("/", auth, async (req, res) => {
  try {
    const { usage } = req.body;
    if (!usage || usage.length !== 4)
      return res.status(400).json({ error: true, message: "Usage must have 4 numbers" });

    const flaskRes = await axios.post(`${FLASK_URL}/analyze`, { usage });

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        usageHistory: {
          usage,
          cluster: flaskRes.data.cluster,
          prediction: flaskRes.data.prediction,
          recommendations: flaskRes.data.recommendations
        }
      }
    });

    res.json(flaskRes.data);
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

export default router;
