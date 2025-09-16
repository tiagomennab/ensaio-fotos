const { Client } = require('pg');
const fs = require('fs');

async function applyVideoSchema() {
  const client = new Client({
    connectionString: "postgresql://postgres.bdxfiwxdcarnygrzqnek:tangoMikeBravo9212!@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('📖 Reading SQL script...');
    const sql = fs.readFileSync('./create-video-generation-table.sql', 'utf8');
    
    console.log('🚀 Applying schema changes...');
    await client.query(sql);
    
    console.log('✅ Video generation table created successfully!');
    
    // Verify the table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'video_generations' AND table_schema = 'public'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful!');
    } else {
      console.log('❌ Table verification failed!');
    }
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

applyVideoSchema().catch(console.error);