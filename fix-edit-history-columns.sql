-- Fix edit_history table by removing duplicate userId columns
-- The table currently has both 'user_id' and 'userId' columns

DO $$ 
BEGIN
    -- Check current state
    RAISE NOTICE 'Current columns in edit_history table:';
    
    -- Drop foreign key constraints first if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'edit_history' 
        AND constraint_name = 'edit_history_user_id_fkey'
    ) THEN
        ALTER TABLE "edit_history" DROP CONSTRAINT "edit_history_user_id_fkey";
        RAISE NOTICE 'Dropped foreign key constraint edit_history_user_id_fkey';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'edit_history' 
        AND constraint_name = 'edit_history_userId_fkey'
    ) THEN
        ALTER TABLE "edit_history" DROP CONSTRAINT "edit_history_userId_fkey";
        RAISE NOTICE 'Dropped foreign key constraint edit_history_userId_fkey';
    END IF;
    
    -- Check if we have both columns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edit_history' AND column_name = 'user_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edit_history' AND column_name = 'userId'
    ) THEN
        -- We have both columns, need to consolidate
        RAISE NOTICE 'Found both user_id and userId columns - consolidating data...';
        
        -- Update userId column with data from user_id column (if userId is null)
        UPDATE "edit_history" 
        SET "userId" = "user_id" 
        WHERE "userId" IS NULL AND "user_id" IS NOT NULL;
        
        -- Drop the old snake_case column
        ALTER TABLE "edit_history" DROP COLUMN IF EXISTS "user_id";
        RAISE NOTICE 'Dropped old user_id column';
        
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edit_history' AND column_name = 'user_id'
    ) THEN
        -- We only have user_id, rename it to userId
        RAISE NOTICE 'Renaming user_id column to userId...';
        ALTER TABLE "edit_history" RENAME COLUMN "user_id" TO "userId";
        
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'edit_history' AND column_name = 'userId'
    ) THEN
        -- We don't have userId column at all
        RAISE NOTICE 'Adding userId column...';
        ALTER TABLE "edit_history" ADD COLUMN "userId" TEXT;
    END IF;
    
    -- Make userId NOT NULL if it has null values
    UPDATE "edit_history" SET "userId" = 'unknown-user' WHERE "userId" IS NULL;
    
    -- Set NOT NULL constraint
    ALTER TABLE "edit_history" ALTER COLUMN "userId" SET NOT NULL;
    
    -- Add back the foreign key constraint
    ALTER TABLE "edit_history" 
    ADD CONSTRAINT "edit_history_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    -- Add index for performance
    DROP INDEX IF EXISTS "edit_history_userId_idx";
    CREATE INDEX "edit_history_userId_idx" ON "edit_history"("userId");
    
    -- Final verification
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'edit_history' 
    ORDER BY ordinal_position;
    
    RAISE NOTICE 'edit_history table fixed successfully!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error fixing edit_history table: %', SQLERRM;
END $$;