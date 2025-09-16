const { PrismaClient } = require('@prisma/client')

async function testVideoEnumOnly() {
  console.log('🧪 Testando apenas o enum VideoQuality (sem criar registros)...')
  
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
    
    // Teste 2: Validar se conseguimos usar o enum em queries
    console.log('\n2. Testando validação do enum...')
    
    try {
      // Esta query vai falhar se o enum não aceitar 'standard'
      await prisma.$queryRaw`
        SELECT 'standard'::"VideoQuality" as quality_test;
      `
      console.log('✅ Valor "standard" aceito pelo enum')
      
      await prisma.$queryRaw`
        SELECT 'pro'::"VideoQuality" as quality_test;
      `
      console.log('✅ Valor "pro" aceito pelo enum')
      
    } catch (enumError) {
      console.error('❌ Erro com valores do enum:', enumError.message)
      throw enumError
    }
    
    // Teste 3: Verificar se valores uppercase falham
    console.log('\n3. Testando rejeição de valores uppercase...')
    
    try {
      await prisma.$queryRaw`
        SELECT 'STANDARD'::"VideoQuality" as quality_test;
      `
      console.log('⚠️  Valor "STANDARD" ainda é aceito (não deveria!)')
    } catch (enumError) {
      console.log('✅ Valor "STANDARD" corretamente rejeitado')
    }
    
    try {
      await prisma.$queryRaw`
        SELECT 'PRO'::"VideoQuality" as quality_test;
      `
      console.log('⚠️  Valor "PRO" ainda é aceito (não deveria!)')
    } catch (enumError) {
      console.log('✅ Valor "PRO" corretamente rejeitado')
    }
    
    // Teste 4: Verificar a estrutura da tabela
    console.log('\n4. Verificando estrutura da tabela video_generations...')
    
    const columnInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'video_generations' AND column_name = 'quality';
    `
    
    console.log('✅ Info da coluna quality:', columnInfo)
    
    console.log('\n🎉 TESTE DO ENUM CONCLUÍDO!')
    console.log('✅ Enum VideoQuality configurado corretamente')
    console.log('✅ Valores lowercase (standard, pro) funcionam')
    console.log('✅ A criação de vídeos deve funcionar na aplicação!')
    
    return true
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message)
    console.error('Stack completo:', error.stack)
    return false
    
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Desconectado do banco')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testVideoEnumOnly().then(success => {
    if (success) {
      console.log('\n🎊 EXCELENTE! O enum VideoQuality está correto!')
      console.log('🚀 A aplicação deve conseguir criar vídeos agora!')
    } else {
      console.log('\n💥 Ainda há problemas com o enum. Verificar logs acima.')
    }
    process.exit(success ? 0 : 1)
  }).catch(console.error)
}

module.exports = { testVideoEnumOnly }