-- AlterTable
ALTER TABLE "User" ADD COLUMN "totalModels" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "totalGenerations" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");
CREATE INDEX "User_plan_idx" ON "User"("plan");
CREATE INDEX "User_status_idx" ON "User"("status");