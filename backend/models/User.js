import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usageHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  usage: [Number],
  cluster: Object,
  prediction: Object,
  recommendations: Object,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    streak: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    usageHistory: [usageHistorySchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
