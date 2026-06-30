import { PrismaClient } from '@prisma/client'

// Singleton lazy pattern - solo se inicializa cuando se usa
// En build time (Vercel), no hay DATABASE_URL disponible

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _client: PrismaClient | null = null

async function createClientAsync(): Promise<PrismaClient> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.warn('[db] DATABASE_URL not set, PrismaClient in offline mode')
    return new PrismaClient()
  }

  try {
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const pg = await import('pg')
    const pool = new pg.Pool({
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
    return new PrismaClient({
      log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    })
  }
}

// Cliente sincrono para compatibilidad
// Se inicializa de forma diferida con un proxy
export function getDb(): PrismaClient {
  if (_client) return _client
  // Creacion sincrona con fallback
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    _client = new PrismaClient()
  } else {
    try {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { PrismaPg } = require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg')
      const { Pool } = require('pg') as typeof import('pg')
      /* eslint-enable @typescript-eslint/no-require-imports */
      const pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        ssl: { rejectUnauthorized: false },
      })
      const adapter = new PrismaPg(pool)
      _client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
      })
    } catch {
      _client = new PrismaClient({
        log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
      })
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _client
  }
  return _client
}


export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
