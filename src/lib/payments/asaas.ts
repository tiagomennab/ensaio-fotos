interface AsaasConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
}

class AsaasAPI {
  private apiKey: string
  private baseURL: string

  constructor(config: AsaasConfig) {
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
      const error = await response.json()
      throw new Error(`Asaas API Error: ${error.message || response.statusText}`)
    }

    return response.json()
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
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
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
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
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
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
})

export { asaas, AsaasAPI }
export { AsaasAPI as AsaasClient }

// Helper functions for our SaaS
export const PLAN_PRICES = {
  PREMIUM: 19.90,
  GOLD: 49.90
} as const

export const PLAN_CYCLES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
} as const

export function getPlanPrice(plan: 'PREMIUM' | 'GOLD', cycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY') {
  const basePrice = PLAN_PRICES[plan]
  return cycle === 'YEARLY' ? basePrice * 10 : basePrice // 2 months free on yearly
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