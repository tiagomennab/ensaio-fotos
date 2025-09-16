const { PrismaClient } = require('@prisma/client')

async function testVideoCreationFix() {
  console.log('🧪 Testando criação de vídeo após correção do enum...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })
  
  try {
    await prisma.$connect()
    
    // Teste 1: Verificar se o enum está correto
    console.log('\n1. Verificando enum VideoQuality...')
    
    const enumValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'VideoQuality'
      ORDER BY enumsortorder;
    `
    
    console.log('✅ Valores do enum:', enumValues.map(e => e.enumlabel))
    
    // Teste 2: Criar video com qualidade 'standard'
    console.log('\n2. Testando criação com quality = "standard"...')
    
    const testVideoStandard = {
      userId: 'test-user-id-standard',
      sourceImageUrl: 'https://example.com/test-standard.jpg',
      prompt: 'Test prompt for standard video generation',
      duration: 5,
      aspectRatio: '16:9',
      quality: 'standard', // lowercase
      creditsUsed: 15,
      status: 'STARTING'
    }
    
    const createdStandard = await prisma.videoGeneration.create({
      data: testVideoStandard
    })
    
    console.log('✅ Video STANDARD criado:', {
      id: createdStandard.id,
      quality: createdStandard.quality,
      status: createdStandard.status
    })
    
    // Teste 3: Criar video com qualidade 'pro'
    console.log('\n3. Testando criação com quality = "pro"...')
    
    const testVideoPro = {
      userId: 'test-user-id-pro',
      sourceImageUrl: 'https://example.com/test-pro.jpg',
      prompt: 'Test prompt for pro video generation',
      duration: 10,
      aspectRatio: '9:16',
      quality: 'pro', // lowercase
      creditsUsed: 30,
      status: 'STARTING'
    }
    
    const createdPro = await prisma.videoGeneration.create({
      data: testVideoPro
    })
    
    console.log('✅ Video PRO criado:', {
      id: createdPro.id,
      quality: createdPro.quality,
      status: createdPro.status
    })
    
    // Teste 4: Verificar se conseguimos ler os vídeos criados
    console.log('\n4. Verificando leitura dos vídeos criados...')
    
    const createdVideos = await prisma.videoGeneration.findMany({
      where: {
        userId: {
          in: [testVideoStandard.userId, testVideoPro.userId]
        }
      },
      select: {
        id: true,
        quality: true,
        status: true,
        creditsUsed: true,
        createdAt: true
      }
    })
    
    console.log('✅ Vídeos encontrados:', createdVideos.length)
    createdVideos.forEach(video => {
      console.log(`  - ID: ${video.id}, Quality: ${video.quality}, Status: ${video.status}`)
    })
    
    // Limpeza: Remover dados de teste
    console.log('\n5. Limpando dados de teste...')
    
    const deleteResult = await prisma.videoGeneration.deleteMany({
      where: {
        userId: {
          in: [testVideoStandard.userId, testVideoPro.userId]
        }
      }
    })
    
    console.log('✅ Vídeos de teste removidos:', deleteResult.count)
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!')
    console.log('✅ Enum VideoQuality está funcionando corretamente')
    console.log('✅ Criação de vídeo com quality "standard" - OK')
    console.log('✅ Criação de vídeo com quality "pro" - OK')
    console.log('✅ Leitura dos vídeos criados - OK')
    console.log('\n🚀 A criação de vídeos deve funcionar agora!')
    
    return true
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message)
    
    if (error.message.includes('invalid input value for enum')) {
      console.error('🔴 AINDA HÁ PROBLEMA COM O ENUM!')
      console.error('   O erro indica que ainda está sendo usado valor uppercase')
      console.error('   Precisa verificar onde está sendo usado STANDARD/PRO')
    }
    
    if (error.code === 'P2002') {
      console.error('🟡 Erro de uniqueness constraint - dados de teste já existem?')
    }
    
    console.error('\nStack completo:', error.stack)
    return false
    
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Desconectado do banco')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testVideoCreationFix().then(success => {
    if (success) {
      console.log('\n🎊 PARABÉNS! O problema do enum foi corrigido!')
    } else {
      console.log('\n💥 Ainda há problemas. Verificar logs acima.')
    }
    process.exit(success ? 0 : 1)
  }).catch(console.error)
}

module.exports = { testVideoCreationFix }