const { PrismaClient } = require('@prisma/client')

async function createPaymentsTable() {
  console.log('🔧 Criando tabela payments no Supabase...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })
  
  try {
    console.log('1. Conectando ao banco...')
    await prisma.$connect()
    console.log('✅ Conectado!')
    
    // Passo 1: Criar os enums
    console.log('\n2. Criando enums...')
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- PaymentType enum
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
            CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'CREDIT_PURCHASE', 'PHOTO_PACKAGE');
          END IF;
          
          -- PaymentStatus enum  
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
            CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'CANCELLED');
          END IF;
          
          -- BillingType enum
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BillingType') THEN
            CREATE TYPE "BillingType" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO', 'UNDEFINED');
          END IF;
        END $$;
      `
      console.log('✅ Enums criados/verificados')
    } catch (enumError) {
      console.log('⚠️ Erro nos enums (podem já existir):', enumError.message)
    }
    
    // Passo 2: Criar a tabela payments
    console.log('\n3. Criando tabela payments...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL,
        "asaasPaymentId" TEXT NOT NULL,
        
        -- Payment details
        "type" "PaymentType" NOT NULL,
        "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "billingType" "BillingType" NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "description" TEXT,
        
        -- Due date and payment tracking
        "dueDate" TIMESTAMP(3) NOT NULL,
        "confirmedDate" TIMESTAMP(3),
        "overdueDate" TIMESTAMP(3),
        
        -- Installments for credit cards
        "installmentCount" INTEGER,
        "installmentValue" DOUBLE PRECISION,
        
        -- References
        "userId" TEXT NOT NULL,
        "creditPackageId" TEXT,
        "photoPackageId" TEXT,
        
        -- Metadata and URLs
        "invoiceUrl" TEXT,
        "bankSlipUrl" TEXT,
        "pixQrCode" TEXT,
        "pixCopyPasteCode" TEXT,
        "metadata" JSONB,
        
        -- Timestamps
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✅ Tabela payments criada!')
    
    // Passo 3: Criar constraint unique
    console.log('\n4. Adicionando constraints...')
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "payments" ADD CONSTRAINT "payments_asaasPaymentId_key" UNIQUE ("asaasPaymentId");
      `
      console.log('✅ Constraint unique em asaasPaymentId adicionada')
    } catch (constraintError) {
      console.log('⚠️ Constraint unique já existe:', constraintError.message)
    }
    
    // Passo 4: Criar foreign keys
    console.log('\n5. Adicionando foreign keys...')
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
      console.log('✅ Foreign key para users adicionada')
    } catch (fkError) {
      console.log('⚠️ Foreign key users já existe:', fkError.message)
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "payments" ADD CONSTRAINT "payments_creditPackageId_fkey" 
        FOREIGN KEY ("creditPackageId") REFERENCES "credit_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `
      console.log('✅ Foreign key para credit_packages adicionada')
    } catch (fkError) {
      console.log('⚠️ Foreign key credit_packages já existe:', fkError.message)
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "payments" ADD CONSTRAINT "payments_photoPackageId_fkey" 
        FOREIGN KEY ("photoPackageId") REFERENCES "photo_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `
      console.log('✅ Foreign key para photo_packages adicionada')
    } catch (fkError) {
      console.log('⚠️ Foreign key photo_packages já existe:', fkError.message)
    }
    
    // Passo 5: Criar índices
    console.log('\n6. Criando índices...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON "payments"("userId");',
      'CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");',
      'CREATE INDEX IF NOT EXISTS "payments_type_idx" ON "payments"("type");',
      'CREATE INDEX IF NOT EXISTS "payments_dueDate_idx" ON "payments"("dueDate");',
      'CREATE INDEX IF NOT EXISTS "payments_createdAt_idx" ON "payments"("createdAt");',
      'CREATE INDEX IF NOT EXISTS "payments_asaasPaymentId_idx" ON "payments"("asaasPaymentId");'
    ]
    
    for (const indexSQL of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexSQL)
      } catch (indexError) {
        console.log('⚠️ Índice já existe:', indexError.message)
      }
    }
    console.log('✅ Índices criados/verificados')
    
    // Passo 6: Criar trigger para updated_at
    console.log('\n7. Criando trigger para updated_at...')
    
    try {
      await prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedAt" = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
      
      await prisma.$executeRaw`
        DROP TRIGGER IF EXISTS update_payments_updated_at ON "payments";
        CREATE TRIGGER update_payments_updated_at
            BEFORE UPDATE ON "payments"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `
      console.log('✅ Trigger para updated_at criado')
    } catch (triggerError) {
      console.log('⚠️ Erro no trigger:', triggerError.message)
    }
    
    // Verificação final
    console.log('\n8. Verificando tabela criada...')
    
    const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      ORDER BY ordinal_position
    `
    
    console.log('✅ Tabela payments criada com sucesso!')
    console.log('Colunas:', tableInfo.length)
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Teste básico
    console.log('\n9. Testando acesso via Prisma...')
    const paymentCount = await prisma.payment.count()
    console.log('✅ Tabela acessível via Prisma! Total de registros:', paymentCount)
    
    console.log('\n🎉 SUCESSO! Tabela payments criada no Supabase!')
    console.log('Agora o Prisma Studio deve funcionar sem erros.')
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela payments:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Desconectado do banco')
  }
}

createPaymentsTable().catch(console.error)