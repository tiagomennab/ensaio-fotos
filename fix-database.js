const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...')
    
    // 1. Add missing column asaasCustomerId to users table (if not exists)
    console.log('1. Adding asaasCustomerId column to users table...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'asaasCustomerId') THEN
              ALTER TABLE users ADD COLUMN "asaasCustomerId" TEXT UNIQUE;
          END IF;
      END $$;
    `
    
    // 2. Create user_consents table (if not exists)
    console.log('2. Creating user_consents table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_consents (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
          "ipAddress" TEXT NOT NULL,
          "userAgent" TEXT NOT NULL,
          essential BOOLEAN DEFAULT true NOT NULL,
          functional BOOLEAN DEFAULT false NOT NULL,
          analytics BOOLEAN DEFAULT false NOT NULL,
          marketing BOOLEAN DEFAULT false NOT NULL,
          version TEXT NOT NULL,
          "consentedAt" TIMESTAMP NOT NULL,
          "isRevocation" BOOLEAN DEFAULT false NOT NULL,
          "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
          "updatedAt" TIMESTAMP DEFAULT now() NOT NULL
      );
    `
    
    // 3. Add missing subscriptionCancelledAt column to users table
    console.log('3. Adding subscriptionCancelledAt column to users table...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'subscriptionCancelledAt') THEN
              ALTER TABLE users ADD COLUMN "subscriptionCancelledAt" TIMESTAMP;
          END IF;
      END $$;
    `

    // 4. Create indexes for user_consents table (if not exist)
    console.log('4. Creating indexes for user_consents table...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_consents' AND indexname = 'user_consents_userId_idx') THEN
              CREATE INDEX user_consents_userId_idx ON user_consents("userId");
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_consents' AND indexname = 'user_consents_ipAddress_idx') THEN
              CREATE INDEX user_consents_ipAddress_idx ON user_consents("ipAddress");
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_consents' AND indexname = 'user_consents_consentedAt_idx') THEN
              CREATE INDEX user_consents_consentedAt_idx ON user_consents("consentedAt");
          END IF;
      END $$;
    `
    
    console.log('✅ Database schema fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixDatabase()