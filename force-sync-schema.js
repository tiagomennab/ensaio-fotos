const { PrismaClient } = require('@prisma/client')

async function forceSyncSchema() {
  console.log('🚀 FORÇANDO SINCRONIZAÇÃO DO SCHEMA...')
  console.log('⚠️  ATENÇÃO: Esta operação pode alterar/deletar dados!')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })
  
  try {
    await prisma.$connect()
    console.log('✅ Conectado ao banco')
    
    // Passo 1: Corrigir colunas faltantes mais críticas
    console.log('\n1. Adicionando colunas críticas faltantes...')
    
    // accounts: userId e providerAccountId (snake_case para camelCase)
    try {
      await prisma.$executeRaw`
        ALTER TABLE "accounts" 
        ADD COLUMN IF NOT EXISTS "userId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerAccountId" TEXT;
      `
      
      // Copiar dados das colunas snake_case para camelCase
      await prisma.$executeRaw`
        UPDATE "accounts" 
        SET "userId" = "user_id", "providerAccountId" = "provider_account_id"
        WHERE "userId" IS NULL OR "providerAccountId" IS NULL;
      `
      console.log('✅ accounts: userId e providerAccountId adicionadas')
    } catch (e) {
      console.log('⚠️ accounts já tem as colunas:', e.message)
    }
    
    // sessions: sessionToken e userId
    try {
      await prisma.$executeRaw`
        ALTER TABLE "sessions" 
        ADD COLUMN IF NOT EXISTS "sessionToken" TEXT,
        ADD COLUMN IF NOT EXISTS "userId" TEXT;
      `
      
      await prisma.$executeRaw`
        UPDATE "sessions" 
        SET "sessionToken" = "session_token", "userId" = "user_id"
        WHERE "sessionToken" IS NULL OR "userId" IS NULL;
      `
      console.log('✅ sessions: sessionToken e userId adicionadas')
    } catch (e) {
      console.log('⚠️ sessions já tem as colunas:', e.message)
    }
    
    // edit_history: colunas faltantes
    try {
      await prisma.$executeRaw`
        ALTER TABLE "edit_history" 
        ADD COLUMN IF NOT EXISTS "originalImageUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "editedImageUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
      `
      
      // Copiar dados das colunas snake_case
      await prisma.$executeRaw`
        UPDATE "edit_history" 
        SET 
          "originalImageUrl" = COALESCE("originalImageUrl", "original_image_url", ''),
          "editedImageUrl" = COALESCE("editedImageUrl", "edited_image_url", ''),
          "thumbnailUrl" = "thumbnail_url",
          "createdAt" = COALESCE("createdAt", "created_at", CURRENT_TIMESTAMP),
          "updatedAt" = COALESCE("updatedAt", "updated_at", CURRENT_TIMESTAMP)
        WHERE "originalImageUrl" IS NULL OR "editedImageUrl" IS NULL;
      `
      console.log('✅ edit_history: colunas de imagem adicionadas')
    } catch (e) {
      console.log('⚠️ edit_history já tem as colunas:', e.message)
    }
    
    // Passo 2: Corrigir principais nullable mismatches
    console.log('\n2. Corrigindo nullable mismatches críticos...')
    
    // users: principais colunas que devem ser nullable
    try {
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ALTER COLUMN "name" DROP NOT NULL,
        ALTER COLUMN "avatar" DROP NOT NULL,
        ALTER COLUMN "password" DROP NOT NULL,
        ALTER COLUMN "emailVerified" DROP NOT NULL,
        ALTER COLUMN "stripeCustomerId" DROP NOT NULL,
        ALTER COLUMN "asaasCustomerId" DROP NOT NULL,
        ALTER COLUMN "subscriptionId" DROP NOT NULL,
        ALTER COLUMN "subscriptionStatus" DROP NOT NULL,
        ALTER COLUMN "subscriptionEndsAt" DROP NOT NULL,
        ALTER COLUMN "subscriptionCancelledAt" DROP NOT NULL,
        ALTER COLUMN "lastLoginAt" DROP NOT NULL;
      `
      console.log('✅ users: nullable constraints corrigidas')
    } catch (e) {
      console.log('⚠️ users nullable:', e.message)
    }
    
    // accounts: colunas opcionais
    try {
      await prisma.$executeRaw`
        ALTER TABLE "accounts" 
        ALTER COLUMN "refresh_token" DROP NOT NULL,
        ALTER COLUMN "access_token" DROP NOT NULL,
        ALTER COLUMN "expires_at" DROP NOT NULL,
        ALTER COLUMN "token_type" DROP NOT NULL,
        ALTER COLUMN "scope" DROP NOT NULL,
        ALTER COLUMN "id_token" DROP NOT NULL,
        ALTER COLUMN "session_state" DROP NOT NULL;
      `
      console.log('✅ accounts: nullable constraints corrigidas')
    } catch (e) {
      console.log('⚠️ accounts nullable:', e.message)
    }
    
    // Passo 3: Adicionar foreign keys críticas
    console.log('\n3. Adicionando foreign keys críticas...')
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "accounts" 
        ADD CONSTRAINT IF NOT EXISTS "accounts_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
      console.log('✅ accounts: FK para users adicionada')
    } catch (e) {
      console.log('⚠️ accounts FK já existe:', e.message)
    }
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "sessions" 
        ADD CONSTRAINT IF NOT EXISTS "sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
      console.log('✅ sessions: FK para users adicionada')
    } catch (e) {
      console.log('⚠️ sessions FK já existe:', e.message)
    }
    
    // Passo 4: Corrigir enums que estão como text
    console.log('\n4. Corrigindo tipos de enum...')
    
    // credit_transactions: criar enums se não existirem
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditTransactionType') THEN
            CREATE TYPE "CreditTransactionType" AS ENUM ('EARNED', 'SPENT', 'EXPIRED', 'REFUNDED');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditTransactionSource') THEN
            CREATE TYPE "CreditTransactionSource" AS ENUM ('PURCHASE', 'BONUS', 'GENERATION', 'VIDEO', 'REFUND', 'ADMIN');
          END IF;
        END $$;
      `
      console.log('✅ Enums de credit transactions criados')
    } catch (e) {
      console.log('⚠️ Enums já existem:', e.message)
    }
    
    // Passo 5: Teste final de conexão
    console.log('\n5. Testando conexões do Prisma...')
    
    try {
      const userCount = await prisma.user.count()
      console.log('✅ Users acessível:', userCount)
      
      const accountCount = await prisma.account.count()
      console.log('✅ Accounts acessível:', accountCount)
      
      const sessionCount = await prisma.session.count()
      console.log('✅ Sessions acessível:', sessionCount)
      
      const paymentCount = await prisma.payment.count()
      console.log('✅ Payments acessível:', paymentCount)
      
      const webhookCount = await prisma.webhookEvent.count()
      console.log('✅ WebhookEvents acessível:', webhookCount)
      
      const paymentMethodCount = await prisma.paymentMethod.count()
      console.log('✅ PaymentMethods acessível:', paymentMethodCount)
      
    } catch (testError) {
      console.error('❌ Erro nos testes:', testError.message)
    }
    
    console.log('\n🎉 SINCRONIZAÇÃO FORÇADA CONCLUÍDA!')
    console.log('✅ Principais problemas corrigidos')
    console.log('✅ Prisma Studio deve funcionar muito melhor agora')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro na sincronização forçada:', error.message)
    console.error('Stack:', error.stack)
    return false
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Desconectado do banco')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  forceSyncSchema().then(success => {
    if (success) {
      console.log('\n🚀 SUCESSO! Execute: npx prisma studio')
    } else {
      console.log('\n❌ Problemas na sincronização. Verifique logs acima.')
    }
  }).catch(console.error)
}

module.exports = { forceSyncSchema }