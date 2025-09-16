const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugUsers() {
  try {
    console.log('🔍 Investigando dados dos usuários...')
    
    // Tentar pegar usuários com dados simples primeiro
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true
      },
      take: 5
    })
    
    console.log('✅ Encontrados usuários:', users.length)
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.name}`)
      console.log(`  Plan: ${user.plan}`)
      console.log(`  Created: ${user.createdAt}`)
      console.log('---')
    })
    
    // Verificar se há problemas específicos de encoding
    console.log('\n🧹 Verificando encoding...')
    for (const user of users) {
      try {
        if (user.name && typeof user.name === 'string') {
          const buffer = Buffer.from(user.name, 'utf8')
          console.log(`User ${user.id} name buffer length: ${buffer.length}, string length: ${user.name.length}`)
          
          // Verificar se há caracteres inválidos
          const isValid = Buffer.isEncoding('utf8') && buffer.toString('utf8') === user.name
          console.log(`Valid UTF-8: ${isValid}`)
        }
      } catch (error) {
        console.log(`⚠️  Encoding issue with user ${user.id}:`, error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao investigar usuários:', error)
    
    // Tentar identificar o tipo específico do erro
    if (error.message.includes('Utf8Error')) {
      console.log('🔧 Erro de UTF-8 detectado. Pode haver caracteres corruptos nos dados.')
    }
    if (error.message.includes('prepared statement')) {
      console.log('🔧 Erro de prepared statement. Pode ser um problema de cache do Prisma.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

debugUsers()