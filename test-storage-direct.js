require('dotenv').config({ path: '.env.local' });

const { processAndStoreReplicateImages } = require('./src/lib/services/auto-image-storage');

async function testStorageService() {
  console.log('🧪 Testing auto-image-storage service directly...');

  // Test URLs (use a recent Replicate output)
  const testUrls = [
    'https://replicate.delivery/xezq/P6bbSeedIxnQu0Te3fWCqj8fx3dP2vS3a87SSMKktf72nRUVF/out-0.png'
  ];

  const testGenerationId = 'test-' + Date.now();
  const testUserId = 'cmf3555br0004qjk80pe9dhqr'; // Using existing user ID

  try {
    console.log('📥 Processing test images...');
    const results = await processAndStoreReplicateImages(testUrls, testGenerationId, testUserId);

    console.log('✅ Test completed successfully!');
    console.log('Results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStorageService();