require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkModels() {
  try {
    const models = await prisma.aIModel.findMany({
      take: 5,
      select: { id: true, name: true, status: true }
    })
    
    console.log('Available models:')
    models.forEach(model => {
      console.log(`ID: ${model.id}, Name: ${model.name}, Status: ${model.status}`)
    })
    
    if (models.length > 0) {
      console.log('\nFirst model ID for testing:', models[0].id)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkModels()