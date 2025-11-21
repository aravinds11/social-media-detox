import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dayjs from "dayjs";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const today = dayjs().startOf("day");
    const lastLogin = user.lastLogin ? dayjs(user.lastLogin).startOf("day") : null;

    if (!lastLogin) {
      user.streak = 1;
    } else if (lastLogin.isSame(today)) {
    } else if (lastLogin.add(1, "day").isSame(today)) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const responseObj = {
      token,
      name: user.name,
      streak: user.streak,
      coins: user.coins,
    };

    // console.log("LOGIN ROUTE SENDING RESPONSE:", responseObj);

    res.json(responseObj);

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
