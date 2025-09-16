const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🔌 Testando conexão com o banco...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
  
  try {
    // Teste básico de conexão
    console.log('1. Testando conexão básica...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida')
    
    // Teste de query simples
    console.log('2. Testando query simples...')
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('✅ Query executada:', result)
    
    // Teste de contagem de usuários
    console.log('3. Testando contagem de usuários...')
    const userCount = await prisma.user.count()
    console.log('✅ Total de usuários:', userCount)
    
    // Listar tabelas existentes
    console.log('4. Verificando tabelas existentes...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    console.log('✅ Tabelas encontradas:')
    tables.forEach(table => console.log(`  - ${table.table_name}`))
    
    // Verificar se edit_history existe
    console.log('5. Verificando tabela edit_history...')
    const editHistoryExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'edit_history'
      ) as exists
    `
    console.log('✅ Tabela edit_history existe:', editHistoryExists[0].exists)
    
    if (editHistoryExists[0].exists) {
      // Verificar colunas da tabela edit_history
      console.log('6. Verificando colunas de edit_history...')
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'edit_history'
        ORDER BY ordinal_position
      `
      console.log('✅ Colunas de edit_history:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    console.log('\n✅ Todos os testes passaram!')
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('👋 Conexão fechada')
  }
}

testConnection().catch(console.error)