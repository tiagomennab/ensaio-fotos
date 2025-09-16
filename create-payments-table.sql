-- Create payments table and related enums based on Prisma schema

-- Create enums first
DO $$ BEGIN
    -- PaymentType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
        CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'CREDIT_PURCHASE', 'PHOTO_PACKAGE');
        RAISE NOTICE 'Created PaymentType enum';
    END IF;
    
    -- PaymentStatus enum  
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'CANCELLED');
        RAISE NOTICE 'Created PaymentStatus enum';
    END IF;
    
    -- BillingType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BillingType') THEN
        CREATE TYPE "BillingType" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO', 'UNDEFINED');
        RAISE NOTICE 'Created BillingType enum';
    END IF;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "asaasPaymentId" TEXT NOT NULL,
    
    -- Payment details
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "billingType" "BillingType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    
    -- Due date and payment tracking
    "dueDate" TIMESTAMP(3) NOT NULL,
    "confirmedDate" TIMESTAMP(3),
    "overdueDate" TIMESTAMP(3),
    
    -- Installments for credit cards
    "installmentCount" INTEGER,
    "installmentValue" DOUBLE PRECISION,
    
    -- References
    "userId" TEXT NOT NULL,
    "creditPackageId" TEXT,
    "photoPackageId" TEXT,
    
    -- Metadata and URLs
    "invoiceUrl" TEXT,
    "bankSlipUrl" TEXT,
    "pixQrCode" TEXT,
    "pixCopyPasteCode" TEXT,
    "metadata" JSONB,
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payments' AND constraint_name = 'payments_asaasPaymentId_key'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_asaasPaymentId_key" UNIQUE ("asaasPaymentId");
        RAISE NOTICE 'Added unique constraint on asaasPaymentId';
    END IF;
END $$;

-- Create foreign key constraints
DO $$ BEGIN
    -- User foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payments' AND constraint_name = 'payments_userId_fkey'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to users';
    END IF;
    
    -- Credit package foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payments' AND constraint_name = 'payments_creditPackageId_fkey'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_creditPackageId_fkey" 
        FOREIGN KEY ("creditPackageId") REFERENCES "credit_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to credit_packages';
    END IF;
    
    -- Photo package foreign key  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payments' AND constraint_name = 'payments_photoPackageId_fkey'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_photoPackageId_fkey" 
        FOREIGN KEY ("photoPackageId") REFERENCES "photo_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to photo_packages';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON "payments"("userId");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_type_idx" ON "payments"("type");
CREATE INDEX IF NOT EXISTS "payments_dueDate_idx" ON "payments"("dueDate");
CREATE INDEX IF NOT EXISTS "payments_createdAt_idx" ON "payments"("createdAt");
CREATE INDEX IF NOT EXISTS "payments_asaasPaymentId_idx" ON "payments"("asaasPaymentId");

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payments_updated_at ON "payments";
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON "payments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE 'Payments table created successfully with all constraints and indexes!';

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;