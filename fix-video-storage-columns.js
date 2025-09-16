const { PrismaClient } = require('@prisma/client');

async function addVideoStorageColumns() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Adicionando colunas de storage na tabela video_generations...');

    // Adicionar colunas faltantes na tabela video_generations
    const alterVideoTable = `
      ALTER TABLE video_generations
      ADD COLUMN IF NOT EXISTS "storageProvider" TEXT,
      ADD COLUMN IF NOT EXISTS "storageBucket" TEXT,
      ADD COLUMN IF NOT EXISTS "storageKey" TEXT,
      ADD COLUMN IF NOT EXISTS "posterKey" TEXT,
      ADD COLUMN IF NOT EXISTS "publicUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "mimeType" TEXT DEFAULT 'video/mp4',
      ADD COLUMN IF NOT EXISTS "sizeBytes" BIGINT,
      ADD COLUMN IF NOT EXISTS "durationSec" INTEGER;
    `;

    await prisma.$executeRawUnsafe(alterVideoTable);

    console.log('✅ Colunas de vídeo adicionadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao adicionar colunas de vídeo:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addVideoStorageColumns();