-- Create payment_methods table based on Prisma schema

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS "payment_methods" (
    "id" TEXT NOT NULL,
    
    -- Card details (tokenized)
    "asaasTokenId" TEXT,
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardHolderName" TEXT,
    "expiryMonth" TEXT,
    "expiryYear" TEXT,
    
    -- Status
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    "userId" TEXT NOT NULL,
    
    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on asaasTokenId
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payment_methods' AND constraint_name = 'payment_methods_asaasTokenId_key'
    ) THEN
        ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_asaasTokenId_key" UNIQUE ("asaasTokenId");
        RAISE NOTICE 'Added unique constraint on asaasTokenId';
    END IF;
END $$;

-- Create foreign key constraint to users
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'payment_methods' AND constraint_name = 'payment_methods_userId_fkey'
    ) THEN
        ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to users';
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "payment_methods_userId_idx" ON "payment_methods"("userId");
CREATE INDEX IF NOT EXISTS "payment_methods_isActive_idx" ON "payment_methods"("isActive");
CREATE INDEX IF NOT EXISTS "payment_methods_isDefault_idx" ON "payment_methods"("isDefault");

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON "payment_methods";
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON "payment_methods"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE 'PaymentMethods table created successfully!';

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_methods' 
ORDER BY ordinal_position;