/**
 * Create the first admin user for the Alohive admin panel.
 * Usage: node scripts/create-admin.mjs <email> <password> <name>
 *
 * Example:
 *   node scripts/create-admin.mjs admin@alohive.in "MyStr0ngP@ss" "Alohive Admin"
 */

import { createPool } from "@vercel/postgres"
import { config } from "dotenv"
import bcrypt from "bcryptjs"

config({ path: ".env.local" })

const [, , email, password, name] = process.argv

if (!email || !password || !name) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> <name>")
  process.exit(1)
}

const pool = createPool({ connectionString: process.env.DATABASE_URL })

const hash = await bcrypt.hash(password, 10)

const { rows } = await pool.sql`
  INSERT INTO "AdminUser" (id, email, "passwordHash", name, "createdAt")
  VALUES (
    gen_random_uuid(),
    ${email},
    ${hash},
    ${name},
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
    SET "passwordHash" = EXCLUDED."passwordHash",
        name = EXCLUDED.name
  RETURNING id, email, name
`

console.log("Admin user created/updated:", rows[0])
await pool.end()
