const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateFreeToStarter() {
  try {
    console.log('🔄 First, need to add STARTER to the enum and remove FREE...')
    
    // First, add STARTER to the enum if it doesn't exist
    try {
      await prisma.$executeRaw`ALTER TYPE "Plan" ADD VALUE 'STARTER'`
      console.log('✅ Added STARTER to Plan enum')
    } catch (error) {
      console.log('ℹ️ STARTER already exists in Plan enum or other issue:', error.message)
    }
    
    console.log('🔄 Migrating users from FREE to STARTER plan...')
    
    // Find all users with plan issues and update via ORM
    const freeUsers = await prisma.$queryRaw`SELECT id FROM "users" WHERE "plan"::text = 'FREE'`
    console.log(`Found ${freeUsers.length} users with FREE plan`)
    
    if (freeUsers.length > 0) {
      // Update each user individually using ORM
      for (const user of freeUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            plan: 'STARTER',
            creditsLimit: 50
          }
        })
      }
      console.log(`✅ Successfully migrated ${freeUsers.length} users from FREE to STARTER plan`)
    }
    
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateFreeToStarter()