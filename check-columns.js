const { PrismaClient } = require('@prisma/client');

async function checkColumns() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Verificando estrutura da tabela generations...');

    const checkColumns = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'generations'
      AND column_name IN ('storageProvider', 'storageBucket', 'storageKeys', 'operationType', 'storageContext', 'metadata')
      ORDER BY column_name;
    `;

    const columns = await prisma.$queryRawUnsafe(checkColumns);

    if (columns.length > 0) {
      console.log('✅ Colunas encontradas:', columns);
    } else {
      console.log('❌ Nenhuma coluna storage encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();