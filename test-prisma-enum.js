const { PrismaClient, VideoQuality } = require('@prisma/client')

async function testPrismaEnum() {
  console.log('🧪 Testando enum VideoQuality do Prisma Client...')
  
  try {
    // Teste 1: Verificar valores do enum
    console.log('\n1. Valores disponíveis no enum VideoQuality:')
    console.log('VideoQuality object:', VideoQuality)
    console.log('VideoQuality keys:', Object.keys(VideoQuality))
    console.log('VideoQuality values:', Object.values(VideoQuality))
    
    // Teste 2: Verificar se ainda tem valores uppercase
    const hasUppercase = Object.values(VideoQuality).some(v => 
      v === 'STANDARD' || v === 'PRO'
    )
    
    const hasLowercase = Object.values(VideoQuality).some(v => 
      v === 'standard' || v === 'pro'
    )
    
    console.log('\n2. Análise dos valores:')
    console.log('Tem valores uppercase (STANDARD/PRO):', hasUppercase)
    console.log('Tem valores lowercase (standard/pro):', hasLowercase)
    
    // Teste 3: Tentar usar os valores
    console.log('\n3. Testando acesso aos valores:')
    
    try {
      console.log('VideoQuality.standard:', VideoQuality.standard)
    } catch (e) {
      console.log('❌ VideoQuality.standard não existe:', e.message)
    }
    
    try {
      console.log('VideoQuality.pro:', VideoQuality.pro)  
    } catch (e) {
      console.log('❌ VideoQuality.pro não existe:', e.message)
    }
    
    try {
      console.log('VideoQuality.STANDARD:', VideoQuality.STANDARD)
    } catch (e) {
      console.log('❌ VideoQuality.STANDARD não existe:', e.message)
    }
    
    try {
      console.log('VideoQuality.PRO:', VideoQuality.PRO)
    } catch (e) {
      console.log('❌ VideoQuality.PRO não existe:', e.message)
    }
    
    // Teste 4: Verificar se conseguimos criar um objeto com o enum
    console.log('\n4. Testando criação de objeto com enum:')
    
    const testData = {
      quality: VideoQuality.standard || VideoQuality.STANDARD
    }
    
    console.log('Objeto de teste:', testData)
    
    if (hasUppercase && !hasLowercase) {
      console.log('\n⚠️  PROBLEMA: Prisma Client ainda tem valores uppercase!')
      console.log('O schema.prisma foi atualizado, mas o client não foi regenerado corretamente.')
      return false
    } else if (hasLowercase && !hasUppercase) {
      console.log('\n✅ CORRETO: Prisma Client tem apenas valores lowercase!')
      return true
    } else if (hasLowercase && hasUppercase) {
      console.log('\n⚠️  AMBÍGUO: Prisma Client tem valores uppercase E lowercase!')
      console.log('Isso pode gerar confusão. Deve ter apenas lowercase.')
      return false
    } else {
      console.log('\n❌ ERRO: Prisma Client não tem nenhum valor reconhecido!')
      return false
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao testar enum:', error.message)
    console.error('Stack:', error.stack)
    return false
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testPrismaEnum().then(success => {
    if (success) {
      console.log('\n🎉 ENUM CORRETO! O Prisma Client foi atualizado corretamente.')
    } else {
      console.log('\n💥 ENUM INCORRETO! Precisa regenerar o Prisma Client.')
    }
    process.exit(success ? 0 : 1)
  }).catch(console.error)
}

module.exports = { testPrismaEnum }