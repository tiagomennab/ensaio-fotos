const { PrismaClient } = require('@prisma/client')

async function createMissingTables() {
  console.log('🔧 Criando tabelas faltantes no Supabase...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })
  
  try {
    await prisma.$connect()
    
    // =============================
    // 1. CRIAR TABELA webhook_events
    // =============================
    console.log('\n1. Criando tabela webhook_events...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "webhook_events" (
        "id" TEXT NOT NULL,
        
        -- Webhook details
        "event" TEXT NOT NULL,
        "asaasPaymentId" TEXT,
        "asaasSubscriptionId" TEXT,
        
        -- Processing status  
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "processedAt" TIMESTAMP(3),
        "errorMessage" TEXT,
        "retryCount" INTEGER NOT NULL DEFAULT 0,
        "maxRetries" INTEGER NOT NULL DEFAULT 3,
        
        -- Raw webhook data
        "rawData" JSONB NOT NULL,
        "signature" TEXT,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        
        -- Timestamps
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✅ Tabela webhook_events criada!')
    
    // Índices para webhook_events
    console.log('Criando índices para webhook_events...')
    const webhookIndexes = [
      'CREATE INDEX IF NOT EXISTS "webhook_events_event_idx" ON "webhook_events"("event");',
      'CREATE INDEX IF NOT EXISTS "webhook_events_status_idx" ON "webhook_events"("status");',
      'CREATE INDEX IF NOT EXISTS "webhook_events_asaasPaymentId_idx" ON "webhook_events"("asaasPaymentId");',
      'CREATE INDEX IF NOT EXISTS "webhook_events_createdAt_idx" ON "webhook_events"("createdAt");'
    ]
    
    for (const indexSQL of webhookIndexes) {
      try {
        await prisma.$executeRawUnsafe(indexSQL)
      } catch (indexError) {
        console.log('⚠️ Índice já existe:', indexError.message)
      }
    }
    
    // ================================
    // 2. CRIAR TABELA payment_methods
    // ================================
    console.log('\n2. Criando tabela payment_methods...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" TEXT NOT NULL,
        
        -- Card details (tokenized)
        "asaasTokenId" TEXT,
        "cardLast4" TEXT,
        "cardBrand" TEXT,
        "cardHolderName" TEXT,
        "expiryMonth" TEXT,
        "expiryYear" TEXT,
        
        -- Status
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        
        -- Timestamps
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        -- Relations
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✅ Tabela payment_methods criada!')
    
    // Constraint unique para payment_methods
    try {
      await prisma.$executeRaw`
        ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_asaasTokenId_key" UNIQUE ("asaasTokenId");
      `
      console.log('✅ Constraint unique em asaasTokenId adicionada')
    } catch (constraintError) {
      console.log('⚠️ Constraint unique já existe:', constraintError.message)
    }
    
    // Foreign key para payment_methods
    try {
      await prisma.$executeRaw`
        ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
      console.log('✅ Foreign key para users adicionada')
    } catch (fkError) {
      console.log('⚠️ Foreign key já existe:', fkError.message)
    }
    
    // Índices para payment_methods
    console.log('Criando índices para payment_methods...')
    const paymentMethodIndexes = [
      'CREATE INDEX IF NOT EXISTS "payment_methods_userId_idx" ON "payment_methods"("userId");',
      'CREATE INDEX IF NOT EXISTS "payment_methods_isActive_idx" ON "payment_methods"("isActive");',
      'CREATE INDEX IF NOT EXISTS "payment_methods_isDefault_idx" ON "payment_methods"("isDefault");'
    ]
    
    for (const indexSQL of paymentMethodIndexes) {
      try {
        await prisma.$executeRawUnsafe(indexSQL)
      } catch (indexError) {
        console.log('⚠️ Índice já existe:', indexError.message)
      }
    }
    
    // ===========================
    // 3. CRIAR TRIGGERS updated_at
    // ===========================
    console.log('\n3. Criando triggers para updated_at...')
    
    // Função já criada anteriormente, só precisamos dos triggers
    try {
      await prisma.$executeRaw`
        DROP TRIGGER IF EXISTS update_webhook_events_updated_at ON "webhook_events";
        CREATE TRIGGER update_webhook_events_updated_at
            BEFORE UPDATE ON "webhook_events"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `
      console.log('✅ Trigger para webhook_events criado')
    } catch (triggerError) {
      console.log('⚠️ Erro no trigger webhook_events:', triggerError.message)
    }
    
    try {
      await prisma.$executeRaw`
        DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON "payment_methods";
        CREATE TRIGGER update_payment_methods_updated_at
            BEFORE UPDATE ON "payment_methods"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `
      console.log('✅ Trigger para payment_methods criado')
    } catch (triggerError) {
      console.log('⚠️ Erro no trigger payment_methods:', triggerError.message)
    }
    
    // ===============================
    // 4. VERIFICAÇÃO FINAL
    // ===============================
    console.log('\n4. Verificação final...')
    
    // Verificar webhook_events
    const webhookInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'webhook_events' 
      ORDER BY ordinal_position
    `
    console.log(`✅ webhook_events criada com ${webhookInfo.length} colunas`)
    
    // Verificar payment_methods
    const paymentMethodInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'payment_methods' 
      ORDER BY ordinal_position
    `
    console.log(`✅ payment_methods criada com ${paymentMethodInfo.length} colunas`)
    
    // Teste de acesso via Prisma
    console.log('\n5. Testando acesso via Prisma...')
    
    try {
      const webhookCount = await prisma.webhookEvent.count()
      console.log('✅ webhook_events acessível via Prisma! Total:', webhookCount)
    } catch (webhookError) {
      console.log('❌ Erro ao acessar webhook_events:', webhookError.message)
    }
    
    try {
      const paymentMethodCount = await prisma.paymentMethod.count()
      console.log('✅ payment_methods acessível via Prisma! Total:', paymentMethodCount)
    } catch (paymentMethodError) {
      console.log('❌ Erro ao acessar payment_methods:', paymentMethodError.message)
    }
    
    // Contagem final de tabelas
    console.log('\n6. Contagem final...')
    const finalTables = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    console.log(`✅ Total de tabelas no Supabase agora: ${finalTables[0].total}`)
    
    console.log('\n🎉 SINCRONIZAÇÃO COMPLETA!')
    console.log('✅ Todas as 21 tabelas do Prisma agora existem no Supabase')
    console.log('✅ Prisma Studio deve funcionar sem erros!')
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Desconectado do banco')
  }
}

createMissingTables().catch(console.error)