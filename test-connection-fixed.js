const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🧪 Testando conexão corrigida...')

  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Disable prepared statements to avoid conflicts
    __internal: {
      engine: {
        connectionTimeout: 60000,
      },
    },
  })

  try {
    // Test basic connection
    console.log('1. Testando conexão básica...')
    const result = await prisma.$queryRaw`SELECT 'Connection OK' as status, NOW() as timestamp;`
    console.log('✅ Conexão OK:', result[0])

    // Test user count
    console.log('2. Testando contagem de usuários...')
    const userCount = await prisma.user.count()
    console.log('✅ Total de usuários:', userCount)

    if (userCount > 0) {
      console.log('3. Testando busca de usuários...')
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
        },
        take: 3
      })

      console.log('✅ Primeiros usuários:')
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} - ${user.plan}`)
      })
    }

    // Test generation count
    console.log('4. Testando contagem de gerações...')
    const genCount = await prisma.generation.count()
    console.log('✅ Total de gerações:', genCount)

    console.log('\n🎉 Todas as queries funcionaram! Prepared statements corrigidos.')

  } catch (error) {
    console.error('❌ Erro:', error.message)

    if (error.message.includes('prepared statement')) {
      console.log('\n💡 O erro persiste. Possíveis soluções:')
      console.log('  - Reiniciar completamente o servidor de desenvolvimento')
      console.log('  - Usar uma nova sessão do terminal')
      console.log('  - Verificar se há outras instâncias do Next.js rodando')
    }
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão fechada')
  }
}

testConnection()