import "dotenv/config";
import express from "express";
import cors from "cors";
import { isSupabaseConfigured } from "./lib/supabase.js";
import authRoutes from "./routes/auth.js";
import goalsRoutes from "./routes/goals.js";
import { getHealth, postPredict, postPredictDemo } from "./routes/predictPublic.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/predict", postPredict);
app.post("/api/predict-demo", postPredictDemo);
app.get("/api/health", getHealth);

function requireSupabase(req, res, next) {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.",
    });
  }
  return next();
}

app.use("/api/auth", requireSupabase, authRoutes);
app.use("/api/goals", requireSupabase, goalsRoutes);

app.listen(PORT, () => {
  console.log(`Reality Check AI backend running on port ${PORT}`);
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    console.log("No OpenAI API key set. Public /api/predict will fail; goals predict uses demo fallback when possible.");
  }
  if (!isSupabaseConfigured()) {
    console.log("Supabase env vars missing: /api/auth and /api/goals return 503 until configured.");
  }
});
