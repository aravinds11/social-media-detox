import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import analyzeRouter from "./routes/analyze.js";
import authRouter from "./routes/auth.js";
import usageRouter from "./routes/usage.js";
import userRouter from "./routes/user.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "detox-node-backend" });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/auth", authRouter);
app.use("/api/usage", usageRouter);
app.use("/api/user", userRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Node.js API running on port ${PORT}`)
);
