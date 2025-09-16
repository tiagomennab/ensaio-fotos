const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function fixPreparedStatementsDirect() {
  let client

  try {
    console.log('🔧 Corrigindo prepared statements com conexão direta...')

    // Criar cliente PostgreSQL direto (não Prisma)
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    await client.connect()
    console.log('✅ Conectado ao PostgreSQL')

    // Limpar todas as prepared statements da sessão
    console.log('🧹 Executando DEALLOCATE ALL...')
    await client.query('DEALLOCATE ALL;')
    console.log('✅ Prepared statements limpos')

    // Testar conexão
    const testResult = await client.query('SELECT NOW() as current_time;')
    console.log('✅ Teste de conexão:', testResult.rows[0])

    // Testar contagem de usuários
    const countResult = await client.query('SELECT COUNT(*) as total FROM users;')
    console.log('✅ Total de usuários:', countResult.rows[0].total)

    console.log('🎉 Prepared statements corrigidos com sucesso!')
    console.log('💡 Agora você pode usar o Prisma normalmente')

  } catch (error) {
    console.error('❌ Erro:', error.message)

    if (error.code === '42P01') {
      console.log('⚠️  Tabela "users" não encontrada. Verifique se as migrações foram executadas.')
    }
  } finally {
    if (client) {
      await client.end()
      console.log('🔌 Conexão fechada')
    }
  }
}

fixPreparedStatementsDirect()