const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    console.log('🔄 Resetting password for lucasamouraa@gmail.com...')
    
    // Hash new password "123456"
    const newPassword = await bcrypt.hash('123456', 12)
    
    // Use raw SQL to update only the password field
    await prisma.$executeRaw`
      UPDATE users 
      SET password = ${newPassword}, "updatedAt" = NOW() 
      WHERE email = 'lucasamouraa@gmail.com'
    `
    
    console.log('✅ Password reset successfully!')
    console.log('- Email: lucasamouraa@gmail.com')
    console.log('- New password: 123456')
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()