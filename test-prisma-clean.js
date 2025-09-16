const { PrismaClient } = require('@prisma/client');

async function main() {
  // Criar novo cliente Prisma a cada execução
  const prisma = new PrismaClient({
    log: ['info', 'warn', 'error']
  });

  try {
    console.log('🔍 Conectando ao banco...');

    // Teste de conexão direta
    await prisma.$connect();
    console.log('✅ Conectado com sucesso!');

    // Query direta para evitar problemas de cache
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "users"`;
    console.log(`👥 Total de usuários: ${result[0].count}`);

    // Se houver usuários, buscar alguns
    if (parseInt(result[0].count) > 0) {
      const users = await prisma.$queryRaw`
        SELECT id, email, name, plan, "creditsBalance", "createdAt"
        FROM "users"
        ORDER BY "createdAt" DESC
        LIMIT 5
      `;

      console.log('\n📋 Usuários encontrados:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Plano: ${user.plan} - Créditos: ${user.creditsBalance}`);
      });
    }

    // Testar outras tabelas
    console.log('\n🔍 Testando outras tabelas...');

    try {
      const modelsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "ai_models"`;
      console.log(`🤖 Total de modelos AI: ${modelsCount[0].count}`);
    } catch (e) {
      console.log(`❌ Tabela ai_models não existe ou erro: ${e.message}`);
    }

    try {
      const genCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "generations"`;
      console.log(`🎨 Total de gerações: ${genCount[0].count}`);
    } catch (e) {
      console.log(`❌ Tabela generations não existe ou erro: ${e.message}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado do banco');
  }
}

main();