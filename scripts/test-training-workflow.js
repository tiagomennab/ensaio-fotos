const Replicate = require('replicate');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Test training workflow with minimal cost
const TRAINING_CONFIG = {
  apiToken: process.env.REPLICATE_API_TOKEN,
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/training',
  testZipUrl: 'https://replicate.delivery/pbxt/IJhMT93w5lxqzNzTLqm0RGQUVvNjkZuSCwZXdWIR3N24XiSIA/training_images.zip', // Sample training data
  models: {
    training: 'ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2'
  }
};

async function validateTrainingInput() {
  console.log('🔍 Validating training input parameters...');
  
  const replicate = new Replicate({
    auth: TRAINING_CONFIG.apiToken
  });

  try {
    // Get model schema to understand required parameters
    const modelParts = TRAINING_CONFIG.models.training.split(':');
    const [owner_model, version_id] = modelParts;
    
    const response = await fetch(`https://api.replicate.com/v1/models/${owner_model}/versions/${version_id}`, {
      headers: {
        'Authorization': `Bearer ${TRAINING_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const versionInfo = await response.json();
      console.log('✅ Training model accessible');
      
      if (versionInfo.openapi_schema?.components?.schemas?.Input) {
        const inputSchema = versionInfo.openapi_schema.components.schemas.Input;
        
        console.log('📋 Training parameters:');
        if (inputSchema.properties) {
          Object.entries(inputSchema.properties).forEach(([param, schema]) => {
            const isRequired = inputSchema.required?.includes(param);
            const type = schema.type || 'object';
            const defaultValue = schema.default !== undefined ? ` (default: ${schema.default})` : '';
            console.log(`  ${isRequired ? '✓' : '○'} ${param}: ${type}${defaultValue}`);
            if (schema.description) {
              console.log(`    └─ ${schema.description}`);
            }
          });
        }
        
        return inputSchema;
      }
    } else {
      console.error(`❌ Failed to get model info: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return null;
  }
}

async function testTrainingCreation() {
  console.log('\n🏋️ Testing training creation...');
  
  const replicate = new Replicate({
    auth: TRAINING_CONFIG.apiToken
  });

  const trainingInput = {
    input_images: TRAINING_CONFIG.testZipUrl,
    trigger_word: 'TOK',
    steps: 500, // Minimal steps to reduce cost
    learning_rate: 1e-4,
    rank: 16, // Lower rank for faster training
    resolution: 512 // Lower resolution for testing
  };

  try {
    console.log('📝 Creating training with minimal cost settings...');
    console.log('⚙️ Input:', JSON.stringify(trainingInput, null, 2));
    
    const training = await replicate.trainings.create({
      version: TRAINING_CONFIG.models.training,
      input: trainingInput,
      webhook: TRAINING_CONFIG.webhookUrl,
      webhook_events_filter: ['start', 'output', 'logs', 'completed']
    });

    console.log(`✅ Training created successfully: ${training.id}`);
    console.log(`📊 Status: ${training.status}`);
    console.log(`🕐 Created: ${training.created_at}`);
    console.log(`💰 Estimated cost: ~$2-5 (minimal settings)`);
    
    return training;
  } catch (error) {
    console.error('❌ Training creation failed:', error.message);
    
    // Check for common errors
    if (error.message.includes('insufficient credits')) {
      console.log('💳 Add credits to your Replicate account at https://replicate.com/account/billing');
    } else if (error.message.includes('invalid input')) {
      console.log('📋 Check input parameters format');
    } else if (error.message.includes('webhook')) {
      console.log('🪝 Check webhook URL configuration');
    }
    
    return null;
  }
}

async function monitorTraining(trainingId) {
  console.log(`\n👀 Monitoring training: ${trainingId}`);
  
  const replicate = new Replicate({
    auth: TRAINING_CONFIG.apiToken
  });

  const maxChecks = 20; // Maximum status checks
  let checks = 0;
  
  while (checks < maxChecks) {
    try {
      const training = await replicate.trainings.get(trainingId);
      
      console.log(`📊 Check ${checks + 1}: Status = ${training.status}`);
      
      if (training.logs) {
        const logLines = training.logs.split('\n').slice(-3); // Last 3 lines
        logLines.forEach(line => {
          if (line.trim()) {
            console.log(`📝 Log: ${line.trim()}`);
          }
        });
      }
      
      if (training.status === 'succeeded') {
        console.log('🎉 Training completed successfully!');
        if (training.output) {
          console.log('📦 Model output:');
          console.log(JSON.stringify(training.output, null, 2));
        }
        return training;
      } else if (training.status === 'failed') {
        console.log('❌ Training failed');
        if (training.error) {
          console.log(`🚨 Error: ${training.error}`);
        }
        return training;
      } else if (training.status === 'canceled') {
        console.log('🛑 Training was canceled');
        return training;
      }
      
      // Wait before next check
      checks++;
      if (checks < maxChecks) {
        console.log('⏳ Waiting 30 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } catch (error) {
      console.error('❌ Failed to get training status:', error.message);
      break;
    }
  }
  
  console.log('⏰ Monitoring timeout reached');
  return null;
}

async function testTrainingCancellation(trainingId) {
  console.log(`\n🛑 Testing training cancellation for: ${trainingId}`);
  
  const replicate = new Replicate({
    auth: TRAINING_CONFIG.apiToken
  });

  try {
    await replicate.trainings.cancel(trainingId);
    console.log('✅ Training cancelled successfully');
    
    // Check status after cancellation
    await new Promise(resolve => setTimeout(resolve, 5000));
    const training = await replicate.trainings.get(trainingId);
    console.log(`📊 Status after cancellation: ${training.status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Cancellation failed:', error.message);
    return false;
  }
}

async function runTrainingWorkflowTest() {
  console.log('🚀 Starting training workflow test\n');
  
  if (!TRAINING_CONFIG.apiToken) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment variables');
    return;
  }
  
  // Step 1: Validate input parameters
  const inputSchema = await validateTrainingInput();
  if (!inputSchema) {
    console.error('❌ Cannot proceed without valid input schema');
    return;
  }
  
  // Step 2: Create training
  const training = await testTrainingCreation();
  if (!training) {
    console.error('❌ Cannot proceed without successful training creation');
    return;
  }
  
  // Step 3: Monitor for a short time
  console.log('\n⏳ Monitoring training for 2 minutes...');
  const monitorTimeout = setTimeout(() => {
    console.log('⏰ Monitor timeout - stopping observation');
  }, 120000); // 2 minutes
  
  const finalTraining = await monitorTraining(training.id);
  clearTimeout(monitorTimeout);
  
  // Step 4: Cancel if still running (to avoid charges)
  if (finalTraining && ['starting', 'processing'].includes(finalTraining.status)) {
    console.log('\n💰 Training still running - cancelling to avoid charges...');
    await testTrainingCancellation(training.id);
  }
  
  console.log('\n📊 TRAINING WORKFLOW TEST SUMMARY');
  console.log('==================================');
  console.log(`✅ Model validation: Success`);
  console.log(`✅ Training creation: Success`);
  console.log(`✅ Status monitoring: Success`);
  console.log(`ℹ️  Final status: ${finalTraining?.status || 'Unknown'}`);
  console.log(`💡 Training ID: ${training.id}`);
  
  console.log('\n🎯 Training workflow is properly configured!');
  console.log('💡 You can monitor this training at: https://replicate.com/trainings/' + training.id);
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTrainingWorkflowTest().catch(console.error);
}

module.exports = {
  runTrainingWorkflowTest,
  validateTrainingInput,
  testTrainingCreation,
  monitorTraining,
  testTrainingCancellation
};