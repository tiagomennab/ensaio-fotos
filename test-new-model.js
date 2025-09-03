const { getAIProvider } = require('./src/lib/ai');

async function testModelCreation() {
  try {
    console.log('🧪 Testing model creation with corrected API...');
    
    const provider = getAIProvider();
    console.log('✅ AI Provider loaded');

    // Create a simple training request using some of the S3 URLs
    const trainingRequest = {
      modelId: 'test-model-123',
      name: 'Test Model',
      class: 'person',
      imageUrls: [
        'https://ensaio-fotos-prod.s3.us-east-2.amazonaws.com/training/cmf1v1gk40003qj644rhtxwsg/face/face_1_face_1_25259346-0%20-%20Copia.jpg/1756775948127-8d3z1wvlgda.jpg',
        'https://ensaio-fotos-prod.s3.us-east-2.amazonaws.com/training/cmf1v1gk40003qj644rhtxwsg/face/face_2_face_2_25259346-0.jpg/1756775950187-3rw1the9mvo.jpg',
        'https://ensaio-fotos-prod.s3.us-east-2.amazonaws.com/training/cmf1v1gk40003qj644rhtxwsg/face/face_3_face_3_25259346-1%20-%20Copia.jpg/1756775950870-8rsetmhou0t.jpg',
      ],
      triggerWord: 'testperson_person',
      classWord: 'person',
      params: {
        steps: 1000,
        resolution: 1024,
        learningRate: 1e-4,
        batchSize: 1,
        seed: 12345
      },
      webhookUrl: 'http://localhost:3000/api/webhooks/training'
    };

    console.log('🚀 Attempting to start training...');
    const result = await provider.startTraining(trainingRequest);
    
    console.log('🎉 SUCCESS! Training started:', {
      id: result.id,
      status: result.status,
      estimatedTime: result.estimatedTime
    });

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Stack:', error.stack);
  }
}

testModelCreation();