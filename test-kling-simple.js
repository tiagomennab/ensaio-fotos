#!/usr/bin/env node

/**
 * Teste simples da API do Kling 2.1 Master via HTTP
 * Requesitos: servidor deve estar rodando em localhost:3000
 */

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  
  // Payload de teste para text-to-video
  videoRequest: {
    prompt: 'A beautiful sunset over the ocean with gentle waves, cinematic lighting, peaceful and serene atmosphere',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'standard',
    negativePrompt: 'blurry, low quality, distorted, watermark, text'
  }
}

async function testKlingAPI() {
  console.log('🎬 Teste HTTP da API do Kling 2.1 Master')
  console.log('=' .repeat(50))
  console.log('⚠️  IMPORTANTE: Certifique-se que o servidor está rodando em localhost:3000')
  console.log('⚠️  IMPORTANTE: Você precisa estar autenticado no browser primeiro')
  console.log('')
  
  try {
    // Teste 1: Health check
    console.log('🔍 TESTE 1: Health Check')
    const healthResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/health`)
    const health = await healthResponse.json()
    
    console.log('Status:', healthResponse.status)
    console.log('Health:', health)
    
    if (!healthResponse.ok) {
      console.log('❌ Servidor não está respondendo. Inicie com: npm run dev')
      return
    }
    console.log('✅ Servidor está online')
    
    // Teste 2: Verificar capabilities (sem auth)
    console.log('\n🔍 TESTE 2: Video Capabilities (sem auth)')
    const capResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/video/create`)
    const capResult = await capResponse.json()
    
    console.log('Status:', capResponse.status)
    console.log('Result:', JSON.stringify(capResult, null, 2))
    
    if (capResponse.status === 401) {
      console.log('✅ Endpoint protegido corretamente (401 Unauthorized)')
    }
    
    // Teste 3: Requisição de criação de vídeo (vai falhar sem auth)
    console.log('\n🎬 TESTE 3: Create Video (sem auth)')
    const videoResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/video/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CONFIG.videoRequest)
    })
    
    const videoResult = await videoResponse.json()
    
    console.log('Status:', videoResponse.status)
    console.log('Result:', JSON.stringify(videoResult, null, 2))
    
    if (videoResponse.status === 401) {
      console.log('✅ Endpoint de criação protegido corretamente (401 Unauthorized)')
    } else if (videoResponse.ok) {
      console.log('✅ Vídeo criado com sucesso!')
      console.log('🆔 Video ID:', videoResult.videoId)
      console.log('🔧 Job ID:', videoResult.jobId)
    } else {
      console.log('❌ Erro na criação:', videoResult.error)
    }
    
    console.log('\n📋 INSTRUÇÕES PARA TESTE COMPLETO:')
    console.log('1. Abra o browser em http://localhost:3000')
    console.log('2. Faça login na aplicação')
    console.log('3. Abra as ferramentas de desenvolvedor (F12)')
    console.log('4. Vá para a aba Console')
    console.log('5. Execute o seguinte código JavaScript:')
    
    console.log(`
// Copie e cole este código no console do browser:
const testKlingInBrowser = async () => {
  console.log('🎬 Testando Kling API no browser com autenticação...');
  
  try {
    // Teste capabilities
    const capRes = await fetch('/api/video/create');
    const capabilities = await capRes.json();
    console.log('Capabilities:', capabilities);
    
    // Teste criação de vídeo
    const videoRes = await fetch('/api/video/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(${JSON.stringify(TEST_CONFIG.videoRequest)})
    });
    
    const result = await videoRes.json();
    console.log('Video Result:', result);
    
    if (videoRes.ok) {
      console.log('✅ Vídeo criado!', result.videoId);
      
      // Monitorar status
      const monitorStatus = async (videoId) => {
        const statusRes = await fetch(\`/api/video/status/\${videoId}\`);
        const status = await statusRes.json();
        console.log('Status:', status);
        return status;
      };
      
      setTimeout(() => monitorStatus(result.videoId), 5000);
    }
  } catch (err) {
    console.error('Erro:', err);
  }
};

testKlingInBrowser();
`)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// Função para testar requisição direta ao Replicate
async function testDirectReplicate() {
  console.log('\n🚀 TESTE DIRETO: Replicate API')
  
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN
  if (!REPLICATE_TOKEN) {
    console.log('❌ REPLICATE_API_TOKEN não configurado no .env.local')
    console.log('💡 Configure: REPLICATE_API_TOKEN=r8_your_token_here')
    return
  }
  
  const payload = {
    input: {
      prompt: TEST_CONFIG.videoRequest.prompt,
      duration: TEST_CONFIG.videoRequest.duration,
      aspect_ratio: TEST_CONFIG.videoRequest.aspectRatio,
      negative_prompt: TEST_CONFIG.videoRequest.negativePrompt
    }
  }
  
  console.log('📤 Enviando para Replicate:', JSON.stringify(payload, null, 2))
  
  try {
    const response = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2.1-master/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Requisição ao Replicate enviada com sucesso!')
      console.log('🆔 Prediction ID:', result.id)
      console.log('📊 Status:', result.status)
      
      if (result.status === 'succeeded' && result.output) {
        console.log('🎥 Vídeo URL:', result.output)
      }
    } else {
      console.log('❌ Erro no Replicate:', result.detail || result.error)
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição ao Replicate:', error.message)
  }
}

// Executar testes
async function runTests() {
  console.log('🎯 Iniciando testes do Kling 2.1 Master API')
  console.log('Data/Hora:', new Date().toISOString())
  console.log('')
  
  await testKlingAPI()
  await testDirectReplicate()
  
  console.log('\n🏁 Testes concluídos!')
}

if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testKlingAPI, testDirectReplicate, TEST_CONFIG }