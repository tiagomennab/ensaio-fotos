const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// S3 configuration from environment
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'ensaio-fotos-prod';
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';
const AWS_CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL;

/**
 * Convert S3 key to full URL
 */
function getPublicUrl(key) {
  // Use CloudFront URL if configured
  if (AWS_CLOUDFRONT_URL) {
    return `${AWS_CLOUDFRONT_URL}/${key}`;
  }

  // Standard S3 URL
  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Check if a string is an S3 key (not a full URL)
 */
function isS3Key(str) {
  return str &&
         typeof str === 'string' &&
         !str.startsWith('http') &&
         !str.startsWith('//') &&
         str.includes('/');
}

async function fixS3Urls() {
  try {
    console.log('🔍 Searching for generations with S3 keys instead of URLs...');

    // Find all generations that have imageUrls
    const generations = await prisma.generation.findMany({
      select: {
        id: true,
        imageUrls: true,
        thumbnailUrls: true,
        storageKeys: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${generations.length} generations to check`);

    let fixed = 0;
    let skipped = 0;

    for (const generation of generations) {
      const imageUrls = generation.imageUrls || [];
      const thumbnailUrls = generation.thumbnailUrls || [];

      // Check if any URLs need fixing
      const needsFixing = imageUrls.some(url => isS3Key(url)) ||
                         thumbnailUrls.some(url => isS3Key(url));

      if (!needsFixing) {
        skipped++;
        continue;
      }

      console.log(`🔧 Fixing generation ${generation.id}...`);
      console.log(`   Current imageUrls:`, imageUrls.slice(0, 2));

      // Convert S3 keys to full URLs
      const fixedImageUrls = imageUrls.map(url => {
        if (isS3Key(url)) {
          const fullUrl = getPublicUrl(url);
          console.log(`   ✅ ${url} → ${fullUrl}`);
          return fullUrl;
        }
        return url;
      });

      const fixedThumbnailUrls = thumbnailUrls.map(url => {
        if (isS3Key(url)) {
          return getPublicUrl(url);
        }
        return url;
      });

      // Update the generation
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          imageUrls: fixedImageUrls,
          thumbnailUrls: fixedThumbnailUrls
        }
      });

      fixed++;
      console.log(`   ✅ Fixed generation ${generation.id}`);
    }

    console.log(`\n🏁 Summary:`);
    console.log(`   ✅ Fixed: ${fixed} generations`);
    console.log(`   ⏭️ Skipped: ${skipped} generations (already correct)`);
    console.log(`   📊 Total checked: ${generations.length} generations`);

    if (fixed > 0) {
      console.log(`\n🎉 Successfully converted S3 keys to full URLs!`);
    } else {
      console.log(`\n✨ All generations already have correct URLs!`);
    }

  } catch (error) {
    console.error('❌ Error fixing S3 URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixS3Urls();