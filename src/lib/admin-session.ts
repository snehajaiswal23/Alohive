import { SignJWT, jwtVerify } from "jose"

export const ADMIN_SESSION_COOKIE    = "alohive_admin_session"
export const ADMIN_CHALLENGE_COOKIE  = "alohive_admin_challenge"

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? process.env.NEXTAUTH_SECRET,
)

export type AdminSessionPayload = {
  adminId: string
  email: string
  name: string
}

// A short-lived token issued after password check, before TOTP is verified.
export type AdminChallengePayload = {
  adminId: string
  email: string
  challenge: true
}

export async function signAdminSession(payload: AdminSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")   // real sessions expire in 8 hours
    .sign(secret)
}

export async function signAdminChallenge(payload: AdminChallengePayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")   // TOTP must be entered within 5 minutes
    .sign(secret)
}

export async function verifyAdminSession(token: string) {
  const { payload } = await jwtVerify<AdminSessionPayload>(token, secret)
  return payload
}

export async function verifyAdminChallenge(token: string) {
  const { payload } = await jwtVerify<AdminChallengePayload>(token, secret)
  if (!payload.challenge) throw new Error("Not a challenge token")
  return payload
}
