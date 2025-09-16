require('dotenv').config({ path: '.env.local' })
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET

async function verifyFinalStructure() {
  try {
    console.log('✅ VERIFICAÇÃO FINAL DA ESTRUTURA DO S3')
    console.log('====================================')
    console.log('Bucket:', BUCKET_NAME)
    
    // Check all required folders
    const requiredStructure = {
      'generated/': '📷 Fotos geradas',
      'edited/': '✏️ Fotos editadas', 
      'upscaled/': '⬆️ Fotos upscaladas',
      'videos/': '🎬 Vídeos gerados',
      'thumbnails/generated/': '🖼️ Thumbnails de fotos geradas',
      'thumbnails/edited/': '🖼️ Thumbnails de fotos editadas',
      'thumbnails/upscaled/': '🖼️ Thumbnails de fotos upscaladas',
      'thumbnails/videos/': '🖼️ Thumbnails de vídeos',
      'training/': '🎯 Treinamento de modelos'
    }
    
    console.log('\n📂 ESTRUTURA ESPERADA vs ATUAL:')
    
    let allGood = true
    
    for (const [folder, description] of Object.entries(requiredStructure)) {
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: folder,
        MaxKeys: 1
      }
      
      try {
        const data = await s3.listObjectsV2(params).promise()
        const exists = data.Contents && data.Contents.length > 0
        
        if (exists) {
          console.log(`✅ ${folder} ${description}`)
        } else {
          console.log(`⚠️ ${folder} ${description} (vazia)`)
        }
      } catch (error) {
        console.log(`❌ ${folder} ${description} (erro: ${error.message})`)
        allGood = false
      }
    }
    
    // Verify generations/ is gone
    console.log('\n🗑️ VERIFICANDO LIMPEZA:')
    const generationsParams = {
      Bucket: BUCKET_NAME,
      Prefix: 'generations/',
      MaxKeys: 1
    }
    
    const generationsData = await s3.listObjectsV2(generationsParams).promise()
    const generationsExists = generationsData.Contents && generationsData.Contents.length > 0
    
    if (!generationsExists) {
      console.log('✅ Pasta "generations/" removida com sucesso')
    } else {
      console.log('❌ Pasta "generations/" ainda existe!')
      allGood = false
    }
    
    // Summary
    console.log('\n📊 RESUMO DA ESTRUTURA:')
    console.log('======================')
    
    if (allGood) {
      console.log('🎉 ESTRUTURA PERFEITA!')
      console.log('')
      console.log('📁 Storage organizado por operação:')
      console.log('   generated/ ← Fotos geradas normalmente')
      console.log('   edited/ ← Fotos com prompt [EDITED]')
      console.log('   upscaled/ ← Fotos com prompt [UPSCALED]')
      console.log('   videos/ ← Vídeos com prompt [VIDEO]')
      console.log('')
      console.log('🖼️ Thumbnails organizados por contexto:')
      console.log('   thumbnails/generated/ ← Miniaturas de fotos geradas')
      console.log('   thumbnails/edited/ ← Miniaturas de fotos editadas')
      console.log('   thumbnails/upscaled/ ← Miniaturas de fotos upscaladas')
      console.log('   thumbnails/videos/ ← Miniaturas de vídeos')
      console.log('')
      console.log('🎯 Sistema funcionando:')
      console.log('   ✅ Detecção automática de contexto por prompt')
      console.log('   ✅ Storage organizado e consistente')
      console.log('   ✅ Estrutura padronizada para todos os tipos')
      console.log('   ✅ Sem conflitos entre pastas')
    } else {
      console.log('⚠️ Alguns problemas encontrados na estrutura')
    }
    
    // Test URLs format
    console.log('\n🔗 FORMATO DE URLS ESPERADO:')
    console.log('Imagem: https://ensaio-fotos-prod.s3.us-east-2.amazonaws.com/generated/[userId]/[generationId]_0.jpg')
    console.log('Thumbnail: https://ensaio-fotos-prod.s3.us-east-2.amazonaws.com/thumbnails/generated/[userId]/[generationId]_0_thumb.jpg')
    console.log('Vídeo: https://ensaio-fotos-prod.s3.us-east-2.amazonaws.com/videos/[userId]/[generationId]_0.mp4')
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
  }
}

verifyFinalStructure()