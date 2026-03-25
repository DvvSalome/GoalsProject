import {
  hasValidOpenAiKey,
  runDemoPrediction,
  runOpenAiPrediction,
  validatePredictionPayload,
} from "../services/predictionService.js";

export async function postPredict(req, res) {
  try {
    const v = validatePredictionPayload(req.body || {});
    if (!v.ok) {
      return res.status(400).json({ error: v.error });
    }

    const prediction = await runOpenAiPrediction(req.body);
    return res.json({ success: true, prediction });
  } catch (error) {
    console.error("Prediction error:", error.message);

    if (
      error.message.includes("API key") ||
      error.message.includes("auth") ||
      error.status === 401
    ) {
      return res.status(500).json({
        error: "OpenAI API key is invalid or missing. Check your .env file.",
      });
    }

    return res.status(500).json({
      error: "Prediction failed. " + error.message,
    });
  }
}

export function postPredictDemo(req, res) {
  try {
    const v = validatePredictionPayload(req.body || {});
    if (!v.ok) {
      return res.status(400).json({ error: v.error });
    }
    const prediction = runDemoPrediction(req.body);
    return res.json({ success: true, prediction });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Prediction failed." });
  }
}

export function getHealth(_req, res) {
  res.json({
    status: "ok",
    hasApiKey: hasValidOpenAiKey(),
    supabase: !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY
    ),
  });
}
