require('dotenv').config({ path: '.env.local' })
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET

async function checkS3Structure() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DO S3')
    console.log('=============================')
    console.log('Bucket:', BUCKET_NAME)
    
    // List all objects in the bucket
    const params = {
      Bucket: BUCKET_NAME,
      Delimiter: '/'
    }
    
    const data = await s3.listObjectsV2(params).promise()
    
    console.log('\n📂 PASTAS ENCONTRADAS NO S3:')
    if (data.CommonPrefixes && data.CommonPrefixes.length > 0) {
      data.CommonPrefixes.forEach(prefix => {
        console.log(`- ${prefix.Prefix}`)
      })
    }
    
    console.log('\n📄 ARQUIVOS NA RAIZ:')
    if (data.Contents && data.Contents.length > 0) {
      data.Contents.forEach(obj => {
        if (!obj.Key.includes('/')) {
          console.log(`- ${obj.Key} (${obj.Size} bytes)`)
        }
      })
    }
    
    // Check specific folders
    console.log('\n🔍 VERIFICANDO PASTAS ESPECÍFICAS:')
    
    const foldersToCheck = ['generated/', 'generations/', 'edited/', 'upscaled/', 'videos/', 'thumbnails/']
    
    for (const folder of foldersToCheck) {
      const folderParams = {
        Bucket: BUCKET_NAME,
        Prefix: folder,
        MaxKeys: 1
      }
      
      try {
        const folderData = await s3.listObjectsV2(folderParams).promise()
        const exists = folderData.Contents && folderData.Contents.length > 0
        const status = exists ? '✅ EXISTE' : '❌ VAZIA/NÃO EXISTE'
        
        if (exists) {
          console.log(`${folder} ${status} (${folderData.Contents.length} objetos)`)
        } else {
          console.log(`${folder} ${status}`)
        }
      } catch (error) {
        console.log(`${folder} ❌ ERRO: ${error.message}`)
      }
    }
    
    // Check for images in generated vs generations
    console.log('\n🖼️ VERIFICANDO CONTEÚDO:')
    
    const checkFolderContent = async (folder) => {
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: folder,
        MaxKeys: 5
      }
      
      const data = await s3.listObjectsV2(params).promise()
      if (data.Contents && data.Contents.length > 0) {
        console.log(`\n${folder}:`)
        data.Contents.forEach(obj => {
          console.log(`  - ${obj.Key} (${obj.Size} bytes, ${obj.LastModified})`)
        })
      }
    }
    
    await checkFolderContent('generated/')
    await checkFolderContent('generations/')
    
    console.log('\n❗ PROBLEMA IDENTIFICADO:')
    console.log('- O código usa "generated/" mas existe "generations/" no S3')
    console.log('- Precisamos padronizar para uma única estrutura')
    
    console.log('\n💡 RECOMENDAÇÃO:')
    console.log('- Manter "generated/" (como no código atual)')
    console.log('- Migrar conteúdo de "generations/" para "generated/" se houver')
    console.log('- Remover pasta "generations/" vazia')
    
  } catch (error) {
    console.error('❌ Erro ao verificar S3:', error.message)
  }
}

checkS3Structure()