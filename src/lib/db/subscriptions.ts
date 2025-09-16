import { prisma } from '@/lib/db'
import { Plan } from '@prisma/client'

export async function createSubscription(data: {
  userId: string
  asaasCustomerId: string
  asaasSubscriptionId: string
  plan: Plan
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd?: boolean
}) {
  return prisma.user.update({
    where: { id: data.userId },
    data: {
      plan: data.plan,
      subscriptionId: data.asaasSubscriptionId,
      subscriptionStatus: data.status,
      subscriptionEndsAt: data.currentPeriodEnd,
      creditsLimit: getCreditsLimitForPlan(data.plan),
      creditsUsed: 0 // Reset credits on new subscription
    }
  })
}

export async function updateSubscriptionStatus(
  userId: string,
  status: string,
  currentPeriodEnd?: Date
) {
  const updateData: any = {
    subscriptionStatus: status
  }

  if (currentPeriodEnd) {
    updateData.subscriptionEndsAt = currentPeriodEnd
  }

  // If subscription is cancelled or expired, downgrade to FREE
  if (['CANCELLED', 'EXPIRED', 'OVERDUE'].includes(status)) {
    updateData.plan = Plan.STARTER
    updateData.creditsLimit = 500
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData
  })
}

export async function cancelSubscription(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'CANCELLED',
      plan: Plan.STARTER,
      creditsLimit: 500
    }
  })
}

export async function getSubscriptionByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      subscriptionId: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      creditsUsed: true,
      creditsLimit: true
    }
  })
}

export async function getUserByAsaasCustomerId(asaasCustomerId: string) {
  return prisma.user.findFirst({
    where: {
      // We'll store this in a custom field or use email mapping
      email: { contains: asaasCustomerId } // Temporary - better to add asaasCustomerId field
    }
  })
}

export async function updateUserAsaasCustomerId(userId: string, asaasCustomerId: string) {
  // We need to add this field to the User model
  return prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: asaasCustomerId // Reusing this field for now, rename later
    }
  })
}

function getCreditsLimitForPlan(plan: Plan): number {
  switch (plan) {
    case Plan.STARTER:
      return 500
    case Plan.PREMIUM:
      return 1200
    case Plan.GOLD:
      return 2500
    default:
      return 500
  }
}

// Usage logging for billing
export async function logUsage(data: {
  userId: string
  action: string
  creditsUsed: number
  details?: any
}) {
  return prisma.usageLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      creditsUsed: data.creditsUsed,
      details: data.details || {}
    }
  })
}

export async function getUsageStats(userId: string, startDate: Date, endDate: Date) {
  const logs = await prisma.usageLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const totalCredits = logs.reduce((sum, log) => sum + log.creditsUsed, 0)
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalCredits,
    actionCounts,
    logs: logs.slice(0, 100) // Last 100 activities
  }
}