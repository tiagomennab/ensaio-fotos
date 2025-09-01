#!/usr/bin/env node

/**
 * Script para testar webhooks localmente
 * 
 * Uso:
 * node test-webhooks.js [tipo] [porto]
 * 
 * Tipos disponíveis:
 * - replicate-training: Testa webhook de treinamento
 * - replicate-generation: Testa webhook de geração  
 * - asaas-payment: Testa webhook de pagamento
 * 
 * Exemplos:
 * node test-webhooks.js replicate-training 3002
 * node test-webhooks.js asaas-payment 3002
 */

const https = require('https');
const crypto = require('crypto');

const PORT = process.argv[3] || '3002';
const BASE_URL = `http://localhost:${PORT}`;

// Payloads de teste
const testPayloads = {
  'replicate-training': {
    url: `${BASE_URL}/api/webhooks/training`,
    payload: {
      id: 'test-training-job-' + Date.now(),
      version: 'test-version-id',
      status: 'succeeded',
      created_at: new Date().toISOString(),
      started_at: new Date(Date.now() - 300000).toISOString(),
      completed_at: new Date().toISOString(),
      output: {
        weights: 'https://replicate.delivery/test-model-weights.tar'
      },
      metrics: {
        total_time: 1800 // 30 minutos
      },
      logs: ['Training started', 'Epoch 1/10', 'Training completed successfully']
    }
  },

  'replicate-generation': {
    url: `${BASE_URL}/api/webhooks/generation`,
    payload: {
      id: 'test-generation-job-' + Date.now(),
      version: 'test-version-id',
      status: 'succeeded',
      created_at: new Date().toISOString(),
      started_at: new Date(Date.now() - 60000).toISOString(),
      completed_at: new Date().toISOString(),
      output: [
        'https://replicate.delivery/test-image-1.jpg',
        'https://replicate.delivery/test-image-2.jpg'
      ],
      metrics: {
        total_time: 45 // 45 segundos
      }
    }
  },

  'asaas-payment': {
    url: `${BASE_URL}/api/payments/asaas/webhook`,
    payload: {
      event: 'PAYMENT_CONFIRMED',
      payment: {
        id: 'pay_test_' + Date.now(),
        customer: 'cus_test_customer',
        value: 29.90,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Assinatura Premium - Ensaio Fotos',
        status: 'CONFIRMED'
      }
    }
  }
};

function generateWebhookSignature(payload, secret) {
  return 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

async function sendTestWebhook(type) {
  const config = testPayloads[type];
  
  if (!config) {
    console.error(`❌ Tipo de webhook inválido: ${type}`);
    console.log('Tipos disponíveis:', Object.keys(testPayloads).join(', '));
    process.exit(1);
  }

  console.log(`🚀 Testando webhook: ${type}`);
  console.log(`📡 URL: ${config.url}`);
  console.log(`📦 Payload:`, JSON.stringify(config.payload, null, 2));

  try {
    // Preparar headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'WebhookTester/1.0'
    };

    // Adicionar headers específicos baseado no tipo
    if (type.startsWith('replicate')) {
      // Para Replicate, adicionar assinatura se houver secret
      const secret = process.env.REPLICATE_WEBHOOK_SECRET;
      if (secret) {
        headers['webhook-signature'] = generateWebhookSignature(config.payload, secret);
        console.log(`🔒 Adicionada assinatura webhook (secret configurado)`);
      } else {
        console.log(`⚠️ REPLICATE_WEBHOOK_SECRET não configurado - enviando sem assinatura`);
      }
    } else if (type.startsWith('asaas')) {
      // Para Asaas, adicionar token se houver
      const token = process.env.ASAAS_WEBHOOK_TOKEN;
      if (token) {
        headers['asaas-access-token'] = token;
        console.log(`🔒 Adicionado token Asaas (token configurado)`);
      } else {
        console.log(`⚠️ ASAAS_WEBHOOK_TOKEN não configurado - enviando sem token`);
      }
    }

    // Enviar requisição
    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(config.payload)
    });

    const responseText = await response.text();

    console.log(`\n📊 RESULTADO:`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, responseText);

    if (response.ok) {
      console.log(`✅ Webhook enviado com sucesso!`);
    } else {
      console.log(`❌ Webhook falhou!`);
    }

  } catch (error) {
    console.error(`❌ Erro ao enviar webhook:`, error.message);
  }
}

// Verificar argumentos
const webhookType = process.argv[2];

if (!webhookType) {
  console.log(`
🔧 TESTE DE WEBHOOKS - Ensaio Fotos

Uso: node test-webhooks.js [tipo] [porta]

Tipos disponíveis:
  replicate-training   - Webhook de treinamento do Replicate
  replicate-generation - Webhook de geração do Replicate  
  asaas-payment       - Webhook de pagamento do Asaas

Exemplos:
  node test-webhooks.js replicate-training 3002
  node test-webhooks.js asaas-payment 3002

Nota: Configure as variáveis de ambiente para segurança:
  - REPLICATE_WEBHOOK_SECRET (para webhooks Replicate)
  - ASAAS_WEBHOOK_TOKEN (para webhooks Asaas)
`);
  process.exit(0);
}

// Executar teste
sendTestWebhook(webhookType);