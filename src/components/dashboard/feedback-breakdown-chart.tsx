"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface FeedbackBreakdownChartProps {
  happy: number
  neutral: number
  unhappy: number
}

const COLORS = { happy: "#22c55e", neutral: "#fbbf24", unhappy: "#f87171" }

export function FeedbackBreakdownChart({ happy, neutral, unhappy }: FeedbackBreakdownChartProps) {
  const total = happy + neutral + unhappy
  const data = [
    { key: "happy", label: "Happy (4-5 ★)", value: happy, color: COLORS.happy },
    { key: "neutral", label: "Neutral (3 ★)", value: neutral, color: COLORS.neutral },
    { key: "unhappy", label: "Unhappy (1-2 ★)", value: unhappy, color: COLORS.unhappy },
  ]

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-sm text-gray-400">
        No feedback received today
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-[120px] h-[120px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={32} outerRadius={56} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((row) => (
          <div key={row.key} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
              <span>{row.label}</span>
            </div>
            <span className="font-medium text-gray-800">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
