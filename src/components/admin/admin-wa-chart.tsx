"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Props {
  data: { day: string; count: number }[]
}

export function AdminWaChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0f1117", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
          formatter={(v) => [Number(v ?? 0).toLocaleString("en-IN"), "Messages"]}
        />
        <Bar dataKey="count" fill="#2dd4bf" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
