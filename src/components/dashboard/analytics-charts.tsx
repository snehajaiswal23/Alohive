"use client"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import type { AnalyticsSummary } from "@/lib/analytics"
import { formatCurrency } from "@/lib/utils"

// ── Tooltip helpers ──────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const rev = payload.find((p) => p.name === "revenue")?.value ?? 0
  const visits = payload.find((p) => p.name === "visits")?.value ?? 0
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-growth-600">{formatCurrency(rev)}</p>
      <p className="text-gray-400">{visits} visit{visits !== 1 ? "s" : ""}</p>
    </div>
  )
}

function CampaignTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const sent = payload.find((p) => p.name === "sentCount")?.value ?? 0
  const recovered = payload.find((p) => p.name === "recoveredCount")?.value ?? 0
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-800 mb-1 truncate max-w-[180px]">{label}</p>
      <p className="text-gray-500">{sent} sent</p>
      <p className="text-growth-600">{recovered} recovered</p>
      {sent > 0 && (
        <p className="text-trust-600 font-medium mt-0.5">{Math.round((recovered / sent) * 100)}% ROI</p>
      )}
    </div>
  )
}

// ── Revenue area chart ────────────────────────────────────────────────

export function RevenueChart({ data }: { data: AnalyticsSummary["monthlyRevenue"] }) {
  if (data.every((d) => d.revenue === 0)) {
    return <EmptyChart message="No revenue data yet — start logging visits with bill amounts." />
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={1} />
        <YAxis
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}
          width={48}
        />
        <Tooltip content={<RevenueTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="revenue"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#16a34a" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Campaign ROI bar chart ────────────────────────────────────────────

export function CampaignROIChart({ data }: { data: AnalyticsSummary["campaignROI"] }) {
  if (data.length === 0) {
    return <EmptyChart message="No campaigns sent yet. Launch one from the AI Studio." />
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#374151" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<CampaignTooltip />} />
        <ReferenceLine x={0} stroke="#e5e7eb" />
        <Bar dataKey="sentCount" name="sentCount" fill="#e5e7eb" radius={[0, 2, 2, 0]} barSize={10} />
        <Bar dataKey="recoveredCount" name="recoveredCount" radius={[0, 2, 2, 0]} barSize={10}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.roiPct >= 20 ? "#16a34a" : entry.roiPct >= 10 ? "#2563eb" : "#f59e0b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Peak hours heatmap ────────────────────────────────────────────────

const HEAT_CLASSES = [
  "bg-gray-100",
  "bg-growth-100",
  "bg-growth-200",
  "bg-growth-300",
  "bg-growth-400",
  "bg-growth-500",
]

export function PeakHoursHeatmap({
  days,
  hours,
  data,
}: {
  days: string[]
  hours: number[]
  data: number[][]
}) {
  const hasData = data.some((row) => row.some((v) => v > 0))

  if (!hasData) {
    return <EmptyChart message="Visit more customers to see peak hour patterns." />
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-6">
          {days.map((d) => (
            <div key={d} className="h-7 flex items-center text-xs text-gray-400 w-8">{d}</div>
          ))}
        </div>
        <div>
          {/* Hour labels */}
          <div className="flex gap-1 mb-1">
            {hours.map((h) => (
              <div key={h} className="w-7 text-center text-xs text-gray-400">{h}</div>
            ))}
          </div>
          {/* Grid */}
          {data.map((row, di) => (
            <div key={di} className="flex gap-1 mb-1">
              {row.map((val, hi) => (
                <div
                  key={hi}
                  className={`w-7 h-7 rounded transition-all ${HEAT_CLASSES[Math.min(val, 5)]}`}
                  title={`${days[di]} ${hours[hi]}:00 — ${val === 0 ? "quiet" : val === 5 ? "peak" : "moderate"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <span>Quiet</span>
        {HEAT_CLASSES.map((c, i) => (
          <div key={i} className={`w-4 h-4 rounded ${c}`} />
        ))}
        <span>Peak</span>
      </div>
    </div>
  )
}

// ── Staff performance table ───────────────────────────────────────────

export function StaffTable({ data }: { data: AnalyticsSummary["staffPerformance"] }) {
  if (data.length === 0) {
    return <EmptyChart message="Add staff members to track performance." />
  }
  const maxRevenue = Math.max(1, ...data.map((s) => s.revenue))
  const maxVisits  = Math.max(1, ...data.map((s) => s.visits))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="border-b border-gray-100">
            {["Staff", "Role", "Visits", "Revenue", "Avg rating"].map((h) => (
              <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400 pr-4 last:pr-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="py-3 font-medium text-gray-800 pr-4">{s.name}</td>
              <td className="py-3 text-xs text-gray-400 pr-4">{s.role}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-trust-400 rounded-full"
                      style={{ width: `${(s.visits / maxVisits) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 tabular-nums">{s.visits}</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-growth-400 rounded-full"
                      style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium text-growth-600 tabular-nums">{formatCurrency(s.revenue)}</span>
                </div>
              </td>
              <td className="py-3">
                {s.avgRating != null ? (
                  <span className="text-amber-600 font-medium">{s.avgRating.toFixed(1)} ★</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[120px] text-sm text-gray-400 text-center px-4">
      {message}
    </div>
  )
}
