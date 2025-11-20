import mongoose from "mongoose";

const appUsageSchema = new mongoose.Schema({
  id: String,
  label: String,
  time: String,
  pct: Number,
  iconUrl: String,
});

const usageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: String, required: true }, 
    apps: [appUsageSchema],
    totalTime: { type: String, default: "0m" },
  },
  { timestamps: true }
);

export default mongoose.model("Usage", usageSchema);
