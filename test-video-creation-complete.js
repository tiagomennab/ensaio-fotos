const { PrismaClient, VideoQuality, VideoStatus } = require('@prisma/client')

async function testVideoCreationComplete() {
  console.log('🎬 Testando criação completa de vídeo...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })
  
  try {
    await prisma.$connect()
    
    // Teste 1: Verificar enums Prisma
    console.log('\n1. Verificando enums do Prisma:')
    console.log('VideoQuality:', VideoQuality)
    console.log('VideoStatus:', VideoStatus)
    
    // Teste 2: Criar usuário de teste (se não existir)
    console.log('\n2. Garantindo usuário de teste...')
    
    let testUser
    try {
      testUser = await prisma.user.findUnique({
        where: { email: 'test-video@example.com' }
      })
      
      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            email: 'test-video@example.com',
            name: 'Test Video User',
            plan: 'PREMIUM',
            creditsLimit: 1000,
            creditsUsed: 0
          }
        })
        console.log('✅ Usuário de teste criado:', testUser.id)
      } else {
        console.log('✅ Usuário de teste já existe:', testUser.id)
      }
    } catch (userError) {
      console.error('❌ Erro ao criar usuário de teste:', userError.message)
      return false
    }
    
    // Teste 3: Criar video generation com qualidade 'standard'
    console.log('\n3. Testando criação com quality = "standard"...')
    
    const testVideoStandard = {
      userId: testUser.id,
      sourceImageUrl: 'https://example.com/test-standard.jpg',
      prompt: 'Test prompt for standard video generation',
      negativePrompt: 'blurry, low quality',
      duration: 5,
      aspectRatio: '16:9',
      quality: VideoQuality.standard, // Usando enum do Prisma
      creditsUsed: 20,
      status: VideoStatus.STARTING
    }
    
    console.log('📋 Dados para criação:', {
      ...testVideoStandard,
      userId: '***' // Ocultar ID por segurança
    })
    
    const createdStandard = await prisma.videoGeneration.create({
      data: testVideoStandard
    })
    
    console.log('✅ Video STANDARD criado com sucesso:', {
      id: createdStandard.id,
      quality: createdStandard.quality,
      status: createdStandard.status
    })
    
    // Teste 4: Criar video generation com qualidade 'pro'
    console.log('\n4. Testando criação com quality = "pro"...')
    
    const testVideoPro = {
      userId: testUser.id,
      sourceImageUrl: 'https://example.com/test-pro.jpg',
      prompt: 'Test prompt for pro video generation',
      negativePrompt: 'artifacts, distortion',
      duration: 10,
      aspectRatio: '9:16',
      quality: VideoQuality.pro, // Usando enum do Prisma
      creditsUsed: 60,
      status: VideoStatus.STARTING
    }
    
    const createdPro = await prisma.videoGeneration.create({
      data: testVideoPro
    })
    
    console.log('✅ Video PRO criado com sucesso:', {
      id: createdPro.id,
      quality: createdPro.quality,
      status: createdPro.status
    })
    
    // Teste 5: Listar vídeos criados
    console.log('\n5. Verificando vídeos criados...')
    
    const createdVideos = await prisma.videoGeneration.findMany({
      where: {
        userId: testUser.id
      },
      select: {
        id: true,
        quality: true,
        status: true,
        creditsUsed: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 2
    })
    
    console.log('✅ Vídeos encontrados:', createdVideos.length)
    createdVideos.forEach(video => {
      console.log(`  - ID: ${video.id.substring(0, 8)}..., Quality: ${video.quality}, Status: ${video.status}`)
    })
    
    // Teste 6: Testar as funções do arquivo videos.ts
    console.log('\n6. Testando funções do videos.ts...')
    
    const { createVideoGeneration } = require('./src/lib/db/videos.js')
    
    const requestData = {
      sourceImageUrl: 'https://example.com/test-function.jpg',
      prompt: 'Testing createVideoGeneration function',
      negativePrompt: 'test artifacts',
      duration: 5,
      aspectRatio: '1:1',
      quality: 'standard', // String pura, será convertida pela função
      creditsUsed: 25
    }
    
    console.log('📋 Testando função createVideoGeneration com:', requestData)
    
    const functionResult = await createVideoGeneration(testUser.id, requestData)
    
    console.log('✅ Função createVideoGeneration funcionou:', {
      id: functionResult.id,
      quality: functionResult.quality,
      status: functionResult.status
    })
    
    // Limpeza: Remover dados de teste
    console.log('\n7. Limpando dados de teste...')
    
    const deleteResult = await prisma.videoGeneration.deleteMany({
      where: {
        userId: testUser.id,
        prompt: {
          contains: 'Test'
        }
      }
    })
    
    console.log('✅ Vídeos de teste removidos:', deleteResult.count)
    
    // Remover usuário de teste
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Usuário de teste removido')
    
    console.log('\n🎉 TESTE COMPLETO CONCLUÍDO!')
    console.log('✅ Prisma Client está funcionando corretamente')
    console.log('✅ Enum VideoQuality com valores lowercase funciona')
    console.log('✅ Criação de vídeos via Prisma funciona')
    console.log('✅ Função createVideoGeneration funciona')
    console.log('\n🚀 O sistema de criação de vídeos deve funcionar agora!')
    
    return true
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE COMPLETO:', error.message)
    
    if (error.message.includes('invalid input value for enum')) {
      console.error('🔴 AINDA HÁ PROBLEMA COM O ENUM!')
      console.error('   Verifique se o Prisma Client foi regenerado corretamente')
    }
    
    if (error.code === 'P2002') {
      console.error('🟡 Erro de constraint - pode ser dados duplicados')
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
  testVideoCreationComplete().then(success => {
    if (success) {
      console.log('\n🎊 SUCESSO TOTAL! O problema foi resolvido completamente!')
      console.log('🚀 A aplicação deve conseguir criar vídeos normalmente agora!')
    } else {
      console.log('\n💥 Ainda há problemas. Verificar logs acima.')
    }
    process.exit(success ? 0 : 1)
  }).catch(console.error)
}

module.exports = { testVideoCreationComplete }