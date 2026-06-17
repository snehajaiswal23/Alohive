"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashCard } from "@/components/ui/card"

interface ServiceRow {
  id: string
  name: string
  category: string | null
  price: number | null
  isActive: boolean
}

interface StylistRow {
  id: string
  name: string
  roleLabel: string
}

interface CatalogManagementProps {
  businessId: string
  initialServices: ServiceRow[]
  initialStylists: StylistRow[]
}

export function CatalogManagement({ businessId, initialServices, initialStylists }: CatalogManagementProps) {
  const [services, setServices] = useState(initialServices)
  const [stylists, setStylists] = useState(initialStylists)

  const [serviceName, setServiceName] = useState("")
  const [serviceCategory, setServiceCategory] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceError, setServiceError] = useState("")
  const [serviceLoading, setServiceLoading] = useState(false)
  const [serviceBusyId, setServiceBusyId] = useState<string | null>(null)

  const [stylistName, setStylistName] = useState("")
  const [stylistRole, setStylistRole] = useState("")
  const [stylistError, setStylistError] = useState("")
  const [stylistLoading, setStylistLoading] = useState(false)
  const [stylistBusyId, setStylistBusyId] = useState<string | null>(null)

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault()
    setServiceLoading(true)
    setServiceError("")
    try {
      const res = await fetch(`/api/business/${businessId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceName,
          category: serviceCategory || undefined,
          price: servicePrice ? Number(servicePrice) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServiceError(data.error || "Something went wrong")
        return
      }
      setServices((prev) => [...prev, data.service])
      setServiceName("")
      setServiceCategory("")
      setServicePrice("")
    } catch {
      setServiceError("Network error. Please try again.")
    } finally {
      setServiceLoading(false)
    }
  }

  async function toggleServiceActive(service: ServiceRow) {
    setServiceBusyId(service.id)
    try {
      const res = await fetch(`/api/business/${businessId}/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      })
      if (!res.ok) return
      const data = await res.json()
      setServices((prev) => prev.map((s) => (s.id === service.id ? data.service : s)))
    } finally {
      setServiceBusyId(null)
    }
  }

  async function handleRemoveService(service: ServiceRow) {
    if (!confirm(`Remove "${service.name}"?`)) return
    setServiceBusyId(service.id)
    try {
      const res = await fetch(`/api/business/${businessId}/services/${service.id}`, { method: "DELETE" })
      if (!res.ok) return
      setServices((prev) => prev.filter((s) => s.id !== service.id))
    } finally {
      setServiceBusyId(null)
    }
  }

  async function handleAddStylist(e: React.FormEvent) {
    e.preventDefault()
    setStylistLoading(true)
    setStylistError("")
    try {
      const res = await fetch(`/api/business/${businessId}/stylists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: stylistName, roleLabel: stylistRole || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStylistError(data.error || "Something went wrong")
        return
      }
      setStylists((prev) => [...prev, data.stylist])
      setStylistName("")
      setStylistRole("")
    } catch {
      setStylistError("Network error. Please try again.")
    } finally {
      setStylistLoading(false)
    }
  }

  async function handleRemoveStylist(stylist: StylistRow) {
    if (!confirm(`Remove ${stylist.name}?`)) return
    setStylistBusyId(stylist.id)
    try {
      const res = await fetch(`/api/business/${businessId}/stylists/${stylist.id}`, { method: "DELETE" })
      if (!res.ok) return
      setStylists((prev) => prev.filter((s) => s.id !== stylist.id))
    } finally {
      setStylistBusyId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DashCard>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Services</h2>
        {services.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No services added yet.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.category || "—"}{s.price != null ? ` · ₹${s.price}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={s.isActive ? "green" : "gray"} variant="subtle">
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <button
                    disabled={serviceBusyId === s.id}
                    onClick={() => toggleServiceActive(s)}
                    className="text-xs text-clarity-600 hover:text-clarity-700 disabled:opacity-50"
                  >
                    {s.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    disabled={serviceBusyId === s.id}
                    onClick={() => handleRemoveService(s)}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddService} className="flex flex-col gap-2 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <Input theme="light" placeholder="Service name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
            <Input theme="light" placeholder="Category (optional)" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} />
          </div>
          <Input theme="light" type="number" placeholder="Price in ₹ (optional)" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} />
          {serviceError && <p className="text-xs text-red-500">{serviceError}</p>}
          <Button type="submit" variant="primary" size="sm" disabled={serviceLoading}>
            {serviceLoading ? "Adding…" : "+ Add service"}
          </Button>
        </form>
      </DashCard>

      <DashCard>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Stylists</h2>
        {stylists.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No stylists added yet.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {stylists.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.roleLabel}</p>
                </div>
                <button
                  disabled={stylistBusyId === s.id}
                  onClick={() => handleRemoveStylist(s)}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddStylist} className="flex flex-col gap-2 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <Input theme="light" placeholder="Stylist name" value={stylistName} onChange={(e) => setStylistName(e.target.value)} required />
            <Input theme="light" placeholder="Role (e.g. Senior Stylist)" value={stylistRole} onChange={(e) => setStylistRole(e.target.value)} />
          </div>
          {stylistError && <p className="text-xs text-red-500">{stylistError}</p>}
          <Button type="submit" variant="primary" size="sm" disabled={stylistLoading}>
            {stylistLoading ? "Adding…" : "+ Add stylist"}
          </Button>
        </form>
      </DashCard>
    </div>
  )
}
