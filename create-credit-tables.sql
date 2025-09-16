-- Credit Packages System Tables
-- Run this SQL in your Supabase SQL Editor

-- 1. Create Credit Packages table
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
);

-- 2. Create Credit Purchases table
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
  "userId" TEXT NOT NULL,
  
  CONSTRAINT "credit_purchases_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "credit_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Create Credit Transactions table
CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- 'EARNED', 'SPENT', 'EXPIRED', 'REFUNDED'
  "source" TEXT NOT NULL, -- 'SUBSCRIPTION', 'PURCHASE', 'BONUS', 'GENERATION', 'TRAINING', 'REFUND', 'EXPIRATION'
  "amount" INTEGER NOT NULL,
  "description" TEXT,
  "referenceId" TEXT,
  "creditPurchaseId" TEXT,
  "metadata" JSONB,
  "balanceAfter" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "credit_transactions_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "credit_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS "credit_purchases_userId_idx" ON "credit_purchases"("userId");
CREATE INDEX IF NOT EXISTS "credit_purchases_status_idx" ON "credit_purchases"("status");
CREATE INDEX IF NOT EXISTS "credit_purchases_validUntil_idx" ON "credit_purchases"("validUntil");
CREATE INDEX IF NOT EXISTS "credit_purchases_isExpired_idx" ON "credit_purchases"("isExpired");
CREATE INDEX IF NOT EXISTS "credit_purchases_packageId_idx" ON "credit_purchases"("packageId");

CREATE INDEX IF NOT EXISTS "credit_transactions_userId_idx" ON "credit_transactions"("userId");
CREATE INDEX IF NOT EXISTS "credit_transactions_type_idx" ON "credit_transactions"("type");
CREATE INDEX IF NOT EXISTS "credit_transactions_source_idx" ON "credit_transactions"("source");
CREATE INDEX IF NOT EXISTS "credit_transactions_createdAt_idx" ON "credit_transactions"("createdAt");
CREATE INDEX IF NOT EXISTS "credit_transactions_creditPurchaseId_idx" ON "credit_transactions"("creditPurchaseId");

-- 5. Insert default credit packages
INSERT INTO "credit_packages" ("id", "name", "description", "creditAmount", "price", "bonusCredits", "validityMonths", "sortOrder") VALUES
('ESSENTIAL', 'Pacote Essencial', 'Ideal para uso básico com 100 créditos', 100, 29.90, 0, 12, 1),
('ADVANCED', 'Pacote Avançado', 'Para usuários regulares com 300 créditos + 50 bonus', 300, 79.90, 50, 12, 2),
('PRO', 'Pacote Profissional', 'Para uso intensivo com 500 créditos + 100 bonus', 500, 119.90, 100, 12, 3),
('ULTIMATE', 'Pacote Ultimate', 'Máxima quantidade com 1000 créditos + 200 bonus', 1000, 199.90, 200, 12, 4)
ON CONFLICT ("id") DO NOTHING;

-- 6. Add missing columns to users table (if they don't exist)
DO $$ 
BEGIN
    -- Add creditsBalance column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'creditsBalance'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "creditsBalance" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 7. Update trigger for updatedAt columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON "credit_packages";
CREATE TRIGGER update_credit_packages_updated_at
    BEFORE UPDATE ON "credit_packages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_purchases_updated_at ON "credit_purchases";
CREATE TRIGGER update_credit_purchases_updated_at
    BEFORE UPDATE ON "credit_purchases"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;