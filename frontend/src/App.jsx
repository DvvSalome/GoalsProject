import { useState, useEffect } from "react";
import { Brain, Zap, AlertTriangle, Ghost } from "lucide-react";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import LoadingAnimation from "./components/LoadingAnimation";
import HistoryTracker from "./components/HistoryTracker";
import DisciplineChart from "./components/DisciplineChart";
import Header from "./components/Header";

const DEMO_SCENARIO = {
  goal: "Study 5 hours today",
  hours: 5,
  energy: 4,
  mood: "bad",
  distractions: true,
  consistency: "low",
  recentSchedule: "chaotic",
  recentFollowThrough: "none",
  recentHistory:
    "This week I have had a messy schedule, slept late, and barely studied. I keep postponing and then feeling guilty.",
};

export default function App() {
  const [formData, setFormData] = useState({
    goal: "",
    hours: 2,
    energy: 5,
    mood: "neutral",
    distractions: false,
    consistency: "medium",
    recentSchedule: "unstable",
    recentFollowThrough: "little",
    recentHistory: "",
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setUseAI(data.hasApiKey);
      })
      .catch(() => setUseAI(false));
  }, []);

  const handlePredict = async (data) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    const payload = data || formData;

    try {
      const endpoint = useAI ? "/api/predict" : "/api/predict-demo";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (useAI) {
          const fallbackRes = await fetch("/api/predict-demo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const fallbackResult = await fallbackRes.json();
          if (fallbackResult.success) {
            setPrediction(fallbackResult.prediction);
            setHistory((prev) => [
              {
                goal: payload.goal,
                probability: fallbackResult.prediction.failure_probability,
                date: new Date().toLocaleTimeString(),
              },
              ...prev.slice(0, 4),
            ]);
            return;
          }
        }
        throw new Error(result.error || "Prediction failed");
      }

      setPrediction(result.prediction);
      setHistory((prev) => [
        {
          goal: payload.goal,
          probability: result.prediction.failure_probability,
          date: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setFormData(DEMO_SCENARIO);
    handlePredict(DEMO_SCENARIO);
  };

  const handleReset = () => {
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Header />

        {/* Demo Button */}
        <div className="flex justify-center mb-8 gap-3">
          <button
            onClick={handleDemo}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 text-sm font-medium text-gray-300 hover:text-red-300"
          >
            <Zap className="w-4 h-4 text-amber-400 group-hover:text-red-400 transition-colors" />
            Try realistic failing scenario
          </button>

          {!useAI && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Demo mode (no API key)
            </div>
          )}
        </div>

        {loading ? (
          <LoadingAnimation />
        ) : prediction ? (
          <div className="animate-fade-in">
            <ResultCard prediction={prediction} onReset={handleReset} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {history.length > 0 && <HistoryTracker history={history} />}
              <DisciplineChart energy={formData.energy} hours={formData.hours} />
            </div>
          </div>
        ) : (
          <InputForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => handlePredict()}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
