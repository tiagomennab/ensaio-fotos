const Replicate = require('replicate');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  apiToken: process.env.REPLICATE_API_TOKEN || 'your-replicate-api-token-here',
  webhookUrl: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/webhooks/training',
  models: {
    flux: {
      training: 'ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2',
      generation: 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
      dev: 'black-forest-labs/flux-dev:6e4a938f85952bdabcc15aa329178c4d681c52bf25a0342403287dc26944661d'
    },
    sdxl: {
      generation: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc'
    }
  }
};

async function testReplicateConnection() {
  console.log('🔗 Testing Replicate API connection...');
  
  if (!TEST_CONFIG.apiToken) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment variables');
    return false;
  }

  try {
    const replicate = new Replicate({
      auth: TEST_CONFIG.apiToken
    });

    // Test basic connection by listing account info
    const account = await replicate.accounts.current();
    console.log('✅ Connected to Replicate successfully');
    console.log(`📊 Account: ${account.username}, Type: ${account.type}`);
    return true;
  } catch (error) {
    console.error('❌ Replicate connection failed:', error.message);
    return false;
  }
}

async function testModelValidation() {
  console.log('\n🔍 Testing model validation...');
  
  const replicate = new Replicate({
    auth: TEST_CONFIG.apiToken
  });

  const modelsToTest = [
    { name: 'FLUX Schnell', version: TEST_CONFIG.models.flux.generation },
    { name: 'FLUX Dev', version: TEST_CONFIG.models.flux.dev },
    { name: 'FLUX Training', version: TEST_CONFIG.models.flux.training },
    { name: 'SDXL', version: TEST_CONFIG.models.sdxl.generation }
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`  🔎 Validating ${model.name}...`);
      
      // Validate model exists by checking version info
      const modelParts = model.version.split(':');
      if (modelParts.length === 2) {
        const [owner_model, version_id] = modelParts;
        
        const response = await fetch(`https://api.replicate.com/v1/models/${owner_model}/versions/${version_id}`, {
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.apiToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const versionInfo = await response.json();
          console.log(`  ✅ ${model.name}: Valid (Schema: ${versionInfo.openapi_schema ? 'Available' : 'N/A'})`);
        } else {
          console.log(`  ❌ ${model.name}: Invalid (Status: ${response.status})`);
        }
      } else {
        console.log(`  ❌ ${model.name}: Invalid version format`);
      }
    } catch (error) {
      console.log(`  ❌ ${model.name}: Validation failed - ${error.message}`);
    }
  }
}

async function testImageGeneration() {
  console.log('\n🎨 Testing image generation...');
  
  const replicate = new Replicate({
    auth: TEST_CONFIG.apiToken
  });

  try {
    console.log('  📝 Creating FLUX Schnell prediction...');
    
    const prediction = await replicate.predictions.create({
      version: TEST_CONFIG.models.flux.generation,
      input: {
        prompt: 'a beautiful sunset over mountains, highly detailed, 8k',
        aspect_ratio: '1:1',
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 80
      }
    });

    console.log(`  ✅ Prediction created: ${prediction.id}`);
    console.log(`  📊 Status: ${prediction.status}`);
    console.log(`  🕐 Created: ${prediction.created_at}`);
    
    // Wait a bit and check status
    console.log('  ⏳ Waiting 10 seconds before status check...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const updatedPrediction = await replicate.predictions.get(prediction.id);
    console.log(`  📊 Updated status: ${updatedPrediction.status}`);
    
    if (updatedPrediction.status === 'succeeded' && updatedPrediction.output) {
      console.log(`  🖼️ Output URLs: ${JSON.stringify(updatedPrediction.output)}`);
    } else if (updatedPrediction.status === 'failed') {
      console.log(`  ❌ Generation failed: ${updatedPrediction.error}`);
    } else {
      console.log(`  ⏳ Generation still processing...`);
    }
    
    // Cancel to avoid charges if still running
    if (['starting', 'processing'].includes(updatedPrediction.status)) {
      await replicate.predictions.cancel(prediction.id);
      console.log('  🛑 Prediction cancelled to avoid charges');
    }
    
    return true;
  } catch (error) {
    console.error('  ❌ Image generation test failed:', error.message);
    return false;
  }
}

async function testTrainingWorkflow() {
  console.log('\n🏋️ Testing training workflow (dry run)...');
  
  const replicate = new Replicate({
    auth: TEST_CONFIG.apiToken
  });

  try {
    // Note: We won't actually start training to avoid costs
    // Instead, we'll validate the training model and input format
    
    console.log('  🔍 Validating training model accessibility...');
    
    const trainingModel = TEST_CONFIG.models.flux.training;
    const modelParts = trainingModel.split(':');
    
    if (modelParts.length === 2) {
      const [owner_model, version_id] = modelParts;
      
      const response = await fetch(`https://api.replicate.com/v1/models/${owner_model}/versions/${version_id}`, {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const versionInfo = await response.json();
        console.log('  ✅ Training model is accessible');
        
        if (versionInfo.openapi_schema && versionInfo.openapi_schema.components) {
          const inputSchema = versionInfo.openapi_schema.components.schemas?.Input;
          if (inputSchema && inputSchema.properties) {
            console.log('  📋 Required input parameters:');
            Object.keys(inputSchema.properties).forEach(param => {
              const isRequired = inputSchema.required?.includes(param);
              console.log(`    ${isRequired ? '✓' : '○'} ${param}: ${inputSchema.properties[param].type || 'object'}`);
            });
          }
        }
        
        console.log('  ℹ️ Training workflow validated (not executed to avoid costs)');
        return true;
      } else {
        console.log('  ❌ Training model not accessible');
        return false;
      }
    } else {
      console.log('  ❌ Invalid training model format');
      return false;
    }
  } catch (error) {
    console.error('  ❌ Training workflow test failed:', error.message);
    return false;
  }
}

async function testWebhookConfiguration() {
  console.log('\n🪝 Testing webhook configuration...');
  
  try {
    const webhookUrl = TEST_CONFIG.webhookUrl;
    console.log(`  🔗 Webhook URL: ${webhookUrl}`);
    
    // Test if webhook URL is reachable (basic connectivity)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Replicate-Webhook-Id': 'test-webhook-id',
        'Replicate-Webhook-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'Replicate-Webhook-Signature': 'test-signature'
      },
      body: JSON.stringify({
        id: 'test-prediction-id',
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        output: ['test-output-url']
      })
    });
    
    console.log(`  📊 Webhook endpoint response: ${response.status}`);
    
    if (response.status === 200 || response.status === 400) {
      console.log('  ✅ Webhook endpoint is reachable');
      return true;
    } else {
      console.log('  ⚠️ Webhook endpoint may not be properly configured');
      return false;
    }
  } catch (error) {
    console.error('  ❌ Webhook test failed:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting complete Replicate integration test\n');
  
  const results = {
    connection: false,
    modelValidation: false,
    imageGeneration: false,
    trainingWorkflow: false,
    webhookConfiguration: false
  };
  
  // Run all tests
  results.connection = await testReplicateConnection();
  
  if (results.connection) {
    results.modelValidation = await testModelValidation();
    results.imageGeneration = await testImageGeneration();
    results.trainingWorkflow = await testTrainingWorkflow();
    results.webhookConfiguration = await testWebhookConfiguration();
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Replicate integration is fully configured.');
  } else {
    console.log('⚠️ Some tests failed. Check the configuration and try again.');
  }
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runCompleteTest().catch(console.error);
}

module.exports = {
  runCompleteTest,
  testReplicateConnection,
  testModelValidation,
  testImageGeneration,
  testTrainingWorkflow,
  testWebhookConfiguration
};