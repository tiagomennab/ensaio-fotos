const { PrismaClient } = require('@prisma/client');

async function createVideoTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Create enums first
    console.log('📝 Creating VideoStatus enum...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "VideoStatus" AS ENUM ('STARTING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    console.log('📝 Creating VideoQuality enum...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "VideoQuality" AS ENUM ('standard', 'pro');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    // Create the table
    console.log('🏗️  Creating video_generations table...');
    await prisma.$executeRaw`
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
    `;
    
    // Create indexes
    console.log('📇 Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "video_generations_userId_idx" ON "video_generations"("userId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "video_generations_status_idx" ON "video_generations"("status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "video_generations_jobId_idx" ON "video_generations"("jobId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "video_generations_createdAt_idx" ON "video_generations"("createdAt");`;
    
    // Add foreign key constraints
    console.log('🔗 Adding foreign keys...');
    await prisma.$executeRaw`
      DO $$ BEGIN
          ALTER TABLE "video_generations" ADD CONSTRAINT "video_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ BEGIN
          ALTER TABLE "video_generations" ADD CONSTRAINT "video_generations_sourceGenerationId_fkey" FOREIGN KEY ("sourceGenerationId") REFERENCES "generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `;
    
    // Verify table creation
    console.log('✅ Verifying table creation...');
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'video_generations' AND table_schema = 'public'
    `;
    
    if (result.length > 0) {
      console.log('✅ Video generations table created successfully!');
      console.log('🎉 Schema applied successfully! You can now test video generation.');
    } else {
      console.log('❌ Table verification failed!');
    }
    
  } catch (error) {
    console.error('❌ Error creating video table:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

createVideoTable().catch(console.error);