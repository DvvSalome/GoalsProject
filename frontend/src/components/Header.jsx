import { Brain, Eye } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center mb-10 animate-fade-in">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="relative">
          <Brain className="w-10 h-10 text-red-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="text-gradient">Reality Check</span>
          <span className="text-white/80"> AI</span>
        </h1>
      </div>
      <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto">
        Self-Sabotage Predictor
      </p>
      <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
        Predicts when you'll fail, why you'll fail, and what you're really doing wrong.
      </p>
    </header>
  );
}
