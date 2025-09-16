-- Migration: Add userId column to edit_history table
-- This SQL can be run manually if prisma migrate is timing out

-- Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'edit_history'
);

-- Add userId column if it doesn't exist
DO $$ 
BEGIN
    -- Check if userId column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'edit_history' 
        AND column_name = 'userId'
    ) THEN
        -- Add the userId column
        ALTER TABLE "edit_history" ADD COLUMN "userId" TEXT;
        
        -- Add foreign key constraint to users table
        ALTER TABLE "edit_history" 
        ADD CONSTRAINT "edit_history_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        -- Add index on userId for performance
        CREATE INDEX "edit_history_userId_idx" ON "edit_history"("userId");
        
        RAISE NOTICE 'userId column added to edit_history table successfully';
    ELSE
        RAISE NOTICE 'userId column already exists in edit_history table';
    END IF;
    
    -- Verify the column was added
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'edit_history' 
        AND column_name = 'userId'
    ) THEN
        RAISE NOTICE 'Verification: userId column exists in edit_history table';
    ELSE
        RAISE EXCEPTION 'ERROR: userId column was not added to edit_history table';
    END IF;
END $$;