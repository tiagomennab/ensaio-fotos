import { prisma } from '@/lib/prisma'
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
  return prisma.generation.create({
    data: {
      ...data,
      status: GenerationStatus.PENDING,
      imageUrls: [],
      thumbnailUrls: []
    },
    include: {
      model: {
        select: { id: true, name: true, class: true }
      }
    }
  })
}

export async function getGenerationsByUserId(
  userId: string, 
  page = 1, 
  limit = 20,
  modelId?: string
) {
  const skip = (page - 1) * limit
  const where = {
    userId,
    ...(modelId && { modelId })
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
  limit = 20
) {
  const skip = (page - 1) * limit
  const where = {
    userId,
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