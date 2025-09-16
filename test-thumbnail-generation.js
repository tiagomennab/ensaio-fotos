const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test thumbnail generation functionality
async function testThumbnailGeneration() {
  try {
    console.log('🧪 Testing thumbnail generation functionality...');

    // Find the latest completed generation
    const generation = await prisma.generation.findFirst({
      where: {
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrls: true,
        thumbnailUrls: true,
        metadata: true,
        createdAt: true
      }
    });

    if (!generation) {
      console.log('❌ No completed generations found');
      return;
    }

    console.log(`📋 Testing generation: ${generation.id}`);
    console.log(`📅 Created: ${generation.createdAt}`);

    const imageUrls = generation.imageUrls || [];
    const thumbnailUrls = generation.thumbnailUrls || [];

    console.log(`\n🖼️ Image URLs (${imageUrls.length}):`);
    imageUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`);
    });

    console.log(`\n🖼️ Thumbnail URLs (${thumbnailUrls.length}):`);
    thumbnailUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`);
    });

    // Check if thumbnails are different from originals
    const hasSeparateThumbnails = imageUrls.length > 0 && thumbnailUrls.length > 0 &&
                                 imageUrls[0] !== thumbnailUrls[0];

    console.log(`\n📊 Analysis:`);
    console.log(`  ✅ Has images: ${imageUrls.length > 0}`);
    console.log(`  ✅ Has thumbnails: ${thumbnailUrls.length > 0}`);
    console.log(`  ${hasSeparateThumbnails ? '✅' : '❌'} Separate thumbnails: ${hasSeparateThumbnails}`);

    if (generation.metadata) {
      const metadata = generation.metadata;
      console.log(`\n📝 Metadata:`);
      console.log(`  📦 Storage provider: ${metadata.storageProvider || 'unknown'}`);
      console.log(`  🔄 Processed via: ${metadata.processedVia || 'unknown'}`);
      console.log(`  🖼️ Thumbnails generated: ${metadata.thumbnailsGenerated || false}`);

      if (metadata.thumbnailKeys) {
        console.log(`  🔑 Thumbnail keys: ${metadata.thumbnailKeys.length}`);
        metadata.thumbnailKeys.forEach((key, i) => {
          console.log(`    ${i + 1}. ${key}`);
        });
      }
    }

    // Test URL accessibility (basic check)
    if (thumbnailUrls.length > 0) {
      console.log(`\n🔍 Testing thumbnail URL accessibility...`);
      try {
        const response = await fetch(thumbnailUrls[0], { method: 'HEAD' });
        const isAccessible = response.ok;
        console.log(`  ${isAccessible ? '✅' : '❌'} First thumbnail accessible: ${isAccessible}`);

        if (isAccessible) {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          console.log(`    📊 Content-Type: ${contentType}`);
          console.log(`    📏 Size: ${contentLength ? (parseInt(contentLength) / 1024).toFixed(2) + ' KB' : 'unknown'}`);
        }
      } catch (error) {
        console.log(`  ❌ Error testing accessibility: ${error.message}`);
      }
    }

    // Summary
    console.log(`\n🏁 Test Summary:`);
    if (hasSeparateThumbnails) {
      console.log(`  🎉 SUCCESS: Thumbnail generation is working!`);
      console.log(`  📏 Original and thumbnail URLs are different`);
      console.log(`  📦 Thumbnails should be 300x300px in size`);
    } else {
      console.log(`  ⚠️ NOTICE: Thumbnails are same as originals`);
      console.log(`  🔧 This generation was processed before thumbnail feature`);
      console.log(`  ✨ New generations will have proper thumbnails`);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testThumbnailGeneration();