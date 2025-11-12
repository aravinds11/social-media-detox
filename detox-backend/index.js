import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "detox-node-backend" });
});

app.use("/api/analyze", analyzeRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Node.js API running on port ${PORT}`));
