import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log(`[email:dev] Password reset link for ${to}: ${resetUrl}`)
    return
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Alohive <noreply@alohive.in>",
    to,
    subject: "Reset your Alohive password",
    html: `<p>We received a request to reset your Alohive password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  })
}
