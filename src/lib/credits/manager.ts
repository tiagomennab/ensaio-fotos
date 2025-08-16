import { prisma } from '@/lib/db'
import { UserPlan } from '@prisma/client'

export interface CreditLimits {
  daily: number
  monthly: number
  training: number
  generation: number
  storage: number // GB
}

export interface CreditUsage {
  today: number
  thisMonth: number
  totalTraining: number
  totalGeneration: number
  remaining: number
}

export const PLAN_LIMITS: Record<UserPlan, CreditLimits> = {
  FREE: {
    daily: 10,
    monthly: 100,
    training: 1, // 1 model training per month
    generation: 50, // 50 generations per month
    storage: 1 // 1GB storage
  },
  PREMIUM: {
    daily: 100,
    monthly: 1000,
    training: 5, // 5 model trainings per month
    generation: 500, // 500 generations per month
    storage: 10 // 10GB storage
  },
  GOLD: {
    daily: 500,
    monthly: 5000,
    training: 20, // 20 model trainings per month
    generation: 2000, // 2000 generations per month
    storage: 50 // 50GB storage
  }
}

export class CreditManager {
  static async getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })
    
    return user?.credits || 0
  }

  static async getUserUsage(userId: string): Promise<CreditUsage> {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get transactions for usage calculation
    const [todayTransactions, monthTransactions, allTransactions, user] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: {
          userId,
          type: 'DEBIT',
          createdAt: { gte: startOfDay }
        }
      }),
      prisma.creditTransaction.findMany({
        where: {
          userId,
          type: 'DEBIT',
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.creditTransaction.findMany({
        where: {
          userId,
          type: 'DEBIT'
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })
    ])

    return {
      today: todayTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      thisMonth: monthTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalTraining: allTransactions
        .filter(tx => tx.description.includes('training'))
        .reduce((sum, tx) => sum + tx.amount, 0),
      totalGeneration: allTransactions
        .filter(tx => tx.description.includes('generation'))
        .reduce((sum, tx) => sum + tx.amount, 0),
      remaining: user?.credits || 0
    }
  }

  static async canUserAfford(
    userId: string, 
    amount: number, 
    userPlan: UserPlan
  ): Promise<{ canAfford: boolean; reason?: string }> {
    const [currentCredits, usage] = await Promise.all([
      this.getUserCredits(userId),
      this.getUserUsage(userId)
    ])

    // Check if user has enough credits
    if (currentCredits < amount) {
      return {
        canAfford: false,
        reason: `Insufficient credits. Need ${amount}, have ${currentCredits}`
      }
    }

    const limits = PLAN_LIMITS[userPlan]

    // Check daily limit
    if (usage.today + amount > limits.daily) {
      return {
        canAfford: false,
        reason: `Daily limit exceeded. Would use ${usage.today + amount}/${limits.daily} credits`
      }
    }

    // Check monthly limit
    if (usage.thisMonth + amount > limits.monthly) {
      return {
        canAfford: false,
        reason: `Monthly limit exceeded. Would use ${usage.thisMonth + amount}/${limits.monthly} credits`
      }
    }

    return { canAfford: true }
  }

  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: {
      modelId?: string
      generationId?: string
      type?: 'TRAINING' | 'GENERATION' | 'STORAGE' | 'OTHER'
    }
  ): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        // Deduct credits
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              decrement: amount
            }
          }
        })

        // Log transaction
        await tx.creditTransaction.create({
          data: {
            userId,
            type: 'DEBIT',
            amount,
            description,
            modelId: metadata?.modelId,
            generationId: metadata?.generationId
          }
        })
      })

      return true
    } catch (error) {
      console.error('Failed to deduct credits:', error)
      return false
    }
  }

  static async addCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: {
      modelId?: string
      generationId?: string
      subscriptionId?: string
    }
  ): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        // Add credits
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: amount
            }
          }
        })

        // Log transaction
        await tx.creditTransaction.create({
          data: {
            userId,
            type: 'CREDIT',
            amount,
            description,
            modelId: metadata?.modelId,
            generationId: metadata?.generationId
          }
        })
      })

      return true
    } catch (error) {
      console.error('Failed to add credits:', error)
      return false
    }
  }

  static async getMonthlyAllowance(userPlan: UserPlan): Promise<number> {
    return PLAN_LIMITS[userPlan].monthly
  }

  static async resetMonthlyCredits(): Promise<void> {
    // This function should be called monthly (via cron job)
    const users = await prisma.user.findMany({
      where: {
        plan: {
          in: ['PREMIUM', 'GOLD']
        }
      }
    })

    for (const user of users) {
      const monthlyAllowance = PLAN_LIMITS[user.plan].monthly
      
      await this.addCredits(
        user.id,
        monthlyAllowance,
        `Monthly credit allowance: ${user.plan} plan`
      )
    }
  }

  static async getUserStorageUsage(userId: string): Promise<{
    used: number // in bytes
    limit: number // in bytes
    percentage: number
  }> {
    // Calculate storage usage from uploaded files
    const [facePhotos, bodyPhotos, generations] = await Promise.all([
      prisma.trainingPhoto.findMany({
        where: {
          model: {
            userId
          }
        },
        select: { fileSize: true }
      }),
      prisma.trainingPhoto.findMany({
        where: {
          model: {
            userId
          }
        },
        select: { fileSize: true }
      }),
      prisma.generation.findMany({
        where: { userId },
        select: { imageUrls: true }
      })
    ])

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    })

    const totalSize = [
      ...facePhotos,
      ...bodyPhotos
    ].reduce((sum, photo) => sum + (photo.fileSize || 0), 0)

    // Estimate generated images size (assume 1MB per image)
    const generatedImagesSize = generations.reduce(
      (sum, gen) => sum + (gen.imageUrls.length * 1024 * 1024), 0
    )

    const used = totalSize + generatedImagesSize
    const limitGB = PLAN_LIMITS[user?.plan || 'FREE'].storage
    const limit = limitGB * 1024 * 1024 * 1024 // Convert GB to bytes
    const percentage = Math.round((used / limit) * 100)

    return {
      used,
      limit,
      percentage: Math.min(percentage, 100)
    }
  }

  static formatCredits(amount: number): string {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`
    }
    return amount.toString()
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
}