// Simple test of status mapping functions
const { 
  mapReplicateToGenerationStatus,
  mapReplicateToVideoStatus,
  isReplicateStatusCompleted,
  isReplicateStatusFailed,
  isReplicateStatusProcessing
} = require('./src/lib/utils/status-mapping');

console.log('🧪 Testing Status Mapping Functions\n');

// Test generation status mapping
console.log('📊 Generation Status Mapping:');
console.log('  starting  ->', mapReplicateToGenerationStatus('starting'));
console.log('  processing ->', mapReplicateToGenerationStatus('processing'));
console.log('  succeeded  ->', mapReplicateToGenerationStatus('succeeded'));
console.log('  failed     ->', mapReplicateToGenerationStatus('failed'));

// Test video status mapping  
console.log('\n🎬 Video Status Mapping:');
console.log('  starting   ->', mapReplicateToVideoStatus('starting'));
console.log('  processing ->', mapReplicateToVideoStatus('processing'));
console.log('  succeeded  ->', mapReplicateToVideoStatus('succeeded'));
console.log('  failed     ->', mapReplicateToVideoStatus('failed'));
console.log('  canceled   ->', mapReplicateToVideoStatus('canceled'));

// Test status check functions
console.log('\n✅ Status Check Functions:');
console.log('  isCompleted(succeeded):', isReplicateStatusCompleted('succeeded'));
console.log('  isCompleted(failed):   ', isReplicateStatusCompleted('failed'));
console.log('  isFailed(failed):      ', isReplicateStatusFailed('failed'));
console.log('  isFailed(succeeded):   ', isReplicateStatusFailed('succeeded'));
console.log('  isProcessing(starting):', isReplicateStatusProcessing('starting'));
console.log('  isProcessing(processing):', isReplicateStatusProcessing('processing'));
console.log('  isProcessing(succeeded):', isReplicateStatusProcessing('succeeded'));

console.log('\n✅ Status mapping test completed successfully!');