import { StaffSidebar } from "@/components/staff/staff-sidebar"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-root flex h-screen overflow-hidden">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
