import { NextRequest, NextResponse } from "next/server"
import { recalculateAllTiers } from "@/lib/loyalty"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { businessesProcessed, customersUpdated } = await recalculateAllTiers()

  return NextResponse.json({ businessesProcessed, customersUpdated })
}
