import bcrypt from "bcrypt"
import { SignJWT, jwtVerify } from "jose"

const SESSION_COOKIE = "alohive_session"
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export type SessionPayload = {
  userId: string
  businessId: string
  role: string
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret)
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify<SessionPayload>(token, secret)
  return payload
}

export { SESSION_COOKIE }
