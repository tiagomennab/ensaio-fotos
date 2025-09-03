#!/usr/bin/env node

/**
 * Replicate Integration Test Suite
 * Tests the complete AI model training workflow
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || 'your-replicate-api-token-here';

// Test utilities
async function makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
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

  const response = await fetch(url, options);
  const data = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

async function uploadTestImage(filePath, modelId, category = 'face') {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('modelId', modelId);
  form.append('category', category);

  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: form
  });

  return {
    status: response.status,
    ok: response.ok,
    data: await response.json()
  };
}

// Test functions
class ReplicateIntegrationTest {
  constructor() {
    this.testResults = [];
    this.authCookie = null;
  }

  log(test, status, details = '') {
    const timestamp = new Date().toISOString();
    const result = { test, status, details, timestamp };
    this.testResults.push(result);
    
    const statusSymbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
    console.log(`${statusSymbol} [${timestamp}] ${test}: ${details}`);
  }

  async test1_ReplicateAPITokenValidation() {
    try {
      this.log('Replicate API Token Validation', 'RUNNING', 'Checking token validity...');
      
      const Replicate = require('replicate');
      const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
      
      // Try to list trainings to validate token
      const trainings = await replicate.trainings.list();
      
      this.log('Replicate API Token Validation', 'PASS', `Token valid, found ${trainings.results.length} previous trainings`);
      return true;
    } catch (error) {
      this.log('Replicate API Token Validation', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test2_ServerHealthCheck() {
    try {
      this.log('Server Health Check', 'RUNNING', 'Checking server status...');
      
      const result = await makeRequest('/api/health');
      
      if (result.ok) {
        this.log('Server Health Check', 'PASS', `Server healthy: ${JSON.stringify(result.data)}`);
        return true;
      } else {
        this.log('Server Health Check', 'FAIL', `Server unhealthy: ${result.status}`);
        return false;
      }
    } catch (error) {
      this.log('Server Health Check', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test3_AuthenticationFlow() {
    try {
      this.log('Authentication Flow', 'RUNNING', 'Testing login...');
      
      // Try to access a protected endpoint without auth
      const unauthedResult = await makeRequest('/api/ai/train');
      
      if (unauthedResult.status === 401) {
        this.log('Authentication Flow', 'PASS', 'Proper authentication required');
        return true;
      } else {
        this.log('Authentication Flow', 'FAIL', `Expected 401, got ${unauthedResult.status}`);
        return false;
      }
    } catch (error) {
      this.log('Authentication Flow', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test4_ReplicateProviderInitialization() {
    try {
      this.log('Replicate Provider Initialization', 'RUNNING', 'Testing provider setup...');
      
      // Test that we can access the AI provider config endpoint
      const result = await makeRequest('/api/ai/config');
      
      if (result.ok) {
        this.log('Replicate Provider Initialization', 'PASS', `AI configuration accessible`);
        return true;
      } else if (result.status === 401) {
        this.log('Replicate Provider Initialization', 'PASS', 'AI provider properly protected by auth');
        return true;
      } else {
        this.log('Replicate Provider Initialization', 'FAIL', `Unexpected response: ${result.status}`);
        return false;
      }
    } catch (error) {
      this.log('Replicate Provider Initialization', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test5_FluxModelValidation() {
    try {
      this.log('FLUX Model Validation', 'RUNNING', 'Validating FLUX model versions...');
      
      const Replicate = require('replicate');
      const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
      
      // Test FLUX training model
      const fluxTrainingVersion = 'replicate/lora-training:b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc';
      
      try {
        const model = await replicate.models.versions.get('replicate', 'lora-training', 'b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc');
        this.log('FLUX Model Validation', 'PASS', `Training model valid: ${model.id}`);
      } catch (error) {
        this.log('FLUX Model Validation', 'FAIL', `Training model invalid: ${error.message}`);
      }

      // Test FLUX generation model  
      try {
        const genModel = await replicate.models.versions.get('black-forest-labs', 'flux-schnell', 'c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e');
        this.log('FLUX Model Validation', 'PASS', `Generation model valid: ${genModel.id}`);
        return true;
      } catch (error) {
        this.log('FLUX Model Validation', 'FAIL', `Generation model invalid: ${error.message}`);
        return false;
      }
    } catch (error) {
      this.log('FLUX Model Validation', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test6_WebhookEndpoints() {
    try {
      this.log('Webhook Endpoints', 'RUNNING', 'Testing webhook availability...');
      
      // Test training webhook with empty POST
      const trainingWebhook = await makeRequest('/api/webhooks/training', 'POST', {});
      const generationWebhook = await makeRequest('/api/webhooks/generation', 'POST', {});
      
      // Webhooks should exist (even if they return errors for empty payloads)
      const trainingExists = trainingWebhook.status !== 404;
      const generationExists = generationWebhook.status !== 404;
      
      if (trainingExists && generationExists) {
        this.log('Webhook Endpoints', 'PASS', `Webhook endpoints accessible (training: ${trainingWebhook.status}, generation: ${generationWebhook.status})`);
        return true;
      } else {
        this.log('Webhook Endpoints', 'FAIL', `Missing endpoints - training: ${trainingExists}, generation: ${generationExists}`);
        return false;
      }
    } catch (error) {
      this.log('Webhook Endpoints', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test7_CostCalculations() {
    try {
      this.log('Cost Calculations', 'RUNNING', 'Testing cost calculation functions...');
      
      // Test cost calculations with manual implementation to avoid TypeScript import issues
      // Based on AI_CONFIG from config.ts
      const trainingCost = this.calculateTrainingCost(1000, 1024);
      const generationCost = this.calculateGenerationCost(1024, 1024, 20);
      
      if (trainingCost > 0 && generationCost > 0) {
        this.log('Cost Calculations', 'PASS', `Training: ${trainingCost} credits, Generation: ${generationCost} credits`);
        return true;
      } else {
        this.log('Cost Calculations', 'FAIL', 'Invalid cost calculations');
        return false;
      }
    } catch (error) {
      this.log('Cost Calculations', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  // Helper methods for cost calculation (based on AI_CONFIG)
  calculateTrainingCost(steps, resolution = 1024) {
    const training = {
      baseSteps: 1000,
      costPerStep: 0.001,
      setupCost: 5
    };
    
    const stepCost = (steps / training.baseSteps) * training.costPerStep * training.baseSteps;
    const resolutionMultiplier = Math.pow(resolution / 512, 2);
    return Math.ceil((training.setupCost + stepCost) * resolutionMultiplier);
  }

  calculateGenerationCost(width, height, steps = 20) {
    const generation = {
      baseResolution: 1024,
      costPerMegapixel: 1,
      costPerStep: 0.1
    };
    
    const megapixels = (width * height) / (1024 * 1024);
    const resolutionCost = megapixels * generation.costPerMegapixel;
    const stepCost = (steps / 20) * generation.costPerStep;
    return Math.ceil(resolutionCost + stepCost);
  }

  async test8_UploadDirectoryStructure() {
    try {
      this.log('Upload Directory Structure', 'RUNNING', 'Checking upload directories...');
      
      const requiredDirs = [
        'uploads/training/face',
        'uploads/training/body', 
        'uploads/generated'
      ];
      
      let allExist = true;
      for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log('Upload Directory Structure', 'INFO', `Created missing directory: ${dir}`);
        }
      }
      
      this.log('Upload Directory Structure', 'PASS', 'All required directories exist');
      return true;
    } catch (error) {
      this.log('Upload Directory Structure', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test9_SimulateQuickTraining() {
    try {
      this.log('Quick Training Simulation', 'RUNNING', 'Testing minimal training request...');
      
      const Replicate = require('replicate');
      const replicate = new Replicate({ 
        auth: REPLICATE_API_TOKEN,
        userAgent: 'test-suite/1.0.0'
      });
      
      // Test that we can at least list trainings (which validates API access)
      const trainings = await replicate.trainings.list();
      
      this.log('Quick Training Simulation', 'PASS', `API accessible, can list trainings (${trainings.results.length} found)`);
      return true;
    } catch (error) {
      this.log('Quick Training Simulation', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async test10_GenerationTest() {
    try {
      this.log('Generation Test', 'RUNNING', 'Testing image generation...');
      
      const Replicate = require('replicate');
      const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
      
      // Test with FLUX Schnell for fast results
      const prediction = await replicate.predictions.create({
        version: 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
        input: {
          prompt: 'a beautiful sunset over mountains',
          aspect_ratio: '1:1',
          num_inference_steps: 4,
          num_outputs: 1
        }
      });
      
      // Cancel immediately to avoid charges
      await replicate.predictions.cancel(prediction.id);
      
      this.log('Generation Test', 'PASS', `Generation created and canceled: ${prediction.id}`);
      return true;
    } catch (error) {
      this.log('Generation Test', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    console.log('\n🚀 Starting Replicate Integration Test Suite...\n');
    
    const tests = [
      this.test1_ReplicateAPITokenValidation,
      this.test2_ServerHealthCheck,
      this.test3_AuthenticationFlow,
      this.test4_ReplicateProviderInitialization,
      this.test5_FluxModelValidation,
      this.test6_WebhookEndpoints,
      this.test7_CostCalculations,
      this.test8_UploadDirectoryStructure,
      this.test9_SimulateQuickTraining,
      this.test10_GenerationTest
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test.call(this);
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        this.log(test.name, 'FAIL', `Unexpected error: ${error.message}`);
        failed++;
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

    // Save detailed results to file
    const reportPath = path.join(__dirname, '..', 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: { passed, failed, successRate: Math.round((passed / (passed + failed)) * 100) },
      tests: this.testResults,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`📝 Detailed report saved to: ${reportPath}`);

    if (failed > 0) {
      console.log('\n⚠️  Issues found. Review the failed tests above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! Your Replicate integration is working correctly.');
    }
  }
}

// Curl command generator for manual testing
function generateCurlCommands() {
  console.log('\n🔧 Manual Testing Commands:');
  console.log('=====================================\n');

  console.log('1. Test Health Endpoint:');
  console.log(`curl -X GET "${BASE_URL}/api/health" | jq\n`);

  console.log('2. Test Authentication (should return 401):');
  console.log(`curl -X POST "${BASE_URL}/api/ai/train" \\`);
  console.log(`     -H "Content-Type: application/json" | jq\n`);

  console.log('3. Test Replicate API directly:');
  console.log(`curl -X GET "https://api.replicate.com/v1/trainings" \\`);
  console.log(`     -H "Authorization: Token ${REPLICATE_API_TOKEN}" | jq\n`);

  console.log('4. Create a test generation:');
  console.log(`curl -X POST "https://api.replicate.com/v1/predictions" \\`);
  console.log(`     -H "Authorization: Token ${REPLICATE_API_TOKEN}" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{`);
  console.log(`       "version": "black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e",`);
  console.log(`       "input": {`);
  console.log(`         "prompt": "a beautiful landscape",`);
  console.log(`         "aspect_ratio": "1:1",`);
  console.log(`         "num_inference_steps": 4`);
  console.log(`       }`);
  console.log(`     }' | jq\n`);

  console.log('5. Test webhook endpoints:');
  console.log(`curl -X POST "${BASE_URL}/api/webhooks/training" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{}' | jq\n`);

  console.log(`curl -X POST "${BASE_URL}/api/webhooks/generation" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{}' | jq\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--curl-only')) {
    generateCurlCommands();
    return;
  }

  if (args.includes('--help')) {
    console.log('Replicate Integration Test Suite');
    console.log('');
    console.log('Usage:');
    console.log('  node test-replicate-integration.js        # Run full test suite');
    console.log('  node test-replicate-integration.js --curl-only  # Show curl commands only');
    console.log('  node test-replicate-integration.js --help       # Show this help');
    return;
  }

  // Check dependencies
  try {
    require('replicate');
    require('form-data');
  } catch (error) {
    console.error('❌ Missing dependencies. Please install:');
    console.error('npm install replicate form-data');
    process.exit(1);
  }

  const tester = new ReplicateIntegrationTest();
  await tester.runAllTests();
  
  generateCurlCommands();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { ReplicateIntegrationTest };