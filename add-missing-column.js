const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addMissingColumn() {
  try {
    console.log('🔧 Adding missing subscriptionCancelledAt column...')
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'subscriptionCancelledAt') THEN
              ALTER TABLE users ADD COLUMN "subscriptionCancelledAt" TIMESTAMP;
              RAISE NOTICE 'Column subscriptionCancelledAt added successfully';
          ELSE
              RAISE NOTICE 'Column subscriptionCancelledAt already exists';
          END IF;
      END $$;
    `
    
    console.log('✅ Database column fix completed!')
    
  } catch (error) {
    console.error('❌ Error adding column:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addMissingColumn()