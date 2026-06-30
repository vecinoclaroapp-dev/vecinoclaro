import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    // During build time, DATABASE_URL might not be set
    // Return a dummy client that won't be called
    return new PrismaClient()
  }

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl: { rejectUnauthorized: false },
    })
  }

  const adapter = new PrismaPg(globalForPrisma.pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  })
}

// Singleton pattern - solo se inicializa cuando se llama por primera vez
let _client: PrismaClient | null = null

export function getDb(): PrismaClient {
  if (_client) return _client
  _client = globalForPrisma.prisma ?? createPrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _client
  }
  return _client
}

// Proxy para mantener compatibilidad con `import { db } from '@/lib/db'`
// Pero solo se inicializa cuando se accede a una propiedad
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getDb()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
