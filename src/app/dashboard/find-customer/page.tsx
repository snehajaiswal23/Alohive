"use client"
import { useState } from "react"
import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, Phone } from "lucide-react"
import Link from "next/link"

const CUSTOMER = {
  name: "Aditi Sharma",
  phone: "+91 98765 43210",
  visits: 14,
  lastVisit: "3 days ago",
  points: 1420,
  tier: "Gold",
  services: ["Hair color (3×)", "Hair spa (2×)", "Haircut (5×)", "Facial (4×)"],
}

export default function FindCustomerPage() {
  const [query, setQuery] = useState("")
  const found = query.trim().length >= 3

  return (
    <div>
      <StaffTopbar title="Find customer" subtitle="Look up by name or phone number" alertCount={2} />
      <div className="p-6 max-w-md space-y-5">
        <Input
          theme="light"
          placeholder="Name or phone…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          icon={<Search size={15} />}
          autoFocus
        />

        {found && (
          <DashCard className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-trust-100 flex items-center justify-center text-lg font-bold text-trust-700">
                {CUSTOMER.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900">{CUSTOMER.name}</p>
                  <Badge color="amber" variant="subtle">{CUSTOMER.tier}</Badge>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone size={11} /> {CUSTOMER.phone}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{CUSTOMER.visits}</p>
                <p className="text-xs text-gray-500 mt-0.5">Visits</p>
              </div>
              <div className="bg-trust-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-trust-700">{CUSTOMER.points.toLocaleString()}</p>
                <p className="text-xs text-trust-500 mt-0.5">Points</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Clock size={14} className="text-gray-400 mx-auto mb-0.5" />
                <p className="text-xs font-medium text-gray-700">{CUSTOMER.lastVisit}</p>
                <p className="text-xs text-gray-400">Last visit</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Services used</p>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOMER.services.map(s => (
                  <Badge key={s} color="teal" variant="subtle">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Link href="/dashboard/log-visit" className="flex-1">
                <button className="w-full text-sm font-medium text-white bg-trust-500 hover:bg-trust-600 rounded-lg py-2.5 transition-colors">
                  Log visit
                </button>
              </Link>
              <Link href="/dashboard/redeem" className="flex-1">
                <button className="w-full text-sm font-medium text-trust-600 bg-trust-50 hover:bg-trust-100 border border-trust-200 rounded-lg py-2.5 transition-colors">
                  Redeem points
                </button>
              </Link>
            </div>
          </DashCard>
        )}

        {!found && query.length > 0 && (
          <p className="text-sm text-center text-gray-400 py-4">Keep typing to search…</p>
        )}
      </div>
    </div>
  )
}
