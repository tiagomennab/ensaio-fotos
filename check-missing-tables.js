const { PrismaClient } = require('@prisma/client')

async function checkMissingTables() {
  console.log('🔍 Verificando tabelas faltantes no banco...')
  
  const prisma = new PrismaClient()
  
  try {
    // Tabelas que o Prisma espera encontrar (baseado no schema)
    const expectedTables = [
      'users',
      'accounts', 
      'sessions',
      'verificationtokens',
      'ai_models',
      'generations', 
      'video_generations',
      'collections',
      'edit_history',
      'photo_packages',
      'api_keys',
      'SystemLog',
      'usage_logs',
      'user_consents',
      'payments',           // ❌ Esta está faltando
      'credit_purchases',
      'credit_transactions',
      'credit_packages',
      'system_config'
    ]
    
    // Verificar quais tabelas existem
    console.log('1. Verificando tabelas existentes...')
    const existingTablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    const existingTables = existingTablesResult.map(row => row.table_name)
    console.log('✅ Tabelas existentes:', existingTables.join(', '))
    
    // Encontrar tabelas faltantes
    console.log('\n2. Identificando tabelas faltantes...')
    const missingTables = expectedTables.filter(table => !existingTables.includes(table))
    
    if (missingTables.length > 0) {
      console.log('❌ Tabelas faltantes:')
      missingTables.forEach(table => console.log(`  - ${table}`))
    } else {
      console.log('✅ Todas as tabelas esperadas existem!')
    }
    
    // Verificar tabelas extras
    console.log('\n3. Verificando tabelas extras...')
    const extraTables = existingTables.filter(table => !expectedTables.includes(table))
    if (extraTables.length > 0) {
      console.log('ℹ️ Tabelas extras (não no schema):')
      extraTables.forEach(table => console.log(`  - ${table}`))
    }
    
    // Verificar especificamente a tabela payments
    console.log('\n4. Verificando tabela payments especificamente...')
    const paymentsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
      ) as exists
    `
    
    console.log('Tabela payments existe:', paymentsExists[0].exists)
    
    if (!paymentsExists[0].exists) {
      console.log('\n🔧 Sugestão: Criar tabela payments:')
      console.log(`
CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "status" TEXT NOT NULL,
  "method" TEXT,
  "externalId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");
      `)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkMissingTables().catch(console.error)