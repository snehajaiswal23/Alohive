"use client"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts"

export interface MonthlyReviewPoint {
  month: string      // "Jun", "Jul" etc.
  count: number
  avgRating: number | null
}

interface ReviewsGrowthChartProps {
  data: MonthlyReviewPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const count = payload.find((p) => p.name === "count")?.value
  const avg = payload.find((p) => p.name === "avgRating")?.value
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {count != null && <p className="text-gray-600">{count} review{count !== 1 ? "s" : ""}</p>}
      {avg != null && avg > 0 && <p className="text-amber-600">{avg.toFixed(1)} ★ avg</p>}
    </div>
  )
}

export function ReviewsGrowthChart({ data }: ReviewsGrowthChartProps) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">
        No review history yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="count" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis yAxisId="rating" orientation="right" domain={[0, 5]} tick={{ fontSize: 11, fill: "#fbbf24" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          yAxisId="count"
          type="monotone"
          dataKey="count"
          name="count"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#reviewGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#22c55e" }}
        />
        <Line
          yAxisId="rating"
          type="monotone"
          dataKey="avgRating"
          name="avgRating"
          stroke="#fbbf24"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "#fbbf24" }}
          strokeDasharray="4 3"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
