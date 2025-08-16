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

      const training = await this.client.trainings.create({
        version: AI_CONFIG.replicate.models.flux.training,
        input,
        webhook: webhookUrl,
        webhook_events_filter: ['start', 'output', 'logs', 'completed']
      })

      return {
        id: training.id,
        status: this.mapReplicateStatus(training.status),
        createdAt: training.created_at,
        estimatedTime: this.estimateTrainingTime(request.imageUrls.length, request.params.steps)
      }

    } catch (error) {
      throw new AIError(
        `Failed to start training: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          url: training.output.weights,
          name: `model_${trainingId.slice(-8)}`
        } : undefined,
        logs: training.logs ? training.logs.split('\n') : undefined,
        error: training.error,
        createdAt: training.created_at,
        completedAt: training.completed_at || undefined
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
        num_outputs: request.params.num_outputs || 1,
        disable_safety_checker: !request.params.safety_checker
      }

      if (request.negativePrompt) {
        input.negative_prompt = request.negativePrompt
      }

      // Use custom model if provided, otherwise use base model
      const modelVersion = request.modelUrl || AI_CONFIG.replicate.models.flux.generation

      const webhookUrl = request.webhookUrl || 
        `${AI_CONFIG.webhooks.baseUrl}${AI_CONFIG.webhooks.endpoints.generation}`

      const prediction = await this.client.predictions.create({
        version: modelVersion,
        input,
        webhook: webhookUrl,
        webhook_events_filter: ['start', 'output', 'logs', 'completed']
      })

      return {
        id: prediction.id,
        status: this.mapReplicateStatus(prediction.status),
        createdAt: prediction.created_at,
        estimatedTime: this.estimateGenerationTime(
          request.params.width, 
          request.params.height, 
          request.params.steps
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
        error: prediction.error,
        logs: prediction.logs ? prediction.logs.split('\n') : undefined,
        createdAt: prediction.created_at,
        completedAt: prediction.completed_at || undefined,
        metadata: prediction.input ? {
          prompt: prediction.input.prompt,
          seed: prediction.input.seed || 0,
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
      // For Replicate, we can try to create a test prediction to validate the model
      const testPrediction = await this.client.predictions.create({
        version: modelUrl,
        input: {
          prompt: 'test',
          width: 512,
          height: 512,
          num_inference_steps: 1
        }
      })

      // Cancel immediately after creation to avoid charges
      await this.client.predictions.cancel(testPrediction.id)
      return true

    } catch (error) {
      return false
    }
  }

  async getAvailableModels() {
    // Note: Replicate doesn't have a direct API to list all models
    // This would return a curated list of popular models
    return [
      {
        id: AI_CONFIG.replicate.models.flux.generation,
        name: 'FLUX.1 Schnell',
        description: 'Fast, high-quality image generation',
        type: 'base' as const
      },
      {
        id: AI_CONFIG.replicate.models.sdxl.generation,
        name: 'Stable Diffusion XL',
        description: 'High-resolution image generation',
        type: 'base' as const
      }
    ]
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
}