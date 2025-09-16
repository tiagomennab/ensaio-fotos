const { PrismaClient } = require('@prisma/client')
const { processAndStoreReplicateImages } = require('../src/lib/services/auto-image-storage')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function findBrokenGenerations() {
  console.log('🔍 Finding generations with broken images...')
  
  // Find generations that might have expired URLs
  const generations = await prisma.generation.findMany({
    where: {
      status: 'COMPLETED',
      imageUrls: {
        isEmpty: false
      },
      // Find generations from the last 30 days that might have expired URLs
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    select: {
      id: true,
      imageUrls: true,
      userId: true,
      createdAt: true,
      metadata: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 Found ${generations.length} completed generations to check`)
  
  const brokenGenerations = []
  
  for (const generation of generations) {
    if (!generation.imageUrls || generation.imageUrls.length === 0) continue
    
    const imageUrls = Array.isArray(generation.imageUrls) ? generation.imageUrls : [generation.imageUrls]
    let hasBrokenImages = false
    
    // Check if images contain replicate.delivery URLs (temporary) or are inaccessible
    for (const url of imageUrls) {
      if (typeof url === 'string') {
        // Check if it's a temporary Replicate URL
        if (url.includes('replicate.delivery') || url.includes('replicate.com/api/models')) {
          hasBrokenImages = true
          break
        }
        
        // Check if the image is accessible
        try {
          const response = await fetch(url, { method: 'HEAD', timeout: 5000 })
          if (!response.ok) {
            hasBrokenImages = true
            break
          }
        } catch (error) {
          hasBrokenImages = true
          break
        }
      }
    }
    
    if (hasBrokenImages) {
      brokenGenerations.push({
        ...generation,
        imageUrls: imageUrls
      })
    }
  }
  
  console.log(`❌ Found ${brokenGenerations.length} generations with broken images`)
  return brokenGenerations
}

async function fixBrokenGeneration(generation) {
  console.log(`🔧 Fixing generation ${generation.id}...`)
  
  try {
    const imageUrls = generation.imageUrls.filter(url => typeof url === 'string')
    
    // Check if we have original URLs in metadata
    let urlsToProcess = imageUrls
    if (generation.metadata && generation.metadata.originalUrls) {
      urlsToProcess = generation.metadata.originalUrls
      console.log(`📋 Using original URLs from metadata: ${urlsToProcess.length}`)
    }
    
    // Skip if URLs are not Replicate URLs (might be permanent already)
    const replicateUrls = urlsToProcess.filter(url => 
      url.includes('replicate.delivery') || url.includes('replicate.com')
    )
    
    if (replicateUrls.length === 0) {
      console.log(`⚠️ No Replicate URLs found for generation ${generation.id}, skipping`)
      return false
    }
    
    console.log(`📥 Processing ${replicateUrls.length} Replicate URLs...`)
    
    // Process images through auto-storage
    const results = await processAndStoreReplicateImages(replicateUrls, generation.id)
    
    if (results.length > 0) {
      const permanentUrls = results.map(r => r.url)
      
      // Update generation with new permanent URLs
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          imageUrls: permanentUrls,
          thumbnailUrls: permanentUrls,
          metadata: {
            ...generation.metadata,
            fixedAt: new Date().toISOString(),
            originalUrls: replicateUrls,
            s3Keys: results.map(r => r.key)
          }
        }
      })
      
      console.log(`✅ Fixed generation ${generation.id} with ${permanentUrls.length} permanent URLs`)
      return true
    } else {
      console.log(`❌ Failed to process any images for generation ${generation.id}`)
      return false
    }
    
  } catch (error) {
    console.error(`❌ Error fixing generation ${generation.id}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Broken Images Fix Script')
  console.log('====================================\n')
  
  try {
    // Find broken generations
    const brokenGenerations = await findBrokenGenerations()
    
    if (brokenGenerations.length === 0) {
      console.log('✅ No broken generations found!')
      return
    }
    
    console.log(`\n📋 Broken generations summary:`)
    brokenGenerations.forEach((gen, index) => {
      console.log(`   ${index + 1}. ${gen.id} (${gen.createdAt.toISOString()}) - ${gen.imageUrls.length} images`)
    })
    
    console.log(`\n🔧 Starting fixes...`)
    
    let fixedCount = 0
    let failedCount = 0
    
    for (let i = 0; i < brokenGenerations.length; i++) {
      const generation = brokenGenerations[i]
      console.log(`\n[${i + 1}/${brokenGenerations.length}] Processing generation ${generation.id}`)
      
      const success = await fixBrokenGeneration(generation)
      
      if (success) {
        fixedCount++
      } else {
        failedCount++
      }
      
      // Add a small delay to avoid overwhelming the API
      if (i < brokenGenerations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log('\n🎉 Fix process completed!')
    console.log(`📊 Results:`)
    console.log(`   ✅ Fixed: ${fixedCount}`)
    console.log(`   ❌ Failed: ${failedCount}`)
    console.log(`   📋 Total: ${brokenGenerations.length}`)
    
  } catch (error) {
    console.error('❌ Script failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function testSingleGeneration(generationId) {
  console.log(`🧪 Testing single generation: ${generationId}`)
  
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      select: {
        id: true,
        imageUrls: true,
        userId: true,
        createdAt: true,
        metadata: true
      }
    })
    
    if (!generation) {
      console.log('❌ Generation not found')
      return
    }
    
    console.log(`📋 Generation details:`)
    console.log(`   ID: ${generation.id}`)
    console.log(`   Created: ${generation.createdAt.toISOString()}`)
    console.log(`   Images: ${generation.imageUrls?.length || 0}`)
    
    const success = await fixBrokenGeneration(generation)
    console.log(success ? '✅ Fix successful' : '❌ Fix failed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length > 0 && args[0] === '--test') {
    if (args[1]) {
      testSingleGeneration(args[1])
    } else {
      console.log('❌ Usage: node fix-broken-images.js --test <generation-id>')
    }
  } else {
    main()
  }
}

module.exports = {
  findBrokenGenerations,
  fixBrokenGeneration
}