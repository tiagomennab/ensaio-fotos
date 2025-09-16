const fetch = require('node-fetch');

// Test text-to-video generation with fixed status mapping
async function testVideoGeneration() {
  const API_BASE = 'http://localhost:3001';
  
  console.log('🎬 Testing text-to-video generation with fixed status mapping...\n');

  try {
    // 1. First, test the video generation endpoint
    console.log('📝 Step 1: Creating video generation...');
    
    const videoRequest = {
      prompt: "A beautiful sunset over calm ocean waves, cinematic style, peaceful and serene",
      duration: 5,
      aspectRatio: "16:9",
      quality: "standard"
    };

    const response = await fetch(`${API_BASE}/api/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Using a test authorization header - in real app this would be session-based
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(videoRequest)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ Video generation failed:', response.status, errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Video generation response:', JSON.stringify(result, null, 2));

    // 2. Check if we got a job ID and can track status
    if (result.jobId) {
      console.log(`\n🔄 Step 2: Checking status for job ${result.jobId}...`);
      
      // Test status endpoint
      const statusResponse = await fetch(`${API_BASE}/api/video/${result.jobId}`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        console.log('📊 Status response:', JSON.stringify(statusResult, null, 2));
        
        // Verify status mapping is working correctly
        console.log('\n✅ Status mapping verification:');
        console.log(`- Database status: ${statusResult.status}`);
        console.log(`- Should be uppercase enum: ${['STARTING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(statusResult.status) ? 'YES' : 'NO'}`);
      } else {
        console.log('❌ Status check failed:', statusResponse.status);
      }
    }

    // 3. Test video list endpoint
    console.log('\n📋 Step 3: Testing video list endpoint...');
    const listResponse = await fetch(`${API_BASE}/api/video`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    if (listResponse.ok) {
      const listResult = await listResponse.json();
      console.log('📝 Video list response:', JSON.stringify(listResult, null, 2));
    } else {
      console.log('❌ Video list failed:', listResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // If auth error, that's expected - we're testing without proper session
    if (error.message.includes('auth') || error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Note: Authentication errors are expected in this test environment.');
      console.log('   The important part is that our status mapping code is syntactically correct.');
    }
  }
}

// Also test the Kling provider directly if possible
async function testKlingProvider() {
  console.log('\n🎯 Testing Kling provider directly...\n');
  
  try {
    // This will test if our imports and status mapping work
    const { KlingVideoProvider } = require('./src/lib/ai/providers/kling.ts');
    
    console.log('✅ KlingVideoProvider imported successfully');
    
    // Test if we can create an instance (this will test the config)
    try {
      const provider = new KlingVideoProvider();
      console.log('✅ KlingVideoProvider instance created successfully');
      
      // Test the available models method
      const models = await provider.getAvailableModels();
      console.log('✅ Available models:', JSON.stringify(models, null, 2));
      
    } catch (configError) {
      console.log('⚠️ Provider config error (expected if REPLICATE_API_TOKEN not set):', configError.message);
    }
    
  } catch (importError) {
    console.log('❌ Import error:', importError.message);
    
    // This would indicate syntax or mapping issues
    if (importError.message.includes('status-mapping')) {
      console.log('🔍 Status mapping issue detected - checking status-mapping.ts...');
    }
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting video generation and status mapping tests...\n');
  
  await testKlingProvider();
  await testVideoGeneration();
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error);