import { getAIProvider } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { processAndStoreReplicateImages } from '@/lib/services/auto-image-storage'
import { downloadAndStoreImages } from '@/lib/storage/utils'
import { broadcastGenerationStatusChange } from '@/lib/services/realtime-service'

interface PollingJob {
  predictionId: string
  generationId: string
  userId: string
  maxAttempts: number
  attempts: number
  intervalMs: number
  timeoutId?: NodeJS.Timeout
}

// Active polling jobs
const activePollingJobs = new Map<string, PollingJob>()

/**
 * Start polling a Replicate prediction until completion
 */
export async function startPolling(
  predictionId: string,
  generationId: string,
  userId: string,
  maxAttempts: number = 120, // 10 minutes at 5s intervals
  intervalMs: number = 5000   // 5 seconds
) {
  console.log(`🔄 Starting polling for prediction ${predictionId}`)

  // Stop existing polling for this prediction if any
  stopPolling(predictionId)

  const job: PollingJob = {
    predictionId,
    generationId,
    userId,
    maxAttempts,
    attempts: 0,
    intervalMs
  }

  activePollingJobs.set(predictionId, job)

  // Start the polling loop
  await pollPrediction(job)
}

/**
 * Stop polling for a specific prediction
 */
export function stopPolling(predictionId: string) {
  const job = activePollingJobs.get(predictionId)
  if (job?.timeoutId) {
    clearTimeout(job.timeoutId)
    activePollingJobs.delete(predictionId)
    console.log(`⏹️ Stopped polling for prediction ${predictionId}`)
  }
}

/**
 * Poll a single prediction and handle the response
 */
async function pollPrediction(job: PollingJob) {
  const { predictionId, generationId, userId } = job

  try {
    job.attempts++
    console.log(`📡 Polling attempt ${job.attempts}/${job.maxAttempts} for prediction ${predictionId}`)

    const aiProvider = getAIProvider()
    if (!aiProvider) {
      throw new Error('AI provider not available')
    }

    // Get prediction status from Replicate
    const prediction = await aiProvider.getPredictionStatus(predictionId)
    console.log(`📊 Prediction status: ${prediction.status}`)

    // Find the generation in database
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        user: {
          select: { id: true, email: true }
        },
        model: {
          select: { name: true }
        }
      }
    })

    if (!generation) {
      console.error(`❌ Generation ${generationId} not found`)
      stopPolling(predictionId)
      return
    }

    // Handle different statuses
    const updateData: any = {}

    switch (prediction.status) {
      case 'starting':
      case 'processing':
        updateData.status = 'PROCESSING'

        // Broadcast progress update
        await broadcastGenerationStatusChange(
          generationId,
          userId,
          'processing',
          { attempts: job.attempts, maxAttempts: job.maxAttempts }
        )

        // Continue polling
        scheduleNextPoll(job)
        break

      case 'succeeded':
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()

        if (prediction.output) {
          // Process output similar to webhook
          let temporaryUrls: string[] = []

          if (Array.isArray(prediction.output)) {
            temporaryUrls = prediction.output
          } else if (typeof prediction.output === 'string') {
            temporaryUrls = [prediction.output]
          }

          if (temporaryUrls.length > 0) {
            console.log(`📥 Processing ${temporaryUrls.length} generated images from polling`)

            try {
              // Try auto-storage first
              const autoStorageResults = await processAndStoreReplicateImages(
                temporaryUrls,
                generationId,
                userId
              )

              if (autoStorageResults.length > 0) {
                const s3Keys = autoStorageResults.map(r => r.key)
                const permanentUrls = autoStorageResults.map(r => r.url)

                // Generate thumbnail URLs - fallback to original if no thumbnail generated
                const thumbnailUrls = autoStorageResults.map(r => r.thumbnailUrl || r.url)
                const thumbnailKeys = autoStorageResults.map(r => r.thumbnailKey || r.key)

                // HYBRID APPROACH: Save both for compatibility with proper thumbnails
                updateData.imageUrls = permanentUrls
                updateData.thumbnailUrls = thumbnailUrls
                updateData.storageKeys = s3Keys
                updateData.storageProvider = 'aws'
                updateData.metadata = {
                  s3Keys: s3Keys,
                  thumbnailKeys: thumbnailKeys,
                  originalUrls: temporaryUrls,
                  processedAt: new Date().toISOString(),
                  storageProvider: 'aws',
                  storageType: 'private',
                  processedVia: 'polling',
                  thumbnailsGenerated: autoStorageResults.some(r => r.thumbnailUrl)
                }

                const thumbnailCount = autoStorageResults.filter(r => r.thumbnailUrl).length
                console.log(`✅ Polling: Successfully stored ${s3Keys.length} images permanently (${thumbnailCount} thumbnails generated)`)

              } else {
                throw new Error('Auto-storage returned no results')
              }

            } catch (autoStorageError) {
              console.error(`⚠️ Auto-storage failed during polling, falling back to legacy storage:`, autoStorageError)

              // Fallback to legacy storage
              const storageResult = await downloadAndStoreImages(
                temporaryUrls,
                generationId,
                userId
              )

              if (storageResult.success && storageResult.permanentUrls && storageResult.permanentUrls.length > 0) {
                updateData.imageUrls = storageResult.permanentUrls
                updateData.thumbnailUrls = storageResult.thumbnailUrls || storageResult.permanentUrls
                updateData.storageProvider = 'aws'
                updateData.metadata = {
                  originalUrls: temporaryUrls,
                  processedAt: new Date().toISOString(),
                  storageProvider: 'legacy',
                  processedVia: 'polling'
                }

                console.log(`✅ Polling: Successfully stored ${storageResult.permanentUrls.length} images via legacy storage`)

              } else {
                // Final fallback: use temporary URLs
                updateData.imageUrls = temporaryUrls
                updateData.thumbnailUrls = temporaryUrls
                updateData.storageProvider = 'temporary'
                updateData.metadata = {
                  temporaryUrls: temporaryUrls,
                  storageError: true,
                  processedVia: 'polling',
                  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                }
                updateData.errorMessage = `Warning: Storage failed during polling, images may expire in 1 hour`
              }
            }
          }
        }

        // Calculate processing time
        updateData.processingTime = new Date().getTime() - new Date(generation.createdAt).getTime()

        // Broadcast completion
        await broadcastGenerationStatusChange(
          generationId,
          userId,
          'succeeded',
          {
            imageUrls: updateData.imageUrls || [],
            thumbnailUrls: updateData.thumbnailUrls || [],
            processingTime: updateData.processingTime
          }
        )

        // Stop polling
        stopPolling(predictionId)
        break

      case 'failed':
        updateData.status = 'FAILED'
        updateData.completedAt = new Date()

        if (prediction.error) {
          updateData.errorMessage = prediction.error
        }

        // Broadcast failure
        await broadcastGenerationStatusChange(
          generationId,
          userId,
          'failed',
          { errorMessage: updateData.errorMessage }
        )

        // Stop polling
        stopPolling(predictionId)
        break

      case 'canceled':
        updateData.status = 'CANCELLED'
        updateData.completedAt = new Date()

        // Broadcast cancellation
        await broadcastGenerationStatusChange(
          generationId,
          userId,
          'canceled',
          {}
        )

        // Stop polling
        stopPolling(predictionId)
        break

      default:
        console.log(`⚠️ Unknown prediction status: ${prediction.status}`)
        scheduleNextPoll(job)
        break
    }

    // Update generation in database
    if (Object.keys(updateData).length > 0) {
      await prisma.generation.update({
        where: { id: generationId },
        data: updateData
      })

      console.log(`📝 Updated generation ${generationId} with status: ${updateData.status}`)
    }

  } catch (error) {
    console.error(`❌ Polling error for prediction ${predictionId}:`, error)

    // Check if we should retry or give up
    if (job.attempts >= job.maxAttempts) {
      console.error(`🚫 Max polling attempts reached for prediction ${predictionId}`)

      // Mark generation as failed
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'FAILED',
          errorMessage: `Polling failed after ${job.maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          completedAt: new Date()
        }
      })

      // Broadcast failure
      await broadcastGenerationStatusChange(
        generationId,
        userId,
        'failed',
        { errorMessage: `Polling timeout after ${job.maxAttempts} attempts` }
      )

      stopPolling(predictionId)
    } else {
      // Retry with exponential backoff
      const backoffMs = Math.min(job.intervalMs * Math.pow(1.5, job.attempts), 30000) // Max 30s
      console.log(`🔄 Retrying in ${backoffMs}ms (attempt ${job.attempts + 1}/${job.maxAttempts})`)

      job.timeoutId = setTimeout(() => {
        pollPrediction(job)
      }, backoffMs)
    }
  }
}

/**
 * Schedule the next polling attempt
 */
function scheduleNextPoll(job: PollingJob) {
  if (job.attempts >= job.maxAttempts) {
    console.error(`🚫 Max polling attempts reached for prediction ${job.predictionId}`)
    stopPolling(job.predictionId)
    return
  }

  job.timeoutId = setTimeout(() => {
    pollPrediction(job)
  }, job.intervalMs)
}

/**
 * Get status of all active polling jobs
 */
export function getPollingStatus() {
  const jobs = Array.from(activePollingJobs.values()).map(job => ({
    predictionId: job.predictionId,
    generationId: job.generationId,
    userId: job.userId,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    intervalMs: job.intervalMs
  }))

  return {
    activeJobs: jobs.length,
    jobs
  }
}

/**
 * Stop all polling jobs (useful for cleanup)
 */
export function stopAllPolling() {
  console.log(`🛑 Stopping all ${activePollingJobs.size} polling jobs`)

  for (const [predictionId] of activePollingJobs) {
    stopPolling(predictionId)
  }
}