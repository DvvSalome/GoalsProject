import { Router } from "express";
import { createUserClient } from "../lib/supabase.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  hasValidOpenAiKey,
  runDemoPrediction,
  runOpenAiPrediction,
  validatePredictionPayload,
} from "../services/predictionService.js";

const router = Router();

router.use(requireAuth);

function mapRowToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    hours: Number(row.hours),
    energy: row.energy,
    mood: row.mood,
    distractions: row.distractions,
    consistency: row.consistency,
    recentSchedule: row.recent_schedule,
    recentFollowThrough: row.recent_follow_through,
    recentHistory: row.recent_history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapHistoryRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    goalId: row.goal_id,
    userId: row.user_id,
    eventType: row.event_type,
    source: row.source,
    inputSnapshot: row.input_snapshot,
    prediction: row.prediction,
    createdAt: row.created_at,
  };
}

function rowToPredictionPayload(row, overrides = {}) {
  return {
    goal: overrides.goal !== undefined ? overrides.goal : row.goal,
    hours: overrides.hours !== undefined ? overrides.hours : Number(row.hours),
    energy: overrides.energy !== undefined ? overrides.energy : row.energy,
    mood: overrides.mood !== undefined ? overrides.mood : row.mood,
    distractions:
      overrides.distractions !== undefined ? overrides.distractions : row.distractions,
    consistency: overrides.consistency !== undefined ? overrides.consistency : row.consistency,
    recentSchedule:
      overrides.recentSchedule !== undefined
        ? overrides.recentSchedule
        : row.recent_schedule,
    recentFollowThrough:
      overrides.recentFollowThrough !== undefined
        ? overrides.recentFollowThrough
        : row.recent_follow_through,
    recentHistory:
      overrides.recentHistory !== undefined ? overrides.recentHistory : row.recent_history ?? "",
  };
}

function validateGoalBody(body, partial = false) {
  const fields = [
    "goal",
    "hours",
    "energy",
    "mood",
    "distractions",
    "consistency",
    "recentSchedule",
    "recentFollowThrough",
  ];
  if (!partial) {
    for (const f of fields) {
      if (body[f] === undefined && f !== "recentHistory") {
        return `Missing field: ${f}`;
      }
    }
    if (!String(body.goal || "").trim()) return "goal must not be empty.";
  }
  if (body.hours !== undefined) {
    const h = Number(body.hours);
    if (Number.isNaN(h) || h < 0.5 || h > 16) return "hours must be between 0.5 and 16.";
  }
  if (body.energy !== undefined) {
    const e = Number(body.energy);
    if (Number.isNaN(e) || e < 1 || e > 10) return "energy must be between 1 and 10.";
  }
  if (body.mood !== undefined && !["good", "neutral", "bad"].includes(body.mood)) {
    return "invalid mood.";
  }
  if (
    body.consistency !== undefined &&
    !["high", "medium", "low"].includes(body.consistency)
  ) {
    return "invalid consistency.";
  }
  if (
    body.recentSchedule !== undefined &&
    !["stable", "unstable", "chaotic"].includes(body.recentSchedule)
  ) {
    return "invalid recentSchedule.";
  }
  if (
    body.recentFollowThrough !== undefined &&
    !["strong", "partial", "little", "none"].includes(body.recentFollowThrough)
  ) {
    return "invalid recentFollowThrough.";
  }
  return null;
}

router.get("/", async (req, res) => {
  const supabase = createUserClient(req.accessToken);
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ goals: (data || []).map(mapRowToApi) });
});

router.post("/", async (req, res) => {
  const err = validateGoalBody(req.body || {}, false);
  if (err) return res.status(400).json({ error: err });

  const {
    goal,
    hours,
    energy,
    mood,
    distractions,
    consistency,
    recentSchedule,
    recentFollowThrough,
    recentHistory,
  } = req.body;

  const supabase = createUserClient(req.accessToken);
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: req.user.id,
      goal: String(goal).trim(),
      hours,
      energy,
      mood,
      distractions: Boolean(distractions),
      consistency,
      recent_schedule: recentSchedule,
      recent_follow_through: recentFollowThrough,
      recent_history: recentHistory ?? null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ goal: mapRowToApi(data) });
});

router.get("/:id/history", async (req, res) => {
  const supabase = createUserClient(req.accessToken);
  const { data: goal, error: gErr } = await supabase
    .from("goals")
    .select("id")
    .eq("id", req.params.id)
    .maybeSingle();
  if (gErr) return res.status(500).json({ error: gErr.message });
  if (!goal) return res.status(404).json({ error: "Goal not found." });

  const { data, error } = await supabase
    .from("goal_history")
    .select("*")
    .eq("goal_id", req.params.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ entries: (data || []).map(mapHistoryRow) });
});

router.post("/:id/notes", async (req, res) => {
  const text = req.body?.text;
  if (text === undefined || String(text).trim() === "") {
    return res.status(400).json({ error: "text is required." });
  }

  const supabase = createUserClient(req.accessToken);
  const { data: goal, error: gErr } = await supabase
    .from("goals")
    .select("id")
    .eq("id", req.params.id)
    .maybeSingle();
  if (gErr) return res.status(500).json({ error: gErr.message });
  if (!goal) return res.status(404).json({ error: "Goal not found." });

  const { data, error } = await supabase
    .from("goal_history")
    .insert({
      goal_id: req.params.id,
      user_id: req.user.id,
      event_type: "note",
      input_snapshot: { note: String(text).trim() },
      prediction: null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ entry: mapHistoryRow(data) });
});

router.post("/:id/predict", async (req, res) => {
  const supabase = createUserClient(req.accessToken);
  const { data: goalRow, error: gErr } = await supabase
    .from("goals")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (gErr) return res.status(500).json({ error: gErr.message });
  if (!goalRow) return res.status(404).json({ error: "Goal not found." });

  const payload = rowToPredictionPayload(goalRow, req.body || {});
  const v = validatePredictionPayload(payload);
  if (!v.ok) return res.status(400).json({ error: v.error });

  const useAi = hasValidOpenAiKey();
  let prediction;
  let source;

  try {
    if (useAi) {
      prediction = await runOpenAiPrediction(payload);
      source = "openai";
    } else {
      prediction = runDemoPrediction(payload);
      source = "demo";
    }
  } catch (e) {
    console.error("Prediction error:", e.message);
    if (
      e.message?.includes?.("API key") ||
      e.message?.includes?.("auth") ||
      e.status === 401
    ) {
      return res.status(500).json({
        error: "OpenAI API key is invalid or missing. Check your .env file.",
      });
    }
    if (useAi) {
      try {
        prediction = runDemoPrediction(payload);
        source = "demo";
      } catch (e2) {
        return res.status(500).json({ error: e2.message || "Prediction failed." });
      }
    } else {
      return res.status(500).json({ error: e.message || "Prediction failed." });
    }
  }

  const { data: hist, error: hErr } = await supabase
    .from("goal_history")
    .insert({
      goal_id: goalRow.id,
      user_id: req.user.id,
      event_type: "prediction",
      source,
      input_snapshot: payload,
      prediction,
    })
    .select()
    .single();

  if (hErr) return res.status(500).json({ error: hErr.message });

  return res.json({
    success: true,
    prediction,
    source,
    historyEntry: mapHistoryRow(hist),
  });
});

router.get("/:id", async (req, res) => {
  const supabase = createUserClient(req.accessToken);
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Goal not found." });
  return res.json({ goal: mapRowToApi(data) });
});

router.patch("/:id", async (req, res) => {
  const err = validateGoalBody(req.body || {}, true);
  if (err) return res.status(400).json({ error: err });

  const patch = {};
  const b = req.body || {};
  if (b.goal !== undefined) patch.goal = String(b.goal).trim();
  if (b.hours !== undefined) patch.hours = b.hours;
  if (b.energy !== undefined) patch.energy = b.energy;
  if (b.mood !== undefined) patch.mood = b.mood;
  if (b.distractions !== undefined) patch.distractions = Boolean(b.distractions);
  if (b.consistency !== undefined) patch.consistency = b.consistency;
  if (b.recentSchedule !== undefined) patch.recent_schedule = b.recentSchedule;
  if (b.recentFollowThrough !== undefined)
    patch.recent_follow_through = b.recentFollowThrough;
  if (b.recentHistory !== undefined) patch.recent_history = b.recentHistory;

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const supabase = createUserClient(req.accessToken);
  const { data, error } = await supabase
    .from("goals")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Goal not found." });
  return res.json({ goal: mapRowToApi(data) });
});

router.delete("/:id", async (req, res) => {
  const supabase = createUserClient(req.accessToken);
  const { data, error } = await supabase.from("goals").delete().eq("id", req.params.id).select("id");

  if (error) return res.status(500).json({ error: error.message });
  if (!data?.length) return res.status(404).json({ error: "Goal not found." });
  return res.status(204).send();
});

export default router;
