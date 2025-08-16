import { prisma } from '@/lib/db'

export interface AnalyticsEvent {
  userId: string
  event: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface UserAnalytics {
  totalModels: number
  totalGenerations: number
  totalCreditsUsed: number
  averageGenerationTime: number
  mostUsedModel: string | null
  favoriteStyle: string | null
  joinDate: Date
  lastActivity: Date
  planUpgrades: number
}

export interface SystemAnalytics {
  totalUsers: number
  activeUsers: number
  totalModels: number
  totalGenerations: number
  successRate: number
  averageProcessingTime: number
  popularModels: Array<{ name: string; usage: number }>
  revenueMetrics: {
    mrr: number // Monthly Recurring Revenue
    totalRevenue: number
    conversionRate: number
  }
}

export class AnalyticsTracker {
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          event: event.event,
          properties: event.properties || {},
          timestamp: event.timestamp || new Date()
        }
      })
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  static async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const [
      user,
      models,
      generations,
      creditTransactions,
      subscriptions
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.aIModel.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              generations: true
            }
          }
        }
      }),
      prisma.generation.findMany({
        where: { userId },
        select: {
          id: true,
          style: true,
          processingTime: true,
          createdAt: true,
          status: true,
          model: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.creditTransaction.findMany({
        where: {
          userId,
          type: 'DEBIT'
        },
        select: {
          amount: true
        }
      }),
      prisma.subscription.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      })
    ])

    const totalCreditsUsed = creditTransactions.reduce(
      (sum, tx) => sum + tx.amount, 0
    )

    const completedGenerations = generations.filter(g => g.status === 'COMPLETED')
    const averageGenerationTime = completedGenerations.length > 0
      ? completedGenerations.reduce((sum, g) => sum + (g.processingTime || 0), 0) / completedGenerations.length
      : 0

    // Find most used model
    const modelUsage = models.reduce((acc, model) => {
      acc[model.name] = model._count.generations
      return acc
    }, {} as Record<string, number>)

    const mostUsedModel = Object.keys(modelUsage).length > 0
      ? Object.keys(modelUsage).reduce((a, b) => modelUsage[a] > modelUsage[b] ? a : b)
      : null

    // Find favorite style
    const styleUsage = generations.reduce((acc, gen) => {
      const style = gen.style || 'default'
      acc[style] = (acc[style] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteStyle = Object.keys(styleUsage).length > 0
      ? Object.keys(styleUsage).reduce((a, b) => styleUsage[a] > styleUsage[b] ? a : b)
      : null

    return {
      totalModels: models.length,
      totalGenerations: generations.length,
      totalCreditsUsed,
      averageGenerationTime: Math.round(averageGenerationTime),
      mostUsedModel,
      favoriteStyle,
      joinDate: user?.createdAt || new Date(),
      lastActivity: user?.updatedAt || new Date(),
      planUpgrades: subscriptions
    }
  }

  static async getSystemAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<SystemAnalytics> {
    const end = endDate || new Date()
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    const [
      userStats,
      modelStats,
      generationStats,
      subscriptionStats
    ] = await Promise.all([
      prisma.user.aggregate({
        _count: true,
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.aIModel.aggregate({
        _count: true,
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.generation.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        select: {
          status: true,
          processingTime: true,
          model: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.subscription.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        select: {
          plan: true,
          amount: true
        }
      })
    ])

    // Calculate active users (users who generated images in the last 7 days)
    const activeUsersCount = await prisma.user.count({
      where: {
        generations: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    const totalUsers = await prisma.user.count()
    const totalModels = await prisma.aIModel.count()
    const totalGenerations = await prisma.generation.count()

    const successfulGenerations = generationStats.filter(g => g.status === 'COMPLETED')
    const successRate = generationStats.length > 0
      ? (successfulGenerations.length / generationStats.length) * 100
      : 0

    const averageProcessingTime = successfulGenerations.length > 0
      ? successfulGenerations.reduce((sum, g) => sum + (g.processingTime || 0), 0) / successfulGenerations.length
      : 0

    // Popular models
    const modelUsage = generationStats.reduce((acc, gen) => {
      if (gen.model?.name) {
        acc[gen.model.name] = (acc[gen.model.name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const popularModels = Object.entries(modelUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, usage]) => ({ name, usage }))

    // Revenue metrics
    const totalRevenue = subscriptionStats.reduce((sum, sub) => sum + sub.amount, 0)
    const mrr = subscriptionStats
      .filter(sub => sub.plan !== 'FREE')
      .reduce((sum, sub) => sum + sub.amount, 0)

    const conversionRate = totalUsers > 0
      ? (subscriptionStats.filter(sub => sub.plan !== 'FREE').length / totalUsers) * 100
      : 0

    return {
      totalUsers,
      activeUsers: activeUsersCount,
      totalModels,
      totalGenerations,
      successRate: Math.round(successRate * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime),
      popularModels,
      revenueMetrics: {
        mrr,
        totalRevenue,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    }
  }

  static async trackUserAction(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: action,
      properties: {
        ...metadata,
        source: 'web_app'
      }
    })
  }

  static async getPopularPrompts(limit: number = 10): Promise<Array<{
    prompt: string
    usage: number
    averageRating?: number
  }>> {
    const generations = await prisma.generation.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        prompt: true
      }
    })

    const promptUsage = generations.reduce((acc, gen) => {
      const cleanPrompt = gen.prompt.replace(/TOK\d+/g, '[person]').trim()
      acc[cleanPrompt] = (acc[cleanPrompt] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(promptUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([prompt, usage]) => ({
        prompt,
        usage
      }))
  }

  static async getUserEngagement(userId: string): Promise<{
    daysActive: number
    streakDays: number
    totalSessions: number
    averageSessionTime: number
  }> {
    const events = await prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      select: {
        event: true,
        timestamp: true
      }
    })

    const uniqueDays = new Set(
      events.map(e => e.timestamp.toDateString())
    ).size

    // Calculate streak (consecutive days with activity)
    let streakDays = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const hasActivity = events.some(e => 
        e.timestamp.toDateString() === checkDate.toDateString()
      )
      
      if (hasActivity) {
        streakDays++
      } else if (i > 0) {
        break
      }
    }

    return {
      daysActive: uniqueDays,
      streakDays,
      totalSessions: events.filter(e => e.event === 'session_start').length,
      averageSessionTime: 0 // Would need session tracking to calculate this
    }
  }
}