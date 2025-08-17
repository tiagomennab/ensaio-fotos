-- Migration to fix Prisma schema inconsistencies
-- This script adds missing models and fields that exist in migrations but not in the current schema

-- 1. Add missing fields to users table (from migration 00002_add_user_stats)
-- Check if columns don't exist before adding them to avoid errors
DO $$ 
BEGIN
    -- Add totalModels column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'totalModels') THEN
        ALTER TABLE "users" ADD COLUMN "totalModels" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add totalGenerations column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'totalGenerations') THEN
        ALTER TABLE "users" ADD COLUMN "totalGenerations" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add totalCreditsUsed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'totalCreditsUsed') THEN
        ALTER TABLE "users" ADD COLUMN "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add lastLoginAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'lastLoginAt') THEN
        ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
    END IF;
END $$;

-- 2. Create indexes for users table (from migration 00002_add_user_stats)
-- Create index on lastLoginAt if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'User_lastLoginAt_idx') THEN
        CREATE INDEX "User_lastLoginAt_idx" ON "users"("lastLoginAt");
    END IF;
END $$;

-- Create index on plan if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'User_plan_idx') THEN
        CREATE INDEX "User_plan_idx" ON "users"("plan");
    END IF;
END $$;

-- 3. Create SystemLog table if it doesn't exist (from migration 00001_add_system_log)
CREATE TABLE IF NOT EXISTS "SystemLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for SystemLog table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'SystemLog' AND indexname = 'SystemLog_level_idx') THEN
        CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'SystemLog' AND indexname = 'SystemLog_userId_idx') THEN
        CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'SystemLog' AND indexname = 'SystemLog_createdAt_idx') THEN
        CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'SystemLog' AND indexname = 'SystemLog_requestId_idx') THEN
        CREATE INDEX "SystemLog_requestId_idx" ON "SystemLog"("requestId");
    END IF;
END $$;

-- Add foreign key constraint for SystemLog.userId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'SystemLog_userId_fkey' 
                   AND table_name = 'SystemLog') THEN
        ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Add missing fields to generations table if they don't exist (from add_generation_fields.sql)
DO $$ 
BEGIN
    -- Add jobId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generations' AND column_name = 'jobId') THEN
        ALTER TABLE "generations" ADD COLUMN "jobId" TEXT;
    END IF;

    -- Add estimatedCompletionTime column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'generations' AND column_name = 'estimatedCompletionTime') THEN
        ALTER TABLE "generations" ADD COLUMN "estimatedCompletionTime" TIMESTAMP(3);
    END IF;
END $$;

-- 5. Verification queries to check if everything was applied correctly
-- Uncomment these to run verification after applying the migration

/*
-- Verify users table has all required columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('totalModels', 'totalGenerations', 'totalCreditsUsed', 'lastLoginAt')
ORDER BY column_name;

-- Verify SystemLog table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'SystemLog'
ORDER BY ordinal_position;

-- Verify generations table has new fields
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'generations' 
AND column_name IN ('jobId', 'estimatedCompletionTime')
ORDER BY column_name;

-- Verify indexes were created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('users', 'SystemLog', 'generations')
AND indexname LIKE '%_idx'
ORDER BY tablename, indexname;
*/

-- Migration completed successfully
SELECT 'Migration completed - All schema inconsistencies have been fixed!' as status;
