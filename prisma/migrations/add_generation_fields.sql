-- Add missing fields to Generation table
ALTER TABLE "generations" ADD COLUMN "jobId" TEXT;
ALTER TABLE "generations" ADD COLUMN "estimatedCompletionTime" TIMESTAMP(3);