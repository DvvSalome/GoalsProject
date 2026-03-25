import { Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function generateMockData(energy, hours) {
  const points = [];
  const maxDiscipline = Math.min(energy * 10, 90);
  const decayRate = 0.15 + (10 - energy) * 0.05;

  for (let t = 0; t <= hours * 60; t += 15) {
    const hourMark = t / 60;
    const base = maxDiscipline * Math.exp(-decayRate * hourMark);
    const noise = (Math.random() - 0.5) * 10;
    const phoneCheck = t > 30 && t % 45 < 15 ? -15 : 0;
    const discipline = Math.max(5, Math.min(100, base + noise + phoneCheck));

    points.push({
      time: `${Math.floor(t / 60)}h${(t % 60).toString().padStart(2, "0")}`,
      discipline: Math.round(discipline),
      motivation: Math.round(
        Math.max(10, maxDiscipline * 0.8 * Math.exp(-decayRate * 0.7 * hourMark) + (Math.random() - 0.5) * 8)
      ),
    });
  }
  return points;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-red-400 font-medium">
        Discipline: {payload[0]?.value}%
      </p>
      {payload[1] && (
        <p className="text-amber-400 font-medium">
          Motivation: {payload[1]?.value}%
        </p>
      )}
    </div>
  );
};

export default function DisciplineChart({ energy, hours }) {
  const data = generateMockData(energy, hours);

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Discipline vs Time (Predicted)
        </h3>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="disciplineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="motivationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "#374151" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="discipline"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#disciplineGrad)"
            />
            <Area
              type="monotone"
              dataKey="motivation"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="url(#motivationGrad)"
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
          <span className="text-xs text-gray-500">Discipline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-amber-500 rounded border-dashed" />
          <span className="text-xs text-gray-500">Motivation</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center mt-2">
        Projected decline based on your energy and session length
      </p>
    </div>
  );
}
