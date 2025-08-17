import { prisma } from '@/lib/db'
import { ModelClass, ModelStatus } from '@prisma/client'

export async function createAIModel(data: {
  name: string
  class: ModelClass
  userId: string
  facePhotos: any[]
  halfBodyPhotos: any[]
  fullBodyPhotos: any[]
}) {
  const totalPhotos = data.facePhotos.length + data.halfBodyPhotos.length + data.fullBodyPhotos.length
  
  return prisma.aIModel.create({
    data: {
      name: data.name,
      class: data.class,
      userId: data.userId,
      facePhotos: data.facePhotos,
      halfBodyPhotos: data.halfBodyPhotos,
      fullBodyPhotos: data.fullBodyPhotos,
      totalPhotos,
      status: ModelStatus.UPLOADING
    }
  })
}

export async function getModelsByUserId(userId: string) {
  return prisma.aIModel.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      generations: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })
}

export async function getModelById(id: string, userId?: string) {
  const where = userId ? { id, userId } : { id }
  
  return prisma.aIModel.findUnique({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      generations: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function updateModelStatus(
  modelId: string, 
  status: ModelStatus, 
  progress?: number,
  errorMessage?: string
) {
  return prisma.aIModel.update({
    where: { id: modelId },
    data: {
      status,
      progress: progress ?? undefined,
      errorMessage,
      trainedAt: status === ModelStatus.READY ? new Date() : undefined
    }
  })
}

export async function updateModelProgress(modelId: string, progress: number, estimatedTime?: number) {
  return prisma.aIModel.update({
    where: { id: modelId },
    data: {
      progress,
      estimatedTime
    }
  })
}

export async function deleteModel(modelId: string, userId: string) {
  // Soft delete by updating status
  return prisma.aIModel.update({
    where: { 
      id: modelId,
      userId // Ensure user owns the model
    },
    data: {
      status: ModelStatus.DELETED
    }
  })
}

export async function getReadyModelsByUserId(userId: string) {
  return prisma.aIModel.findMany({
    where: {
      userId,
      status: ModelStatus.READY
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      class: true,
      createdAt: true,
      sampleImages: true,
      qualityScore: true
    }
  })
}

export async function canUserCreateModel(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      plan: true,
      models: {
        where: {
          status: { not: ModelStatus.DELETED }
        }
      }
    }
  })
  
  if (!user) return false
  
  const modelCount = user.models.length
  
  switch (user.plan) {
    case 'FREE':
      return modelCount < 1
    case 'PREMIUM':
      return modelCount < 3
    case 'GOLD':
      return true // unlimited
    default:
      return false
  }
}

export async function getModelStats(modelId: string) {
  const generations = await prisma.generation.count({
    where: { modelId }
  })
  
  const averageProcessingTime = await prisma.generation.aggregate({
    where: { 
      modelId,
      processingTime: { not: null }
    },
    _avg: {
      processingTime: true
    }
  })
  
  return {
    totalGenerations: generations,
    averageProcessingTime: averageProcessingTime._avg.processingTime || 0
  }
}