import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    errorFormat: 'minimal',
    // Connection pool optimization for Supabase
    __internal: {
      engine: {
        // Increased timeouts for better resilience with Supabase
        pool_timeout: 60000, // 60 seconds (was 30)
        connection_limit: 15, // Reduced from 20 to avoid Supabase limits
        // Connection retry configuration
        connect_timeout: 30000, // 30 seconds for initial connection
        query_timeout: 45000,   // 45 seconds for individual queries
        // Connection pool management
        pool_max_idle_time: 300000, // 5 minutes idle time
        pool_min_size: 1,      // Minimum connections in pool
        pool_max_size: 10,     // Maximum connections (conservative for Supabase)
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma