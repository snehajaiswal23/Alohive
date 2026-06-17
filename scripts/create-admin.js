const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const bcrypt = require("bcryptjs")
require("dotenv").config({ path: ".env.local" })

async function main() {
  const [email, password, name] = process.argv.slice(2)
  if (!email || !password || !name) {
    console.error("Usage: npm run create-admin -- <email> <password> <name>")
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    console.error(`Admin with email ${email} already exists.`)
    await prisma.$disconnect()
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = await prisma.adminUser.create({ data: { email, passwordHash, name } })
  console.log(`Created admin user: ${admin.email} (${admin.id})`)
  await prisma.$disconnect()
}

main()
