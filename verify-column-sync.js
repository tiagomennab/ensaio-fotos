const { PrismaClient } = require('@prisma/client')

async function verifyColumnSync() {
  console.log('🔍 Verificando sincronização de colunas...')
  
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    
    // Teste completo das relações que estavam causando problema
    console.log('1. Testando todas as queries que o Prisma Studio faz...')
    
    try {
      // Query principal do User que estava falhando
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          password: true,
          emailVerified: true,
          plan: true,
          stripeCustomerId: true,
          asaasCustomerId: true,
          subscriptionId: true,
          subscriptionStatus: true,
          subscriptionEndsAt: true,
          subscriptionCancelledAt: true,
          creditsUsed: true,
          creditsLimit: true,
          creditsBalance: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          // Todas as relações que o Studio tenta acessar
          accounts: {
            select: { id: true }
          },
          sessions: {
            select: { id: true }
          },
          models: {
            select: { id: true }
          },
          generations: {
            select: { id: true }
          },
          videoGenerations: {
            select: { id: true }
          },
          collections: {
            select: { id: true }
          },
          editHistory: {
            select: { id: true }
          },
          apiKeys: {
            select: { id: true }
          },
          systemLogs: {
            select: { id: true }
          },
          consents: {
            select: { id: true }
          },
          payments: {
            select: { id: true }
          },
          creditPurchases: {
            select: { id: true }
          },
          paymentMethods: {
            select: { id: true }
          },
          creditTransactions: {
            select: { id: true }
          }
        }
      })
      
      console.log('✅ Query completa de User funcionou! Usuários encontrados:', users.length)
      
      // Mostrar detalhes de cada usuário
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.plan})`)
        console.log(`    Relações: accounts(${user.accounts.length}), sessions(${user.sessions.length}), models(${user.models.length})`)
        console.log(`    Payments: payments(${user.payments.length}), paymentMethods(${user.paymentMethods.length})`)
      })
      
    } catch (queryError) {
      console.error('❌ Erro na query principal:', queryError.message)
      return false
    }
    
    // Teste 2: Verificar se todas as tabelas são acessíveis
    console.log('\n2. Testando acesso a todas as tabelas...')
    
    const tableTests = [
      { model: 'user', name: 'User' },
      { model: 'account', name: 'Account' },
      { model: 'session', name: 'Session' },
      { model: 'verificationToken', name: 'VerificationToken' },
      { model: 'aIModel', name: 'AIModel' },
      { model: 'generation', name: 'Generation' },
      { model: 'collection', name: 'Collection' },
      { model: 'editHistory', name: 'EditHistory' },
      { model: 'photoPackage', name: 'PhotoPackage' },
      { model: 'apiKey', name: 'ApiKey' },
      { model: 'usageLog', name: 'UsageLog' },
      { model: 'systemConfig', name: 'SystemConfig' },
      { model: 'systemLog', name: 'SystemLog' },
      { model: 'userConsent', name: 'UserConsent' },
      { model: 'payment', name: 'Payment' },
      { model: 'creditPurchase', name: 'CreditPurchase' },
      { model: 'webhookEvent', name: 'WebhookEvent' },
      { model: 'paymentMethod', name: 'PaymentMethod' },
      { model: 'creditPackage', name: 'CreditPackage' },
      { model: 'creditTransaction', name: 'CreditTransaction' },
      { model: 'videoGeneration', name: 'VideoGeneration' }
    ]
    
    let successCount = 0
    let errorCount = 0
    
    for (const test of tableTests) {
      try {
        const count = await prisma[test.model].count()
        console.log(`  ✅ ${test.name}: ${count} registros`)
        successCount++
      } catch (error) {
        console.log(`  ❌ ${test.name}: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`\n📊 RESULTADO DOS TESTES:`)
    console.log(`✅ Sucessos: ${successCount}/${tableTests.length}`)
    console.log(`❌ Erros: ${errorCount}/${tableTests.length}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 PERFEITO! Todas as tabelas estão funcionando!')
      console.log('✅ Prisma Studio deve funcionar 100% agora!')
      return true
    } else {
      console.log('\n⚠️ Ainda existem problemas que precisam ser corrigidos.')
      return false
    }
    
  } catch (error) {
    console.error('❌ Erro geral na verificação:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verifyColumnSync().then(success => {
    if (success) {
      console.log('\n🚀 PRONTO PARA TESTAR O PRISMA STUDIO!')
      console.log('Execute: npx prisma studio')
    } else {
      console.log('\n🔧 Ainda há trabalho a ser feito...')
    }
  }).catch(console.error)
}

module.exports = { verifyColumnSync }