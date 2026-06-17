import { SignJWT, jwtVerify } from "jose"

const SESSION_COOKIE = "alohive_session"
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export type SessionPayload = {
  userId: string
  businessId: string
  role: string
  plan?: string
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
