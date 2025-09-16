/**
 * Script para migrar os limites de créditos dos planos para os novos valores
 * Execute: node scripts/migrate-credit-limits.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateCreditsLimits() {
  try {
    console.log('🔄 Iniciando migração dos limites de créditos...')

    // Verificar estado atual antes da migração
    console.log('\n📊 Estado atual dos usuários:')
    const currentStats = await prisma.user.groupBy({
      by: ['plan', 'creditsLimit'],
      _count: {
        id: true
      },
      orderBy: [
        { plan: 'asc' },
        { creditsLimit: 'asc' }
      ]
    })

    currentStats.forEach(stat => {
      console.log(`   ${stat.plan}: ${stat.creditsLimit} créditos -> ${stat._count.id} usuários`)
    })

    // Executar migrações
    console.log('\n🔄 Executando migrações...')

    // Migrar STARTER (de qualquer valor para 500)
    const starterUpdated = await prisma.user.updateMany({
      where: {
        plan: 'STARTER',
        creditsLimit: { not: 500 }
      },
      data: {
        creditsLimit: 500
      }
    })
    console.log(`✅ STARTER: ${starterUpdated.count} usuários atualizados para 500 créditos`)

    // Migrar PREMIUM (de qualquer valor para 1200)
    const premiumUpdated = await prisma.user.updateMany({
      where: {
        plan: 'PREMIUM',
        creditsLimit: { not: 1200 }
      },
      data: {
        creditsLimit: 1200
      }
    })
    console.log(`✅ PREMIUM: ${premiumUpdated.count} usuários atualizados para 1200 créditos`)

    // Migrar GOLD (de qualquer valor para 2500)
    const goldUpdated = await prisma.user.updateMany({
      where: {
        plan: 'GOLD',
        creditsLimit: { not: 2500 }
      },
      data: {
        creditsLimit: 2500
      }
    })
    console.log(`✅ GOLD: ${goldUpdated.count} usuários atualizados para 2500 créditos`)

    // Verificar estado após migração
    console.log('\n📊 Estado após migração:')
    const newStats = await prisma.user.groupBy({
      by: ['plan', 'creditsLimit'],
      _count: {
        id: true
      },
      orderBy: [
        { plan: 'asc' },
        { creditsLimit: 'asc' }
      ]
    })

    newStats.forEach(stat => {
      console.log(`   ${stat.plan}: ${stat.creditsLimit} créditos -> ${stat._count.id} usuários`)
    })

    console.log('\n🎉 Migração concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar migração
migrateCreditsLimits()