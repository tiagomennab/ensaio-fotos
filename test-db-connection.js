const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testando conexão com o banco de dados...');

    // Teste de conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    // Teste de query simples
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);

    // Teste de outras tabelas
    const modelCount = await prisma.aiModel.count();
    console.log(`🤖 Total de modelos AI: ${modelCount}`);

    const generationCount = await prisma.generation.count();
    console.log(`🎨 Total de gerações: ${generationCount}`);

    // Listar usuários existentes
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true
      },
      take: 10
    });

    console.log('\n👥 Usuários no banco:');
    if (users.length === 0) {
      console.log('   Nenhum usuário encontrado');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - Plano: ${user.plan} - Criado: ${user.createdAt.toLocaleDateString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('   Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();