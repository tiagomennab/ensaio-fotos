import { UPSCALE_CONFIG, UpscaleOptions, UpscalePlan } from './upscale-config'

/**
 * Valida se um arquivo de imagem é adequado para upscale
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Verifica formato
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !UPSCALE_CONFIG.supportedFormats.includes(extension)) {
    return {
      isValid: false,
      error: `Formato não suportado. Use: ${UPSCALE_CONFIG.supportedFormats.join(', ')}`
    }
  }

  // Verifica tamanho
  if (file.size > UPSCALE_CONFIG.maxFileSize) {
    const maxSizeMB = UPSCALE_CONFIG.maxFileSize / (1024 * 1024)
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`
    }
  }

  return { isValid: true }
}

/**
 * Valida URL de imagem para upscale
 */
export function validateImageUrl(imageUrl: string): { isValid: boolean; error?: string } {
  try {
    new URL(imageUrl)
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: 'URL de imagem inválida'
    }
  }
}

/**
 * Valida opções de upscale conforme ranges configurados
 */
export function validateUpscaleOptions(options: UpscaleOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const { ranges } = UPSCALE_CONFIG

  // Valida creativity
  if (options.creativity !== undefined) {
    if (options.creativity < ranges.creativity.min || options.creativity > ranges.creativity.max) {
      errors.push(`Creativity deve estar entre ${ranges.creativity.min} e ${ranges.creativity.max}`)
    }
  }

  // Valida resemblance
  if (options.resemblance !== undefined) {
    if (options.resemblance < ranges.resemblance.min || options.resemblance > ranges.resemblance.max) {
      errors.push(`Resemblance deve estar entre ${ranges.resemblance.min} e ${ranges.resemblance.max}`)
    }
  }

  // Valida dynamic
  if (options.dynamic !== undefined) {
    if (options.dynamic < ranges.dynamic.min || options.dynamic > ranges.dynamic.max) {
      errors.push(`Dynamic deve estar entre ${ranges.dynamic.min} e ${ranges.dynamic.max}`)
    }
  }

  // Valida sharpen
  if (options.sharpen !== undefined) {
    if (options.sharpen < ranges.sharpen.min || options.sharpen > ranges.sharpen.max) {
      errors.push(`Sharpen deve estar entre ${ranges.sharpen.min} e ${ranges.sharpen.max}`)
    }
  }

  // Valida num_inference_steps
  if (options.num_inference_steps !== undefined) {
    if (options.num_inference_steps < ranges.num_inference_steps.min || 
        options.num_inference_steps > ranges.num_inference_steps.max) {
      errors.push(`Inference steps deve estar entre ${ranges.num_inference_steps.min} e ${ranges.num_inference_steps.max}`)
    }
  }

  // Valida scale_factor
  if (!UPSCALE_CONFIG.scaleFactors.includes(options.scale_factor)) {
    errors.push(`Scale factor deve ser um de: ${UPSCALE_CONFIG.scaleFactors.join(', ')}`)
  }

  // Valida sd_model
  if (options.sd_model && !UPSCALE_CONFIG.options.sd_models.includes(options.sd_model)) {
    errors.push(`Modelo SD deve ser um de: ${UPSCALE_CONFIG.options.sd_models.join(', ')}`)
  }

  // Valida scheduler
  if (options.scheduler && !UPSCALE_CONFIG.options.schedulers.includes(options.scheduler)) {
    errors.push(`Scheduler deve ser um de: ${UPSCALE_CONFIG.options.schedulers.join(', ')}`)
  }

  // Valida output_format
  if (options.output_format && !UPSCALE_CONFIG.options.output_formats.includes(options.output_format)) {
    errors.push(`Formato de saída deve ser um de: ${UPSCALE_CONFIG.options.output_formats.join(', ')}`)
  }

  // Valida tiling_width
  if (options.tiling_width !== undefined) {
    if (options.tiling_width < ranges.tiling_width.min || options.tiling_width > ranges.tiling_width.max) {
      errors.push(`Tiling width deve estar entre ${ranges.tiling_width.min} e ${ranges.tiling_width.max}`)
    }
  }

  // Valida tiling_height
  if (options.tiling_height !== undefined) {
    if (options.tiling_height < ranges.tiling_height.min || options.tiling_height > ranges.tiling_height.max) {
      errors.push(`Tiling height deve estar entre ${ranges.tiling_height.min} e ${ranges.tiling_height.max}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Verifica se um usuário pode fazer upscale baseado no seu plano
 */
export function canUserUpscale(userPlan: UpscalePlan, scaleFactor: number, dailyUsage: number): {
  canUpscale: boolean
  reason?: string
} {
  const limits = UPSCALE_CONFIG.planLimits[userPlan]

  // Verifica limite diário
  if (dailyUsage >= limits.dailyLimit) {
    return {
      canUpscale: false,
      reason: `Limite diário atingido (${limits.dailyLimit} upscales/dia para o plano ${userPlan})`
    }
  }

  // Verifica fator de escala máximo
  if (scaleFactor > limits.maxScaleFactor) {
    return {
      canUpscale: false,
      reason: `Fator de escala ${scaleFactor}x não disponível no plano ${userPlan} (máximo: ${limits.maxScaleFactor}x)`
    }
  }

  return { canUpscale: true }
}

/**
 * Calcula créditos necessários para upscale
 */
export function calculateUpscaleCredits(imagesCount: number): number {
  const { credits } = UPSCALE_CONFIG
  
  if (imagesCount >= credits.batchMinimum) {
    return imagesCount * credits.batchDiscount
  }
  
  return imagesCount * credits.baseUpscale
}

/**
 * Mescla opções do usuário com defaults
 */
export function mergeUpscaleOptions(userOptions: Partial<UpscaleOptions>): UpscaleOptions {
  return {
    ...UPSCALE_CONFIG.defaults,
    ...userOptions
  } as UpscaleOptions
}

/**
 * Gera um seed aleatório se não fornecido
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000)
}

/**
 * Estima tempo de processamento baseado no fator de escala
 */
export function estimateProcessingTime(scaleFactor: number): number {
  const baseTime = 30000 // 30 segundos base
  const multiplier = {
    2: 1,
    4: 1.5,
    8: 2.5
  }[scaleFactor] || 1
  
  return Math.round(baseTime * multiplier)
}

/**
 * Formata resolução estimada após upscale
 */
export function calculateUpscaledResolution(originalWidth: number, originalHeight: number, scaleFactor: number) {
  return {
    width: originalWidth * scaleFactor,
    height: originalHeight * scaleFactor,
    megapixels: (originalWidth * scaleFactor * originalHeight * scaleFactor) / 1000000
  }
}

/**
 * Gera ID único para job de upscale
 */
export function generateUpscaleJobId(): string {
  return `upscale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Verifica se uma URL do Replicate está próxima da expiração
 */
export function isReplicateUrlNearExpiry(url: string, minutesThreshold: number = 10): boolean {
  try {
    // URLs do Replicate têm formato: https://replicate.delivery/pbxt/...
    if (!url.includes('replicate.delivery')) {
      return false // Not a temporary Replicate URL
    }
    
    // URLs temporárias do Replicate expiram em ~1 hora
    // Por simplicidade, consideramos qualquer URL do replicate.delivery como temporária
    return true
  } catch (error) {
    console.error('Error checking URL expiry:', error)
    return false
  }
}

/**
 * Monitora URLs temporárias e alerta sobre expiração iminente
 */
export function monitorUrlExpiration(urls: string[], generationId: string): {
  temporaryUrls: string[]
  needsImmediateStorage: boolean
  expiryWarning: string | null
} {
  const temporaryUrls = urls.filter(url => isReplicateUrlNearExpiry(url))
  const needsImmediateStorage = temporaryUrls.length > 0
  
  let expiryWarning = null
  if (needsImmediateStorage) {
    expiryWarning = `⚠️ WARNING: ${temporaryUrls.length} temporary URLs detected for generation ${generationId}. These URLs will expire in ~1 hour and must be stored permanently immediately.`
    console.warn(expiryWarning)
  }
  
  return {
    temporaryUrls,
    needsImmediateStorage,
    expiryWarning
  }
}

/**
 * Validação abrangente antes de enviar para API
 */
export function comprehensiveInputValidation(
  imageUrl: string,
  options: Partial<UpscaleOptions>,
  userPlan: string
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validação de URL
  const urlValidation = validateImageUrl(imageUrl)
  if (!urlValidation.isValid) {
    errors.push(urlValidation.error!)
  }
  
  // Validação de opções completas
  const mergedOptions = mergeUpscaleOptions(options)
  const optionsValidation = validateUpscaleOptions(mergedOptions)
  if (!optionsValidation.isValid) {
    errors.push(...optionsValidation.errors)
  }
  
  // Validação específica de tamanho de imagem via URL
  if (imageUrl) {
    try {
      const url = new URL(imageUrl)
      // Check if it's a data URI
      if (url.protocol === 'data:') {
        const dataSizeMatch = imageUrl.match(/data:[^;]+;base64,(.+)/)
        if (dataSizeMatch) {
          const base64Data = dataSizeMatch[1]
          const sizeInBytes = (base64Data.length * 3) / 4
          if (sizeInBytes > UPSCALE_CONFIG.maxFileSize) {
            errors.push(`Data URI too large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB, max: ${UPSCALE_CONFIG.maxFileSize / 1024 / 1024}MB`)
          }
          if (sizeInBytes > 256 * 1024) {
            warnings.push('Data URI > 256KB: Consider using HTTP URL for better performance')
          }
        }
      }
    } catch (urlError) {
      errors.push('Invalid image URL format')
    }
  }
  
  // Validação de plano do usuário
  const planValidation = canUserUpscale(userPlan as any, mergedOptions.scale_factor, 0)
  if (!planValidation.canUpscale) {
    errors.push(planValidation.reason!)
  }
  
  // Avisos de otimização
  if (mergedOptions.creativity && mergedOptions.creativity > 0.7) {
    warnings.push('High creativity (>0.7) may produce unexpected results. Consider values 0.3-0.6 for better consistency.')
  }
  
  if (mergedOptions.num_inference_steps && mergedOptions.num_inference_steps > 50) {
    warnings.push('High inference steps (>50) will increase processing time significantly.')
  }
  
  if (mergedOptions.scale_factor === 8) {
    warnings.push('8x scaling requires very high quality input images and may fail on low resolution sources.')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}