export const AI_CONFIG = {
  // Provider selection: 'replicate' | 'runpod' | 'local'
  provider: (process.env.AI_PROVIDER || 'replicate') as 'replicate' | 'runpod' | 'local',
  
  // Replicate Configuration
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN || '',
    webhookSecret: process.env.REPLICATE_WEBHOOK_SECRET || '',
    // Model destination configuration
    modelNaming: {
      baseUsername: process.env.REPLICATE_USERNAME || 'vibephoto',
      prefix: 'flux-lora',
      separator: '-'
    },
    // Popular models for training and generation
    models: {
      // FLUX.1 for training and generation - Updated per Replicate API docs
      flux: {
        training: 'ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2',
        generation: 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e'
      },
      // Stable Diffusion models
      sdxl: {
        training: 'cloneofsimo/lora:fce477182f407ffd66b94b08e761424cabd13b82b518754b83080bc75ad32466',
        generation: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        turbo: 'stability-ai/sdxl-turbo:da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf' // Faster generation
      },
      // Real-ESRGAN for upscaling
      upscaler: 'nightmareai/real-esrgan',
      // Background removal
      backgroundRemoval: 'rembg/new:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003'
    }
  },
  
  // RunPod Configuration
  runpod: {
    apiKey: process.env.RUNPOD_API_KEY || '',
    endpointId: process.env.RUNPOD_ENDPOINT_ID || '',
    webhookUrl: process.env.RUNPOD_WEBHOOK_URL || ''
  },
  
  // Training Configuration
  training: {
    // Default training parameters
    defaultParams: {
      steps: 1000,
      learningRate: 1e-4,
      batchSize: 1,
      resolution: 1024,
      triggerWord: 'TOK', // Default trigger word
      classWord: 'person', // Default class word
    },
    
    // Quality settings based on user plan
    qualitySettings: {
      FREE: {
        maxSteps: 500,
        maxResolution: 512,
        maxImages: 10
      },
      PREMIUM: {
        maxSteps: 1000,
        maxResolution: 1024,
        maxImages: 50
      },
      GOLD: {
        maxSteps: 2000,
        maxResolution: 1536,
        maxImages: 100
      }
    }
  },
  
  // Generation Configuration
  generation: {
    // Default generation parameters
    defaultParams: {
      width: 1024,
      height: 1024,
      steps: 20,
      guidance_scale: 7.5,
      scheduler: 'DPMSolverMultistep',
      safety_checker: true
    },
    
    // Generation limits based on user plan
    limits: {
      FREE: {
        maxGenerationsPerDay: 10,
        maxResolution: 512,
        maxSteps: 20
      },
      PREMIUM: {
        maxGenerationsPerDay: 100,
        maxResolution: 1024,
        maxSteps: 50
      },
      GOLD: {
        maxGenerationsPerDay: 500,
        maxResolution: 1536,
        maxSteps: 100
      }
    }
  },
  
  // Webhook Configuration
  webhooks: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    endpoints: {
      training: '/api/webhooks/training',
      generation: '/api/webhooks/generation'
    }
  },
  
  // Cost Configuration (in credits)
  costs: {
    training: {
      baseSteps: 1000, // Base training steps
      costPerStep: 0.001, // Cost per training step
      setupCost: 5 // Base setup cost
    },
    generation: {
      baseResolution: 1024, // Base resolution
      costPerMegapixel: 1, // Cost per megapixel
      costPerStep: 0.1 // Additional cost per inference step
    }
  }
}

// Helper function to calculate training cost
export function calculateTrainingCost(steps: number, resolution: number = 1024): number {
  const { training } = AI_CONFIG.costs
  const stepCost = (steps / training.baseSteps) * training.costPerStep * training.baseSteps
  const resolutionMultiplier = Math.pow(resolution / 512, 2)
  return Math.ceil((training.setupCost + stepCost) * resolutionMultiplier)
}

// Helper function to calculate generation cost
export function calculateGenerationCost(
  width: number, 
  height: number, 
  steps: number = 20
): number {
  const { generation } = AI_CONFIG.costs
  const megapixels = (width * height) / (1024 * 1024)
  const resolutionCost = megapixels * generation.costPerMegapixel
  const stepCost = (steps / 20) * generation.costPerStep
  return Math.ceil(resolutionCost + stepCost)
}

// Model quality scoring
export function calculateModelQuality(
  photoCount: number,
  avgResolution: number,
  diversityScore: number
): number {
  const photoScore = Math.min(photoCount / 15, 1) * 40 // Max 40 points for photos
  const resolutionScore = Math.min(avgResolution / 1024, 1) * 30 // Max 30 points for resolution
  const diversityScorePoints = diversityScore * 30 // Max 30 points for diversity
  
  return Math.round(photoScore + resolutionScore + diversityScorePoints)
}