-- CreateTable
CREATE TABLE "SystemLog" (
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

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_requestId_idx" ON "SystemLog"("requestId");

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;