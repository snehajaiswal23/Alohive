"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashCard } from "@/components/ui/card"
import { X } from "lucide-react"

interface StaffMember {
  id: string
  name: string
  email: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

interface StaffManagementProps {
  businessId: string
  initialStaff: StaffMember[]
}

export function StaffManagement({ businessId, initialStaff }: StaffManagementProps) {
  const [staff, setStaff] = useState(initialStaff)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setStaff((prev) => [...prev, data.staff])
      setShowAdd(false)
      setName("")
      setEmail("")
      setPassword("")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(member: StaffMember) {
    setBusyId(member.id)
    try {
      const res = await fetch(`/api/business/${businessId}/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !member.isActive }),
      })
      if (!res.ok) return
      const data = await res.json()
      setStaff((prev) => prev.map((s) => (s.id === member.id ? data.staff : s)))
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(member: StaffMember) {
    if (!confirm(`Remove ${member.name}? This permanently deletes their account.`)) return
    setBusyId(member.id)
    try {
      const res = await fetch(`/api/business/${businessId}/staff/${member.id}`, { method: "DELETE" })
      if (!res.ok) return
      setStaff((prev) => prev.filter((s) => s.id !== member.id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashCard>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Staff accounts</h2>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Add staff</Button>
      </div>

      {staff.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No receptionists added yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Name", "Email", "Status", ""].map((h) => (
                <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-gray-50">
                <td className="py-3 font-medium text-gray-800">{s.name}</td>
                <td className="py-3 text-gray-500">{s.email}</td>
                <td className="py-3">
                  <Badge color={s.isActive ? "green" : "gray"} variant="subtle">
                    {s.isActive ? "Active" : "Revoked"}
                  </Badge>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <button
                      disabled={busyId === s.id}
                      onClick={() => toggleActive(s)}
                      className="text-xs text-clarity-600 hover:text-clarity-700 disabled:opacity-50"
                    >
                      {s.isActive ? "Revoke" : "Restore"}
                    </button>
                    <button
                      disabled={busyId === s.id}
                      onClick={() => handleRemove(s)}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[16px] p-6 w-full max-w-sm relative">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Add staff member</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <Input
                theme="light"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                theme="light"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                theme="light"
                label="Temporary password"
                type="text"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" variant="primary" className="w-full mt-1" disabled={loading}>
                {loading ? "Adding…" : "Add staff"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </DashCard>
  )
}
