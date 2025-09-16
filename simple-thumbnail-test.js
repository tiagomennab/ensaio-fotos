const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simpleTest() {
  try {
    const gen = await prisma.generation.findUnique({
      where: { id: 'cmfk39oi30003qj50eii1u70s' },
      select: {
        id: true,
        imageUrls: true,
        thumbnailUrls: true,
        metadata: true
      }
    });

    console.log('🖼️ Image URLs:', gen?.imageUrls);
    console.log('🖼️ Thumbnail URLs:', gen?.thumbnailUrls);

    if (gen?.metadata) {
      console.log('📝 Metadata thumbnailsGenerated:', gen.metadata.thumbnailsGenerated);
      console.log('📝 Metadata thumbnailKeys:', gen.metadata.thumbnailKeys);
    }

    const imageUrls = gen?.imageUrls || [];
    const thumbnailUrls = gen?.thumbnailUrls || [];
    const areDifferent = imageUrls.length > 0 && thumbnailUrls.length > 0 && imageUrls[0] != thumbnailUrls[0];

    console.log('📊 Analysis:');
    console.log('   Has images:', imageUrls.length > 0);
    console.log('   Has thumbnails:', thumbnailUrls.length > 0);
    console.log('   Are different:', areDifferent);

    if (areDifferent) {
      console.log('🎉 SUCCESS: Thumbnails are working!');
    } else {
      console.log('⚠️ NOTICE: This generation uses same URLs for images and thumbnails');
      console.log('✨ New generations will have proper thumbnails');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();