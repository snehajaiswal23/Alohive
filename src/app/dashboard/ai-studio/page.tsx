import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { AIStudioClient } from "./ai-studio-client"

export default async function AIStudioPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  if (!payload) redirect("/login")
  return <AIStudioClient businessId={payload.businessId} />
}
