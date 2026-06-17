import { config } from "dotenv"
config({ path: ".env.local" })
import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await pool.query(`
  ALTER TABLE "Subscription"
    ADD COLUMN IF NOT EXISTS "razorpayShortUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "paymentMethod"    JSONB;
`)

console.log("Migration complete — added razorpayShortUrl and paymentMethod to Subscription")
await pool.end()
