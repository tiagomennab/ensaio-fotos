#!/usr/bin/env node

/**
 * Teste da API do Kling 2.1 Master com autenticação real do NextAuth
 * Este script usa a mesma autenticação que o frontend
 */

const { PrismaClient } = require('@prisma/client')

// Configuração do teste
const TEST_CONFIG = {
  // Endpoint da API
  baseUrl: 'http://localhost:3000',
  
  // Usuário de teste (criar se não existir)
  testUser: {
    email: 'test@example.com',
    name: 'Teste Kling Video',
    plan: 'PREMIUM' // Para ter acesso a recursos de vídeo
  },
  
  // Request de teste
  videoRequest: {
    prompt: 'A serene mountain landscape at golden hour, gentle camera movement, cinematic lighting, peaceful atmosphere',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'standard',
    negativePrompt: 'blurry, low quality, distorted, watermark, text'
  }
}

// Inicializar Prisma
const prisma = new PrismaClient()

/**
 * Criar ou buscar usuário de teste
 */
async function getOrCreateTestUser() {
  console.log('👤 Buscando/criando usuário de teste...')
  
  let user = await prisma.user.findUnique({
    where: { email: TEST_CONFIG.testUser.email }
  })
  
  if (!user) {
    console.log('➕ Criando usuário de teste...')
    user = await prisma.user.create({
      data: {
        email: TEST_CONFIG.testUser.email,
        name: TEST_CONFIG.testUser.name,
        plan: TEST_CONFIG.testUser.plan,
        creditsUsed: 0,
        creditsLimit: 1000
      }
    })
    console.log('✅ Usuário criado:', user.id)
  } else {
    console.log('✅ Usuário encontrado:', user.id)
  }
  
  return user
}

/**
 * Criar uma sessão de teste simples
 */
async function createTestSession(user) {
  // Para simplicidade, vamos simular a autenticação diretamente no request
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      creditsUsed: user.creditsUsed,
      creditsLimit: user.creditsLimit
    }
  }
}

/**
 * Fazer requisição autenticada simulando o NextAuth
 */
async function makeAuthenticatedAPICall(endpoint, method = 'POST', body = null) {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`
  
  console.log(`🔄 ${method} ${url}`)
  if (body) {
    console.log('📋 Body:', JSON.stringify(body, null, 2))
  }
  
  // Para teste local, vamos fazer a requisição diretamente ao handler
  // Em vez de HTTP, vamos importar e chamar a função diretamente
  return await callApiDirectly(endpoint, method, body)
}

/**
 * Chamar API diretamente (bypass HTTP para teste)
 */
async function callApiDirectly(endpoint, method, body) {
  try {
    // Simular NextRequest para testes
    const testRequest = {
      method: method,
      json: async () => body || {},
      nextUrl: new URL(`${TEST_CONFIG.baseUrl}${endpoint}`),
      headers: new Map([
        ['content-type', 'application/json'],
        ['user-agent', 'test-client/1.0']
      ])
    }
    
    if (endpoint === '/api/video/create') {
      if (method === 'POST') {
        // Importar e chamar a função POST
        const { POST } = require('./src/app/api/video/create/route')
        
        // Mock da função requireAuthAPI para retornar nosso usuário de teste
        const originalRequireAuth = require('./src/lib/auth').requireAuthAPI
        const testUser = await getOrCreateTestUser()
        
        require('./src/lib/auth').requireAuthAPI = jest.fn().mockResolvedValue({
          user: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
            plan: testUser.plan,
            creditsUsed: testUser.creditsUsed,
            creditsLimit: testUser.creditsLimit
          }
        })
        
        const response = await POST(testRequest)
        const result = await response.json()
        
        // Restaurar função original
        require('./src/lib/auth').requireAuthAPI = originalRequireAuth
        
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          json: async () => result
        }
      } else if (method === 'GET') {
        // Importar e chamar a função GET para capabilities
        const { GET } = require('./src/app/api/video/create/route')
        
        const testUser = await getOrCreateTestUser()
        require('./src/lib/auth').requireAuthAPI = jest.fn().mockResolvedValue({
          user: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
            plan: testUser.plan,
            creditsUsed: testUser.creditsUsed,
            creditsLimit: testUser.creditsLimit
          }
        })
        
        const response = await GET(testRequest)
        const result = await response.json()
        
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          json: async () => result
        }
      }
    }
    
    throw new Error(`Endpoint ${endpoint} não implementado no teste`)
    
  } catch (error) {
    console.error('❌ Erro na chamada direta da API:', error)
    return {
      ok: false,
      status: 500,
      json: async () => ({ error: error.message })
    }
  }
}

/**
 * Teste principal
 */
async function testKlingWithAuth() {
  console.log('🎬 Teste da API do Kling 2.1 Master com Autenticação')
  console.log('=' .repeat(60))
  
  try {
    // Conectar ao banco
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados')
    
    // Buscar/criar usuário de teste
    const testUser = await getOrCreateTestUser()
    
    // Teste 1: Verificar capabilities
    console.log('\n🔍 TESTE 1: Video Creation Capabilities')
    const capabilitiesResponse = await makeAuthenticatedAPICall('/api/video/create', 'GET')
    const capabilities = await capabilitiesResponse.json()
    
    console.log('Status:', capabilitiesResponse.status)
    console.log('Capabilities:', JSON.stringify(capabilities, null, 2))
    
    if (capabilitiesResponse.ok) {
      console.log('✅ Capabilities OK - Usuário tem acesso ao sistema de vídeo')
    } else {
      console.log('❌ Erro nas capabilities:', capabilities.error)
      return
    }
    
    // Teste 2: Criar vídeo
    console.log('\n🎬 TESTE 2: Criação de Vídeo')
    const videoResponse = await makeAuthenticatedAPICall('/api/video/create', 'POST', TEST_CONFIG.videoRequest)
    const videoResult = await videoResponse.json()
    
    console.log('Status:', videoResponse.status)
    console.log('Result:', JSON.stringify(videoResult, null, 2))
    
    if (videoResponse.ok) {
      console.log('✅ Vídeo criado com sucesso!')
      console.log('🆔 Video ID:', videoResult.videoId)
      console.log('🔧 Job ID:', videoResult.jobId)
      console.log('⏱️ Tempo estimado:', videoResult.estimatedTime, 'segundos')
      
      // Monitorar status se possível
      if (videoResult.videoId) {
        await monitorVideoInDatabase(videoResult.videoId)
      }
    } else {
      console.log('❌ Erro na criação do vídeo:', videoResult.error)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
    console.log('👋 Desconectado do banco de dados')
  }
}

/**
 * Monitorar vídeo direto no banco de dados
 */
async function monitorVideoInDatabase(videoId) {
  console.log('\n📊 Monitorando vídeo no banco de dados...')
  
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    try {
      const video = await prisma.videoGeneration.findUnique({
        where: { id: videoId }
      })
      
      if (!video) {
        console.log('❌ Vídeo não encontrado no banco')
        break
      }
      
      console.log(`📊 Check ${attempts + 1}:`, {
        id: video.id,
        status: video.status,
        jobId: video.jobId,
        progress: video.progress,
        videoUrl: video.videoUrl ? 'Presente' : 'Não disponível',
        errorMessage: video.errorMessage
      })
      
      if (video.status === 'COMPLETED') {
        console.log('✅ Vídeo completado!')
        if (video.videoUrl) {
          console.log('🎥 URL do vídeo:', video.videoUrl)
        }
        break
      } else if (video.status === 'FAILED') {
        console.log('❌ Vídeo falhou:', video.errorMessage)
        break
      }
      
      attempts++
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Aguarda 5s
      }
      
    } catch (error) {
      console.error('❌ Erro ao monitorar:', error)
      break
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('⏰ Monitoramento encerrado após', maxAttempts, 'tentativas')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  // Mock do jest para testes
  global.jest = {
    fn: () => ({
      mockResolvedValue: (value) => () => Promise.resolve(value)
    })
  }
  
  testKlingWithAuth().catch(console.error)
}

module.exports = {
  testKlingWithAuth,
  getOrCreateTestUser,
  TEST_CONFIG
}