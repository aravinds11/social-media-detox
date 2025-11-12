import express from "express";
import axios from "axios";

const router = express.Router();
const FLASK_URL = process.env.FLASK_URL || "http://127.0.0.1:5000";

router.post("/", async (req, res) => {
  try {
    const { usage } = req.body;

    if (!usage || !Array.isArray(usage) || usage.length !== 4) {
      return res.status(400).json({
        error: true,
        message: "usage must be an array of 4 numbers [screen_time, session_duration, app_switches, night_activity]"
      });
    }

    const flaskResponse = await axios.post(`${FLASK_URL}/analyze`, { usage });
    res.json(flaskResponse.data);
  } catch (error) {
    console.error("Flask API error:", error.message);
    res.status(500).json({ error: true, message: "Error communicating with AI service" });
  }
});

export default router;
