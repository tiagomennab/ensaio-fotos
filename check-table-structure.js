const { PrismaClient } = require('@prisma/client');

async function checkTableStructure() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking video_generations table structure...');
    
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'video_generations' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Table columns:');
    console.table(columns);
    
    // Check constraints
    console.log('🔒 Checking constraints...');
    const constraints = await prisma.$queryRaw`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'video_generations';
    `;
    
    console.log('📋 Table constraints:');
    console.table(constraints);
    
    // Check foreign keys
    console.log('🔗 Checking foreign key relationships...');
    const foreignKeys = await prisma.$queryRaw`
      SELECT 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu 
        ON kcu.constraint_name = ccu.constraint_name
      WHERE kcu.table_name = 'video_generations' 
        AND kcu.constraint_name LIKE '%_fkey';
    `;
    
    console.log('📋 Foreign keys:');
    console.table(foreignKeys);
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableStructure();