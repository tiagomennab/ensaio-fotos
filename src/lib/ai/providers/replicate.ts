import Replicate from 'replicate'
import { 
  AIProvider, 
  TrainingRequest, 
  TrainingResponse, 
  GenerationRequest, 
  GenerationResponse,
  AIError 
} from '../base'
import { AI_CONFIG } from '../config'

export class ReplicateProvider extends AIProvider {
  private client: Replicate

  constructor() {
    super()
    
    if (!AI_CONFIG.replicate.apiToken) {
      throw new AIError('Replicate API token not configured', 'REPLICATE_CONFIG_ERROR')
    }

    this.client = new Replicate({
      auth: AI_CONFIG.replicate.apiToken
    })
  }

  async startTraining(request: TrainingRequest): Promise<TrainingResponse> {
    try {
      const input = {
        input_images: this.createZipFromUrls(request.imageUrls),
        trigger_word: request.triggerWord,
        max_train_steps: request.params.steps,
        learning_rate: request.params.learningRate,
        batch_size: request.params.batchSize,
        resolution: request.params.resolution,
        seed: request.params.seed,
        autocaption: true,
        autocaption_suffix: ` a photo of ${request.triggerWord} ${request.classWord}`
      }

      const webhookUrl = request.webhookUrl || 
        `${AI_CONFIG.webhooks.baseUrl}${AI_CONFIG.webhooks.endpoints.training}`

      const training = await (this.client.trainings as any).create({
        version: AI_CONFIG.replicate.models.flux.training,
        input,
        destination,
        webhook: webhookUrl,
        webhook_events_filter: ['start', 'output', 'logs', 'completed']
      })

      return {
        id: training.id,
        status: this.mapReplicateStatus(training.status),
        createdAt: training.created_at,
        estimatedTime: this.estimateFluxTrainingTime(request.imageUrls.length),
        metadata: {
          destination,
          triggerWord: request.params.triggerWord || 'TOK'
        }
      }

    } catch (error) {
      throw new AIError(
        `Failed to start FLUX training: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRAINING_START_ERROR'
      )
    }
  }

  async getTrainingStatus(trainingId: string): Promise<TrainingResponse> {
    try {
      const training = await this.client.trainings.get(trainingId)

      return {
        id: training.id,
        status: this.mapReplicateStatus(training.status),
        model: training.output ? {
          url: training.output,
          name: this.extractModelNameFromDestination(training.output)
        } : undefined,
        logs: training.logs ? training.logs.split('\n') : undefined,
        error: training.error as string | undefined,
        createdAt: training.created_at,
        completedAt: training.completed_at || undefined,
        metadata: {
          destination: training.output,
          version: training.version
        }
      }

    } catch (error) {
      throw new AIError(
        `Failed to get training status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRAINING_STATUS_ERROR'
      )
    }
  }

  async cancelTraining(trainingId: string): Promise<boolean> {
    try {
      await this.client.trainings.cancel(trainingId)
      return true
    } catch (error) {
      return false
    }
  }

  async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const input: any = {
        prompt: request.prompt,
        width: request.params.width,
        height: request.params.height,
        num_inference_steps: request.params.steps,
        guidance_scale: request.params.guidance_scale,
        seed: request.params.seed,
        num_outputs: request.params.num_outputs || 1
      }

      if (request.negativePrompt) {
        input.negative_prompt = request.negativePrompt
      }

      const webhookUrl = request.webhookUrl || 
        `${AI_CONFIG.webhooks.baseUrl}${AI_CONFIG.webhooks.endpoints.generation}`

      const prediction = await this.client.predictions.create({
        version: request.modelUrl || AI_CONFIG.replicate.models.flux.generation,
        input,
        webhook: webhookUrl,
        webhook_events_filter: ['start', 'output', 'logs', 'completed']
      })

      return {
        id: prediction.id,
        status: this.mapReplicateStatus(prediction.status),
        createdAt: prediction.created_at,
        estimatedTime: this.estimateGenerationTime(
          request.params.width || 1024, 
          request.params.height || 1024, 
          request.params.steps || 20
        ),
        metadata: {
          prompt: request.prompt,
          seed: request.params.seed || 0,
          params: request.params
        }
      }

    } catch (error) {
      throw new AIError(
        `Failed to start generation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_START_ERROR'
      )
    }
  }

  async getGenerationStatus(generationId: string): Promise<GenerationResponse> {
    try {
      const prediction = await this.client.predictions.get(generationId)

      return {
        id: prediction.id,
        status: this.mapReplicateStatus(prediction.status),
        urls: Array.isArray(prediction.output) ? prediction.output : 
               prediction.output ? [prediction.output] : undefined,
        error: prediction.error as string | undefined,
        createdAt: prediction.created_at,
        completedAt: prediction.completed_at || undefined,
        metadata: prediction.input ? {
          prompt: (prediction.input as any).prompt,
          seed: (prediction.input as any).seed || 0,
          params: prediction.input as any
        } : undefined
      }

    } catch (error) {
      throw new AIError(
        `Failed to get generation status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_STATUS_ERROR'
      )
    }
  }

  async cancelGeneration(generationId: string): Promise<boolean> {
    try {
      await this.client.predictions.cancel(generationId)
      return true
    } catch (error) {
      return false
    }
  }

  async validateModel(modelUrl: string): Promise<boolean> {
    try {
      // Use the official Replicate models endpoint to validate
      const modelParts = modelUrl.split(':')
      if (modelParts.length === 2) {
        const [owner_name, version_id] = modelParts
        
        // Try to get model version info
        const response = await fetch(`https://api.replicate.com/v1/models/${owner_name}/versions/${version_id}`, {
          headers: {
            'Authorization': `Bearer ${AI_CONFIG.replicate.apiToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        return response.ok
      }
      
      return false
    } catch (error) {
      console.error('Model validation failed:', error)
      return false
    }
  }

  async getAvailableModels() {
    try {
      // Return curated list of verified models from config
      return [
        {
          id: AI_CONFIG.replicate.models.flux.generation,
          name: 'FLUX.1 Schnell',
          description: 'Fast, high-quality image generation (4 steps)',
          type: 'base' as const
        },
        {
          id: AI_CONFIG.replicate.models.flux.dev,
          name: 'FLUX.1 Dev',
          description: 'Higher quality FLUX model (20+ steps)',
          type: 'base' as const
        },
        {
          id: AI_CONFIG.replicate.models.flux.pro,
          name: 'FLUX.1 Pro',
          description: 'Professional grade FLUX model (25+ steps)',
          type: 'base' as const
        },
        {
          id: AI_CONFIG.replicate.models.sdxl.generation,
          name: 'Stable Diffusion XL',
          description: 'High-resolution image generation',
          type: 'base' as const
        },
        {
          id: AI_CONFIG.replicate.models.sdxl.turbo,
          name: 'SDXL Turbo',
          description: 'Faster SDXL variant (1-4 steps)',
          type: 'base' as const
        }
      ]
    } catch (error) {
      console.error('Failed to get available models:', error)
      return []
    }
  }

  private mapReplicateStatus(status: string): TrainingResponse['status'] | GenerationResponse['status'] {
    switch (status) {
      case 'starting':
        return 'starting'
      case 'processing':
        return 'processing'
      case 'succeeded':
        return 'succeeded'
      case 'failed':
        return 'failed'
      case 'canceled':
        return 'canceled'
      default:
        return 'processing'
    }
  }

  private createZipFromUrls(urls: string[]): string {
    // In a real implementation, you would:
    // 1. Download all images from URLs
    // 2. Create a ZIP file
    // 3. Upload the ZIP to a temporary storage
    // 4. Return the ZIP URL
    
    // For now, return a placeholder URL
    // This should be implemented based on your storage provider
    return 'https://example.com/training-images.zip'
  }

  private estimateTrainingTime(imageCount: number, steps: number): number {
    // Estimate training time in minutes
    const baseTime = 30 // 30 minutes base
    const stepMultiplier = steps / 1000
    const imageMultiplier = Math.sqrt(imageCount) / 3
    
    return Math.ceil(baseTime * stepMultiplier * imageMultiplier)
  }

  private estimateGenerationTime(width: number, height: number, steps: number): number {
    // Estimate generation time in seconds
    const megapixels = (width * height) / (1024 * 1024)
    const baseTime = 10 // 10 seconds base
    const stepTime = steps * 0.5
    const resolutionTime = megapixels * 3
    
    return Math.ceil(baseTime + stepTime + resolutionTime)
  }

  private getOptimalLearningRate(task: string, imageCount: number): number {
    // Optimize learning rate based on task type and image count
    let baseLearningRate = 1e-4
    
    switch (task) {
      case 'face':
        baseLearningRate = 1e-4 // Conservative for faces to avoid artifacts
        break
      case 'style':
        baseLearningRate = 2e-4 // Higher for style training
        break
      case 'object':
        baseLearningRate = 1.5e-4 // Balanced for objects
        break
    }
    
    // Adjust based on image count - more images allow for higher learning rate
    if (imageCount < 10) {
      baseLearningRate *= 0.8 // Reduce for few images
    } else if (imageCount > 30) {
      baseLearningRate *= 1.2 // Increase for many images
    }
    
    return baseLearningRate
  }

  private getOptimalRank(task: string): number {
    // LoRA rank affects quality vs training speed/memory
    switch (task) {
      case 'face':
        return 32 // Higher rank for better facial detail preservation
      case 'style':
        return 64 // Highest rank for complex style patterns
      case 'object':
        return 16 // Lower rank sufficient for objects
      default:
        return 32
    }
  }

  private isRetryableError(error: Error): boolean {
    // Determine if an error is worth retrying
    const retryableMessages = [
      'rate limit',
      'timeout',
      'server error',
      'internal error',
      'temporarily unavailable',
      'too many requests',
      'network error',
      'connection',
      'service unavailable'
    ]
    
    const errorMessage = error.message.toLowerCase()
    return retryableMessages.some(msg => errorMessage.includes(msg))
  }

  private determineFluxModelQuality(userPlan?: string): 'schnell' | 'dev' | 'pro' {
    // Determine FLUX model quality based on user plan
    switch (userPlan) {
      case 'GOLD':
        return 'pro' // Highest quality for premium users
      case 'PREMIUM':
        return 'dev' // Good balance of quality and speed
      case 'FREE':
      default:
        return 'schnell' // Fast and free
    }
  }

  private getFluxModelVersion(quality: 'schnell' | 'dev' | 'pro'): string {
    switch (quality) {
      case 'pro':
        return AI_CONFIG.replicate.models.flux.pro
      case 'dev':
        return AI_CONFIG.replicate.models.flux.dev
      case 'schnell':
      default:
        return AI_CONFIG.replicate.models.flux.generation
    }
  }

  private getOptimalStepsForFlux(quality: 'schnell' | 'dev' | 'pro', requestedSteps?: number): number {
    // Optimize steps based on model quality
    switch (quality) {
      case 'schnell':
        return Math.min(requestedSteps || 4, 8) // Schnell is optimized for 1-8 steps
      case 'dev':
        return Math.min(requestedSteps || 20, 50) // Dev works well with 10-50 steps
      case 'pro':
        return Math.min(requestedSteps || 25, 100) // Pro can handle more steps for quality
      default:
        return 4
    }
  }

  private getOutputQuality(userPlan?: string): number {
    // Output quality based on user plan
    switch (userPlan) {
      case 'GOLD':
        return 95 // Highest quality
      case 'PREMIUM':
        return 85 // Good quality
      case 'FREE':
      default:
        return 80 // Standard quality
    }
  }
}