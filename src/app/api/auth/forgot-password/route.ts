import { NextRequest, NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  let devResetUrl: string | undefined

  if (user) {
    const rawToken = randomBytes(32).toString("hex")
    const hashedToken = createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiresAt: expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`
    await sendPasswordResetEmail(user.email, resetUrl)

    if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
      devResetUrl = resetUrl
    }
  }

  return NextResponse.json({
    success: true,
    message: "Reset link sent if email exists",
    ...(devResetUrl ? { devResetUrl } : {}),
  })
}
