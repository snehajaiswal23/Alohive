import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/analytics/peak-hours">) {
  const { id } = await ctx.params
  // Returns a 7×12 matrix (days × hours 9am-8pm) with visit counts
  return Response.json({
    businessId: id,
    days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    hours: [9,10,11,12,13,14,15,16,17,18,19,20],
    data: [
      [0,2,3,3,4,5,4,3,3,2,1,0],
      [0,3,4,5,5,4,3,4,5,4,2,0],
      [0,2,3,4,5,5,4,3,2,2,1,0],
      [0,2,3,4,4,3,3,4,4,3,2,0],
      [0,3,4,5,5,4,4,5,5,4,2,0],
      [3,4,5,5,5,4,4,5,5,5,4,2],
      [1,2,2,3,3,2,2,2,3,3,2,0],
    ],
  })
}
