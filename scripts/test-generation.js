/**
 * Generation Testing Script
 * 
 * This script helps test and debug the generation API
 * Usage: node scripts/test-generation.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testGeneration() {
  console.log('🧪 Testing Generation System...\n')

  try {
    // 1. Check environment configuration
    console.log('📋 Environment Check:')
    console.log(`- AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set'}`)
    console.log(`- REPLICATE_API_TOKEN: ${process.env.REPLICATE_API_TOKEN ? 'set' : 'not set'}`)
    console.log(`- NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'not set'}`)
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
    console.log()

    // 2. Test database connectivity
    console.log('🔍 Database Connectivity:')
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message)
      return
    }
    console.log()

    // 3. Find test user and model
    console.log('👤 Finding Test Data:')
    const user = await prisma.user.findFirst({
      where: {
        email: { not: null }
      },
      include: {
        models: {
          where: { status: 'READY' },
          take: 1
        }
      }
    })

    if (!user) {
      console.log('❌ No test user found')
      return
    }

    console.log(`✅ Test user found: ${user.email} (Plan: ${user.plan})`)
    console.log(`- Credits used: ${user.creditsUsed}/${user.creditsLimit}`)

    if (user.models.length === 0) {
      console.log('⚠️  No ready models found for user')
      
      // Show all models for this user
      const allModels = await prisma.aIModel.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, status: true, modelUrl: true }
      })
      
      console.log('Available models:')
      allModels.forEach(model => {
        console.log(`  - ${model.name}: ${model.status} (URL: ${model.modelUrl ? 'yes' : 'no'})`)
      })
      
      return
    }

    const model = user.models[0]
    console.log(`✅ Test model found: ${model.name} (Status: ${model.status})`)
    console.log(`- Model URL: ${model.modelUrl ? 'present' : 'missing'}`)
    console.log()

    // 4. Test Replicate API connectivity
    if (process.env.AI_PROVIDER === 'replicate' && process.env.REPLICATE_API_TOKEN) {
      console.log('🌐 Testing Replicate API:')
      try {
        const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell', {
          headers: {
            'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          console.log('✅ Replicate API accessible')
          const modelInfo = await response.json()
          console.log(`- Default FLUX model status: ${modelInfo.latest_version?.status || 'unknown'}`)
        } else {
          console.log(`❌ Replicate API error: ${response.status} ${response.statusText}`)
          const errorData = await response.json().catch(() => ({}))
          console.log('Error details:', errorData)
        }
      } catch (apiError) {
        console.log('❌ Replicate API connection failed:', apiError.message)
      }
      console.log()
    }

    // 5. Test model validation (if custom model exists)
    if (model.modelUrl && process.env.AI_PROVIDER === 'replicate') {
      console.log('🔍 Testing Model Validation:')
      try {
        const modelParts = model.modelUrl.split(':')
        if (modelParts.length === 2) {
          const [owner_name, version_id] = modelParts
          
          const response = await fetch(`https://api.replicate.com/v1/models/${owner_name}/versions/${version_id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const modelInfo = await response.json()
            console.log(`✅ Custom model accessible: ${model.modelUrl}`)
            console.log(`- Model status: ${modelInfo.status}`)
            console.log(`- Created: ${modelInfo.created_at}`)
          } else {
            console.log(`❌ Custom model validation failed: ${response.status}`)
            const errorData = await response.json().catch(() => ({}))
            console.log('Error details:', errorData)
          }
        } else {
          console.log(`❌ Invalid model URL format: ${model.modelUrl}`)
        }
      } catch (validationError) {
        console.log('❌ Model validation error:', validationError.message)
      }
      console.log()
    }

    // 6. Simulate generation request
    console.log('🎨 Simulating Generation Request:')
    const testPrompt = "professional headshot, business attire, clean background"
    console.log(`Test prompt: "${testPrompt}"`)
    
    // Show what the request would look like
    const generationRequest = {
      modelId: model.id,
      prompt: testPrompt,
      aspectRatio: '1:1',
      resolution: '512x512',
      variations: 1,
      strength: 0.8
    }
    console.log('Request parameters:', JSON.stringify(generationRequest, null, 2))

    // Check if user can use credits
    const canUseCredits = user.creditsUsed < user.creditsLimit
    console.log(`Can use credits: ${canUseCredits}`)
    console.log()

    // 7. Test AI provider initialization
    console.log('🤖 Testing AI Provider:')
    try {
      const { getAIProvider } = require('../src/lib/ai')
      const aiProvider = getAIProvider()
      console.log('✅ AI Provider initialized successfully')
      
      // Test available models
      const availableModels = await aiProvider.getAvailableModels()
      console.log(`✅ Available models: ${availableModels.length}`)
      availableModels.slice(0, 3).forEach(model => {
        console.log(`  - ${model.name}: ${model.description}`)
      })
    } catch (providerError) {
      console.log('❌ AI Provider initialization failed:', providerError.message)
    }

    console.log('\n🎯 Test Summary:')
    console.log('- Run this test after any configuration changes')
    console.log('- Check the console logs in your application for detailed error messages')
    console.log('- Use the debug endpoint: POST /api/debug/generation')
    console.log('- Monitor Replicate dashboard for API usage and errors')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testGeneration().catch(console.error)