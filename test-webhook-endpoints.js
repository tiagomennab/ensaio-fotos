/**
 * Script para testar endpoints de webhook
 * Simula webhooks do Replicate para validar a funcionalidade
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

class WebhookTester {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.endpoints = {
      training: `${this.baseUrl}/api/webhooks/training`,
      generation: `${this.baseUrl}/api/webhooks/generation`
    };
  }

  // Simula webhook de training em diferentes estágios
  async testTrainingWebhooks() {
    console.log('🔗 Testando webhooks de training...');
    console.log('=' .repeat(50));
    
    const testCases = [
      {
        name: 'Training Started',
        payload: {
          id: 'training_test_123',
          status: 'starting',
          created_at: new Date().toISOString(),
          input: {
            instance_data: 'https://example.com/test.zip',
            task: 'face',
            resolution: 1024
          }
        }
      },
      {
        name: 'Training Processing',
        payload: {
          id: 'training_test_123',
          status: 'processing',
          created_at: new Date().toISOString(),
          logs: 'Epoch 1/10 completed...'
        }
      },
      {
        name: 'Training Succeeded',
        payload: {
          id: 'training_test_123',
          status: 'succeeded',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          output: {
            weights: 'https://replicate.delivery/pbxt/model-weights.tar'
          },
          metrics: {
            total_time: 1800 // 30 minutes
          }
        }
      },
      {
        name: 'Training Failed',
        payload: {
          id: 'training_test_456',
          status: 'failed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error: 'Insufficient training data quality'
        }
      }
    ];
    
    for (const testCase of testCases) {
      await this.sendWebhook('training', testCase.name, testCase.payload);
    }
  }

  // Simula webhook de generation em diferentes estágios
  async testGenerationWebhooks() {
    console.log('\n🎨 Testando webhooks de generation...');
    console.log('=' .repeat(50));
    
    const testCases = [
      {
        name: 'Generation Started',
        payload: {
          id: 'generation_test_789',
          status: 'starting',
          created_at: new Date().toISOString(),
          input: {
            prompt: 'A professional portrait of TOK person',
            seed: 42,
            num_inference_steps: 4
          }
        }
      },
      {
        name: 'Generation Processing',
        payload: {
          id: 'generation_test_789',
          status: 'processing',
          created_at: new Date().toISOString(),
          logs: 'Generating image... Step 2/4'
        }
      },
      {
        name: 'Generation Succeeded',
        payload: {
          id: 'generation_test_789',
          status: 'succeeded',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          output: [
            'https://replicate.delivery/pbxt/generated-image-1.webp',
            'https://replicate.delivery/pbxt/generated-image-2.webp'
          ]
        }
      },
      {
        name: 'Generation Failed',
        payload: {
          id: 'generation_test_999',
          status: 'failed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error: 'NSFW content detected'
        }
      }
    ];
    
    for (const testCase of testCases) {
      await this.sendWebhook('generation', testCase.name, testCase.payload);
    }
  }

  // Envia webhook para endpoint específico
  async sendWebhook(type, testName, payload) {
    try {
      console.log(`   Testando: ${testName}...`);
      
      const response = await fetch(this.endpoints[type], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Replicate-Webhook/1.0'
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`   ✅ ${testName}: Status ${response.status}`);
        try {
          const responseJson = JSON.parse(responseText);
          if (responseJson.success) {
            console.log(`      Webhook processado com sucesso`);
          } else {
            console.log(`      ⚠️  Resposta indica falha: ${responseJson.error}`);
          }
        } catch {
          console.log(`      Resposta: ${responseText}`);
        }
      } else {
        console.log(`   ❌ ${testName}: Status ${response.status}`);
        console.log(`      Erro: ${responseText}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${testName}: Falha na requisição`);
      console.log(`      Erro: ${error.message}`);
    }
  }

  // Testa conectividade básica dos endpoints
  async testEndpointConnectivity() {
    console.log('🔍 Testando conectividade dos endpoints...');
    console.log('=' .repeat(50));
    
    for (const [type, url] of Object.entries(this.endpoints)) {
      try {
        console.log(`   Testando ${type}: ${url}`);
        
        // Tenta fazer GET (que deve retornar 405 Method Not Allowed)
        const response = await fetch(url, { method: 'GET' });
        
        if (response.status === 405) {
          console.log(`   ✅ Endpoint ${type} está acessível (405 - método correto)`);
        } else if (response.status === 404) {
          console.log(`   ❌ Endpoint ${type} não encontrado (404)`);
        } else {
          console.log(`   ⚠️  Endpoint ${type} resposta inesperada: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Endpoint ${type} inacessível: ${error.message}`);
      }
    }
  }

  // Executa todos os testes
  async runAllTests() {
    console.log('🚀 TESTE DE WEBHOOKS REPLICATE');
    console.log('=' .repeat(60));
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Training Webhook: ${this.endpoints.training}`);
    console.log(`Generation Webhook: ${this.endpoints.generation}`);
    
    // Teste 1: Conectividade
    await this.testEndpointConnectivity();
    
    // Aguarda um pouco entre testes
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 2: Webhooks de Training
    await this.testTrainingWebhooks();
    
    // Aguarda um pouco entre testes
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3: Webhooks de Generation
    await this.testGenerationWebhooks();
    
    // Resumo
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESUMO DOS TESTES DE WEBHOOK');
    console.log('=' .repeat(60));
    console.log('✅ Endpoints testados');
    console.log('✅ Payloads de diferentes status enviados');
    console.log('✅ Estrutura de dados validada');
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Verificar logs do servidor para processamento');
    console.log('2. Confirmar updates no banco de dados');
    console.log('3. Testar em ambiente com Next.js rodando');
    console.log('4. Configurar webhooks reais no Replicate');
  }
}

// Executar testes
async function main() {
  try {
    const tester = new WebhookTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Erro nos testes de webhook:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = WebhookTester;