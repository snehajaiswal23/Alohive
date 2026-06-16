"use client"
import { useState } from "react"
import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, ArrowUpRight, Clock } from "lucide-react"

type Alert = { id: number; name: string; service: string; complaint: string; time: string; resolved: boolean }

const INITIAL: Alert[] = [
  { id: 1, name: "Sunita Patel", service: "Facial", complaint: "Waited 45 minutes even with an appointment. Not ideal.", time: "2 hours ago", resolved: false },
  { id: 2, name: "Rahul Mishra", service: "Haircut", complaint: "The stylist changed mid-service without telling me.", time: "Yesterday", resolved: false },
]

export default function StaffAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL)

  const resolve  = (id: number) => setAlerts(a => a.map(x => x.id === id ? { ...x, resolved: true } : x))
  const pending  = alerts.filter(a => !a.resolved)
  const resolved = alerts.filter(a =>  a.resolved)

  return (
    <div>
      <StaffTopbar title="Alerts" subtitle="Unhappy customer feedback" alertCount={pending.length} />
      <div className="p-6 max-w-2xl space-y-5">

        {/* Pending */}
        {pending.length === 0 ? (
          <DashCard className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-full bg-growth-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-growth-600" />
            </div>
            <p className="font-semibold text-gray-700">All clear!</p>
            <p className="text-xs text-gray-400">No pending alerts right now.</p>
          </DashCard>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {pending.length} pending
            </p>
            {pending.map(alert => (
              <DashCard key={alert.id} className="border-red-200 bg-red-50/30">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{alert.name}</p>
                      <Badge color="gray" variant="subtle">{alert.service}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">
                      &ldquo;{alert.complaint}&rdquo;
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1.5">
                      <Clock size={10} /> {alert.time}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pl-12">
                  <Button variant="primary" size="sm" className="text-xs" onClick={() => resolve(alert.id)}>
                    <CheckCircle size={12} /> Mark resolved
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg text-xs">
                    <ArrowUpRight size={12} /> Escalate to owner
                  </Button>
                </div>
              </DashCard>
            ))}
          </div>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Resolved ({resolved.length})
            </p>
            {resolved.map(alert => (
              <DashCard key={alert.id} className="opacity-50">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="w-4 h-4 text-growth-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-gray-700 text-sm">{alert.name}</p>
                      <Badge color="green" variant="subtle">Resolved</Badge>
                    </div>
                    <p className="text-xs text-gray-400 italic">&ldquo;{alert.complaint}&rdquo;</p>
                  </div>
                </div>
              </DashCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
