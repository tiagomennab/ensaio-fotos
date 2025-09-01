const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('🔄 Testando conexão com banco de dados...')
    
    // Teste simples de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão com banco estabelecida:', result)

    // Tenta buscar usuários
    const userCount = await prisma.user.count()
    console.log(`📊 Total de usuários: ${userCount}`)

    // Cria usuário de teste se não existir
    const testEmail = 'test@test.com'
    let testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    if (!testUser) {
      console.log('👤 Criando usuário de teste...')
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Usuário Teste',
          password: hashedPassword,
          plan: 'STARTER',
          creditsLimit: 100
        }
      })
      console.log('✅ Usuário de teste criado:', testUser.email)
    } else {
      console.log('👤 Usuário de teste já existe:', testUser.email)
    }

    console.log('\n📧 Para fazer login use:')
    console.log('Email: test@test.com')
    console.log('Senha: 123456')

  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error)
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Possíveis soluções:')
      console.log('1. Verifique se o Supabase está acessível')
      console.log('2. Confirme as credenciais DATABASE_URL')
      console.log('3. Verifique conexão com internet')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()