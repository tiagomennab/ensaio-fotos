#!/usr/bin/env node

/**
 * Teste da API do Kling 2.1 Master para geração de vídeo
 * Faz uma requisição de teste com autenticação adequada
 */

// Configuração da requisição de teste
const TEST_CONFIG = {
  // API endpoint do projeto
  apiUrl: 'http://localhost:3000/api/video/create',
  
  // Dados de teste para text-to-video
  textToVideoRequest: {
    prompt: 'A beautiful sunset over the ocean with gentle waves, cinematic lighting, peaceful and serene atmosphere',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'standard',
    negativePrompt: 'blurry, low quality, distorted, watermark, text'
  },
  
  // Dados de teste para image-to-video (exemplo)
  imageToVideoRequest: {
    sourceImageUrl: 'https://example.com/test-image.jpg',
    prompt: 'gentle breathing motion, subtle movement, natural portrait expression',
    duration: 5,
    aspectRatio: '16:9', 
    quality: 'pro',
    negativePrompt: 'blurry, low quality, distorted'
  }
}

// Função para fazer requisição com autenticação
async function makeAuthenticatedRequest(endpoint, data) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Para teste local, você precisa adicionar um token de sessão válido
      // ou usar a autenticação via cookies/session
      'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN_HERE' // Substitua pelo token real
    },
    body: JSON.stringify(data)
  })
  
  return response
}

// Função principal de teste
async function testKlingVideoGeneration() {
  console.log('🎬 Testando API do Kling 2.1 Master Video Generation')
  console.log('=' .repeat(60))
  
  try {
    // Teste 1: Text-to-Video
    console.log('\n📝 TESTE 1: Text-to-Video Generation')
    console.log('Endpoint:', TEST_CONFIG.apiUrl)
    console.log('Payload:', JSON.stringify(TEST_CONFIG.textToVideoRequest, null, 2))
    
    const textToVideoResponse = await makeAuthenticatedRequest(
      TEST_CONFIG.apiUrl, 
      TEST_CONFIG.textToVideoRequest
    )
    
    console.log('Status:', textToVideoResponse.status)
    console.log('Headers:', Object.fromEntries(textToVideoResponse.headers.entries()))
    
    const textToVideoResult = await textToVideoResponse.json()
    console.log('Response:', JSON.stringify(textToVideoResult, null, 2))
    
    if (textToVideoResponse.ok) {
      console.log('✅ Text-to-Video request successful!')
      
      // Se o vídeo foi iniciado, monitore o status
      if (textToVideoResult.videoId) {
        console.log('📊 Monitorando status do vídeo...')
        await monitorVideoStatus(textToVideoResult.videoId)
      }
    } else {
      console.log('❌ Text-to-Video request failed:', textToVideoResult.error)
    }
    
    console.log('\n' + '-'.repeat(60))
    
    // Teste 2: Verificar capabilities
    console.log('\n🔍 TESTE 2: Video Creation Capabilities')
    
    const capabilitiesResponse = await fetch(TEST_CONFIG.apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN_HERE' // Substitua pelo token real
      }
    })
    
    console.log('Status:', capabilitiesResponse.status)
    const capabilities = await capabilitiesResponse.json()
    console.log('Capabilities:', JSON.stringify(capabilities, null, 2))
    
    if (capabilitiesResponse.ok) {
      console.log('✅ Capabilities request successful!')
    } else {
      console.log('❌ Capabilities request failed')
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Função para monitorar o status do vídeo
async function monitorVideoStatus(videoId) {
  const statusEndpoint = `http://localhost:3000/api/video/status/${videoId}`
  let attempts = 0
  const maxAttempts = 20 // Máximo 20 tentativas (aprox. 3 minutos)
  
  while (attempts < maxAttempts) {
    try {
      await new Promise(resolve => setTimeout(resolve, 10000)) // Aguarda 10s
      
      const statusResponse = await fetch(statusEndpoint, {
        headers: {
          'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN_HERE' // Substitua pelo token real
        }
      })
      
      const status = await statusResponse.json()
      console.log(`📊 Status check ${attempts + 1}:`, status)
      
      if (status.status === 'COMPLETED') {
        console.log('✅ Vídeo completado com sucesso!')
        console.log('🎥 URL do vídeo:', status.videoUrl)
        break
      } else if (status.status === 'FAILED') {
        console.log('❌ Vídeo falhou:', status.errorMessage)
        break
      } else if (status.status === 'CANCELLED') {
        console.log('⏹️ Vídeo cancelado')
        break
      }
      
      attempts++
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error)
      break
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('⏰ Timeout: Vídeo ainda processando após 3 minutos')
  }
}

// Função para testar requisição direta ao Replicate (bypass da API local)
async function testDirectReplicateRequest() {
  console.log('\n🚀 TESTE 3: Requisição Direta ao Replicate')
  
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN
  if (!REPLICATE_TOKEN) {
    console.log('❌ REPLICATE_API_TOKEN não configurado')
    return
  }
  
  const replicatePayload = {
    input: {
      prompt: TEST_CONFIG.textToVideoRequest.prompt,
      duration: TEST_CONFIG.textToVideoRequest.duration,
      aspect_ratio: TEST_CONFIG.textToVideoRequest.aspectRatio,
      negative_prompt: TEST_CONFIG.textToVideoRequest.negativePrompt
    }
  }
  
  try {
    console.log('Payload para Replicate:', JSON.stringify(replicatePayload, null, 2))
    
    const response = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2.1-master/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait' // Para resposta síncrona
      },
      body: JSON.stringify(replicatePayload)
    })
    
    console.log('Status Replicate:', response.status)
    const result = await response.json()
    console.log('Response Replicate:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Requisição direta ao Replicate successful!')
    } else {
      console.log('❌ Requisição direta ao Replicate failed')
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição direta:', error)
  }
}

// Executar testes
async function runAllTests() {
  console.log('🎯 Iniciando testes da API do Kling 2.1 Master')
  console.log('Data/Hora:', new Date().toISOString())
  
  // Teste através da API local
  await testKlingVideoGeneration()
  
  // Teste direto no Replicate
  await testDirectReplicateRequest()
  
  console.log('\n🏁 Testes concluídos!')
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testKlingVideoGeneration,
  testDirectReplicateRequest,
  monitorVideoStatus,
  TEST_CONFIG
}