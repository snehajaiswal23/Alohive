// Adds totpSecret + totpEnabled to AdminUser, creates FeatureFlag table,
// and seeds initial flags. Safe to re-run (uses IF NOT EXISTS / DO NOTHING).
import { config } from "dotenv"
import pg from "pg"

config({ path: ".env.local" })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

await pool.query(`
  ALTER TABLE "AdminUser"
    ADD COLUMN IF NOT EXISTS "totpSecret"  TEXT,
    ADD COLUMN IF NOT EXISTS "totpEnabled" BOOLEAN NOT NULL DEFAULT FALSE;
`)
console.log("✓ AdminUser: totpSecret, totpEnabled")

await pool.query(`
  CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key          TEXT UNIQUE NOT NULL,
    label        TEXT NOT NULL,
    description  TEXT,
    "enabledFor" TEXT NOT NULL DEFAULT 'all',
    "isEnabled"  BOOLEAN NOT NULL DEFAULT TRUE,
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy"  TEXT
  );
`)
console.log("✓ FeatureFlag table")

const flags = [
  { key: "ai_studio",          label: "AI Marketing Studio",    desc: "Generate campaign content with AI",              enabledFor: "growth_pro", enabled: true  },
  { key: "competitors",        label: "Competitor Tracking",    desc: "Track competitor Google ratings",                enabledFor: "pro_only",   enabled: true  },
  { key: "ai_assistant",       label: "AI Assistant chat",      desc: "Ask business questions to AI",                  enabledFor: "growth_pro", enabled: true  },
  { key: "multi_location",     label: "Multi-location",         desc: "Manage multiple branches",                      enabledFor: "pro_only",   enabled: false },
  { key: "advanced_analytics", label: "Advanced analytics",     desc: "LTV, campaign ROI, staff performance",          enabledFor: "growth_pro", enabled: true  },
  { key: "referral_program",   label: "Referral engine",        desc: "Customer referral tracking and rewards",        enabledFor: "all",        enabled: true  },
  { key: "win_back",           label: "Win-back campaigns",     desc: "Auto-detect and contact churned customers",     enabledFor: "growth_pro", enabled: true  },
]

for (const f of flags) {
  await pool.query(
    `INSERT INTO "FeatureFlag" (key, label, description, "enabledFor", "isEnabled")
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (key) DO NOTHING`,
    [f.key, f.label, f.desc, f.enabledFor, f.enabled],
  )
}
console.log("✓ FeatureFlag seed (7 flags)")

await pool.end()
console.log("Migration complete.")
