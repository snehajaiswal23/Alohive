"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashCard } from "@/components/ui/card"

export interface CustomerRow {
  id: string
  name: string
  phone: string
  totalVisits: number
  lastVisitAt: string | null
  feedbackAvg: number
}

interface CustomerTableProps {
  businessId: string
  initialCustomers: CustomerRow[]
  initialTotal: number
  pageSize: number
}

function formatDate(iso: string | null) {
  if (!iso) return "Never"
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function feedbackBadge(avg: number) {
  if (avg === 0) return <Badge color="gray" variant="subtle">No feedback</Badge>
  if (avg >= 4) return <Badge color="green" variant="subtle">{avg.toFixed(1)} ★</Badge>
  return <Badge color="red" variant="subtle">{avg.toFixed(1)} ★</Badge>
}

export function CustomerTable({ businessId, initialCustomers, initialTotal, pageSize }: CustomerTableProps) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [customers, setCustomers] = useState(initialCustomers)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) })
        const res = await fetch(`/api/business/${businessId}/customers?${params}`)
        const data = await res.json()
        if (res.ok) {
          setCustomers(data.customers)
          setTotal(data.total)
        }
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [businessId, q, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      <div className="flex-1 min-w-48">
        <Input
          theme="light"
          placeholder="Search by name or phone..."
          icon={<Search size={15} />}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <DashCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Customer", "Phone", "Visits", "Last visit", "Feedback score"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  {loading ? "Loading…" : "No customers found"}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-clarity-100 flex items-center justify-center text-xs font-bold text-clarity-700">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{c.phone}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.totalVisits}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(c.lastVisitAt)}</td>
                  <td className="px-5 py-3.5">{feedbackBadge(c.feedbackAvg)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DashCard>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {total === 0 ? "0 customers" : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-700 rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Prev
          </Button>
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-700 rounded-lg"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
