-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "VideoStatus" AS ENUM ('STARTING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "VideoQuality" AS ENUM ('standard', 'pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "video_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceImageUrl" TEXT NOT NULL,
    "sourceGenerationId" TEXT,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 5,
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "quality" "VideoQuality" NOT NULL DEFAULT 'standard',
    "template" TEXT,
    "jobId" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'STARTING',
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "estimatedTimeRemaining" INTEGER DEFAULT 0,
    "processingStartedAt" TIMESTAMP(3),
    "processingCompletedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_generations_userId_idx" ON "video_generations"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_generations_status_idx" ON "video_generations"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_generations_jobId_idx" ON "video_generations"("jobId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "video_generations_createdAt_idx" ON "video_generations"("createdAt");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "video_generations" ADD CONSTRAINT "video_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (optional, only if sourceGenerationId references generations table)
DO $$ BEGIN
    ALTER TABLE "video_generations" ADD CONSTRAINT "video_generations_sourceGenerationId_fkey" FOREIGN KEY ("sourceGenerationId") REFERENCES "generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;