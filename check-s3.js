require('dotenv').config({ path: '.env.local' });

const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function checkS3Bucket() {
  console.log('🔍 Checking AWS S3 bucket for uploaded files...');
  console.log(`📦 Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log('');

  try {
    // List all objects in bucket
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      MaxKeys: 100
    };

    const data = await s3.listObjectsV2(params).promise();
    
    console.log(`📊 Total objects in bucket: ${data.KeyCount}`);
    console.log('');

    if (data.KeyCount === 0) {
      console.log('❌ No files found in S3 bucket');
      console.log('💡 Try creating a model to upload some photos first');
      return;
    }

    // Group files by folder
    const folders = {};
    
    data.Contents.forEach(obj => {
      const parts = obj.Key.split('/');
      const folder = parts.slice(0, -1).join('/') || 'root';
      
      if (!folders[folder]) {
        folders[folder] = [];
      }
      
      folders[folder].push({
        name: parts[parts.length - 1],
        size: obj.Size,
        modified: obj.LastModified,
        url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
      });
    });

    // Display organized results
    for (const [folder, files] of Object.entries(folders)) {
      console.log(`📁 Folder: ${folder}`);
      files.forEach(file => {
        const sizeKB = (file.size / 1024).toFixed(1);
        console.log(`   📄 ${file.name} (${sizeKB} KB) - ${file.modified.toISOString().split('T')[0]}`);
        console.log(`      🔗 ${file.url}`);
      });
      console.log('');
    }

    // Check for training folders specifically
    const trainingFiles = data.Contents.filter(obj => obj.Key.startsWith('training/'));
    if (trainingFiles.length > 0) {
      console.log('🎯 Training files found:');
      trainingFiles.forEach(file => {
        const sizeKB = (file.Size / 1024).toFixed(1);
        console.log(`   ✅ ${file.Key} (${sizeKB} KB)`);
      });
    } else {
      console.log('⚠️  No training files found yet');
      console.log('💡 Training files will appear in the "training/" folder after model creation');
    }

  } catch (error) {
    console.error('❌ Error checking S3 bucket:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('🔑 Make sure your AWS credentials have S3 access permissions');
    } else if (error.code === 'NoSuchBucket') {
      console.log(`🪣 Bucket "${process.env.AWS_S3_BUCKET}" does not exist`);
    } else if (error.code === 'CredentialsError') {
      console.log('🔐 Check your AWS credentials in .env.local');
    }
  }
}

checkS3Bucket();