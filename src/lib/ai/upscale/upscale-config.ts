export const UPSCALE_CONFIG = {
  // Modelo oficial com hash da documentação
  model: 'philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e',
  
  // Limites e validações
  maxFileSize: 20 * 1024 * 1024, // 20MB
  supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  minResolution: { width: 64, height: 64 },
  maxResolution: { width: 4096, height: 4096 },
  
  // Fatores de escala disponíveis
  scaleFactors: [2, 4, 8] as const,
  
  // Configurações padrão conforme documentação oficial
  defaults: {
    prompt: "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
    negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg, blurry, artifacts, oversaturated, unrealistic, distorted",
    scale_factor: 2,
    creativity: 0.35,
    resemblance: 0.6,
    dynamic: 6,
    sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
    scheduler: "DPM++ 3M SDE Karras",
    num_inference_steps: 18,
    seed: 1337,
    handfix: "disabled",
    sharpen: 0,
    output_format: "png",
    pattern: false,
    downscaling: false,
    tiling_width: 112,
    tiling_height: 144
  },
  
  // Opções disponíveis para cada parâmetro
  options: {
    sd_models: [
      "juggernaut_reborn.safetensors [338b85bc4f]",
      "epicrealism_naturalSinRC1VAE.safetensors [84d76a0328]",
      "flat2DAnimerge_v45Sharp.safetensors"
    ],
    schedulers: [
      "DPM++ 3M SDE Karras",
      "DPM++ 2M Karras", 
      "Euler a",
      "DDIM"
    ],
    handfix_options: ["disabled", "enabled"],
    output_formats: ["png", "jpg", "webp"]
  },
  
  // Ranges para validação (conforme documentação oficial)
  ranges: {
    creativity: { min: 0.3, max: 0.9 }, // Documentação: 0.3-0.9 (max 1)
    resemblance: { min: 0.3, max: 1.6 }, // Documentação: 0.3-1.6 (max 3)
    dynamic: { min: 1, max: 50 }, // HDR: 1-50
    sharpen: { min: 0, max: 10 },
    num_inference_steps: { min: 1, max: 100 },
    tiling_width: { min: 16, max: 256 },
    tiling_height: { min: 16, max: 256 }
  },
  
  // Sistema de créditos
  credits: {
    baseUpscale: 5,
    batchDiscount: 4, // Para 10+ imagens
    batchMinimum: 10
  },
  
  // Limites por plano
  planLimits: {
    STARTER: { 
      dailyLimit: 999, // Removido limite para testes
      maxScaleFactor: 8, // Liberado fator máximo para testes
      enabledFeatures: ['basic', 'advanced', 'batch', 'auto'] // Todas as features para testes
    },
    PREMIUM: { 
      dailyLimit: 999, 
      maxScaleFactor: 8,
      enabledFeatures: ['basic', 'advanced', 'batch', 'auto']
    },
    GOLD: { 
      dailyLimit: 999, 
      maxScaleFactor: 8,
      enabledFeatures: ['basic', 'advanced', 'batch', 'auto']
    }
  }
} as const

export type UpscaleOptions = {
  prompt?: string
  negative_prompt?: string
  scale_factor: 2 | 4 | 8
  creativity?: number
  resemblance?: number
  dynamic?: number
  sd_model?: string
  scheduler?: string
  num_inference_steps?: number
  seed?: number
  handfix?: "disabled" | "enabled"
  sharpen?: number
  output_format?: "png" | "jpg" | "webp"
  pattern?: boolean
  downscaling?: boolean
  lora_links?: string
  tiling_width?: number
  tiling_height?: number
}

export type UpscaleJob = {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  originalImage: string
  resultImage?: string
  options: UpscaleOptions
  progress?: number
  error?: string
  createdAt: Date
  completedAt?: Date
  estimatedTime?: number
  creditsUsed: number
}

export type UpscalePlan = keyof typeof UPSCALE_CONFIG.planLimits