const { PrismaClient } = require('@prisma/client');

async function testTables() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testando tabelas do banco de dados...\n');

    // Teste de conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Testar User table
    console.log('👥 Testando tabela User...');
    const userCount = await prisma.user.count();
    console.log(`   Total de usuários: ${userCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          creditsBalance: true,
          createdAt: true
        },
        take: 5
      });

      console.log('   Usuários encontrados:');
      users.forEach(user => {
        console.log(`     - ${user.email} (${user.name}) - Plano: ${user.plan} - Créditos: ${user.creditsBalance}`);
      });
    }

    // Testar AIModel table (se existir)
    console.log('\n🤖 Testando tabela AIModel...');
    try {
      const modelCount = await prisma.aIModel.count();
      console.log(`   Total de modelos AI: ${modelCount}`);
    } catch (error) {
      console.log(`   ❌ Erro ao acessar AIModel: ${error.message}`);
    }

    // Testar Generation table (se existir)
    console.log('\n🎨 Testando tabela Generation...');
    try {
      const generationCount = await prisma.generation.count();
      console.log(`   Total de gerações: ${generationCount}`);
    } catch (error) {
      console.log(`   ❌ Erro ao acessar Generation: ${error.message}`);
    }

    // Testar VideoGeneration table (se existir)
    console.log('\n🎬 Testando tabela VideoGeneration...');
    try {
      const videoCount = await prisma.videoGeneration.count();
      console.log(`   Total de vídeos: ${videoCount}`);
    } catch (error) {
      console.log(`   ❌ Erro ao acessar VideoGeneration: ${error.message}`);
    }

    // Testar Payment table (se existir)
    console.log('\n💳 Testando tabela Payment...');
    try {
      const paymentCount = await prisma.payment.count();
      console.log(`   Total de pagamentos: ${paymentCount}`);
    } catch (error) {
      console.log(`   ❌ Erro ao acessar Payment: ${error.message}`);
    }

    // Listar todas as tabelas através do Prisma introspection
    console.log('\n📊 Executando query direta para listar tabelas...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;

      console.log('   Tabelas encontradas no banco:');
      tables.forEach(table => {
        console.log(`     - ${table.table_name}`);
      });
    } catch (error) {
      console.log(`   ❌ Erro ao listar tabelas: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTables();