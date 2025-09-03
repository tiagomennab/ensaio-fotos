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

  async createModelDestination(modelName: string, description?: string): Promise<string> {
    try {
      console.log(`🏗️ Creating model destination: ${AI_CONFIG.replicate.modelNaming.baseUsername}/${modelName}`)
      
      const modelData = {
        owner: AI_CONFIG.replicate.modelNaming.baseUsername,
        name: modelName,
        description: description || `Custom AI model: ${modelName}`,
        visibility: 'private' as const,
        hardware: 'cpu' as const // Default hardware for model creation
      }
      
      // Use direct HTTP API call since the Replicate client might not support model creation
      const response = await fetch('https://api.replicate.com/v1/models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.replicate.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modelData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`)
      }
      
      const model = await response.json()
      const destination = `${AI_CONFIG.replicate.modelNaming.baseUsername}/${modelName}`
      
      console.log(`✅ Model destination created: ${destination}`)
      console.log(`🔗 Model URL: ${model.url}`)
      
      return destination
      
    } catch (error) {
      console.error('❌ Model creation failed:', error)
      
      // Check if model already exists
      if (error instanceof Error && error.message.includes('already exists')) {
        const destination = `${AI_CONFIG.replicate.modelNaming.baseUsername}/${modelName}`
        console.log(`♻️ Model already exists, using: ${destination}`)
        return destination
      }
      
      throw new AIError(
        `Failed to create model destination: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MODEL_CREATION_ERROR'
      )
    }
  }

  async startTraining(request: TrainingRequest): Promise<TrainingResponse> {
    try {
      // Validate request parameters
      if (!request.name || !request.imageUrls || request.imageUrls.length === 0) {
        throw new AIError('Invalid training request: missing name or images', 'INVALID_REQUEST')
      }

      if (!AI_CONFIG.replicate.modelNaming.baseUsername) {
        throw new AIError('Replicate username not configured', 'CONFIG_ERROR')
      }

      // Generate destination model name
      const modelName = `${request.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      
      console.log(`🔍 Debug: modelName = ${modelName}`)
      console.log(`🔍 Debug: baseUsername = ${AI_CONFIG.replicate.modelNaming.baseUsername}`)

      // Create model destination first
      const destination = await this.createModelDestination(
        modelName,
        `AI model trained from ${request.imageUrls.length} images`
      )

      console.log(`🚀 Starting FLUX training: ${destination}`)

      const input = {
        input_images: await this.createZipFromUrls(request.imageUrls),
        trigger_word: request.triggerWord || 'TOK',
        steps: request.params.steps || 1000,
        learning_rate: request.params.learningRate || 0.0004,
        batch_size: request.params.batchSize || 1,
        resolution: request.params.resolution || '512,768,1024',
        lora_rank: 16, // Default as per FLUX trainer
        autocaption: true,
        autocaption_suffix: ` a photo of ${request.triggerWord || 'TOK'} ${request.classWord || 'person'}`
      }

      // Skip webhooks in local development or if no valid HTTPS URL available
      const webhookUrl = request.webhookUrl
      const isLocalDev = process.env.NODE_ENV === 'development'
      const hasValidWebhook = webhookUrl && webhookUrl.startsWith('https://')
      
      if (webhookUrl) {
        console.log(`📡 Webhook URL: ${webhookUrl}`)
      } else if (isLocalDev) {
        console.log(`🔄 Development mode: skipping webhook configuration`)
      }

      // Parse the version string to get model owner and name
      const versionParts = AI_CONFIG.replicate.models.flux.training.split(':')
      if (versionParts.length !== 2) {
        throw new AIError('Invalid FLUX training model version format', 'INVALID_MODEL_VERSION')
      }
      const [modelPath, versionId] = versionParts
      const [modelOwner, trainingModelName] = modelPath.split('/')
      
      // Build training options
      const trainingOptions: any = {
        destination,
        input
      }
      
      // Only add webhook if we have a valid HTTPS URL
      if (hasValidWebhook) {
        trainingOptions.webhook = webhookUrl
        trainingOptions.webhook_events_filter = ['start', 'output', 'logs', 'completed']
      }
      
      const training = await this.client.trainings.create(
        modelOwner,
        trainingModelName,
        versionId,
        trainingOptions
      )

      console.log(`✅ Training created with ID: ${training.id}`)

      return {
        id: training.id,
        status: this.mapReplicateStatus(training.status),
        createdAt: training.created_at,
        estimatedTime: this.estimateTrainingTime(request.imageUrls.length, request.params.steps),
        metadata: {
          destination,
          triggerWord: request.triggerWord || 'TOK'
        }
      }

    } catch (error) {
      console.error('❌ Training start failed:', error)
      
      if (error instanceof AIError) {
        throw error
      }
      
      // Handle specific Replicate API errors
      if (error instanceof Error) {
        // Model creation related errors
        if (error.message.includes('MODEL_CREATION_ERROR') || error.message.includes('model creation')) {
          throw new AIError(
            `Model creation failed: ${error.message}. Please check your Replicate account permissions.`,
            'MODEL_CREATION_ERROR'
          )
        }
        
        // Legacy destination errors (should be less common now)
        if (error.message.includes('destination') && error.message.includes('does not exist')) {
          throw new AIError(
            `Model destination error: ${error.message}. The model destination was not created properly.`,
            'DESTINATION_ERROR'
          )
        }
        
        // ZIP creation errors
        if (error.message.includes('zip') || error.message.includes('ZIP')) {
          throw new AIError(
            `Training data preparation failed: ${error.message}. Check image files and S3 access.`,
            'ZIP_CREATION_ERROR'
          )
        }
        
        // Webhook configuration errors
        if (error.message.includes('webhook')) {
          throw new AIError(
            `Webhook configuration error: ${error.message}`,
            'WEBHOOK_ERROR'
          )
        }
        
        // Rate limiting errors
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new AIError(
            `Replicate API rate limit exceeded: ${error.message}. Please try again later.`,
            'RATE_LIMIT_ERROR'
          )
        }
        
        // Authentication errors
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          throw new AIError(
            `Authentication failed: ${error.message}. Check your Replicate API token.`,
            'AUTH_ERROR'
          )
        }
      }
      
      throw new AIError(
        `Failed to start FLUX training: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRAINING_START_ERROR'
      )
    }
  }

  async getPredictionStatus(predictionId: string): Promise<any> {
    try {
      const prediction = await this.client.predictions.get(predictionId)
      
      return {
        id: prediction.id,
        status: this.mapReplicateStatus(prediction.status),
        output: prediction.output,
        error: prediction.error as string | undefined,
        createdAt: prediction.created_at,
        completedAt: prediction.completed_at || undefined
      }
      
    } catch (error) {
      throw new AIError(
        `Failed to get prediction status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PREDICTION_STATUS_ERROR'
      )
    }
  }

  async getTrainingStatus(trainingId: string): Promise<TrainingResponse> {
    try {
      const training = await this.client.trainings.get(trainingId)

      const extractedUrl = training.output ? this.extractModelUrl(training.output) : undefined
      
      return {
        id: training.id,
        status: this.mapReplicateStatus(training.status),
        model: extractedUrl ? {
          url: extractedUrl,
          name: this.extractModelNameFromDestination(extractedUrl)
        } : undefined,
        logs: training.logs ? training.logs.split('\n') : undefined,
        error: training.error as string | undefined,
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
        num_outputs: request.params.num_outputs || 1
      }

      if (request.negativePrompt) {
        input.negative_prompt = request.negativePrompt
      }

      const webhookUrl = request.webhookUrl
      const hasValidWebhook = webhookUrl && webhookUrl.startsWith('https://')
      
      // Build prediction options
      const predictionOptions: any = {
        input
      }
      
      // If we have a custom model URL (trained model), use it as version
      if (request.modelUrl) {
        // For FLUX trained models, the modelUrl is the version identifier
        predictionOptions.version = request.modelUrl
        console.log('🎨 Using custom trained model version:', request.modelUrl)
      } else {
        // Use default FLUX generation model
        predictionOptions.version = AI_CONFIG.replicate.models.flux.generation
        console.log('🎨 Using default FLUX model')
      }
      
      // Only add webhook if we have a valid HTTPS URL
      if (hasValidWebhook) {
        predictionOptions.webhook = webhookUrl
        predictionOptions.webhook_events_filter = ['start', 'output', 'logs', 'completed']
      }

      const prediction = await this.client.predictions.create(predictionOptions)

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

  private async createZipFromUrls(urls: string[]): Promise<string> {
    const { createZipFromLocalFiles, validateImageFiles } = await import('../zip-creator')
    
    // Validate files exist
    const { valid, missing } = await validateImageFiles(urls)
    
    if (missing.length > 0) {
      console.warn(`⚠️ Missing ${missing.length} training files:`, missing.slice(0, 3))
    }
    
    if (valid.length === 0) {
      throw new Error('No valid training images found')
    }
    
    console.log(`✅ Found ${valid.length}/${urls.length} valid training files`)
    
    // Extract model ID from the first URL path
    const modelId = urls[0]?.split('/').find(part => part.match(/^[a-f0-9-]+$/)) || 'unknown'
    
    // Create ZIP from local files
    return await createZipFromLocalFiles(valid, `training-${modelId}`, modelId)
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

  private extractModelUrl(output: any): string | undefined {
    // Extract model URL from Replicate training output
    if (!output) {
      return undefined
    }
    
    // If it's already a string, return as is
    if (typeof output === 'string') {
      return output
    }
    
    // Handle complex object response from FLUX training
    if (typeof output === 'object') {
      // For FLUX models, prefer the version string as it's used for generation
      if (output.version && typeof output.version === 'string') {
        return output.version
      }
      
      // Fallback to weights URL if version not available
      if (output.weights && typeof output.weights === 'string') {
        return output.weights
      }
      
      // Handle other possible formats
      if (output.url && typeof output.url === 'string') {
        return output.url
      }
    }
    
    console.warn('Unable to extract model URL from output:', output)
    return undefined
  }

  private extractModelNameFromDestination(destination?: string): string {
    // Extract model name from destination URL or output
    if (!destination || typeof destination !== 'string') {
      return 'Unknown Model'
    }
    
    try {
      // Handle different destination formats
      // Format: username/model-name or https://replicate.com/username/model-name
      const parts = destination.split('/')
      const modelPart = parts[parts.length - 1] || parts[parts.length - 2]
      
      if (!modelPart) {
        return 'Custom Model'
      }
      
      // Clean up the model name
      return modelPart
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim() || 'Custom Model'
    } catch (error) {
      console.warn('Error extracting model name from destination:', destination, error)
      return 'Custom Model'
    }
  }
}