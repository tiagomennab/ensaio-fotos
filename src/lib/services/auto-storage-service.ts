import { prisma } from '@/lib/db'
import { downloadAndStoreImages } from '@/lib/storage/utils'
import { ReplicateProvider } from '@/lib/ai/providers/replicate'
import { isReplicateStatusCompleted, isReplicateStatusFailed } from '@/lib/utils/status-mapping'
import { logger } from '@/lib/monitoring/logger'

/**
 * Auto Storage Service - Automatically saves images when webhooks are not available
 * This is essential for development mode and as a backup for production
 */
export class AutoStorageService {
  private static instance: AutoStorageService
  private checkInterval: NodeJS.Timeout | null = null
  private isRunning = false

  static getInstance(): AutoStorageService {
    if (!this.instance) {
      this.instance = new AutoStorageService()
    }
    return this.instance
  }

  /**
   * Start monitoring generations for images that need to be saved
   */
  startMonitoring() {
    if (this.isRunning) {
      logger.info('Auto storage service already running', {
        service: 'auto-storage',
        action: 'start_attempt_blocked',
        intervalId: this.checkInterval ? 'exists' : 'null'
      })
      return { success: true, message: 'Already running' }
    }

    // Clean any existing interval before starting
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    logger.info('Starting auto storage service', { service: 'auto-storage', action: 'start' })
    this.isRunning = true

    // Check every 30 seconds for completed generations that need storage
    this.checkInterval = setInterval(async () => {
      await this.checkAndSaveImages()
    }, 30000)

    logger.info('Auto storage monitoring started with 30s interval', {
      service: 'auto-storage',
      action: 'monitoring_started',
      intervalMs: 30000
    })

    // Also do an initial check
    this.checkAndSaveImages()

    return { success: true, message: 'Started successfully' }
  }

  /**
   * Stop the monitoring service
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('⏹️ Auto storage service stopped')
  }

  /**
   * Check for generations and edited images that need their images saved permanently
   */
  private async checkAndSaveImages() {
    const startTime = Date.now()

    try {
      // Timeout protection: max 60 seconds per check cycle to prevent timeouts
      const checkTimeout = setTimeout(() => {
        logger.warn('Auto storage check cycle timeout reached', {
          service: 'auto-storage',
          action: 'check_timeout',
          duration: Date.now() - startTime
        })
      }, 60000) // 1 minute timeout

      // Run generation and edited image checks in parallel for efficiency
      await Promise.allSettled([
        this.checkGenerations(),
        this.checkAndSaveEditedImages()
      ])

      // Clear the timeout if we finish successfully
      clearTimeout(checkTimeout)

      const duration = Date.now() - startTime
      logger.info('Auto storage check cycle completed', {
        service: 'auto-storage',
        action: 'check_completed',
        duration
      })

    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error in auto storage service', error as Error, {
        service: 'auto-storage',
        action: 'service_error',
        duration
      })
    }
  }

  /**
   * Check generations that need storage processing
   */
  private async checkGenerations() {
    try {
      // Only check recent generations (last 2 hours) to avoid endless loops
      // Add age limit to prevent infinite reprocessing of old failed generations
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const maxAge = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours max age

      // Find generations that are processing or completed but might not have permanent URLs
      const generations = await prisma.generation.findMany({
        where: {
          AND: [
            // Must have jobId
            { jobId: { not: null } },
            // Not too old (prevent infinite reprocessing)
            { createdAt: { gte: maxAge } },
            // Main conditions
            {
              OR: [
                // Recent processing generations only
                {
                  AND: [
                    { status: 'PROCESSING' },
                    { createdAt: { gte: twoHoursAgo } }
                  ]
                },
                // Recent completed generations with temporary URLs
                {
                  AND: [
                    { status: 'COMPLETED' },
                    { updatedAt: { gte: twoHoursAgo } }, // Only recently updated
                    {
                      OR: [
                        // No images yet
                        { imageUrls: { isEmpty: true } },
                        // Has temporary URLs (check for replicate.delivery domains)
                        {
                          imageUrls: {
                            hasSome: ['replicate.delivery']
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        take: 10 // Reduced to 10 to prevent timeouts
      })

      if (generations.length === 0) {
        logger.debug('No generations requiring storage processing', {
          service: 'auto-storage',
          action: 'check',
          result: 'no-work'
        })
        return
      }

      logger.info('Checking generations for image storage needs', {
        service: 'auto-storage',
        action: 'check',
        count: generations.length
      })

      const replicate = new ReplicateProvider()

      for (const generation of generations) {
        const operationStart = Date.now()

        try {
          if (!generation.jobId) {
            logger.warn('Generation missing jobId, skipping', {
              generationId: generation.id,
              action: 'skip_no_jobid'
            })
            continue
          }

          // Check status with Replicate
          const status = await replicate.getGenerationStatus(generation.jobId)

          if (isReplicateStatusCompleted(status.status) && status.result && Array.isArray(status.result) && status.result.length > 0) {
            // Check if images are temporary URLs
            const hasTemporaryUrls = status.result.some((url: string) =>
              url.includes('replicate.delivery') || url.includes('pbxt.replicate.delivery')
            )

            if (hasTemporaryUrls) {
              logger.info('Generation - Temporary URLs detected, starting permanent storage', {
                generationId: generation.id,
                imageCount: status.result.length,
                action: 'download_start'
              })

              // Download and store images permanently
              const storageResult = await downloadAndStoreImages(
                status.result,
                generation.id,
                generation.userId
              )

              if (storageResult.success && storageResult.permanentUrls && storageResult.permanentUrls.length > 0) {
                // Update generation with permanent URLs
                await prisma.generation.update({
                  where: { id: generation.id },
                  data: {
                    status: 'COMPLETED',
                    imageUrls: storageResult.permanentUrls,
                    thumbnailUrls: storageResult.thumbnailUrls || storageResult.permanentUrls,
                    completedAt: new Date(),
                    processingTime: status.processingTime || null
                  }
                })

                logger.info('Generation images saved successfully', {
                  generationId: generation.id,
                  imageCount: storageResult.permanentUrls.length,
                  action: 'storage_success'
                })
              }
            }
          } else if (isReplicateStatusFailed(status.status)) {
            // Update generation as failed
            await prisma.generation.update({
              where: { id: generation.id },
              data: {
                status: 'FAILED',
                errorMessage: status.error,
                completedAt: new Date()
              }
            })
          }

          const operationDuration = Date.now() - operationStart

          // Break out of loop if taking too long to prevent timeout
          if (operationDuration > 45000) { // 45 seconds
            logger.warn('Generation processing taking too long, breaking to prevent timeout', {
              generationId: generation.id,
              duration: operationDuration
            })
            break
          }

        } catch (error) {
          logger.error('Error checking generation status', error as Error, {
            generationId: generation.id,
            jobId: generation.jobId,
            action: 'status_check_failed'
          })
        }
      }
    } catch (error) {
      logger.error('Error in generation check', error as Error, {
        service: 'auto-storage',
        action: 'generation_check_error'
      })
    }
  }

  /**
   * Force check and save a specific generation
   */
  async forceCheckGeneration(generationId: string): Promise<boolean> {
    try {
      const generation = await prisma.generation.findUnique({
        where: { id: generationId }
      })

      if (!generation || !generation.jobId) {
        return false
      }

      const replicate = new ReplicateProvider()
      const status = await replicate.getGenerationStatus(generation.jobId)
      
      if (isReplicateStatusCompleted(status.status) && status.result && Array.isArray(status.result)) {
        const storageResult = await downloadAndStoreImages(
          status.result,
          generation.id,
          generation.userId
        )

        if (storageResult.success && storageResult.permanentUrls) {
          await prisma.generation.update({
            where: { id: generation.id },
            data: {
              status: 'COMPLETED',
              imageUrls: storageResult.permanentUrls,
              thumbnailUrls: storageResult.thumbnailUrls || storageResult.permanentUrls,
              completedAt: new Date()
            }
          })
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error(`Error force checking generation ${generationId}:`, error)
      return false
    }
  }

  /**
   * Check for edited images that need permanent storage
   */
  private async checkAndSaveEditedImages() {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

      logger.debug('Starting edited images check', {
        service: 'auto-storage',
        action: 'edited_images_check_start',
        timeWindow: 'last_2_hours'
      })

      // Find recent edit history entries with temporary URLs
      const editedImages = await prisma.editHistory.findMany({
        where: {
          AND: [
            { createdAt: { gte: twoHoursAgo } },
            {
              OR: [
                { editedImageUrl: { contains: 'replicate.delivery' } },
                { editedImageUrl: { contains: 'pbxt.replicate.delivery' } }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Process up to 10 edited images per cycle
      })

      if (editedImages.length === 0) {
        logger.debug('No edited images requiring storage processing', {
          service: 'auto-storage',
          action: 'edited_images_check',
          result: 'no-work'
        })
        return
      }

      logger.info('Found edited images with temporary URLs', {
        service: 'auto-storage',
        action: 'edited_images_check',
        count: editedImages.length,
        editIds: editedImages.map(e => e.id)
      })

      for (const editedImage of editedImages) {
        try {
          logger.info('Processing edited image for permanent storage', {
            editId: editedImage.id,
            userId: editedImage.userId,
            originalUrl: editedImage.editedImageUrl.substring(0, 80) + '...',
            action: 'edited_image_storage_start'
          })

          // Download and store the edited image permanently
          const storageResult = await downloadAndStoreImages(
            [editedImage.editedImageUrl],
            editedImage.id,
            editedImage.userId,
            'edited' // Use 'edited' as subfolder
          )

          if (storageResult.success && storageResult.permanentUrls && storageResult.permanentUrls.length > 0) {
            // Update edit history with permanent URL
            await prisma.editHistory.update({
              where: { id: editedImage.id },
              data: {
                editedImageUrl: storageResult.permanentUrls[0],
                thumbnailUrl: storageResult.thumbnailUrls?.[0] || storageResult.permanentUrls[0],
                updatedAt: new Date()
              }
            })

            logger.info('✅ Edited image successfully saved to permanent storage', {
              editId: editedImage.id,
              originalUrl: editedImage.editedImageUrl.substring(0, 50) + '...',
              permanentUrl: storageResult.permanentUrls[0].substring(0, 50) + '...',
              action: 'edited_image_storage_success'
            })
          } else {
            logger.error('❌ Failed to store edited image permanently', undefined, {
              editId: editedImage.id,
              error: storageResult.error,
              action: 'edited_image_storage_failed'
            })
          }
        } catch (error) {
          logger.error('❌ Error processing edited image storage', error as Error, {
            editId: editedImage.id,
            action: 'edited_image_error'
          })
        }
      }
    } catch (error) {
      logger.error('❌ Error checking edited images', error as Error, {
        service: 'auto-storage',
        action: 'edited_images_check_error'
      })
    }
  }
}