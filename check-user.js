const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    console.log('🔍 Checking user lucasamouraa@gmail.com...')
    
    const user = await prisma.user.findUnique({
      where: { email: 'lucasamouraa@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        plan: true,
        createdAt: true
      }
    })
    
    if (user) {
      console.log('✅ User found:')
      console.log('- ID:', user.id)
      console.log('- Email:', user.email)
      console.log('- Name:', user.name)
      console.log('- Plan:', user.plan)
      console.log('- Has password:', user.password ? 'Yes' : 'No')
      console.log('- Created:', user.createdAt)
    } else {
      console.log('❌ User not found')
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()