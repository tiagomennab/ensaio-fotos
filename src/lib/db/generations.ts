import { prisma } from '@/lib/db'
import { GenerationStatus } from '@prisma/client'

export async function createGeneration(data: {
  userId: string
  modelId: string
  prompt: string
  negativePrompt?: string
  aspectRatio?: string
  resolution?: string
  variations?: number
  strength?: number
  seed?: number
  style?: string
}) {
  // Calculate credits needed (10 credits per image, variations determines how many images)
  const creditsNeeded = (data.variations || 1) * 10

  // Start transaction to ensure atomicity
  return prisma.$transaction(async (tx) => {
    // Check if user has enough credits (simplified version without creditsBalance)
    const user = await tx.user.findUnique({
      where: { id: data.userId },
      select: { creditsUsed: true, creditsLimit: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const availableCredits = user.creditsLimit - user.creditsUsed
    if (availableCredits < creditsNeeded) {
      throw new Error(`Insufficient credits. Need ${creditsNeeded} credits but only have ${availableCredits} available.`)
    }

    // Deduct credits from user (simple version - just increment creditsUsed)
    await tx.user.update({
      where: { id: data.userId },
      data: {
        creditsUsed: { increment: creditsNeeded }
      }
    })

    // Create the generation
    return tx.generation.create({
      data: {
        ...data,
        status: GenerationStatus.PENDING,
        imageUrls: [],
        thumbnailUrls: [],
        estimatedCost: creditsNeeded
      },
      include: {
        model: {
          select: { id: true, name: true, class: true }
        }
      }
    })
  })
}

export async function getGenerationsByUserId(
  userId: string,
  page = 1,
  limit = 20,
  modelId?: string,
  status?: string
) {
  const skip = (page - 1) * limit
  const where = {
    userId,
    ...(modelId && { modelId }),
    ...(status && { status })
  }
  
  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        model: {
          select: { id: true, name: true, class: true }
        }
      }
    }),
    prisma.generation.count({ where })
  ])
  
  return {
    generations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

export async function getGenerationById(id: string, userId?: string) {
  const where = userId ? { id, userId } : { id }
  
  return prisma.generation.findUnique({
    where,
    include: {
      model: {
        select: { id: true, name: true, class: true }
      },
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

export async function updateGenerationStatus(
  generationId: string,
  status: GenerationStatus,
  imageUrls?: string[],
  thumbnailUrls?: string[],
  errorMessage?: string,
  processingTime?: number
) {
  return prisma.generation.update({
    where: { id: generationId },
    data: {
      status,
      imageUrls: imageUrls ?? undefined,
      thumbnailUrls: thumbnailUrls ?? undefined,
      errorMessage,
      processingTime,
      completedAt: status === GenerationStatus.COMPLETED ? new Date() : undefined
    }
  })
}

export async function deleteGeneration(generationId: string, userId: string) {
  return prisma.generation.delete({
    where: {
      id: generationId,
      userId // Ensure user owns the generation
    }
  })
}

export async function getRecentGenerations(userId: string, limit = 5) {
  return prisma.generation.findMany({
    where: {
      userId,
      status: GenerationStatus.COMPLETED
    },
    take: limit,
    orderBy: { completedAt: 'desc' },
    include: {
      model: {
        select: { id: true, name: true, class: true }
      }
    }
  })
}

export async function getGenerationStats(userId: string) {
  const [total, completed, failed, pending] = await Promise.all([
    prisma.generation.count({
      where: { userId }
    }),
    prisma.generation.count({
      where: { userId, status: GenerationStatus.COMPLETED }
    }),
    prisma.generation.count({
      where: { userId, status: GenerationStatus.FAILED }
    }),
    prisma.generation.count({
      where: { 
        userId, 
        status: { in: [GenerationStatus.PENDING, GenerationStatus.PROCESSING] }
      }
    })
  ])
  
  const averageProcessingTime = await prisma.generation.aggregate({
    where: {
      userId,
      processingTime: { not: null }
    },
    _avg: {
      processingTime: true
    }
  })
  
  return {
    total,
    completed,
    failed,
    pending,
    averageProcessingTime: averageProcessingTime._avg.processingTime || 0
  }
}

export async function searchGenerations(
  userId: string,
  query: string,
  page = 1,
  limit = 20,
  status?: string
) {
  const skip = (page - 1) * limit
  const where = {
    userId,
    ...(status && { status }),
    OR: [
      { prompt: { contains: query, mode: 'insensitive' as const } },
      { model: { name: { contains: query, mode: 'insensitive' as const } } }
    ]
  }
  
  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        model: {
          select: { id: true, name: true, class: true }
        }
      }
    }),
    prisma.generation.count({ where })
  ])
  
  return {
    generations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}