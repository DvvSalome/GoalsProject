import { History, TrendingUp } from "lucide-react";

const MOCK_HISTORY = [
  { goal: "Wake up at 6am every day", probability: 89, date: "Yesterday" },
  { goal: "Read for 2 hours", probability: 67, date: "2 days ago" },
  { goal: "No phone before noon", probability: 94, date: "3 days ago" },
];

export default function HistoryTracker({ history }) {
  const allHistory = [...history, ...MOCK_HISTORY].slice(0, 5);

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Failure History
        </h3>
      </div>

      <div className="space-y-3">
        {allHistory.map((item, i) => {
          const isHigh = item.probability >= 65;
          const isMed = item.probability >= 40;
          const color = isHigh
            ? "text-red-400"
            : isMed
              ? "text-amber-400"
              : "text-green-400";
          const barColor = isHigh
            ? "bg-red-500/40"
            : isMed
              ? "bg-amber-500/40"
              : "bg-green-500/40";

          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 truncate max-w-[60%]">
                  {item.goal}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{item.date}</span>
                  <span className={`text-sm font-bold font-mono ${color}`}>
                    {item.probability}%
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-700`}
                  style={{ width: `${item.probability}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-red-400" />
        <p className="text-xs text-gray-500">
          Pattern: You consistently overestimate your capacity.
        </p>
      </div>
    </div>
  );
}
