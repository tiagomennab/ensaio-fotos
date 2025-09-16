require('dotenv').config({ path: '.env.local' });

// Use fetch directly (available in Node.js 18+)
const { fetch } = globalThis;

async function testVideoCreation() {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN não encontrado no .env.local');
    return;
  }
  
  console.log('🎬 Testing video creation with Replicate API...');
  console.log('📡 Token:', REPLICATE_API_TOKEN.substring(0, 10) + '...');
  
  const requestBody = {
    input: {
      prompt: "A beautiful sunset over mountains, gentle camera movement, cinematic quality",
      duration: 5,
      aspect_ratio: "16:9",
      negative_prompt: "fast movements, shaking, distortion"
    }
  };
  
  console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2.1-master/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📥 Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Request failed:', data);
      return;
    }
    
    console.log('✅ Video creation request successful!');
    console.log('🆔 Prediction ID:', data.id);
    console.log('📊 Status:', data.status);
    
    if (data.status === 'succeeded' && data.output) {
      console.log('🎉 Video ready:', data.output);
    } else if (data.status === 'processing' || data.status === 'starting') {
      console.log('⏳ Video is processing...');
      
      // Check status every 10 seconds
      const checkStatus = async (predictionId) => {
        try {
          const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
              'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          const statusData = await statusResponse.json();
          console.log('📊 Status check:', {
            id: statusData.id,
            status: statusData.status,
            progress: statusData.progress || 'N/A',
            created_at: statusData.created_at,
            completed_at: statusData.completed_at
          });
          
          if (statusData.status === 'succeeded') {
            console.log('🎉 Video completed:', statusData.output);
          } else if (statusData.status === 'failed') {
            console.error('❌ Video failed:', statusData.error);
          } else if (statusData.status === 'processing' || statusData.status === 'starting') {
            console.log('⏳ Still processing, checking again in 10 seconds...');
            setTimeout(() => checkStatus(predictionId), 10000);
          }
        } catch (error) {
          console.error('❌ Status check failed:', error);
        }
      };
      
      setTimeout(() => checkStatus(data.id), 10000);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Execute test
testVideoCreation().catch(console.error);