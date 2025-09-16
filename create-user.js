const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  try {
    console.log('👤 Creating user lucasmouraa@gmail.com...')
    
    // Hash password "123456"
    const password = await bcrypt.hash('123456', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'lucasmouraa@gmail.com',
        name: 'Lucas Moura',
        password: password,
        plan: 'PREMIUM',
        creditsLimit: 1000,
        creditsUsed: 0
      }
    })
    
    console.log('✅ User created successfully!')
    console.log('- Email: lucasmouraa@gmail.com')
    console.log('- Password: 123456')
    console.log('- Plan: PREMIUM')
    console.log('- ID:', user.id)
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ User already exists')
    } else {
      console.error('❌ Error creating user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createUser()