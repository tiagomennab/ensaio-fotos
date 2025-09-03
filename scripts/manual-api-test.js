#!/usr/bin/env node

/**
 * Manual API Testing Script
 * Quick test of specific endpoints
 */

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(endpoint, method = 'GET', body = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`\n🔗 Testing: ${method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Content-Type: ${contentType}`);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log(`📝 Response:`, JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`📝 Response (first 200 chars):`, text.substring(0, 200) + '...');
    }
    
    return { status: response.status, ok: response.ok, data, contentType };
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return { error: error.message };
  }
}

async function main() {
  console.log('🚀 Manual API Testing\n');
  
  // Test health endpoint
  await testEndpoint('/api/health');
  
  // Test AI training endpoint (should require auth)
  await testEndpoint('/api/ai/train', 'POST', {
    modelId: 'test-model',
    triggerWord: 'test',
    classWord: 'person'
  });
  
  // Test webhook endpoints with proper Replicate-style payload
  await testEndpoint('/api/webhooks/training', 'POST', {
    id: 'test-training-id',
    status: 'succeeded',
    output: {
      weights: 'https://example.com/model.safetensors'
    }
  });
  
  await testEndpoint('/api/webhooks/generation', 'POST', {
    id: 'test-generation-id', 
    status: 'succeeded',
    output: ['https://example.com/image1.jpg']
  });
  
  // Test Replicate API directly
  console.log('\n🌐 Testing Replicate API directly...');
  
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || 'your-replicate-api-token-here';
  
  try {
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`✅ Replicate API Account: ${data.username || 'N/A'} (${data.type || 'N/A'})`);
  } catch (error) {
    console.log(`❌ Replicate API Error: ${error.message}`);
  }
}

main().catch(console.error);