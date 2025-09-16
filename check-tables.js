const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...')
    
    // Check if generations table exists and is accessible
    try {
      const generationsCount = await prisma.generation.count()
      console.log(`✅ Generations table: ${generationsCount} records`)
    } catch (error) {
      console.log('❌ Generations table error:', error.message)
    }
    
    // Check if ai_models table exists and is accessible
    try {
      const modelsCount = await prisma.aIModel.count()
      console.log(`✅ AI Models table: ${modelsCount} records`)
    } catch (error) {
      console.log('❌ AI Models table error:', error.message)
    }
    
    // Check if users table is accessible
    try {
      const usersCount = await prisma.user.count()
      console.log(`✅ Users table: ${usersCount} records`)
    } catch (error) {
      console.log('❌ Users table error:', error.message)
    }
    
  } catch (error) {
    console.error('❌ General error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()