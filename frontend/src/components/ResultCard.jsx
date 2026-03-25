import {
  AlertTriangle,
  Target,
  Clock,
  Lightbulb,
  Flame,
  Ghost,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

function getRiskColor(risk) {
  switch (risk) {
    case "high":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        ring: "ring-red-500/20",
        glow: "shadow-red-500/20",
        gradient: "from-red-600 to-rose-600",
        probBg: "bg-red-500/20",
        label: "HIGH RISK",
      };
    case "medium":
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        ring: "ring-amber-500/20",
        glow: "shadow-amber-500/20",
        gradient: "from-amber-600 to-orange-600",
        probBg: "bg-amber-500/20",
        label: "MEDIUM RISK",
      };
    default:
      return {
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        ring: "ring-green-500/20",
        glow: "shadow-green-500/20",
        gradient: "from-green-600 to-emerald-600",
        probBg: "bg-green-500/20",
        label: "LOW RISK",
      };
  }
}

export default function ResultCard({ prediction, onReset }) {
  const c = getRiskColor(prediction.risk_level);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Probability Hero Card */}
      <div
        className={`glass rounded-2xl p-8 text-center animate-scale-in ${c.border} border`}
      >
        <div className="mb-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest ${c.bg} ${c.text} ${c.border} border`}
          >
            {c.label}
          </span>
        </div>

        <div className="relative inline-block my-4">
          <span
            className={`text-8xl sm:text-9xl font-black font-mono ${c.text} tracking-tighter`}
          >
            {prediction.failure_probability}
          </span>
          <span className={`text-3xl font-bold ${c.text} ml-1`}>%</span>
          <div
            className={`absolute -inset-4 ${c.probBg} rounded-full blur-2xl -z-10 opacity-50`}
          />
        </div>

        <p className="text-gray-400 text-sm font-medium">
          Probability of failure
        </p>
      </div>

      {/* Insight Cards */}
      <div className="grid gap-4">
        {/* Main Reason */}
        <InsightCard
          icon={<Target className="w-5 h-5" />}
          title="Main Reason"
          content={prediction.main_reason}
          color="red"
        />

        {/* Critical Point */}
        <InsightCard
          icon={<Clock className="w-5 h-5" />}
          title="Critical Moment"
          content={prediction.critical_point}
          color="amber"
        />

        {/* Intervention */}
        <InsightCard
          icon={<Lightbulb className="w-5 h-5" />}
          title="What To Do Instead"
          content={prediction.intervention}
          color="green"
        />

        {/* Brutal Message — highlighted */}
        <div
          className={`glass rounded-2xl p-5 border ${c.border} ${c.bg} animate-slide-up`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg ${c.glow}`}
            >
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${c.text} mb-1 uppercase tracking-wider`}>
                Reality Check
              </h3>
              <p className="text-white font-medium text-base leading-relaxed">
                "{prediction.tone_message}"
              </p>
            </div>
          </div>
        </div>

        {/* Impostor Syndrome */}
        {prediction.impostor_detected && prediction.impostor_message && (
          <div
            className="glass rounded-2xl p-5 border border-purple-500/30 bg-purple-500/5 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Ghost className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-purple-400 mb-1 uppercase tracking-wider">
                  Impostor Syndrome Detected
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {prediction.impostor_message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-white/10 transition-all text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Analyze another goal
        </button>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, content, color }) {
  const colors = {
    red: {
      iconBg: "from-red-600 to-rose-600",
      glow: "shadow-red-500/20",
      title: "text-red-400",
    },
    amber: {
      iconBg: "from-amber-600 to-orange-600",
      glow: "shadow-amber-500/20",
      title: "text-amber-400",
    },
    green: {
      iconBg: "from-green-600 to-emerald-600",
      glow: "shadow-green-500/20",
      title: "text-green-400",
    },
  };

  const c = colors[color] || colors.red;

  return (
    <div
      className="glass rounded-2xl p-5 animate-slide-up"
      style={{ animationDelay: `${color === "red" ? 0 : color === "amber" ? 0.1 : 0.2}s` }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${c.iconBg} flex items-center justify-center shadow-lg ${c.glow}`}
        >
          <span className="text-white">{icon}</span>
        </div>
        <div>
          <h3 className={`text-sm font-bold ${c.title} mb-1 uppercase tracking-wider`}>
            {title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
