import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a behavioral psychologist AI specialized in self-sabotage prediction. Your job is to analyze a person's goal, current state, and behavioral history to predict how likely they are to fail — and WHY.

You are NOT a motivational coach. You are a pattern recognition engine for human self-deception.

## Your Analysis Framework:

1. **Energy-Goal Mismatch**: Compare the energy level to the ambition of the goal. Low energy + high ambition = disaster.
2. **Overplanning Syndrome**: People who set unrealistic hour targets are compensating for past failures. Recognize this.
3. **Distraction Vulnerability**: If distractions are present AND energy is low, the person WILL default to the path of least resistance.
4. **Past Consistency Signal**: This is the strongest predictor. Low past consistency means the person has a track record of quitting. Don't sugarcoat this.
5. **Mood-Performance Correlation**: Bad mood + difficult task = emotional avoidance. Neutral mood + boring task = drift to distractions.
6. **The Critical Moment**: Identify WHEN during the task the person will most likely quit (e.g., "after 30 minutes", "when they hit the first hard problem", "right after checking their phone").
7. **Recent Reality Check**: Treat the user's last few days and this week's behavior as hard evidence. If their recent schedule is chaotic, follow-through is low, or they admit they barely studied, assume the current plan is inflated unless the goal is drastically smaller.
8. **Recency Over Fantasy**: If what they did this week contradicts what they say they will do today, trust the week, not the wishful plan.

## Impostor Syndrome Detection:
If the goal text contains self-doubt language (e.g., "try to", "hopefully", "if I can", "attempt", "maybe"), flag this as impostor syndrome and address it directly.

## Your Tone:
- Brutally honest but psychologically precise
- Like a therapist who stopped being polite
- Not mean for the sake of being mean — accurate and uncomfortable
- Short, punchy sentences
- Make the person FEEL seen

## You MUST respond in this exact JSON format:
{
  "failure_probability": <number 0-100>,
  "risk_level": "low" | "medium" | "high",
  "main_reason": "<1-2 sentence core reason for predicted failure>",
  "critical_point": "<when/where they'll most likely quit>",
  "intervention": "<specific, actionable alternative — not generic advice>",
  "tone_message": "<2-3 sentences of brutally honest psychological insight — make it personal and uncomfortable>",
  "impostor_detected": <boolean>,
  "impostor_message": "<if detected, a direct message about their self-doubt pattern, otherwise null>"
}

## Scoring Guidelines:
- Energy 1-3 + Hours > 3 = automatic 70%+ failure
- Distractions YES + Consistency LOW = automatic 75%+ failure
- Mood BAD + Energy < 5 = add 15% to base failure rate
- Consistency LOW alone = minimum 50% failure rate
- Everything optimal (high energy, no distractions, high consistency, good mood) = still 15-25% (nobody is perfect)
- Be precise with the percentage — don't round to neat numbers. 73% is better than 70%.

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;

app.post("/api/predict", async (req, res) => {
  try {
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

    if (
      !goal ||
      !hours ||
      !energy ||
      !mood ||
      consistency === undefined ||
      !recentSchedule ||
      !recentFollowThrough
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const userMessage = `Analyze this person's goal and predict their likelihood of failure:

- Goal: "${goal}"
- Hours planned: ${hours}
- Current energy level: ${energy}/10
- Current mood: ${mood}
- Distractions present: ${distractions ? "Yes" : "No"}
- Past consistency with similar goals: ${consistency}
- Recent schedule over the last few days: ${recentSchedule}
- Actual follow-through in the last few days: ${recentFollowThrough}
- User's description of this week/recent days: "${recentHistory || "No extra context provided."}"

Be specific to THIS exact situation. Reference their actual goal, numbers, and their recent weekly pattern. If the recent history shows poor structure or no follow-through, say that directly and treat it as a major predictor.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content.trim();

    let prediction;
    try {
      prediction = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    res.json({ success: true, prediction });
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

    res.status(500).json({
      error: "Prediction failed. " + error.message,
    });
  }
});

// Fallback prediction for demo without API key
app.post("/api/predict-demo", (req, res) => {
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

  let baseFailure = 30;

  // Energy-Goal mismatch
  if (energy <= 3 && hours > 3) baseFailure += 35;
  else if (energy <= 5 && hours > 2) baseFailure += 20;
  else if (energy <= 3) baseFailure += 15;

  // Distractions
  if (distractions) baseFailure += 15;

  // Consistency
  if (consistency === "low") baseFailure += 20;
  else if (consistency === "medium") baseFailure += 5;
  else baseFailure -= 10;

  // Mood
  if (mood === "bad") baseFailure += 12;
  else if (mood === "neutral") baseFailure += 3;
  else baseFailure -= 5;

  // Overplanning
  if (hours > 4) baseFailure += 10;

  // Recent schedule
  if (recentSchedule === "chaotic") baseFailure += 16;
  else if (recentSchedule === "unstable") baseFailure += 8;
  else if (recentSchedule === "stable") baseFailure -= 4;

  // Recent follow-through
  if (recentFollowThrough === "none") baseFailure += 18;
  else if (recentFollowThrough === "little") baseFailure += 12;
  else if (recentFollowThrough === "partial") baseFailure += 5;
  else if (recentFollowThrough === "strong") baseFailure -= 8;

  // Recent history text signals
  const recentHistoryLower = (recentHistory || "").toLowerCase();
  const negativeRecentSignals = [
    "haven't studied",
    "have not studied",
    "barely studied",
    "bad schedule",
    "messy schedule",
    "slept late",
    "scroll",
    "procrastinat",
    "postpon",
    "guilty",
    "did nothing",
    "no he estudiado",
    "mal horario",
    "pospuesto",
    "procrastino",
  ];
  const positiveRecentSignals = [
    "consistent",
    "showed up",
    "studied",
    "followed through",
    "kept up",
    "buen horario",
    "constante",
    "sí estudié",
    "si estudie",
  ];

  if (negativeRecentSignals.some((signal) => recentHistoryLower.includes(signal))) {
    baseFailure += 12;
  }

  if (positiveRecentSignals.some((signal) => recentHistoryLower.includes(signal))) {
    baseFailure -= 6;
  }

  const failure_probability = Math.min(Math.max(baseFailure, 12), 97);

  const risk_level =
    failure_probability >= 65
      ? "high"
      : failure_probability >= 40
        ? "medium"
        : "low";

  const reasons = {
    high: `You're planning ${hours} hours with an energy level of ${energy}/10 while your recent pattern has been ${recentSchedule} and your follow-through has been ${recentFollowThrough}. That's not ambition — that's self-deception.`,
    medium: `Your setup isn't terrible, but your ${consistency} consistency plus a ${recentSchedule} recent rhythm suggests you'll negotiate yourself out of this halfway through.`,
    low: `You actually have a decent shot. But don't mistake a good setup for guaranteed follow-through.`,
  };

  const criticals = {
    high: `Around the ${Math.max(15, Math.floor(45 * (energy / 10)))}-minute mark. That's when your brain will start rationalizing why "tomorrow is better."`,
    medium: `About ${Math.floor(hours * 0.4)} hour(s) in, when the initial motivation wears off and the actual work begins.`,
    low: `Near the ${Math.floor(hours * 0.7)}-hour mark, when fatigue starts competing with your discipline.`,
  };

  const interventions = {
    high: `Slash your goal to ${Math.max(1, Math.floor(hours * 0.25))} hour(s). Start within the next 2 minutes. No setup ritual, no "getting ready" — just begin.`,
    medium: `Break it into ${Math.ceil(hours * 2)} blocks of 25 minutes. Remove your phone from the room. Commit to just the first block.`,
    low: `Your plan is reasonable. Set a timer, eliminate one distraction source, and protect the first 30 minutes fiercely.`,
  };

  const tones = {
    high: `Your recent week matters more than today's fantasy. If you've had a ${recentSchedule} schedule and ${recentFollowThrough} follow-through lately, a big promise today is just another performance. Stop pretending this attempt is magically different.`,
    medium: `You're in the danger zone of "good enough to start, not committed enough to finish." Your recent days already exposed your pattern. The question is whether today's version of you will finally respect that reality.`,
    low: `Don't get cocky. A good setup doesn't mean you've earned the result yet. The gap between planning and doing is where most people live permanently. Execute.`,
  };

  const goalLower = goal.toLowerCase();
  const impostorWords = [
    "try",
    "hopefully",
    "if i can",
    "attempt",
    "maybe",
    "want to",
    "might",
  ];
  const impostor_detected = impostorWords.some((w) => goalLower.includes(w));

  const prediction = {
    failure_probability,
    risk_level,
    main_reason: reasons[risk_level],
    critical_point: criticals[risk_level],
    intervention: interventions[risk_level],
    tone_message: tones[risk_level],
    impostor_detected,
    impostor_message: impostor_detected
      ? `Your language already reveals doubt. Saying "${goal}" instead of committing outright is your brain building an escape route before you even start. You're pre-forgiving yourself for quitting.`
      : null,
  };

  res.json({ success: true, prediction });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here",
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Reality Check AI backend running on port ${PORT}`);
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    console.log("⚠️  No OpenAI API key set. Demo mode will use fallback predictions.");
    console.log("   Set OPENAI_API_KEY in .env for AI-powered predictions.");
  }
});
