import { prisma } from '@/lib/db'
import { Plan } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function createUser(data: {
  email: string
  password?: string
  name?: string
  avatar?: string
  plan?: Plan
}) {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      creditsLimit: getCreditsLimitForPlan(data.plan || Plan.STARTER)
    }
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      models: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      generations: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      models: {
        orderBy: { createdAt: 'desc' }
      },
      generations: {
        orderBy: { createdAt: 'desc' }
      },
      collections: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}

export async function updateUserPlan(userId: string, plan: Plan) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      creditsLimit: getCreditsLimitForPlan(plan),
      creditsUsed: 0 // Reset credits when upgrading
    }
  })
}

export async function updateUserCredits(userId: string, creditsUsed: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      creditsUsed: {
        increment: creditsUsed
      }
    }
  })
}

export async function canUserUseCredits(userId: string, creditsNeeded: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsUsed: true, creditsLimit: true }
  })
  
  if (!user) return false
  
  return (user.creditsUsed + creditsNeeded) <= user.creditsLimit
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

function getCreditsLimitForPlan(plan: Plan): number {
  switch (plan) {
    case Plan.STARTER:
      return 50  // 50 créditos por mês
    case Plan.PREMIUM:
      return 200 // 200 créditos por mês
    case Plan.GOLD:
      return 1000 // 1000 créditos por mês
    default:
      return 50
  }
}

export function getModelsLimitForPlan(plan: Plan): number {
  switch (plan) {
    case Plan.STARTER:
      return 1   // 1 modelo por mês
    case Plan.PREMIUM:
      return 3   // 3 modelos por mês
    case Plan.GOLD:
      return 10  // 10 modelos por mês
    default:
      return 1
  }
}