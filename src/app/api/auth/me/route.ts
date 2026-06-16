import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // TODO: verify JWT, fetch user from DB
  return Response.json({ id: "u_1", email: "priya@glossstudio.com", role: "owner", name: "Priya Mehta" })
}
