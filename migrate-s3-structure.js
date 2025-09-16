require('dotenv').config({ path: '.env.local' })
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET

async function migrateS3Structure() {
  try {
    console.log('🚀 MIGRANDO ESTRUTURA DO S3')
    console.log('==========================')
    console.log('Bucket:', BUCKET_NAME)
    
    // 1. List all objects in generations/ folder
    console.log('\n📋 1. LISTANDO CONTEÚDO DA PASTA generations/')
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: 'generations/'
    }
    
    const generationsData = await s3.listObjectsV2(listParams).promise()
    
    if (!generationsData.Contents || generationsData.Contents.length === 0) {
      console.log('❌ Nenhum objeto encontrado em generations/')
      return
    }
    
    console.log(`📁 Encontrados ${generationsData.Contents.length} objetos:`)
    generationsData.Contents.forEach(obj => {
      console.log(`  - ${obj.Key}`)
    })
    
    // 2. Copy each object from generations/ to generated/
    console.log('\n📥 2. MIGRANDO OBJETOS PARA generated/')
    const migrations = []
    
    for (const obj of generationsData.Contents) {
      const oldKey = obj.Key
      const newKey = oldKey.replace('generations/', 'generated/')
      
      console.log(`📄 Migrando: ${oldKey} → ${newKey}`)
      
      const copyParams = {
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
        Key: newKey,
        ACL: 'public-read'
      }
      
      try {
        await s3.copyObject(copyParams).promise()
        console.log(`✅ Copiado: ${newKey}`)
        
        // Add to list for deletion later
        migrations.push({ oldKey, newKey, success: true })
      } catch (error) {
        console.log(`❌ Erro ao copiar ${oldKey}: ${error.message}`)
        migrations.push({ oldKey, newKey, success: false, error: error.message })
      }
    }
    
    // 3. Verify copies were successful
    console.log('\n✅ 3. VERIFICANDO CÓPIAS')
    let successfulCopies = 0
    
    for (const migration of migrations) {
      if (migration.success) {
        try {
          const headParams = {
            Bucket: BUCKET_NAME,
            Key: migration.newKey
          }
          await s3.headObject(headParams).promise()
          console.log(`✅ Verificado: ${migration.newKey}`)
          successfulCopies++
        } catch (error) {
          console.log(`❌ Falha na verificação: ${migration.newKey}`)
          migration.success = false
        }
      }
    }
    
    console.log(`\n📊 RESULTADO: ${successfulCopies}/${migrations.length} objetos migrados com sucesso`)
    
    // 4. Delete original objects if all copies were successful
    if (successfulCopies === migrations.length) {
      console.log('\n🗑️ 4. REMOVENDO OBJETOS ORIGINAIS')
      
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: migrations.map(m => ({ Key: m.oldKey }))
        }
      }
      
      try {
        const deleteResult = await s3.deleteObjects(deleteParams).promise()
        console.log(`✅ Removidos ${deleteResult.Deleted.length} objetos originais`)
        
        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
          console.log('❌ Erros na remoção:')
          deleteResult.Errors.forEach(err => {
            console.log(`  - ${err.Key}: ${err.Message}`)
          })
        }
      } catch (error) {
        console.log('❌ Erro ao remover objetos originais:', error.message)
      }
    } else {
      console.log('⚠️ Não removendo objetos originais devido a falhas na migração')
    }
    
    // 5. Create missing folders structure
    console.log('\n📁 5. CRIANDO ESTRUTURA DE PASTAS NECESSÁRIAS')
    
    const requiredFolders = [
      'generated/',
      'edited/',
      'upscaled/', 
      'videos/',
      'thumbnails/generated/',
      'thumbnails/edited/',
      'thumbnails/upscaled/',
      'thumbnails/videos/'
    ]
    
    for (const folder of requiredFolders) {
      const folderKey = folder + '.gitkeep'
      
      // Check if folder exists (has any objects)
      const checkParams = {
        Bucket: BUCKET_NAME,
        Prefix: folder,
        MaxKeys: 1
      }
      
      const folderData = await s3.listObjectsV2(checkParams).promise()
      const hasContent = folderData.Contents && folderData.Contents.length > 0
      
      if (!hasContent) {
        console.log(`📁 Criando pasta: ${folder}`)
        
        const putParams = {
          Bucket: BUCKET_NAME,
          Key: folderKey,
          Body: '',
          ContentType: 'text/plain'
        }
        
        try {
          await s3.putObject(putParams).promise()
          console.log(`✅ Pasta criada: ${folder}`)
        } catch (error) {
          console.log(`❌ Erro ao criar pasta ${folder}: ${error.message}`)
        }
      } else {
        console.log(`✅ Pasta já existe com conteúdo: ${folder}`)
      }
    }
    
    console.log('\n🎉 MIGRAÇÃO COMPLETA!')
    console.log('Estrutura final do bucket:')
    console.log('├── generated/[userId]/[generationId]_[index].jpg')
    console.log('├── edited/[userId]/[generationId]_[index].jpg')
    console.log('├── upscaled/[userId]/[generationId]_[index].jpg')
    console.log('├── videos/[userId]/[generationId]_[index].mp4')
    console.log('└── thumbnails/')
    console.log('    ├── generated/[userId]/[generationId]_[index]_thumb.jpg')
    console.log('    ├── edited/[userId]/[generationId]_[index]_thumb.jpg')
    console.log('    ├── upscaled/[userId]/[generationId]_[index]_thumb.jpg')
    console.log('    └── videos/[userId]/[generationId]_[index]_thumb.jpg')
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message)
  }
}

// Safety check - only run with --execute flag
const EXECUTE = process.argv.includes('--execute')

if (EXECUTE) {
  console.log('⚠️  EXECUTANDO MIGRAÇÃO REAL')
  migrateS3Structure()
} else {
  console.log('🔍 MODO SEGURO - ADICIONE --execute PARA EXECUTAR')
  console.log('Este script irá:')
  console.log('1. Copiar todos os arquivos de generations/ para generated/')
  console.log('2. Verificar se as cópias foram bem-sucedidas')
  console.log('3. Remover os arquivos originais de generations/')
  console.log('4. Criar estrutura de pastas necessárias')
  console.log('')
  console.log('Usage: node migrate-s3-structure.js --execute')
}