import { PrismaClient } from '@prisma/client'

// Singleton lazy pattern - solo se inicializa cuando se usa
// En build time (Vercel), no hay DATABASE_URL disponible, pero db no se llama

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _client: PrismaClient | null = null

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    // En build time o cuando no hay DB, crear cliente dummy
    // que fallara gracefulmente si se llama
    console.warn('[db] DATABASE_URL not set, PrismaClient created in offline mode')
    return new PrismaClient()
  }

  // Usar Driver Adapter solo si hay conexion disponible
  try {
    // Dynamic import para evitar que pg se cargue en build time
    const { PrismaPg } = require('@prisma/adapter-pg')
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl: { rejectUnauthorized: false },
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    })
  } catch {
    // Si falla la carga del adapter, usar PrismaClient normal
    return new PrismaClient({
      log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    })
  }
}

export function getDb(): PrismaClient {
  if (_client) return _client
  _client = globalForPrisma.prisma ?? createClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _client
  }
  return _client
}

// Proxy para mantener compatibilidad con `import { db } from '@/lib/db'`
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
