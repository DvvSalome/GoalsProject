import { Brain, ChevronDown, AlertCircle } from "lucide-react";

export default function InputForm({ formData, setFormData, onSubmit, error }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.goal.trim()) return;
    onSubmit();
  };

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto glass rounded-2xl p-6 sm:p-8 animate-slide-up"
    >
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Behavioral Input</h2>
      </div>

      {/* Goal */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-400 mb-1.5">
          What's your goal?
        </label>
        <input
          type="text"
          value={formData.goal}
          onChange={(e) => update("goal", e.target.value)}
          placeholder="e.g., Study 5 hours today"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
          required
        />
      </div>

      {/* Hours + Energy row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Hours planned
          </label>
          <input
            type="number"
            min="0.5"
            max="16"
            step="0.5"
            value={formData.hours}
            onChange={(e) => update("hours", parseFloat(e.target.value) || 1)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Energy level
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energy}
              onChange={(e) => update("energy", parseInt(e.target.value))}
              className="w-full mt-2 accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Dead</span>
              <span
                className={`font-mono font-bold text-sm ${
                  formData.energy <= 3
                    ? "text-red-400"
                    : formData.energy <= 6
                      ? "text-amber-400"
                      : "text-green-400"
                }`}
              >
                {formData.energy}/10
              </span>
              <span>Wired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mood + Consistency row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Current mood
          </label>
          <div className="relative">
            <select
              value={formData.mood}
              onChange={(e) => update("mood", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all cursor-pointer"
            >
              <option value="good" className="bg-gray-900">Good</option>
              <option value="neutral" className="bg-gray-900">Neutral</option>
              <option value="bad" className="bg-gray-900">Bad</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Past consistency
          </label>
          <div className="relative">
            <select
              value={formData.consistency}
              onChange={(e) => update("consistency", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all cursor-pointer"
            >
              <option value="high" className="bg-gray-900">High</option>
              <option value="medium" className="bg-gray-900">Medium</option>
              <option value="low" className="bg-gray-900">Low</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            How has your schedule been lately?
          </label>
          <div className="relative">
            <select
              value={formData.recentSchedule}
              onChange={(e) => update("recentSchedule", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all cursor-pointer"
            >
              <option value="stable" className="bg-gray-900">Stable</option>
              <option value="unstable" className="bg-gray-900">Unstable</option>
              <option value="chaotic" className="bg-gray-900">Chaotic</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            In the last few days, how much did you actually follow through?
          </label>
          <div className="relative">
            <select
              value={formData.recentFollowThrough}
              onChange={(e) => update("recentFollowThrough", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all cursor-pointer"
            >
              <option value="strong" className="bg-gray-900">I followed through well</option>
              <option value="partial" className="bg-gray-900">I did some, but not enough</option>
              <option value="little" className="bg-gray-900">Very little</option>
              <option value="none" className="bg-gray-900">Almost nothing</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-1.5">
          Give context from this week or the last few days
        </label>
        <textarea
          value={formData.recentHistory}
          onChange={(e) => update("recentHistory", e.target.value)}
          placeholder="e.g., This week I have had a bad sleep schedule, I haven't studied much, and every time I sit down I end up scrolling instead."
          rows="4"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          This helps the AI judge whether your goal matches your recent behavior instead of just your intention.
        </p>
      </div>

      {/* Distractions */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.distractions}
              onChange={(e) => update("distractions", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 rounded-full bg-white/10 peer-checked:bg-red-500/40 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gray-300 peer-checked:bg-red-400 peer-checked:translate-x-5 transition-all shadow-sm" />
          </div>
          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Distractions present? (phone, social media, people...)
          </span>
        </label>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!formData.goal.trim()}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 disabled:shadow-none active:scale-[0.98]"
      >
        Analyze My Behavior
      </button>
    </form>
  );
}
