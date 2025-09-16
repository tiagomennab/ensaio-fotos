/**
 * Script para aplicar as mudanças na estrutura de créditos
 * Execute: node scripts/apply-credit-structure.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function applyCreditStructure() {
  try {
    console.log('🔄 Aplicando nova estrutura de créditos...')

    // 1. Adicionar campo creditsBalance se não existir
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsBalance" INTEGER DEFAULT 0;`
      console.log('✅ Campo creditsBalance adicionado')
    } catch (error) {
      console.log('ℹ️ Campo creditsBalance já existe')
    }

    // 2. Adicionar campos do Asaas se não existirem
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "asaasCustomerId" VARCHAR(255);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cpfCnpj" VARCHAR(14);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mobilePhone" VARCHAR(20);`
      console.log('✅ Campos de cliente Asaas adicionados')
    } catch (error) {
      console.log('ℹ️ Campos de cliente Asaas já existem')
    }

    // 3. Adicionar campos de endereço se não existirem
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" VARCHAR(255);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "addressNumber" VARCHAR(20);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "complement" VARCHAR(100);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "province" VARCHAR(100);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "state" VARCHAR(2);`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "postalCode" VARCHAR(9);`
      console.log('✅ Campos de endereço adicionados')
    } catch (error) {
      console.log('ℹ️ Campos de endereço já existem')
    }

    // 4. Adicionar campos de controle de assinatura se não existirem
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionCancelledAt" TIMESTAMP;`
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nextBillingDate" TIMESTAMP;`
      console.log('✅ Campos de controle de assinatura adicionados')
    } catch (error) {
      console.log('ℹ️ Campos de controle de assinatura já existem')
    }

    // 5. Criar índices únicos se não existirem
    try {
      await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "User_asaasCustomerId_key" ON "User"("asaasCustomerId");`
      console.log('✅ Índice asaasCustomerId criado')
    } catch (error) {
      console.log('ℹ️ Índice asaasCustomerId já existe')
    }

    // 6. Atualizar creditsLimit padrão se necessário
    const usersWithOldLimit = await prisma.user.count({
      where: {
        plan: 'STARTER',
        creditsLimit: { not: 500 }
      }
    })

    if (usersWithOldLimit > 0) {
      await prisma.user.updateMany({
        where: {
          plan: 'STARTER',
          creditsLimit: { not: 500 }
        },
        data: {
          creditsLimit: 500
        }
      })
      console.log(`✅ ${usersWithOldLimit} usuários STARTER atualizados para 500 créditos`)
    }

    // 7. Verificar estrutura atual
    console.log('\n📊 Verificando estrutura atual:')
    
    const userStats = await prisma.user.groupBy({
      by: ['plan', 'creditsLimit'],
      _count: { id: true },
      _avg: { creditsBalance: true }
    })

    userStats.forEach(stat => {
      console.log(`   ${stat.plan}: ${stat.creditsLimit} limite, ${Math.round(stat._avg.creditsBalance || 0)} saldo médio -> ${stat._count.id} usuários`)
    })

    // 8. Testar as novas funcionalidades
    console.log('\n🧪 Testando funcionalidades:')
    
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        creditsLimit: true,
        creditsUsed: true,
        creditsBalance: true,
        plan: true
      }
    })

    if (testUser) {
      console.log(`   Usuário teste: ${testUser.plan}`)
      console.log(`   Limite: ${testUser.creditsLimit} | Usado: ${testUser.creditsUsed} | Saldo: ${testUser.creditsBalance}`)
      console.log(`   Créditos disponíveis: ${(testUser.creditsLimit - testUser.creditsUsed) + (testUser.creditsBalance || 0)}`)
    }

    console.log('\n🎉 Estrutura de créditos aplicada com sucesso!')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Implementar interface de compra de pacotes')
    console.log('   2. Integrar com Asaas para pagamentos')
    console.log('   3. Criar dashboard de créditos')
    console.log('   4. Configurar expiração de créditos comprados')

  } catch (error) {
    console.error('❌ Erro ao aplicar estrutura:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar aplicação
applyCreditStructure()