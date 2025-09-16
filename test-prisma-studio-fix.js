const { PrismaClient } = require('@prisma/client')

async function testPrismaStudioFix() {
  console.log('🔧 Testando correções para o Prisma Studio...')
  
  const prisma = new PrismaClient()
  
  try {
    // Teste 1: Verificar se conseguimos fazer as queries básicas que o Studio faz
    console.log('1. Testando query de User (que o Studio estava falhando)...')
    
    try {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true,
          // Testar relações que estavam causando problema
          _count: {
            select: {
              payments: true,
              editHistory: true,
              videoGenerations: true
            }
          }
        }
      })
      
      console.log('✅ Query de User funcionou! Encontrados:', users.length, 'usuários')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.plan}) - Payments: ${user._count.payments}, EditHistory: ${user._count.editHistory}`)
      })
      
    } catch (userError) {
      console.log('❌ Query de User falhou:', userError.message)
      
      // Se falhar, pode ser porque a tabela payments ainda não existe
      // Vamos tentar uma query mais simples
      console.log('Tentando query mais simples...')
      const simpleUsers = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          name: true
        }
      })
      console.log('✅ Query simples funcionou! Usuários:', simpleUsers.length)
    }
    
    // Teste 2: Verificar EditHistory (era um dos problemas originais)
    console.log('\n2. Testando EditHistory...')
    try {
      const editHistoryCount = await prisma.editHistory.count()
      console.log('✅ EditHistory acessível! Total de registros:', editHistoryCount)
      
      if (editHistoryCount > 0) {
        const sample = await prisma.editHistory.findFirst({
          select: {
            id: true,
            userId: true,
            operation: true,
            createdAt: true
          }
        })
        console.log('✅ Sample EditHistory:', sample)
      }
    } catch (editError) {
      console.log('❌ EditHistory erro:', editError.message)
    }
    
    // Teste 3: Verificar VideoGeneration (outra relação que pode estar problemática)
    console.log('\n3. Testando VideoGeneration...')
    try {
      const videoCount = await prisma.videoGeneration.count()
      console.log('✅ VideoGeneration acessível! Total de registros:', videoCount)
    } catch (videoError) {
      console.log('❌ VideoGeneration erro:', videoError.message)
    }
    
    // Teste 4: Verificar se tabela payments existe agora
    console.log('\n4. Verificando tabela payments...')
    try {
      const paymentExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'payments'
        ) as exists
      `
      
      if (paymentExists[0].exists) {
        console.log('✅ Tabela payments existe!')
        const paymentCount = await prisma.payment.count()
        console.log('✅ Payments acessível via Prisma! Total:', paymentCount)
      } else {
        console.log('❌ Tabela payments ainda não existe no banco')
      }
    } catch (paymentError) {
      console.log('❌ Payment erro:', paymentError.message)
    }
    
    console.log('\n🎯 Resumo do teste:')
    console.log('- Se todos os testes passaram, o Prisma Studio deve funcionar')
    console.log('- Se alguns falharam, execute os scripts SQL para criar as tabelas faltantes')
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaStudioFix().catch(console.error)