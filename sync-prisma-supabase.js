const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

async function syncPrismaSupabase() {
  console.log('🔍 Sincronizando Prisma Schema vs Supabase...')
  
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    
    // Passo 1: Extrair modelos do schema.prisma
    console.log('1. Analisando schema.prisma...')
    const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf8')
    
    // Extrair modelos do schema
    const modelMatches = schemaContent.match(/model\s+(\w+)\s*{[^}]*}/g) || []
    const prismaModels = modelMatches.map(match => {
      const modelName = match.match(/model\s+(\w+)/)[1]
      return modelName
    })
    
    console.log(`✅ Encontrados ${prismaModels.length} modelos no Prisma:`)
    prismaModels.forEach(model => console.log(`  - ${model}`))
    
    // Passo 2: Listar tabelas no Supabase
    console.log('\n2. Verificando tabelas no Supabase...')
    const supabaseTables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    
    const supabaseTableNames = supabaseTables.map(t => t.table_name)
    console.log(`✅ Encontradas ${supabaseTableNames.length} tabelas no Supabase:`)
    supabaseTableNames.forEach(table => console.log(`  - ${table}`))
    
    // Passo 3: Mapear nomes de modelo para nomes de tabela
    console.log('\n3. Mapeando modelos para tabelas...')
    const modelToTableMap = {}
    
    // Verificar se há @@map() no schema para cada modelo
    prismaModels.forEach(model => {
      const modelRegex = new RegExp(`model\\s+${model}\\s*{[^}]*@@map\\("([^"]+)"\\)[^}]*}`, 's')
      const mapMatch = schemaContent.match(modelRegex)
      
      if (mapMatch) {
        modelToTableMap[model] = mapMatch[1]
      } else {
        // Usar convenção padrão: PascalCase para snake_case (para alguns) ou manter igual
        if (model === 'User') modelToTableMap[model] = 'users'
        else if (model === 'Account') modelToTableMap[model] = 'accounts'
        else if (model === 'Session') modelToTableMap[model] = 'sessions'
        else if (model === 'VerificationToken') modelToTableMap[model] = 'verificationtokens'
        else if (model === 'AIModel') modelToTableMap[model] = 'ai_models'
        else if (model === 'Generation') modelToTableMap[model] = 'generations'
        else if (model === 'VideoGeneration') modelToTableMap[model] = 'video_generations'
        else if (model === 'Collection') modelToTableMap[model] = 'collections'
        else if (model === 'EditHistory') modelToTableMap[model] = 'edit_history'
        else if (model === 'PhotoPackage') modelToTableMap[model] = 'photo_packages'
        else if (model === 'ApiKey') modelToTableMap[model] = 'api_keys'
        else if (model === 'SystemLog') modelToTableMap[model] = 'SystemLog'
        else if (model === 'UsageLog') modelToTableMap[model] = 'usage_logs'
        else if (model === 'UserConsent') modelToTableMap[model] = 'user_consents'
        else if (model === 'Payment') modelToTableMap[model] = 'payments'
        else if (model === 'CreditPurchase') modelToTableMap[model] = 'credit_purchases'
        else if (model === 'PaymentMethod') modelToTableMap[model] = 'payment_methods'
        else if (model === 'CreditTransaction') modelToTableMap[model] = 'credit_transactions'
        else if (model === 'CreditPackage') modelToTableMap[model] = 'credit_packages'
        else if (model === 'SystemConfig') modelToTableMap[model] = 'system_config'
        else modelToTableMap[model] = model.toLowerCase()
      }
    })
    
    console.log('✅ Mapeamento modelo -> tabela:')
    Object.entries(modelToTableMap).forEach(([model, table]) => {
      console.log(`  - ${model} -> ${table}`)
    })
    
    // Passo 4: Identificar tabelas faltantes
    console.log('\n4. Identificando tabelas faltantes...')
    const expectedTables = Object.values(modelToTableMap)
    const missingTables = expectedTables.filter(table => !supabaseTableNames.includes(table))
    
    console.log(`\n📊 RESUMO:`)
    console.log(`- Modelos no Prisma: ${prismaModels.length}`)
    console.log(`- Tabelas no Supabase: ${supabaseTableNames.length}`)
    console.log(`- Tabelas esperadas: ${expectedTables.length}`)
    
    if (missingTables.length > 0) {
      console.log(`\n❌ TABELAS FALTANTES (${missingTables.length}):`)
      missingTables.forEach(table => {
        const model = Object.keys(modelToTableMap).find(k => modelToTableMap[k] === table)
        console.log(`  - ${table} (modelo: ${model})`)
      })
    } else {
      console.log('\n✅ Todas as tabelas estão presentes!')
    }
    
    // Passo 5: Verificar tabelas extras no Supabase
    const extraTables = supabaseTableNames.filter(table => !expectedTables.includes(table))
    if (extraTables.length > 0) {
      console.log(`\n📋 TABELAS EXTRAS NO SUPABASE (${extraTables.length}):`)
      extraTables.forEach(table => console.log(`  - ${table}`))
    }
    
    // Passo 6: Para cada tabela faltante, mostrar qual modelo precisa ser criado
    if (missingTables.length > 0) {
      console.log(`\n🔧 AÇÕES NECESSÁRIAS:`)
      
      for (const table of missingTables) {
        const model = Object.keys(modelToTableMap).find(k => modelToTableMap[k] === table)
        console.log(`\n📝 Criar tabela: ${table} (para modelo ${model})`)
        
        // Mostrar definição do modelo no schema
        const modelDefRegex = new RegExp(`model\\s+${model}\\s*{([^}]*)}`, 's')
        const modelMatch = schemaContent.match(modelDefRegex)
        
        if (modelMatch) {
          console.log(`Definição do modelo:`)
          const modelDef = modelMatch[0].split('\n').slice(0, 10).join('\n') // Primeiras 10 linhas
          console.log(modelDef)
          if (modelMatch[0].split('\n').length > 10) {
            console.log('  ... (truncado)')
          }
        }
      }
    }
    
    return {
      prismaModels,
      supabaseTableNames,
      missingTables,
      extraTables,
      modelToTableMap
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncPrismaSupabase().then(result => {
    if (result && result.missingTables.length === 0) {
      console.log('\n🎉 SUCESSO! Schema e banco estão sincronizados!')
    } else if (result) {
      console.log(`\n⚠️ SINCRONIZAÇÃO NECESSÁRIA: ${result.missingTables.length} tabelas faltantes`)
    }
  }).catch(console.error)
}

module.exports = { syncPrismaSupabase }