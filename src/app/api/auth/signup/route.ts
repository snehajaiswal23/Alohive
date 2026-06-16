import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    email,
    password,
    ownerName,
    businessName,
    businessType,
    city,
    locality,
    phone,
    whatsappNumber,
    googleReviewLink,
    plan,
  } = body

  if (!email || !password || !ownerName || !businessName || !businessType || !city || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const { business, user } = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: businessName,
        type: businessType,
        city,
        locality: locality || null,
        phone,
        whatsappNumber: whatsappNumber || null,
        googleReviewLink: googleReviewLink || null,
        plan: plan || "trial",
      },
    })

    const user = await tx.user.create({
      data: {
        businessId: business.id,
        email,
        passwordHash,
        name: ownerName,
        role: "owner",
      },
    })

    return { business, user }
  })

  const token = await signSession({ userId: user.id, businessId: business.id, role: user.role })

  const res = NextResponse.json(
    {
      success: true,
      business: { id: business.id, name: business.name },
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
    { status: 201 },
  )

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return res
}
