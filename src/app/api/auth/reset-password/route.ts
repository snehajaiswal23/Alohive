import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password required" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const hashedToken = createHash("sha256").update(token).digest("hex")
  const user = await prisma.user.findFirst({
    where: { resetToken: hashedToken, resetTokenExpiresAt: { gt: new Date() } },
  })
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  })

  return NextResponse.json({ success: true })
}
