import Replicate from 'replicate'
import { AI_CONFIG } from '../config'
import { AIError } from '../base'
import { UPSCALE_CONFIG, UpscaleOptions, UpscaleJob } from './upscale-config'
import { 
  validateImageUrl, 
  validateUpscaleOptions, 
  mergeUpscaleOptions,
  generateUpscaleJobId,
  generateRandomSeed 
} from './upscale-utils'
import { downloadAndStoreImages } from '@/lib/storage/utils'

export class ClarityUpscaler {
  private client: Replicate

  constructor() {
    if (!AI_CONFIG.replicate.apiToken) {
      throw new AIError('Replicate API token not configured', 'REPLICATE_CONFIG_ERROR')
    }

    this.client = new Replicate({
      auth: AI_CONFIG.replicate.apiToken,
      // Add default headers including Prefer for synchronous responses
      userAgent: 'VibePhoto-Upscale/1.0'
    })
  }

  /**
   * Faz upscale de uma imagem usando Clarity AI
   */
  async upscaleImage(
    imageUrl: string, 
    options: Partial<UpscaleOptions>,
    preferSync: boolean = true
  ): Promise<{ jobId: string; status: string; result?: string[] }> {
    console.log('🔍 Starting Clarity AI upscale:', { imageUrl: imageUrl.substring(0, 50), options })

    // Valida URL da imagem
    const urlValidation = validateImageUrl(imageUrl)
    if (!urlValidation.isValid) {
      throw new AIError(urlValidation.error!, 'INVALID_IMAGE_URL')
    }

    // Mescla opções com defaults
    const fullOptions = mergeUpscaleOptions(options)
    
    // Gera seed aleatório se não fornecido
    if (!fullOptions.seed) {
      fullOptions.seed = generateRandomSeed()
    }

    // Valida opções
    const validation = validateUpscaleOptions(fullOptions)
    if (!validation.isValid) {
      throw new AIError(
        `Opções inválidas: ${validation.errors.join(', ')}`,
        'INVALID_UPSCALE_OPTIONS'
      )
    }

    try {
      console.log('🚀 Sending upscale request to Clarity AI via Replicate (v2)')
      console.log('🔑 API Token configured:', AI_CONFIG.replicate.apiToken ? 'YES' : 'NO')
      
      // Configure webhook for upscale completion - only if HTTPS URL available
      const webhookConfig: any = {}
      const baseUrl = process.env.NEXTAUTH_URL
      
      // Only add webhook if we have a valid HTTPS URL (production/staging)
      if (baseUrl && baseUrl.startsWith('https://')) {
        webhookConfig.webhook = `${baseUrl}/api/webhooks/replicate`
        webhookConfig.webhook_events_filter = ['start', 'output', 'completed']
        console.log('🔗 Using webhook:', webhookConfig.webhook)
      } else {
        console.log('⚠️ Skipping webhook (development mode - no HTTPS URL available)')
      }

      // Configure request options with correct structure for Replicate API
      const requestOptions: any = {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageUrl,
          prompt: fullOptions.prompt,
          negative_prompt: fullOptions.negative_prompt,
          scale_factor: fullOptions.scale_factor,
          creativity: fullOptions.creativity,
          resemblance: fullOptions.resemblance,
          dynamic: fullOptions.dynamic,
          sd_model: fullOptions.sd_model,
          scheduler: fullOptions.scheduler,
          num_inference_steps: fullOptions.num_inference_steps,
          seed: fullOptions.seed,
          handfix: fullOptions.handfix,
          sharpen: fullOptions.sharpen,
          output_format: fullOptions.output_format,
          ...(fullOptions.pattern && { pattern: fullOptions.pattern }),
          ...(fullOptions.downscaling && { downscaling: fullOptions.downscaling }),
          ...(fullOptions.lora_links && { lora_links: fullOptions.lora_links }),
          ...(fullOptions.tiling_width && { tiling_width: fullOptions.tiling_width }),
          ...(fullOptions.tiling_height && { tiling_height: fullOptions.tiling_height })
        },
        ...webhookConfig
      }

      // Add Prefer header if preferring synchronous response
      let prediction
      if (preferSync) {
        try {
          prediction = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
              'Authorization': `Token ${AI_CONFIG.replicate.apiToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'wait=60'
            },
            body: JSON.stringify(requestOptions)
          })
          
          if (prediction.ok) {
            const result = await prediction.json()
            console.log('✅ Synchronous upscale response received:', result.status)
            
            // If completed synchronously, return with results
            if (result.status === 'succeeded' && result.output) {
              const outputUrls = Array.isArray(result.output) ? result.output : [result.output]
              console.log('✅ Synchronous upscale completed, preparing permanent storage...')
              
              return {
                jobId: result.id,
                status: result.status,
                result: outputUrls,
                requiresStorage: true // Flag indicating these URLs need immediate storage
              }
            }
            
            // If still processing, continue with normal polling
            return {
              jobId: result.id,
              status: result.status
            }
          } else {
            console.warn('⚠️ Synchronous request failed, falling back to async')
          }
        } catch (syncError) {
          console.warn('⚠️ Synchronous request error, falling back to async:', syncError)
        }
      }

      // Fallback to standard async prediction using direct fetch
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${AI_CONFIG.replicate.apiToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'VibePhoto-Upscale/1.0'
        },
        body: JSON.stringify(requestOptions)
      })
      
      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Request to ${response.url} failed with status ${response.status} ${response.statusText}: ${errorBody}`)
      }
      
      prediction = await response.json()

      console.log('✅ Upscale job created:', prediction.id)

      return {
        jobId: prediction.id,
        status: prediction.status
      }

    } catch (error) {
      console.error('❌ Clarity AI upscale error:', error)
      
      if (error instanceof Error) {
        throw new AIError(
          `Falha no upscale: ${error.message}`,
          'UPSCALE_FAILED'
        )
      }
      
      throw new AIError('Erro desconhecido no upscale', 'UNKNOWN_UPSCALE_ERROR')
    }
  }

  /**
   * Verifica o status de um job de upscale
   */
  async getUpscaleStatus(jobId: string): Promise<{
    status: string
    progress?: number
    result?: string[]
    error?: string
  }> {
    try {
      const prediction = await this.client.predictions.get(jobId)
      
      return {
        status: prediction.status,
        progress: this.calculateProgress(prediction.status),
        result: prediction.output ? (Array.isArray(prediction.output) ? prediction.output : [prediction.output]) : undefined,
        error: prediction.error
      }
    } catch (error) {
      console.error('❌ Error checking upscale status:', error)
      throw new AIError('Falha ao verificar status do upscale', 'STATUS_CHECK_FAILED')
    }
  }

  /**
   * Cancela um job de upscale
   */
  async cancelUpscale(jobId: string): Promise<boolean> {
    try {
      await this.client.predictions.cancel(jobId)
      console.log('🛑 Upscale job cancelled:', jobId)
      return true
    } catch (error) {
      console.error('❌ Error cancelling upscale:', error)
      return false
    }
  }

  /**
   * Faz upscale de múltiplas imagens (batch)
   */
  async batchUpscale(
    imageUrls: string[],
    options: Partial<UpscaleOptions>
  ): Promise<{ jobIds: string[]; totalJobs: number }> {
    console.log('📦 Starting batch upscale:', { count: imageUrls.length })

    const jobIds: string[] = []
    const errors: string[] = []

    for (const [index, imageUrl] of imageUrls.entries()) {
      try {
        console.log(`🔄 Processing image ${index + 1}/${imageUrls.length}`)
        
        const result = await this.upscaleImage(imageUrl, options)
        jobIds.push(result.jobId)
        
        // Pequena pausa entre requests para evitar rate limiting
        if (index < imageUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        errors.push(`Imagem ${index + 1}: ${errorMessage}`)
        console.error(`❌ Failed to upscale image ${index + 1}:`, error)
      }
    }

    if (errors.length > 0) {
      console.warn('⚠️ Some images failed to upscale:', errors)
    }

    return {
      jobIds,
      totalJobs: imageUrls.length
    }
  }

  /**
   * Verifica status de múltiplos jobs
   */
  async getBatchStatus(jobIds: string[]): Promise<{
    completed: number
    processing: number
    failed: number
    results: string[]
  }> {
    const statuses = await Promise.all(
      jobIds.map(jobId => this.getUpscaleStatus(jobId).catch(() => ({ status: 'failed' })))
    )

    const completed = statuses.filter(s => s.status === 'succeeded').length
    const processing = statuses.filter(s => s.status === 'processing' || s.status === 'starting').length
    const failed = statuses.filter(s => s.status === 'failed' || s.status === 'canceled').length
    
    const results = statuses
      .filter(s => s.result && s.result.length > 0)
      .flatMap(s => s.result!)

    return { completed, processing, failed, results }
  }

  /**
   * Calcula progresso baseado no status
   */
  private calculateProgress(status: string): number {
    const progressMap: Record<string, number> = {
      'starting': 10,
      'processing': 50,
      'succeeded': 100,
      'failed': 0,
      'canceled': 0
    }
    
    return progressMap[status] || 0
  }

  /**
   * Verifica se o serviço está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Tenta fazer uma requisição simples para verificar conectividade
      const models = await this.client.models.list()
      return Array.isArray(models.results)
    } catch (error) {
      console.error('❌ Clarity AI health check failed:', error)
      return false
    }
  }

  /**
   * Melhora qualidade de imagem (wrapper simplificado)
   */
  async enhanceQuality(
    imageUrl: string, 
    settings?: { 
      creativity?: number
      resemblance?: number
      sharpen?: number 
    }
  ): Promise<{ jobId: string; status: string }> {
    const enhanceOptions: Partial<UpscaleOptions> = {
      scale_factor: 2, // Mínimo para melhoria
      creativity: settings?.creativity || 0.5,
      resemblance: settings?.resemblance || 0.8,
      sharpen: settings?.sharpen || 2,
      dynamic: 8, // Maior contraste para qualidade
      num_inference_steps: 25 // Mais steps para qualidade
    }

    return this.upscaleImage(imageUrl, enhanceOptions)
  }

  /**
   * Redimensiona com IA (wrapper para casos específicos)
   */
  async smartResize(
    imageUrl: string,
    targetScale: 2 | 4 | 8,
    preserveDetails: boolean = true
  ): Promise<{ jobId: string; status: string }> {
    const resizeOptions: Partial<UpscaleOptions> = {
      scale_factor: targetScale,
      resemblance: preserveDetails ? 1.0 : 0.6,
      creativity: preserveDetails ? 0.2 : 0.5,
      sharpen: preserveDetails ? 1 : 0,
      handfix: 'enabled' // Sempre ativo para redimensionamento
    }

    return this.upscaleImage(imageUrl, resizeOptions)
  }
}