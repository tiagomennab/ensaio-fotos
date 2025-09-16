const { PrismaClient } = require('@prisma/client');

async function addStorageColumns() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Adicionando colunas de storage faltantes...');

    // Adicionar colunas faltantes na tabela generations
    const alterTable = `
      ALTER TABLE generations
      ADD COLUMN IF NOT EXISTS "storageProvider" TEXT,
      ADD COLUMN IF NOT EXISTS "storageBucket" TEXT,
      ADD COLUMN IF NOT EXISTS "storageKeys" JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS "operationType" TEXT,
      ADD COLUMN IF NOT EXISTS "storageContext" TEXT,
      ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}'::jsonb;
    `;

    await prisma.$executeRawUnsafe(alterTable);

    console.log('✅ Colunas adicionadas com sucesso!');

    // Verificar se as colunas foram criadas
    const checkColumns = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'generations'
      AND column_name IN ('storageProvider', 'storageBucket', 'storageKeys', 'operationType', 'storageContext', 'metadata')
      ORDER BY column_name;
    `;

    const columns = await prisma.$queryRawUnsafe(checkColumns);
    console.log('📋 Colunas verificadas:', columns);

  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addStorageColumns();