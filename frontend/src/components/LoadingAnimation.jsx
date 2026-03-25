import { Brain, Search, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "Scanning your behavioral patterns...",
  "Detecting self-sabotage signals...",
  "Analyzing energy-goal mismatch...",
  "Cross-referencing with failure archetypes...",
  "Calculating your discipline coefficient...",
  "Identifying your critical break point...",
  "Generating brutally honest assessment...",
];

export default function LoadingAnimation() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-red-500/20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-t-red-400 border-r-orange-400 border-b-transparent border-l-transparent animate-spin" />
          <Brain className="w-8 h-8 text-red-400 absolute animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <Search className="w-3 h-3 text-red-400" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-3 h-3 text-orange-400" />
        </div>
      </div>

      <p className="text-gray-300 font-medium text-lg mb-2">Analyzing you...</p>
      <p className="text-gray-500 text-sm h-5 transition-all duration-300">
        {LOADING_MESSAGES[msgIndex]}
      </p>

      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-red-400/60"
            style={{
              animation: "pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
