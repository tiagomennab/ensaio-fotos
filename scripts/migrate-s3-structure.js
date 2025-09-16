#!/usr/bin/env node

/**
 * S3 Structure Migration Script
 *
 * Migrates existing S3 objects from legacy structure to standardized structure:
 * Legacy: images/{userId}/{id}.ext, videos/{userId}/{id}.ext, generated/{userId}/{genId}/...
 * New: generated/{userId}/{category}/uniqueFilename.ext
 *
 * This script is idempotent and can be safely run multiple times.
 */

const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// Migration statistics
const stats = {
  totalObjects: 0,
  migratedObjects: 0,
  skippedObjects: 0,
  failedObjects: 0,
  databaseUpdates: 0,
  errors: []
};

/**
 * Generate unique filename for migration
 */
function generateUniqueFilename(originalFilename) {
  const extension = originalFilename.split('.').pop();
  const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `${uuid}_${timestamp}.${extension}`;
}

/**
 * Build new standardized S3 key
 */
function buildS3Key(userId, category, filename) {
  return `generated/${userId}/${category}/${filename}`;
}

/**
 * Determine category from legacy key
 */
function determineCategoryFromLegacyKey(key) {
  if (key.startsWith('images/') || key.includes('/image') || key.includes('generated/')) {
    return 'images';
  } else if (key.startsWith('videos/') || key.includes('/video')) {
    return 'videos';
  } else if (key.includes('thumb') || key.includes('thumbnail')) {
    return 'thumbnails';
  } else if (key.includes('edited')) {
    return 'edited';
  } else if (key.includes('upscaled')) {
    return 'upscaled';
  }

  // Default to images if uncertain
  return 'images';
}

/**
 * Extract userId from legacy key
 */
function extractUserIdFromKey(key) {
  const parts = key.split('/');

  // Legacy patterns:
  // images/{userId}/filename.ext
  // videos/{userId}/filename.ext
  // generated/{userId}/genId/filename.ext

  if (parts.length >= 2) {
    if (parts[0] === 'images' || parts[0] === 'videos') {
      return parts[1];
    } else if (parts[0] === 'generated' && parts.length >= 3) {
      return parts[1];
    }
  }

  return null;
}

/**
 * Check if key is already in new standardized format
 */
function isStandardizedKey(key) {
  const parts = key.split('/');
  if (parts.length !== 4) return false;

  const [prefix, userId, category, filename] = parts;

  return prefix === 'generated' &&
         ['images', 'videos', 'edited', 'upscaled', 'thumbnails'].includes(category) &&
         userId && filename;
}

/**
 * List all objects in S3 bucket
 */
async function listAllS3Objects() {
  const objects = [];
  let continuationToken = null;

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken
    });

    const response = await s3Client.send(command);

    if (response.Contents) {
      objects.push(...response.Contents);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

/**
 * Copy S3 object to new location
 */
async function copyS3Object(oldKey, newKey) {
  const command = new CopyObjectCommand({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${encodeURIComponent(oldKey)}`,
    Key: newKey,
    MetadataDirective: 'COPY'
  });

  await s3Client.send(command);
}

/**
 * Delete old S3 object
 */
async function deleteS3Object(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  await s3Client.send(command);
}

/**
 * Update database URLs for a generation
 */
async function updateGenerationUrls(generationId, oldUrls, newUrls, thumbnailUrls = []) {
  try {
    const updateData = {
      imageUrls: newUrls,
      updatedAt: new Date()
    };

    if (thumbnailUrls.length > 0) {
      updateData.thumbnailUrls = thumbnailUrls;
    }

    await prisma.generation.update({
      where: { id: generationId },
      data: updateData
    });

    stats.databaseUpdates++;
    console.log(`  ✅ Updated database for generation ${generationId}`);
  } catch (error) {
    console.error(`  ❌ Failed to update database for generation ${generationId}:`, error.message);
    stats.errors.push(`Database update failed for generation ${generationId}: ${error.message}`);
  }
}

/**
 * Find generation by legacy URL patterns
 */
async function findGenerationByUrl(url) {
  try {
    // Try to find generation containing this URL in imageUrls or thumbnailUrls
    const generation = await prisma.generation.findFirst({
      where: {
        OR: [
          {
            imageUrls: {
              path: '$',
              array_contains: [url]
            }
          },
          {
            thumbnailUrls: {
              path: '$',
              array_contains: [url]
            }
          }
        ]
      }
    });

    return generation;
  } catch (error) {
    // If array_contains doesn't work, try string search
    const generations = await prisma.generation.findMany({
      where: {
        OR: [
          {
            imageUrls: {
              path: '$',
              string_contains: url
            }
          },
          {
            thumbnailUrls: {
              path: '$',
              string_contains: url
            }
          }
        ]
      }
    });

    return generations.find(gen =>
      (gen.imageUrls && gen.imageUrls.includes(url)) ||
      (gen.thumbnailUrls && gen.thumbnailUrls.includes(url))
    );
  }
}

/**
 * Migrate a single S3 object
 */
async function migrateSingleObject(s3Object) {
  const oldKey = s3Object.Key;

  console.log(`📋 Processing: ${oldKey}`);

  // Skip if already in standardized format
  if (isStandardizedKey(oldKey)) {
    console.log(`  ⏭️  Already standardized, skipping`);
    stats.skippedObjects++;
    return;
  }

  // Extract metadata from legacy key
  const userId = extractUserIdFromKey(oldKey);
  if (!userId) {
    console.log(`  ⚠️  Could not extract userId, skipping`);
    stats.skippedObjects++;
    return;
  }

  const category = determineCategoryFromLegacyKey(oldKey);
  const originalFilename = oldKey.split('/').pop();
  const newFilename = generateUniqueFilename(originalFilename);
  const newKey = buildS3Key(userId, category, newFilename);

  try {
    // Copy object to new location
    console.log(`  🔄 Copying to: ${newKey}`);
    await copyS3Object(oldKey, newKey);

    // Build new URL
    const newUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${newKey}`;
    const oldUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${oldKey}`;

    // Update database if this is a generation-related object
    const generation = await findGenerationByUrl(oldUrl);
    if (generation) {
      console.log(`  📝 Found related generation: ${generation.id}`);

      // Update URLs in database
      let newImageUrls = [...(generation.imageUrls || [])];
      let newThumbnailUrls = [...(generation.thumbnailUrls || [])];

      if (category === 'thumbnails') {
        newThumbnailUrls = newThumbnailUrls.map(url => url === oldUrl ? newUrl : url);
      } else {
        newImageUrls = newImageUrls.map(url => url === oldUrl ? newUrl : url);
      }

      await updateGenerationUrls(generation.id, generation.imageUrls, newImageUrls, newThumbnailUrls);
    }

    // Delete old object after successful migration
    console.log(`  🗑️  Deleting old object: ${oldKey}`);
    await deleteS3Object(oldKey);

    stats.migratedObjects++;
    console.log(`  ✅ Successfully migrated: ${oldKey} → ${newKey}`);

  } catch (error) {
    console.error(`  ❌ Failed to migrate ${oldKey}:`, error.message);
    stats.failedObjects++;
    stats.errors.push(`Migration failed for ${oldKey}: ${error.message}`);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting S3 Structure Migration');
  console.log('=====================================\n');

  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is required');
  }

  try {
    // List all S3 objects
    console.log('📋 Listing all S3 objects...');
    const s3Objects = await listAllS3Objects();
    stats.totalObjects = s3Objects.length;

    console.log(`📊 Found ${stats.totalObjects} objects to process\n`);

    // Process each object
    for (let i = 0; i < s3Objects.length; i++) {
      const s3Object = s3Objects[i];
      console.log(`\n[${i + 1}/${s3Objects.length}] Processing object:`);

      await migrateSingleObject(s3Object);

      // Small delay to avoid overwhelming S3
      if (i % 10 === 0 && i > 0) {
        console.log(`\n⏸️  Brief pause after ${i + 1} objects...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    stats.errors.push(`Global error: ${error.message}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n🎯 MIGRATION SUMMARY');
  console.log('====================');
  console.log(`📊 Total objects: ${stats.totalObjects}`);
  console.log(`✅ Migrated: ${stats.migratedObjects}`);
  console.log(`⏭️  Skipped: ${stats.skippedObjects}`);
  console.log(`❌ Failed: ${stats.failedObjects}`);
  console.log(`📝 Database updates: ${stats.databaseUpdates}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  ERRORS (${stats.errors.length}):`);
    stats.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  console.log('\n🎉 Migration completed!');
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => {
      printSummary();
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 FATAL ERROR:', error);
      printSummary();
      process.exit(1);
    });
}

module.exports = {
  runMigration,
  migrateSingleObject,
  isStandardizedKey,
  buildS3Key,
  determineCategoryFromLegacyKey,
  extractUserIdFromKey
};