const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    console.log('🔄 Resetting password for lucasamouraa@gmail.com...')
    
    // Hash new password "123456"
    const newPassword = await bcrypt.hash('123456', 12)
    
    const user = await prisma.user.update({
      where: { email: 'lucasamouraa@gmail.com' },
      data: { password: newPassword }
    })
    
    console.log('✅ Password reset successfully!')
    console.log('- Email: lucasamouraa@gmail.com')
    console.log('- New password: 123456')
    console.log('- User name:', user.name)
    console.log('- Plan:', user.plan)
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()