// Quick test for the image editor save endpoint
const testSaveEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/image-editor/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test'
      },
      body: JSON.stringify({
        imageUrl: 'https://picsum.photos/400/400',
        operation: 'edit',
        prompt: 'Test edit operation',
        originalImageUrl: 'https://picsum.photos/300/300'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testSaveEndpoint();