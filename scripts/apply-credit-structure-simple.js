/**
 * Script simplificado para aplicar as mudanças na estrutura de créditos
 * Execute: node scripts/apply-credit-structure-simple.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function applyCreditStructureSimple() {
  try {
    console.log('🔄 Aplicando nova estrutura de créditos...')

    // 1. Adicionar campo creditsBalance se não existir
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsBalance" INTEGER DEFAULT 0;`
      console.log('✅ Campo creditsBalance adicionado')
    } catch (error) {
      console.log('ℹ️ Campo creditsBalance já existe ou erro:', error.message)
    }

    // 2. Testar se o campo foi criado
    try {
      const testQuery = await prisma.$queryRaw`
        SELECT "creditsBalance" FROM "User" LIMIT 1;
      `
      console.log('✅ Campo creditsBalance verificado e funcional')
    } catch (error) {
      console.log('❌ Erro ao verificar creditsBalance:', error.message)
    }

    // 3. Verificar usuários existentes
    const userCount = await prisma.user.count()
    console.log(`📊 Total de usuários: ${userCount}`)

    // 4. Verificar planos existentes
    const planCounts = await prisma.user.groupBy({
      by: ['plan'],
      _count: { id: true }
    })

    console.log('📊 Distribuição por planos:')
    planCounts.forEach(plan => {
      console.log(`   ${plan.plan}: ${plan._count.id} usuários`)
    })

    // 5. Atualizar limites de créditos se necessário
    const updateResults = await Promise.all([
      prisma.user.updateMany({
        where: { plan: 'STARTER', creditsLimit: { not: 500 } },
        data: { creditsLimit: 500 }
      }),
      prisma.user.updateMany({
        where: { plan: 'PREMIUM', creditsLimit: { not: 1200 } },
        data: { creditsLimit: 1200 }
      }),
      prisma.user.updateMany({
        where: { plan: 'GOLD', creditsLimit: { not: 2500 } },
        data: { creditsLimit: 2500 }
      })
    ])

    const totalUpdated = updateResults.reduce((sum, result) => sum + result.count, 0)
    if (totalUpdated > 0) {
      console.log(`✅ ${totalUpdated} usuários tiveram limites de créditos atualizados`)
    } else {
      console.log('ℹ️ Todos os usuários já têm os limites corretos')
    }

    console.log('\n🎉 Estrutura básica aplicada com sucesso!')
    console.log('\n📝 Próximos passos:')
    console.log('   1. Regenerar Prisma client: npx prisma generate')
    console.log('   2. Testar APIs de créditos')
    console.log('   3. Implementar interface de compra')

  } catch (error) {
    console.error('❌ Erro ao aplicar estrutura:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar aplicação
applyCreditStructureSimple()