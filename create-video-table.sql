-- Create VideoGeneration table
CREATE TABLE IF NOT EXISTS "VideoGeneration" (
  "id" TEXT NOT NULL,
  "sourceImageUrl" TEXT NOT NULL,
  "sourceGenerationId" TEXT,
  "prompt" TEXT NOT NULL,
  "negativePrompt" TEXT,
  "duration" INTEGER NOT NULL DEFAULT 5,
  "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
  "quality" TEXT NOT NULL DEFAULT 'STANDARD',
  "template" TEXT,
  "status" TEXT NOT NULL DEFAULT 'STARTING',
  "jobId" TEXT,
  "errorMessage" TEXT,
  "videoUrl" TEXT,
  "thumbnailUrl" TEXT,
  "creditsUsed" INTEGER NOT NULL DEFAULT 0,
  "estimatedTimeRemaining" INTEGER DEFAULT 0,
  "progress" INTEGER DEFAULT 0,
  "processingStartedAt" TIMESTAMP(3),
  "processingCompletedAt" TIMESTAMP(3),
  "fileSize" INTEGER,
  "processingTime" INTEGER,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VideoGeneration_pkey" PRIMARY KEY ("id")
);

-- Create VideoStatus enum (if not exists)
DO $$ BEGIN
  CREATE TYPE "VideoStatus" AS ENUM ('STARTING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create VideoQuality enum (if not exists)
DO $$ BEGIN
  CREATE TYPE "VideoQuality" AS ENUM ('STANDARD', 'PRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update the table to use the enums
ALTER TABLE "VideoGeneration" 
  ALTER COLUMN "status" TYPE "VideoStatus" USING "status"::"VideoStatus",
  ALTER COLUMN "quality" TYPE "VideoQuality" USING "quality"::"VideoQuality";

-- Create unique constraint on jobId
CREATE UNIQUE INDEX IF NOT EXISTS "VideoGeneration_jobId_key" ON "VideoGeneration"("jobId");

-- Add foreign key constraints
ALTER TABLE "VideoGeneration" 
  ADD CONSTRAINT "VideoGeneration_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VideoGeneration" 
  ADD CONSTRAINT "VideoGeneration_sourceGenerationId_fkey" 
  FOREIGN KEY ("sourceGenerationId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS "VideoGeneration_userId_createdAt_idx" ON "VideoGeneration"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "VideoGeneration_status_idx" ON "VideoGeneration"("status");
CREATE INDEX IF NOT EXISTS "VideoGeneration_jobId_idx" ON "VideoGeneration"("jobId");