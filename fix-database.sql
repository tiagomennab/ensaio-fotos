-- Fix database schema issues for login

-- 1. Add missing column asaasCustomerId to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'asaasCustomerId') THEN
        ALTER TABLE users ADD COLUMN "asaasCustomerId" TEXT UNIQUE;
    END IF;
END $$;

-- 2. Create user_consents table (if not exists)
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

-- 3. Create indexes for user_consents table (if not exist)
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