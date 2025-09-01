const Replicate = require('replicate');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Test generation workflow with different models
const GENERATION_CONFIG = {
  apiToken: process.env.REPLICATE_API_TOKEN,
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/generation',
  models: {
    flux: {
      schnell: 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
      dev: 'black-forest-labs/flux-dev:6e4a938f85952bdabcc15aa329178c4d681c52bf25a0342403287dc26944661d'
    },
    sdxl: {
      generation: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc'
    }
  },
  testPrompts: [
    'a beautiful sunset over mountains, highly detailed, 8k',
    'portrait of a smiling person, professional photography',
    'abstract art, colorful geometric shapes, modern design'
  ]
};

async function validateGenerationModel(modelVersion, modelName) {
  console.log(`🔍 Validating ${modelName} model...`);
  
  try {
    const modelParts = modelVersion.split(':');
    const [owner_model, version_id] = modelParts;
    
    const response = await fetch(`https://api.replicate.com/v1/models/${owner_model}/versions/${version_id}`, {
      headers: {
        'Authorization': `Bearer ${GENERATION_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const versionInfo = await response.json();
      console.log(`✅ ${modelName}: Available`);
      
      if (versionInfo.openapi_schema?.components?.schemas?.Input) {
        const inputSchema = versionInfo.openapi_schema.components.schemas.Input;
        
        console.log(`📋 ${modelName} parameters:`);
        if (inputSchema.properties) {
          Object.entries(inputSchema.properties).forEach(([param, schema]) => {
            const isRequired = inputSchema.required?.includes(param);
            const type = schema.type || 'object';
            const defaultValue = schema.default !== undefined ? ` (default: ${schema.default})` : '';
            console.log(`  ${isRequired ? '✓' : '○'} ${param}: ${type}${defaultValue}`);
          });
        }
        
        return inputSchema;
      }
    } else {
      console.log(`❌ ${modelName}: Not accessible (${response.status})`);
      return null;
    }
  } catch (error) {
    console.error(`❌ ${modelName} validation failed:`, error.message);
    return null;
  }
}

async function testFluxGeneration(modelVersion, modelName, prompt) {
  console.log(`\n🎨 Testing ${modelName} generation...`);
  
  const replicate = new Replicate({
    auth: GENERATION_CONFIG.apiToken
  });

  const input = {
    prompt: prompt,
    aspect_ratio: '1:1',
    num_outputs: 1,
    output_format: 'webp',
    output_quality: 80
  };

  // Add model-specific parameters
  if (modelName.includes('Dev')) {
    input.num_inference_steps = 20;
    input.guidance = 7.5;
  } else if (modelName.includes('Schnell')) {
    // Schnell is optimized for speed, no additional params needed
  }

  try {
    console.log('📝 Creating prediction...');
    console.log('⚙️ Input:', JSON.stringify(input, null, 2));
    
    const prediction = await replicate.predictions.create({
      version: modelVersion,
      input: input
      // Skip webhook for testing since localhost isn't HTTPS
      // webhook: GENERATION_CONFIG.webhookUrl,
      // webhook_events_filter: ['start', 'output', 'logs', 'completed']
    });

    console.log(`✅ Prediction created: ${prediction.id}`);
    console.log(`📊 Status: ${prediction.status}`);
    console.log(`🕐 Created: ${prediction.created_at}`);
    
    return prediction;
  } catch (error) {
    console.error(`❌ ${modelName} generation failed:`, error.message);
    return null;
  }
}

async function testSDXLGeneration(modelVersion, prompt) {
  console.log('\n🎨 Testing SDXL generation...');
  
  const replicate = new Replicate({
    auth: GENERATION_CONFIG.apiToken
  });

  const input = {
    prompt: prompt,
    width: 1024,
    height: 1024,
    num_inference_steps: 20,
    guidance_scale: 7.5,
    num_outputs: 1
  };

  try {
    console.log('📝 Creating SDXL prediction...');
    console.log('⚙️ Input:', JSON.stringify(input, null, 2));
    
    const prediction = await replicate.predictions.create({
      version: modelVersion,
      input: input
      // Skip webhook for testing since localhost isn't HTTPS
      // webhook: GENERATION_CONFIG.webhookUrl,
      // webhook_events_filter: ['start', 'output', 'logs', 'completed']
    });

    console.log(`✅ SDXL prediction created: ${prediction.id}`);
    console.log(`📊 Status: ${prediction.status}`);
    console.log(`🕐 Created: ${prediction.created_at}`);
    
    return prediction;
  } catch (error) {
    console.error('❌ SDXL generation failed:', error.message);
    return null;
  }
}

async function monitorGeneration(predictionId, modelName) {
  console.log(`\n👀 Monitoring ${modelName} generation: ${predictionId}`);
  
  const replicate = new Replicate({
    auth: GENERATION_CONFIG.apiToken
  });

  const maxChecks = 10; // Maximum status checks
  let checks = 0;
  
  while (checks < maxChecks) {
    try {
      const prediction = await replicate.predictions.get(predictionId);
      
      console.log(`📊 Check ${checks + 1}: Status = ${prediction.status}`);
      
      if (prediction.logs) {
        const logLines = prediction.logs.split('\n').slice(-2); // Last 2 lines
        logLines.forEach(line => {
          if (line.trim()) {
            console.log(`📝 Log: ${line.trim()}`);
          }
        });
      }
      
      if (prediction.status === 'succeeded') {
        console.log('🎉 Generation completed successfully!');
        if (prediction.output) {
          console.log('🖼️ Output URLs:');
          if (Array.isArray(prediction.output)) {
            prediction.output.forEach((url, index) => {
              console.log(`  ${index + 1}: ${url}`);
            });
          } else {
            console.log(`  ${prediction.output}`);
          }
        }
        return prediction;
      } else if (prediction.status === 'failed') {
        console.log('❌ Generation failed');
        if (prediction.error) {
          console.log(`🚨 Error: ${prediction.error}`);
        }
        return prediction;
      } else if (prediction.status === 'canceled') {
        console.log('🛑 Generation was canceled');
        return prediction;
      }
      
      // Wait before next check
      checks++;
      if (checks < maxChecks) {
        console.log('⏳ Waiting 15 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    } catch (error) {
      console.error('❌ Failed to get prediction status:', error.message);
      break;
    }
  }
  
  console.log('⏰ Monitoring timeout reached');
  return null;
}

async function testGenerationCancellation(predictionId, modelName) {
  console.log(`\n🛑 Testing ${modelName} generation cancellation...`);
  
  const replicate = new Replicate({
    auth: GENERATION_CONFIG.apiToken
  });

  try {
    await replicate.predictions.cancel(predictionId);
    console.log('✅ Generation cancelled successfully');
    
    // Check status after cancellation
    await new Promise(resolve => setTimeout(resolve, 3000));
    const prediction = await replicate.predictions.get(predictionId);
    console.log(`📊 Status after cancellation: ${prediction.status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Cancellation failed:', error.message);
    return false;
  }
}

async function runGenerationWorkflowTest() {
  console.log('🚀 Starting generation workflow test\n');
  
  if (!GENERATION_CONFIG.apiToken) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment variables');
    return;
  }
  
  const results = {
    fluxSchnell: { validation: false, generation: false, monitoring: false },
    fluxDev: { validation: false, generation: false, monitoring: false },
    sdxl: { validation: false, generation: false, monitoring: false }
  };
  
  // Step 1: Validate all models
  console.log('🔍 STEP 1: Model Validation');
  console.log('============================');
  
  const fluxSchnellSchema = await validateGenerationModel(
    GENERATION_CONFIG.models.flux.schnell, 
    'FLUX Schnell'
  );
  results.fluxSchnell.validation = !!fluxSchnellSchema;
  
  const fluxDevSchema = await validateGenerationModel(
    GENERATION_CONFIG.models.flux.dev, 
    'FLUX Dev'
  );
  results.fluxDev.validation = !!fluxDevSchema;
  
  const sdxlSchema = await validateGenerationModel(
    GENERATION_CONFIG.models.sdxl.generation, 
    'SDXL'
  );
  results.sdxl.validation = !!sdxlSchema;
  
  // Step 2: Test generation with each model
  console.log('\n🎨 STEP 2: Generation Testing');
  console.log('=============================');
  
  const testPrompt = GENERATION_CONFIG.testPrompts[0];
  const predictions = [];
  
  // Test FLUX Schnell (fastest)
  if (results.fluxSchnell.validation) {
    const prediction = await testFluxGeneration(
      GENERATION_CONFIG.models.flux.schnell,
      'FLUX Schnell',
      testPrompt
    );
    if (prediction) {
      predictions.push({ prediction, model: 'FLUX Schnell' });
      results.fluxSchnell.generation = true;
    }
  }
  
  // Test FLUX Dev (balanced)
  if (results.fluxDev.validation) {
    const prediction = await testFluxGeneration(
      GENERATION_CONFIG.models.flux.dev,
      'FLUX Dev',
      testPrompt
    );
    if (prediction) {
      predictions.push({ prediction, model: 'FLUX Dev' });
      results.fluxDev.generation = true;
    }
  }
  
  // Test SDXL (traditional)
  if (results.sdxl.validation) {
    const prediction = await testSDXLGeneration(
      GENERATION_CONFIG.models.sdxl.generation,
      testPrompt
    );
    if (prediction) {
      predictions.push({ prediction, model: 'SDXL' });
      results.sdxl.generation = true;
    }
  }
  
  // Step 3: Monitor generations
  console.log('\n👀 STEP 3: Generation Monitoring');
  console.log('=================================');
  
  for (const { prediction, model } of predictions) {
    const result = await monitorGeneration(prediction.id, model);
    
    // Update results based on monitoring outcome
    if (model === 'FLUX Schnell') {
      results.fluxSchnell.monitoring = !!result;
    } else if (model === 'FLUX Dev') {
      results.fluxDev.monitoring = !!result;
    } else if (model === 'SDXL') {
      results.sdxl.monitoring = !!result;
    }
    
    // Cancel if still running
    if (result && ['starting', 'processing'].includes(result.status)) {
      console.log(`💰 ${model} still running - cancelling to avoid charges...`);
      await testGenerationCancellation(prediction.id, model);
    }
  }
  
  // Step 4: Summary
  console.log('\n📊 GENERATION WORKFLOW TEST SUMMARY');
  console.log('====================================');
  
  Object.entries(results).forEach(([model, tests]) => {
    console.log(`\n${model.toUpperCase()}:`);
    console.log(`  ✅ Validation: ${tests.validation ? 'Pass' : 'Fail'}`);
    console.log(`  ✅ Generation: ${tests.generation ? 'Pass' : 'Fail'}`);
    console.log(`  ✅ Monitoring: ${tests.monitoring ? 'Pass' : 'Fail'}`);
  });
  
  const totalTests = Object.values(results).reduce((acc, tests) => {
    return acc + Object.values(tests).filter(Boolean).length;
  }, 0);
  
  const maxTests = Object.keys(results).length * 3;
  
  console.log(`\n🎯 Overall: ${totalTests}/${maxTests} tests passed`);
  
  if (totalTests === maxTests) {
    console.log('🎉 All generation tests passed! Image generation is fully configured.');
  } else {
    console.log('⚠️ Some tests failed. Check the configuration and try again.');
  }
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runGenerationWorkflowTest().catch(console.error);
}

module.exports = {
  runGenerationWorkflowTest,
  validateGenerationModel,
  testFluxGeneration,
  testSDXLGeneration,
  monitorGeneration,
  testGenerationCancellation
};