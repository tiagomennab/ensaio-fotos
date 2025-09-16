const { Client } = require('pg');

async function testConnection() {
  // Parse da URL de conexão
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.bdxfiwxdcarnygrzqnek:tangoMikeBravo9212!@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require';

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Testando conexão direta com PostgreSQL...');

    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    // Listar tabelas
    const tablesResult = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tabelas no banco de dados:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.table_type})`);
    });

    // Verificar se a tabela users existe e tem dados
    const usersResult = await client.query(`
      SELECT COUNT(*) as count FROM users;
    `);
    console.log(`\n👥 Total de usuários na tabela users: ${usersResult.rows[0].count}`);

    // Se tem usuários, mostrar alguns
    if (parseInt(usersResult.rows[0].count) > 0) {
      const userData = await client.query(`
        SELECT id, email, name, plan, "creditsBalance", "createdAt"
        FROM users
        ORDER BY "createdAt" DESC
        LIMIT 5;
      `);

      console.log('\n📋 Últimos usuários:');
      userData.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Plano: ${user.plan} - Créditos: ${user.creditsBalance}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('   Detalhes técnicos:', error.code);
  } finally {
    await client.end();
  }
}

testConnection();