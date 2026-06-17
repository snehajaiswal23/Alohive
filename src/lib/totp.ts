// RFC 6238 TOTP — implemented with Node.js built-in crypto only.
// Compatible with Google Authenticator, Authy, 1Password, etc.
import { createHmac, randomBytes } from "crypto"

// ── Base32 ────────────────────────────────────────────────────────────────────

const B32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

export function base32Encode(buf: Buffer): string {
  let bits = 0, val = 0, out = ""
  for (const byte of buf) {
    val = (val << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += B32_CHARS[(val >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += B32_CHARS[(val << (5 - bits)) & 31]
  return out
}

export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/, "")
  let bits = 0, val = 0
  const out: number[] = []
  for (const c of clean) {
    const idx = B32_CHARS.indexOf(c)
    if (idx === -1) continue
    val = (val << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8 }
  }
  return Buffer.from(out)
}

// ── TOTP core ─────────────────────────────────────────────────────────────────

const PERIOD = 30
const DIGITS = 6

function hotp(secret: Buffer, counter: bigint): string {
  const buf = Buffer.alloc(8)
  let c = counter
  for (let i = 7; i >= 0; i--) { buf[i] = Number(c & 0xffn); c >>= 8n }
  const hmac = createHmac("sha1", secret).update(buf).digest()
  const offset = hmac[19] & 0x0f
  const code =
    ((hmac[offset]     & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) <<  8) |
     (hmac[offset + 3] & 0xff)
  return String(code % Math.pow(10, DIGITS)).padStart(DIGITS, "0")
}

/** Generate a fresh 160-bit secret (base32-encoded, ready for QR). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20))
}

/**
 * Verify a 6-digit OTP. Accepts ±1 time-window tolerance (±30 s) so
 * clock skew between the admin's phone and the server doesn't lock them out.
 */
export function verifyTotp(secret: string, code: string): boolean {
  const key = base32Decode(secret)
  const t   = BigInt(Math.floor(Date.now() / 1000 / PERIOD))
  for (const delta of [-1n, 0n, 1n]) {
    if (hotp(key, t + delta) === code.replace(/\s/g, "")) return true
  }
  return false
}

/** otpauth:// URI for QR code display in authenticator apps. */
export function totpUri(secret: string, email: string, issuer = "AlohiveAdmin"): string {
  const label = encodeURIComponent(`${issuer}:${email}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD}`
}
