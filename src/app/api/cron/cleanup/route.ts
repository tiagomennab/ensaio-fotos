import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/monitoring/logger'
import { RateLimiter } from '@/lib/security/rate-limiter'
import { prisma } from '@/lib/db'

// Cleanup cron job - runs daily at 2 AM
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await logger.info('Starting daily cleanup job')

    const cleanupResults = await Promise.allSettled([
      cleanupOldLogs(),
      cleanupOldRateLimitLogs(),
      cleanupOldSessions(),
      cleanupOldGenerations(),
      cleanupOrphanedFiles(),
      updateUserStatistics()
    ])

    const results = cleanupResults.map((result, index) => ({
      task: [
        'cleanup_old_logs',
        'cleanup_rate_limit_logs', 
        'cleanup_old_sessions',
        'cleanup_old_generations',
        'cleanup_orphaned_files',
        'update_user_statistics'
      ][index],
      status: result.status,
      error: result.status === 'rejected' ? result.reason?.message : null
    }))

    const failed = results.filter(r => r.status === 'rejected')
    const succeeded = results.filter(r => r.status === 'fulfilled')

    await logger.info('Daily cleanup job completed', {
      succeeded: succeeded.length,
      failed: failed.length,
      results
    })

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      results
    })

  } catch (error) {
    await logger.error('Daily cleanup job failed', error as Error)
    
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}

async function cleanupOldLogs(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const result = await prisma.systemLog.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo
      }
    }
  })

  await logger.info('Cleaned up old system logs', { deleted: result.count })
}

async function cleanupOldRateLimitLogs(): Promise<void> {
  await RateLimiter.cleanupOldLogs()
  await logger.info('Cleaned up old rate limit logs')
}

async function cleanupOldSessions(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: sevenDaysAgo
      }
    }
  })

  await logger.info('Cleaned up expired sessions', { deleted: result.count })
}

async function cleanupOldGenerations(): Promise<void> {
  // Delete failed generations older than 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const result = await prisma.generation.deleteMany({
    where: {
      status: 'FAILED',
      createdAt: {
        lt: sevenDaysAgo
      }
    }
  })

  await logger.info('Cleaned up old failed generations', { deleted: result.count })
}

async function cleanupOrphanedFiles(): Promise<void> {
  // Find training photos without associated models
  const orphanedPhotos = await prisma.trainingPhoto.findMany({
    where: {
      model: null
    },
    where: {
      createdAt: {
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day old
      }
    }
  })

  if (orphanedPhotos.length > 0) {
    // Delete orphaned photos from database
    const result = await prisma.trainingPhoto.deleteMany({
      where: {
        id: {
          in: orphanedPhotos.map(photo => photo.id)
        }
      }
    })

    await logger.info('Cleaned up orphaned training photos', { 
      deleted: result.count,
      photos: orphanedPhotos.map(p => p.url)
    })
  }
}

async function updateUserStatistics(): Promise<void> {
  // Update user statistics for analytics
  const users = await prisma.user.findMany({
    select: { id: true }
  })

  for (const user of users) {
    const [modelCount, generationCount, creditUsage] = await Promise.all([
      prisma.aIModel.count({ where: { userId: user.id } }),
      prisma.generation.count({ where: { userId: user.id } }),
      prisma.creditTransaction.aggregate({
        where: { userId: user.id, type: 'DEBIT' },
        _sum: { amount: true }
      })
    ])

    // Update user record with latest stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalModels: modelCount,
        totalGenerations: generationCount,
        totalCreditsUsed: creditUsage._sum.amount || 0
      }
    })
  }

  await logger.info('Updated user statistics', { users: users.length })
}