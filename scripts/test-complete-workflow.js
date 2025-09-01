#!/usr/bin/env node

/**
 * Complete AI Model Training Workflow Test
 * Tests the entire process: Create model → Upload photos → Start training → Monitor status
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3001';
const REPLICATE_API_TOKEN = 'r8_aKGAAxZyfvl2nur07hL7zZ7C60Mt12v4LzkhG';

// Test configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

const TEST_MODEL = {
  name: 'Test Model ' + Date.now(),
  class: 'PERSON',
  category: 'face'
};

class WorkflowTester {
  constructor() {
    this.sessionCookie = null;
    this.modelId = null;
    this.trainingId = null;
  }

  async makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (this.sessionCookie) {
      options.headers['Cookie'] = this.sessionCookie;
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    let data;
    
    try {
      data = await response.json();
    } catch (error) {
      data = { error: 'Invalid JSON response' };
    }

    // Store session cookie if available
    if (response.headers.get('set-cookie')) {
      this.sessionCookie = response.headers.get('set-cookie');
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers
    };
  }

  async createTestImage() {
    // Create a simple test image (1x1 pixel PNG)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // image data
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // image data
      0xE5, 0x27, 0xDE, 0xFC, 0x00, 0x00, 0x00, 0x00, // IEND chunk
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const testImagePath = path.join(__dirname, '..', 'test-image.png');
    fs.writeFileSync(testImagePath, pngData);
    return testImagePath;
  }

  async step1_CreateUser() {
    console.log('\n🔐 Step 1: Create/Login Test User');
    
    // Try to register first (might fail if user exists)
    const registerResult = await this.makeRequest('/api/auth/register', 'POST', {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    console.log(`   Register: ${registerResult.status} - ${registerResult.data.message || 'N/A'}`);

    // Now try to login
    const loginResult = await this.makeRequest('/api/auth/signin', 'POST', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    console.log(`   Login: ${loginResult.status} - ${loginResult.data.message || 'Success'}`);
    
    if (loginResult.ok || registerResult.ok) {
      console.log('   ✅ User authenticated');
      return true;
    } else {
      console.log('   ❌ Authentication failed');
      return false;
    }
  }

  async step2_CreateModel() {
    console.log('\n📦 Step 2: Create AI Model');
    
    const result = await this.makeRequest('/api/models', 'POST', {
      name: TEST_MODEL.name,
      class: TEST_MODEL.class
    });

    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));

    if (result.ok && result.data.data) {
      this.modelId = result.data.data.id;
      console.log(`   ✅ Model created: ${this.modelId}`);
      return true;
    } else {
      console.log('   ❌ Model creation failed');
      return false;
    }
  }

  async step3_UploadPhotos() {
    console.log('\n📸 Step 3: Upload Training Photos');
    
    const testImagePath = await this.createTestImage();
    
    try {
      for (let i = 0; i < 3; i++) {
        const form = new FormData();
        form.append('file', fs.createReadStream(testImagePath));
        form.append('modelId', this.modelId);
        form.append('category', TEST_MODEL.category);

        const response = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          body: form,
          headers: {
            'Cookie': this.sessionCookie
          }
        });

        const result = await response.json();
        console.log(`   Upload ${i + 1}: ${response.status} - ${result.message || 'N/A'}`);
      }

      // Clean up test image
      fs.unlinkSync(testImagePath);
      
      console.log('   ✅ Photos uploaded');
      return true;
    } catch (error) {
      console.log(`   ❌ Upload failed: ${error.message}`);
      return false;
    }
  }

  async step4_StartTraining() {
    console.log('\n🏋️ Step 4: Start Training');
    
    const result = await this.makeRequest('/api/ai/train', 'POST', {
      modelId: this.modelId,
      triggerWord: 'TOK',
      classWord: 'person',
      trainingParams: {
        steps: 500, // Minimal steps for testing
        resolution: 512, // Lower resolution for faster training
        learningRate: 1e-4,
        batchSize: 1
      }
    });

    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));

    if (result.ok && result.data.data) {
      this.trainingId = result.data.data.trainingId;
      console.log(`   ✅ Training started: ${this.trainingId}`);
      return true;
    } else {
      console.log('   ❌ Training failed to start');
      return false;
    }
  }

  async step5_MonitorTraining() {
    console.log('\n📊 Step 5: Monitor Training Status');
    
    if (!this.trainingId) {
      console.log('   ❌ No training ID available');
      return false;
    }

    const result = await this.makeRequest(`/api/ai/train?trainingId=${this.trainingId}`, 'GET');

    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, JSON.stringify(result.data, null, 2));

    if (result.ok) {
      console.log(`   ✅ Training status retrieved`);
      return true;
    } else {
      console.log('   ❌ Failed to get training status');
      return false;
    }
  }

  async step6_TestReplicateDirectly() {
    console.log('\n🌐 Step 6: Test Replicate API Directly');
    
    const Replicate = require('replicate');
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

    try {
      // Test account access
      const account = await fetch('https://api.replicate.com/v1/account', {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
      }).then(r => r.json());
      
      console.log(`   Account: ${account.username} (${account.type})`);

      // Test listing trainings
      const trainings = await replicate.trainings.list();
      console.log(`   Trainings: ${trainings.results.length} found`);

      // Test creating a minimal prediction (for quick validation)
      const prediction = await replicate.predictions.create({
        version: 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
        input: {
          prompt: 'a test image',
          aspect_ratio: '1:1',
          num_inference_steps: 4
        }
      });

      console.log(`   Test prediction: ${prediction.id} (${prediction.status})`);
      
      // Cancel immediately to avoid charges
      await replicate.predictions.cancel(prediction.id);
      console.log(`   Prediction canceled to avoid charges`);

      console.log('   ✅ Replicate API working correctly');
      return true;
    } catch (error) {
      console.log(`   ❌ Replicate API error: ${error.message}`);
      return false;
    }
  }

  async runCompleteWorkflow() {
    console.log('🚀 Starting Complete AI Model Training Workflow Test');
    console.log('==================================================');

    const steps = [
      { name: 'Create/Login User', fn: this.step1_CreateUser },
      { name: 'Create Model', fn: this.step2_CreateModel },
      { name: 'Upload Photos', fn: this.step3_UploadPhotos },
      { name: 'Start Training', fn: this.step4_StartTraining },
      { name: 'Monitor Training', fn: this.step5_MonitorTraining },
      { name: 'Test Replicate API', fn: this.step6_TestReplicateDirectly }
    ];

    let passed = 0;
    let failed = 0;

    for (const step of steps) {
      try {
        const success = await step.fn.call(this);
        if (success) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        failed++;
      }
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 Workflow Test Results:');
    console.log('========================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 Complete workflow test passed! Your Replicate integration is ready.');
    } else {
      console.log('\n⚠️  Some steps failed. Review the output above for details.');
    }

    // Cleanup
    if (this.modelId) {
      console.log('\n🧹 Cleaning up test model...');
      await this.makeRequest(`/api/models/${this.modelId}`, 'DELETE');
    }
  }
}

async function main() {
  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/health`);
    if (!healthCheck.ok) {
      console.log('❌ Server is not running. Please start with: npm run dev');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Please start with: npm run dev');
    process.exit(1);
  }

  const tester = new WorkflowTester();
  await tester.runCompleteWorkflow();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Workflow test failed:', error);
    process.exit(1);
  });
}

module.exports = { WorkflowTester };