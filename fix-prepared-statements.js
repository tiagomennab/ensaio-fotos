const { PrismaClient } = require('@prisma/client')

async function fixPreparedStatements() {
  let prisma

  try {
    console.log('🔧 Corrigindo prepared statements...')

    // Criar nova instância do Prisma com configuração específica
    prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })

    // Executar query raw para limpar prepared statements
    console.log('🧹 Limpando prepared statements existentes...')

    // Esta query limpa todas as prepared statements da sessão atual
    await prisma.$executeRaw`DEALLOCATE ALL;`

    console.log('✅ Prepared statements limpos')

    // Testar uma query simples para verificar se funciona
    console.log('🧪 Testando conexão...')
    const result = await prisma.$queryRaw`SELECT 1 as test;`
    console.log('✅ Teste de conexão bem-sucedido:', result)

    // Testar query de usuários
    console.log('👥 Testando query de usuários...')
    const userCount = await prisma.user.count()
    console.log('✅ Total de usuários encontrados:', userCount)

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
        },
        take: 2
      })

      console.log('📋 Primeiros usuários:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.name || 'Sem nome'})`)
      })
    }

    console.log('🎉 Prepared statements corrigidos com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao corrigir prepared statements:', error.message)

    if (error.message.includes('prepared statement')) {
      console.log('💡 Dica: Tente reiniciar o servidor de desenvolvimento')
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

fixPreparedStatements()