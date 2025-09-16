/**
 * Script to create credit packages tables in Supabase
 * Run with: node create-credit-tables.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCreditTables() {
  try {
    console.log('🗄️ Creating credit packages system tables...');

    // 1. Create Credit Packages table
    console.log('Creating credit_packages table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "credit_packages" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "creditAmount" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "bonusCredits" INTEGER NOT NULL DEFAULT 0,
        "validityMonths" INTEGER NOT NULL DEFAULT 12,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Credit Purchases table
    console.log('Creating credit_purchases table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "credit_purchases" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "asaasPaymentId" TEXT UNIQUE,
        "packageId" TEXT,
        "packageName" TEXT NOT NULL,
        "creditAmount" INTEGER NOT NULL,
        "bonusCredits" INTEGER NOT NULL DEFAULT 0,
        "value" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "usedCredits" INTEGER NOT NULL DEFAULT 0,
        "validUntil" TIMESTAMP(3) NOT NULL,
        "isExpired" BOOLEAN NOT NULL DEFAULT false,
        "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "confirmedAt" TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL
      )
    `);

    // 3. Create Credit Transactions table
    console.log('Creating credit_transactions table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "credit_transactions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "amount" INTEGER NOT NULL,
        "description" TEXT,
        "referenceId" TEXT,
        "creditPurchaseId" TEXT,
        "metadata" JSONB,
        "balanceAfter" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Add foreign key constraints (one by one)
    console.log('Adding foreign key constraints...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "credit_purchases" 
        ADD CONSTRAINT "credit_purchases_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Foreign key constraint credit_purchases_userId_fkey already exists');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "credit_purchases" 
        ADD CONSTRAINT "credit_purchases_packageId_fkey" 
        FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Foreign key constraint credit_purchases_packageId_fkey already exists');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "credit_transactions" 
        ADD CONSTRAINT "credit_transactions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Foreign key constraint credit_transactions_userId_fkey already exists');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "credit_transactions" 
        ADD CONSTRAINT "credit_transactions_creditPurchaseId_fkey" 
        FOREIGN KEY ("creditPurchaseId") REFERENCES "credit_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Foreign key constraint credit_transactions_creditPurchaseId_fkey already exists');
    }

    // 5. Create indexes (one by one)
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "credit_purchases_userId_idx" ON "credit_purchases"("userId")',
      'CREATE INDEX IF NOT EXISTS "credit_purchases_status_idx" ON "credit_purchases"("status")',
      'CREATE INDEX IF NOT EXISTS "credit_purchases_validUntil_idx" ON "credit_purchases"("validUntil")',
      'CREATE INDEX IF NOT EXISTS "credit_purchases_isExpired_idx" ON "credit_purchases"("isExpired")',
      'CREATE INDEX IF NOT EXISTS "credit_purchases_packageId_idx" ON "credit_purchases"("packageId")',
      'CREATE INDEX IF NOT EXISTS "credit_transactions_userId_idx" ON "credit_transactions"("userId")',
      'CREATE INDEX IF NOT EXISTS "credit_transactions_type_idx" ON "credit_transactions"("type")',
      'CREATE INDEX IF NOT EXISTS "credit_transactions_source_idx" ON "credit_transactions"("source")',
      'CREATE INDEX IF NOT EXISTS "credit_transactions_createdAt_idx" ON "credit_transactions"("createdAt")',
      'CREATE INDEX IF NOT EXISTS "credit_transactions_creditPurchaseId_idx" ON "credit_transactions"("creditPurchaseId")'
    ];

    for (const indexSql of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexSql);
      } catch (e) {
        console.log('Index already exists:', e.message);
      }
    }

    // 6. Insert default credit packages (one by one)
    console.log('Inserting default credit packages...');
    const packages = [
      ['ESSENTIAL', 'Pacote Essencial', 'Ideal para uso básico com 100 créditos', 100, 29.90, 0, 12, 1],
      ['ADVANCED', 'Pacote Avançado', 'Para usuários regulares com 300 créditos + 50 bonus', 300, 79.90, 50, 12, 2],
      ['PRO', 'Pacote Profissional', 'Para uso intensivo com 500 créditos + 100 bonus', 500, 119.90, 100, 12, 3],
      ['ULTIMATE', 'Pacote Ultimate', 'Máxima quantidade com 1000 créditos + 200 bonus', 1000, 199.90, 200, 12, 4]
    ];

    for (const [id, name, description, creditAmount, price, bonusCredits, validityMonths, sortOrder] of packages) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "credit_packages" ("id", "name", "description", "creditAmount", "price", "bonusCredits", "validityMonths", "sortOrder") 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT ("id") DO NOTHING
        `, id, name, description, creditAmount, price, bonusCredits, validityMonths, sortOrder);
      } catch (e) {
        console.log(`Package ${id} already exists or error:`, e.message);
      }
    }

    // 7. Add creditsBalance column to users table if it doesn't exist
    console.log('Adding creditsBalance column to users table...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "users" ADD COLUMN "creditsBalance" INTEGER NOT NULL DEFAULT 0
      `);
      console.log('✅ Added creditsBalance column to users table');
    } catch (e) {
      console.log('creditsBalance column already exists in users table');
    }

    console.log('✅ Credit packages system tables created successfully!');
    
    // Verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('credit_packages', 'credit_purchases', 'credit_transactions');
    `;
    
    console.log('📋 Created tables:', tables);

    // Show package data
    const packageData = await prisma.$queryRaw`SELECT * FROM credit_packages ORDER BY "sortOrder";`;
    console.log('💳 Credit packages:', packageData);

  } catch (error) {
    console.error('❌ Error creating credit tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createCreditTables()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createCreditTables };