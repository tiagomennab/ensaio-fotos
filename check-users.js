require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true, name: true }
    })
    
    console.log('Available users:')
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`)
    })
    
    if (users.length > 0) {
      console.log('\nFirst user ID for testing:', users[0].id)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()