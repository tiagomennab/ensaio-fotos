const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

async function verifyAllColumns() {
  console.log('🔍 Verificando sincronização de TODAS as colunas...')
  
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    
    // Passo 1: Mapear todas as tabelas e suas colunas no Supabase
    console.log('1. Mapeando colunas no Supabase...')
    
    const supabaseColumns = await prisma.$queryRaw`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `
    
    // Organizar por tabela
    const supabaseByTable = {}
    supabaseColumns.forEach(col => {
      if (!supabaseByTable[col.table_name]) {
        supabaseByTable[col.table_name] = []
      }
      supabaseByTable[col.table_name].push({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        maxLength: col.character_maximum_length,
        precision: col.numeric_precision,
        scale: col.numeric_scale,
        position: col.ordinal_position
      })
    })
    
    console.log(`✅ Encontradas ${Object.keys(supabaseByTable).length} tabelas no Supabase`)
    
    // Passo 2: Analisar schema.prisma para extrair definições de colunas
    console.log('\n2. Analisando schema.prisma...')
    
    const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf8')
    
    // Extrair modelos e suas colunas
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g
    const prismaModels = {}
    
    let match
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1]
      const modelBody = match[2]
      
      // Extrair colunas do modelo
      const columnLines = modelBody.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('@@') && !line.includes('@relation'))
      
      const columns = []
      
      for (const line of columnLines) {
        // Parsear linha de coluna: nome tipo modificadores
        const columnMatch = line.match(/^(\w+)\s+([^\s@]+)(.*)/)
        if (columnMatch) {
          const [, name, type, modifiers] = columnMatch
          
          // Analisar modificadores
          const optional = modifiers.includes('?')
          const hasDefault = modifiers.includes('@default')
          const isId = modifiers.includes('@id')
          const isUnique = modifiers.includes('@unique')
          
          columns.push({
            name,
            type,
            optional,
            hasDefault,
            isId,
            isUnique,
            modifiers: modifiers.trim()
          })
        }
      }
      
      prismaModels[modelName] = columns
    }
    
    console.log(`✅ Analisados ${Object.keys(prismaModels).length} modelos no Prisma`)
    
    // Passo 3: Mapear nomes de modelo para tabela
    const modelToTable = {
      'User': 'users',
      'Account': 'accounts', 
      'Session': 'sessions',
      'VerificationToken': 'verificationtokens',
      'AIModel': 'ai_models',
      'Generation': 'generations',
      'VideoGeneration': 'video_generations',
      'Collection': 'collections',
      'EditHistory': 'edit_history',
      'PhotoPackage': 'photo_packages',
      'ApiKey': 'api_keys',
      'UsageLog': 'usage_logs',
      'SystemConfig': 'system_config',
      'SystemLog': 'SystemLog',
      'UserConsent': 'user_consents',
      'Payment': 'payments',
      'CreditPurchase': 'credit_purchases',
      'WebhookEvent': 'webhook_events',
      'PaymentMethod': 'payment_methods',
      'CreditPackage': 'credit_packages',
      'CreditTransaction': 'credit_transactions'
    }
    
    // Passo 4: Comparar coluna por coluna
    console.log('\n3. Comparando colunas...')
    
    let totalTables = 0
    let tablesWithIssues = 0
    let totalColumns = 0
    let columnsWithIssues = 0
    
    const issues = []
    
    for (const [modelName, prismaColumns] of Object.entries(prismaModels)) {
      const tableName = modelToTable[modelName] || modelName.toLowerCase()
      const supabaseTableColumns = supabaseByTable[tableName] || []
      
      totalTables++
      
      console.log(`\n📋 Tabela: ${tableName} (modelo: ${modelName})`)
      console.log(`   Prisma: ${prismaColumns.length} colunas | Supabase: ${supabaseTableColumns.length} colunas`)
      
      if (supabaseTableColumns.length === 0) {
        console.log(`   ❌ TABELA FALTANTE NO SUPABASE!`)
        issues.push({
          type: 'MISSING_TABLE',
          model: modelName,
          table: tableName
        })
        tablesWithIssues++
        continue
      }
      
      // Mapear colunas do Supabase por nome
      const supabaseColumnMap = {}
      supabaseTableColumns.forEach(col => {
        supabaseColumnMap[col.name] = col
      })
      
      let tableHasIssues = false
      
      // Verificar cada coluna do Prisma
      for (const prismaCol of prismaColumns) {
        totalColumns++
        const supabaseCol = supabaseColumnMap[prismaCol.name]
        
        if (!supabaseCol) {
          console.log(`     ❌ Coluna faltante: ${prismaCol.name} (${prismaCol.type})`)
          issues.push({
            type: 'MISSING_COLUMN',
            table: tableName,
            model: modelName,
            column: prismaCol.name,
            expectedType: prismaCol.type
          })
          columnsWithIssues++
          tableHasIssues = true
          continue
        }
        
        // Verificar tipo básico
        let typeMatch = false
        const prismaType = prismaCol.type.toLowerCase()
        const supabaseType = supabaseCol.type.toLowerCase()
        
        // Mapeamento de tipos
        const typeMapping = {
          'string': ['text', 'character varying', 'varchar'],
          'int': ['integer', 'int4'],
          'bigint': ['bigint', 'int8'],
          'float': ['double precision', 'float8', 'real'],
          'decimal': ['numeric', 'decimal'],
          'boolean': ['boolean', 'bool'],
          'datetime': ['timestamp without time zone', 'timestamp'],
          'json': ['jsonb', 'json'],
          'bytes': ['bytea']
        }
        
        // Verificar se os tipos são compatíveis
        for (const [prisma, supabaseTypes] of Object.entries(typeMapping)) {
          if (prismaType.includes(prisma) && supabaseTypes.includes(supabaseType)) {
            typeMatch = true
            break
          }
        }
        
        // Verificar enums (USER-DEFINED no Supabase)
        if (supabaseType === 'user-defined') {
          typeMatch = true // Enums aparecem como USER-DEFINED
        }
        
        // Verificar nullable
        const prismaOptional = prismaCol.optional
        const supabaseNullable = supabaseCol.nullable
        
        if (!typeMatch) {
          console.log(`     ⚠️  Tipo diferente: ${prismaCol.name}`)
          console.log(`          Prisma: ${prismaCol.type} | Supabase: ${supabaseCol.type}`)
          issues.push({
            type: 'TYPE_MISMATCH',
            table: tableName,
            column: prismaCol.name,
            prismaType: prismaCol.type,
            supabaseType: supabaseCol.type
          })
          columnsWithIssues++
          tableHasIssues = true
        }
        
        if (prismaOptional !== supabaseNullable && !prismaCol.hasDefault) {
          console.log(`     ⚠️  Nullable diferente: ${prismaCol.name}`)
          console.log(`          Prisma: ${prismaOptional ? 'opcional' : 'obrigatório'} | Supabase: ${supabaseNullable ? 'nullable' : 'not null'}`)
          issues.push({
            type: 'NULLABLE_MISMATCH',
            table: tableName,
            column: prismaCol.name,
            prismaOptional,
            supabaseNullable
          })
          columnsWithIssues++
          tableHasIssues = true
        }
        
        console.log(`     ✅ ${prismaCol.name}: ${prismaCol.type} ↔ ${supabaseCol.type}`)
      }
      
      // Verificar colunas extras no Supabase
      for (const supabaseCol of supabaseTableColumns) {
        const prismaHasColumn = prismaColumns.find(p => p.name === supabaseCol.name)
        if (!prismaHasColumn) {
          console.log(`     ℹ️  Coluna extra no Supabase: ${supabaseCol.name} (${supabaseCol.type})`)
        }
      }
      
      if (tableHasIssues) {
        tablesWithIssues++
      }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO DA SINCRONIZAÇÃO:')
    console.log('='.repeat(60))
    console.log(`✅ Tabelas verificadas: ${totalTables}`)
    console.log(`❌ Tabelas com problemas: ${tablesWithIssues}`)
    console.log(`✅ Colunas verificadas: ${totalColumns}`)
    console.log(`❌ Colunas com problemas: ${columnsWithIssues}`)
    console.log(`📋 Total de issues: ${issues.length}`)
    
    if (issues.length === 0) {
      console.log('\n🎉 PERFEITO! Todas as colunas estão sincronizadas!')
      return true
    } else {
      console.log('\n🔧 ISSUES ENCONTRADAS:')
      
      // Agrupar por tipo
      const byType = {}
      issues.forEach(issue => {
        if (!byType[issue.type]) byType[issue.type] = []
        byType[issue.type].push(issue)
      })
      
      Object.entries(byType).forEach(([type, issueList]) => {
        console.log(`\n❌ ${type} (${issueList.length} issues):`)
        issueList.forEach(issue => {
          if (issue.type === 'MISSING_TABLE') {
            console.log(`   - Tabela ${issue.table} (modelo ${issue.model})`)
          } else if (issue.type === 'MISSING_COLUMN') {
            console.log(`   - ${issue.table}.${issue.column} (${issue.expectedType})`)
          } else if (issue.type === 'TYPE_MISMATCH') {
            console.log(`   - ${issue.table}.${issue.column}: ${issue.prismaType} vs ${issue.supabaseType}`)
          } else if (issue.type === 'NULLABLE_MISMATCH') {
            console.log(`   - ${issue.table}.${issue.column}: nullable mismatch`)
          }
        })
      })
      
      return false
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verifyAllColumns().then(success => {
    if (success) {
      console.log('\n🚀 TUDO SINCRONIZADO! Prisma Studio deve funcionar perfeitamente.')
    } else {
      console.log('\n⚠️  Sincronização necessária antes do Prisma Studio funcionar 100%.')
    }
  }).catch(console.error)
}

module.exports = { verifyAllColumns }