/**
 * One-time script to create the 3 Alohive plans in Razorpay.
 * Run once: node scripts/create-razorpay-plans.mjs
 *
 * After running, add the output plan IDs to .env.local:
 *   RAZORPAY_PLAN_ID_STARTER=plan_...
 *   RAZORPAY_PLAN_ID_GROWTH=plan_...
 *   RAZORPAY_PLAN_ID_PRO=plan_...
 */

import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const RAZORPAY_BASE = "https://api.razorpay.com/v1"
const auth = "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")

const PLANS = [
  { slug: "starter", name: "Starter",  amount: 99900,  env: "RAZORPAY_PLAN_ID_STARTER" },
  { slug: "growth",  name: "Growth",   amount: 249900, env: "RAZORPAY_PLAN_ID_GROWTH"  },
  { slug: "pro",     name: "Pro",      amount: 499900, env: "RAZORPAY_PLAN_ID_PRO"     },
]

async function createPlan(plan) {
  const existing = process.env[plan.env]
  if (existing) {
    console.log(`✓ ${plan.name} already set: ${existing}`)
    return existing
  }

  const res = await fetch(`${RAZORPAY_BASE}/plans`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      period: "monthly",
      interval: 1,
      item: {
        name: `Alohive ${plan.name}`,
        amount: plan.amount,
        unit_amount: plan.amount,
        currency: "INR",
        description: `Alohive ${plan.name} plan`,
      },
      notes: { slug: plan.slug },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    console.error(`✗ Failed to create ${plan.name}: ${data.error?.description || JSON.stringify(data)}`)
    return null
  }

  console.log(`✓ Created ${plan.name}: ${data.id}`)
  return data.id
}

async function main() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local")
    process.exit(1)
  }

  console.log("Creating Razorpay plans...\n")
  const ids = {}

  for (const plan of PLANS) {
    ids[plan.env] = await createPlan(plan)
  }

  console.log("\n─── Add these to your .env.local ───────────────────────")
  for (const [key, id] of Object.entries(ids)) {
    if (id) console.log(`${key}=${id}`)
  }
  console.log("────────────────────────────────────────────────────────")
}

main().catch((e) => { console.error(e.message); process.exit(1) })
