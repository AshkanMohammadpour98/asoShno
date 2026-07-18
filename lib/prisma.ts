// @ts-ignore
import { PrismaClient } from '@prisma/client'
// @ts-ignore
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new pg.Pool({
  connectionString,
  max: 10, // Adjust based on your needs
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
})
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
