import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/monitoring/logger'
import { prisma } from '@/lib/db'
import Replicate from 'replicate'
import { downloadAndStoreImages } from '@/lib/storage/utils'
import { broadcastGenerationStatusChange, broadcastModelStatusChange } from '@/lib/services/realtime-service'
import { scheduleAutoRecovery } from '@/lib/services/auto-recovery-service'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || ''
})

/**
 * Cron job automático para sincronizar jobs pendentes no Replicate
 * Roda a cada 10 segundos como fallback se webhooks falharem
 * 
 * Este endpoint:
 * 1. Busca jobs com status PROCESSING há mais de 1 minuto
 * 2. Verifica status no Replicate
 * 3. Atualiza banco de dados
 * 4. Envia atualizações via WebSocket
 * 5. Salva imagens permanentemente
 */
export async function GET(request: NextRequest) {
  try {
    // Verificação de segurança para cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await logger.info('🔄 Starting automatic job sync')

    const results = await Promise.allSettled([
      syncPendingGenerations(),
      syncPendingUpscales(),
      syncPendingTraining(),
      scheduleAutoRecovery() // Adiciona recuperação automática
    ])

    const stats = {
      generations: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason },
      upscales: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason },
      training: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason },
      autoRecovery: results[3].status === 'fulfilled' ? results[3].value : { error: results[3].reason },
      timestamp: new Date().toISOString()
    }

    await logger.info('✅ Automatic job sync completed', stats)

    return NextResponse.json({
      success: true,
      message: 'Job sync completed',
      stats
    })

  } catch (error) {
    await logger.error('❌ Automatic job sync failed', error as Error)
    return NextResponse.json(
      { error: 'Job sync failed' },
      { status: 500 }
    )
  }
}

/**
 * Sincroniza gerações de imagem pendentes
 */
async function syncPendingGenerations() {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  
  const pendingGenerations = await prisma.generation.findMany({
    where: {
      status: 'PROCESSING',
      jobId: { not: null },
      createdAt: { lt: oneMinuteAgo }, // Só verifica jobs com mais de 1 minuto
      prompt: { not: { startsWith: '[UPSCALED]' } } // Exclui upscales
    },
    select: {
      id: true,
      jobId: true,
      userId: true,
      createdAt: true
    },
    take: 20 // Limita para evitar sobrecarga
  })

  let updated = 0
  let errors = 0

  for (const generation of pendingGenerations) {
    try {
      if (!generation.jobId) continue

      // Busca status no Replicate
      const prediction = await replicate.predictions.get(generation.jobId)
      
      // Só atualiza se status mudou
      if (prediction.status === 'processing' || prediction.status === 'starting') {
        continue // Ainda processando, não precisa atualizar
      }

      const updateData: any = {}
      let needsUpdate = false

      switch (prediction.status) {
        case 'succeeded':
          if (prediction.output) {
            // Processar output e armazenar imagens
            let temporaryUrls: string[] = []
            if (Array.isArray(prediction.output)) {
              temporaryUrls = prediction.output
            } else if (typeof prediction.output === 'string') {
              temporaryUrls = [prediction.output]
            } else if (prediction.output.images) {
              temporaryUrls = prediction.output.images
            }

            if (temporaryUrls.length > 0) {
              const storageResult = await downloadAndStoreImages(
                temporaryUrls,
                generation.id,
                generation.userId
              )

              if (storageResult.success && storageResult.permanentUrls?.length) {
                updateData.status = 'COMPLETED'
                updateData.completedAt = new Date()
                updateData.imageUrls = storageResult.permanentUrls
                updateData.thumbnailUrls = storageResult.thumbnailUrls || storageResult.permanentUrls
                updateData.errorMessage = null
                needsUpdate = true
                
                console.log(`✅ Auto-sync: Generation ${generation.id} completed with ${storageResult.permanentUrls.length} images`)
              } else {
                updateData.status = 'FAILED'
                updateData.completedAt = new Date()
                updateData.errorMessage = `Auto-sync storage failed: ${storageResult.error}`
                needsUpdate = true
                
                console.error(`❌ Auto-sync: Generation ${generation.id} storage failed`)
              }
            }
          }
          break

        case 'failed':
          updateData.status = 'FAILED'
          updateData.completedAt = new Date()
          updateData.errorMessage = prediction.error || 'Generation failed'
          needsUpdate = true
          
          console.log(`❌ Auto-sync: Generation ${generation.id} failed`)
          break

        case 'canceled':
          updateData.status = 'CANCELLED'
          updateData.completedAt = new Date()
          updateData.errorMessage = 'Generation was cancelled'
          needsUpdate = true
          
          console.log(`🛑 Auto-sync: Generation ${generation.id} cancelled`)
          break
      }

      if (needsUpdate) {
        // Atualizar banco
        await prisma.generation.update({
          where: { id: generation.id },
          data: updateData
        })

        // Broadcast via WebSocket
        await broadcastGenerationStatusChange(
          generation.id,
          generation.userId,
          prediction.status,
          {
            imageUrls: updateData.imageUrls,
            thumbnailUrls: updateData.thumbnailUrls,
            errorMessage: updateData.errorMessage,
            autoSync: true
          }
        )

        updated++
      }

    } catch (error) {
      errors++
      console.error(`❌ Auto-sync error for generation ${generation.id}:`, error)
    }

    // Pequeno delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return {
    type: 'generations',
    checked: pendingGenerations.length,
    updated,
    errors
  }
}

/**
 * Sincroniza upscales pendentes
 */
async function syncPendingUpscales() {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  
  const pendingUpscales = await prisma.generation.findMany({
    where: {
      status: 'PROCESSING',
      jobId: { not: null },
      createdAt: { lt: oneMinuteAgo },
      prompt: { startsWith: '[UPSCALED]' } // Só upscales
    },
    select: {
      id: true,
      jobId: true,
      userId: true,
      createdAt: true
    },
    take: 20
  })

  let updated = 0
  let errors = 0

  for (const upscale of pendingUpscales) {
    try {
      if (!upscale.jobId) continue

      const prediction = await replicate.predictions.get(upscale.jobId)
      
      if (prediction.status === 'processing' || prediction.status === 'starting') {
        continue
      }

      const updateData: any = {}
      let needsUpdate = false

      switch (prediction.status) {
        case 'succeeded':
          if (prediction.output) {
            let temporaryUrls: string[] = []
            if (Array.isArray(prediction.output)) {
              temporaryUrls = prediction.output
            } else if (typeof prediction.output === 'string') {
              temporaryUrls = [prediction.output]
            }

            if (temporaryUrls.length > 0) {
              const storageResult = await downloadAndStoreImages(
                temporaryUrls,
                upscale.id,
                upscale.userId,
                'upscaled'
              )

              if (storageResult.success && storageResult.permanentUrls?.length) {
                updateData.status = 'COMPLETED'
                updateData.completedAt = new Date()
                updateData.imageUrls = storageResult.permanentUrls
                updateData.thumbnailUrls = storageResult.thumbnailUrls || storageResult.permanentUrls
                updateData.errorMessage = null
                needsUpdate = true
                
                console.log(`✅ Auto-sync: Upscale ${upscale.id} completed`)
              } else {
                updateData.status = 'FAILED'
                updateData.completedAt = new Date()
                updateData.errorMessage = `Auto-sync upscale storage failed: ${storageResult.error}`
                needsUpdate = true
              }
            }
          }
          break

        case 'failed':
          updateData.status = 'FAILED'
          updateData.completedAt = new Date()
          updateData.errorMessage = prediction.error || 'Upscale failed'
          needsUpdate = true
          break

        case 'canceled':
          updateData.status = 'CANCELLED'
          updateData.completedAt = new Date()
          updateData.errorMessage = 'Upscale was cancelled'
          needsUpdate = true
          break
      }

      if (needsUpdate) {
        await prisma.generation.update({
          where: { id: upscale.id },
          data: updateData
        })

        await broadcastGenerationStatusChange(
          upscale.id,
          upscale.userId,
          prediction.status,
          {
            imageUrls: updateData.imageUrls,
            thumbnailUrls: updateData.thumbnailUrls,
            errorMessage: updateData.errorMessage,
            isUpscale: true,
            autoSync: true
          }
        )

        updated++
      }

    } catch (error) {
      errors++
      console.error(`❌ Auto-sync error for upscale ${upscale.id}:`, error)
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return {
    type: 'upscales',
    checked: pendingUpscales.length,
    updated,
    errors
  }
}

/**
 * Sincroniza treinamento de modelos pendentes
 */
async function syncPendingTraining() {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  
  const pendingModels = await prisma.aIModel.findMany({
    where: {
      status: 'TRAINING',
      jobId: { not: null },
      createdAt: { lt: oneMinuteAgo }
    },
    select: {
      id: true,
      jobId: true,
      userId: true,
      name: true,
      createdAt: true
    },
    take: 10 // Treinamentos são mais pesados, limita mais
  })

  let updated = 0
  let errors = 0

  for (const model of pendingModels) {
    try {
      if (!model.jobId) continue

      const prediction = await replicate.predictions.get(model.jobId)
      
      if (prediction.status === 'processing' || prediction.status === 'starting') {
        continue
      }

      const updateData: any = {}
      let needsUpdate = false

      switch (prediction.status) {
        case 'succeeded':
          updateData.status = 'READY'
          updateData.trainedAt = new Date()
          updateData.progress = 100
          
          if (prediction.output) {
            updateData.modelUrl = prediction.output
          }
          
          updateData.qualityScore = calculateModelQualityScore(prediction)
          updateData.trainingConfig = {
            trainingCompleted: true,
            completedAt: new Date().toISOString(),
            version: prediction.version
          }
          
          needsUpdate = true
          console.log(`✅ Auto-sync: Model ${model.id} (${model.name}) training completed`)
          break

        case 'failed':
          updateData.status = 'ERROR'
          updateData.trainedAt = new Date()
          updateData.progress = 0
          updateData.errorMessage = prediction.error || 'Training failed'
          needsUpdate = true
          
          console.log(`❌ Auto-sync: Model ${model.id} (${model.name}) training failed`)
          break

        case 'canceled':
          updateData.status = 'DRAFT'
          updateData.errorMessage = 'Training was cancelled'
          needsUpdate = true
          
          console.log(`🛑 Auto-sync: Model ${model.id} (${model.name}) training cancelled`)
          break
      }

      if (needsUpdate) {
        await prisma.aIModel.update({
          where: { id: model.id },
          data: updateData
        })

        await broadcastModelStatusChange(
          model.id,
          model.userId,
          updateData.status || prediction.status,
          {
            progress: updateData.progress,
            qualityScore: updateData.qualityScore,
            errorMessage: updateData.errorMessage,
            modelUrl: updateData.modelUrl,
            autoSync: true
          }
        )

        updated++
      }

    } catch (error) {
      errors++
      console.error(`❌ Auto-sync error for model ${model.id}:`, error)
    }

    await new Promise(resolve => setTimeout(resolve, 200)) // Mais delay para treinamento
  }

  return {
    type: 'training',
    checked: pendingModels.length,
    updated,
    errors
  }
}

/**
 * Calcula score de qualidade do modelo baseado nas métricas
 */
function calculateModelQualityScore(payload: any): number {
  let score = 80
  
  if (payload.status === 'succeeded') {
    score += 15
  }
  
  if (payload.metrics?.total_time) {
    const timeMinutes = payload.metrics.total_time / 60
    if (timeMinutes < 15) score += 10
    else if (timeMinutes < 30) score += 5
    else if (timeMinutes > 60) score -= 5
  }
  
  if (payload.logs && payload.logs.some((log: string) => log.toLowerCase().includes('error'))) {
    score -= 5
  }
  
  return Math.max(20, Math.min(100, score))
}