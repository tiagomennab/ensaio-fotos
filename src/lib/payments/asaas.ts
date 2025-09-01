interface AsaasConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
}

class AsaasAPI {
  private apiKey: string
  private baseURL: string

  constructor(config: AsaasConfig) {
    if (!config.apiKey) {
      throw new Error('ASAAS_API_KEY is required')
    }
    
    this.apiKey = config.apiKey
    this.baseURL = config.environment === 'production' 
      ? 'https://www.asaas.com/api/v3'
      : 'https://sandbox.asaas.com/api/v3'
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = response.statusText
      
      try {
        // Tenta parsear a resposta como JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } else {
          // Se não for JSON, lê como texto
          const textError = await response.text()
          if (textError) {
            errorMessage = textError
          }
        }
      } catch (parseError) {
        // Se falhar ao parsear, mantém o statusText
        console.error('Failed to parse error response:', parseError)
      }

      throw new Error(`Asaas API Error (${response.status}): ${errorMessage}`)
    }

    // Verifica se a resposta tem conteúdo antes de parsear como JSON
    const text = await response.text()
    if (!text) {
      return {}
    }

    try {
      return JSON.parse(text)
    } catch (error) {
      console.error('Failed to parse response as JSON:', text)
      throw new Error('Invalid JSON response from Asaas API')
    }
  }

  // Customer management
  async createCustomer(customerData: {
    name: string
    email: string
    cpfCnpj?: string
    phone?: string
    mobilePhone?: string
    address?: string
    addressNumber?: string
    complement?: string
    province?: string
    city?: string
    state?: string
    postalCode?: string
  }) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })
  }

  async getCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`)
  }

  async updateCustomer(customerId: string, customerData: any) {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    })
  }

  // Subscription management
  async createSubscription(subscriptionData: {
    customer: string
    billingType: 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
    value: number
    nextDueDate: string
    cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
    description?: string
    endDate?: string
    maxPayments?: number
    externalReference?: string
    creditCard?: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    }
    creditCardHolderInfo?: {
      name: string
      email: string
      cpfCnpj: string
      postalCode: string
      addressNumber: string
      phone: string
    }
  }) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    })
  }

  async getSubscription(subscriptionId: string) {
    return this.request(`/subscriptions/${subscriptionId}`)
  }

  async updateSubscription(subscriptionId: string, data: any) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async cancelSubscription(subscriptionId: string) {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    })
  }

  // Payment management
  async createPayment(paymentData: {
    customer: string
    billingType: 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
    dueDate: string
    value: number
    description?: string
    externalReference?: string
    installmentCount?: number
    installmentValue?: number
    creditCard?: {
      holderName: string
      number: string
      expiryMonth: string
      expiryYear: string
      ccv: string
    }
    creditCardHolderInfo?: {
      name: string
      email: string
      cpfCnpj: string
      postalCode: string
      addressNumber: string
      phone: string
    }
  }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  async getPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`)
  }

  async getPayments(filters?: {
    customer?: string
    subscription?: string
    status?: string
    billingType?: string
    dateCreated?: string
    offset?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.request(endpoint)
  }

  // Webhook management
  async createWebhook(webhookData: {
    name: string
    url: string
    events: string[]
    enabled?: boolean
    interrupted?: boolean
    authToken?: string
  }) {
    return this.request('/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    })
  }

  async getWebhooks() {
    return this.request('/webhooks')
  }
}

// Initialize Asaas client
const asaas = new AsaasAPI({
  apiKey: process.env.ASAAS_API_KEY || '',
  environment: process.env.ASAAS_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
})

export { asaas, AsaasAPI }
export { AsaasAPI as AsaasClient }

// Helper functions for our SaaS
export const PLAN_PRICES = {
  STARTER: {
    monthly: 89.00,
    annual: 708.00,
    monthlyEquivalent: 59.00 // Para plano anual (708/12)
  },
  PREMIUM: {
    monthly: 269.00,
    annual: 2148.00,
    monthlyEquivalent: 179.00 // Para plano anual (2148/12)
  },
  GOLD: {
    monthly: 449.00,
    annual: 3588.00,
    monthlyEquivalent: 299.00 // Para plano anual (3588/12)
  }
} as const

export const PLAN_CYCLES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
} as const

export const PLAN_FEATURES = {
  STARTER: {
    models: 1, // por mês
    credits: 50, // por mês
    resolution: 'Resolução padrão'
  },
  PREMIUM: {
    models: 3, // por mês
    credits: 200, // por mês
    resolution: 'Alta resolução'
  },
  GOLD: {
    models: 10, // por mês
    credits: 1000, // por mês
    resolution: 'Máxima resolução'
  }
} as const

export function getPlanPrice(plan: 'STARTER' | 'PREMIUM' | 'GOLD', cycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY') {
  return cycle === 'YEARLY' ? PLAN_PRICES[plan].annual : PLAN_PRICES[plan].monthly
}

// Função para calcular economia anual (4 meses grátis)
export function calculateAnnualSavings(plan: 'STARTER' | 'PREMIUM' | 'GOLD') {
  const monthlyPrice = PLAN_PRICES[plan].monthly
  const annualPrice = PLAN_PRICES[plan].annual
  const savings = (monthlyPrice * 12) - annualPrice
  const monthsEquivalent = Math.round(savings / monthlyPrice)
  
  return {
    savings,
    monthsEquivalent,
    percentage: Math.round((savings / (monthlyPrice * 12)) * 100),
    formattedSavings: `R$ ${savings.toFixed(2)}`
  }
}

export function formatBrazilianDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getNextDueDate(cycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY'): string {
  const date = new Date()
  if (cycle === 'YEARLY') {
    date.setFullYear(date.getFullYear() + 1)
  } else {
    date.setMonth(date.getMonth() + 1)
  }
  return formatBrazilianDate(date)
}