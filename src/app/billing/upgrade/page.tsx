'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Smartphone, FileText, Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function UpgradePageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan')
  
  const [selectedPlan, setSelectedPlan] = useState(planFromUrl || 'STARTER')
  const [step, setStep] = useState(planFromUrl ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    address: {
      postalCode: '',
      addressNumber: '',
      complement: '',
      province: '',
      city: '',
      state: ''
    }
  })

  const [creditCardData, setCreditCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    holderInfo: {
      name: '',
      email: '',
      cpfCnpj: '',
      postalCode: '',
      addressNumber: '',
      phone: ''
    }
  })

  useEffect(() => {
    if (session?.user) {
      setCustomerData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  interface Plan {
    id: 'STARTER' | 'PREMIUM' | 'GOLD'
    name: string
    monthlyPrice: number
    annualPrice: number
    monthlyEquivalent: number
    description: string
    features: string[]
    popular: boolean
    color: 'blue' | 'purple' | 'yellow'
  }

  const planDetails: Record<string, Plan> = {
    STARTER: {
      id: 'STARTER',
      name: 'Starter',
      monthlyPrice: 89,
      annualPrice: 708,
      monthlyEquivalent: 59,
      description: 'Ideal para começar',
      features: ['1 modelo de IA por mês', '50 créditos por mês', 'Resolução padrão'],
      popular: false,
      color: 'blue'
    },
    PREMIUM: {
      id: 'PREMIUM',
      name: 'Premium',
      monthlyPrice: 269,
      annualPrice: 2148,
      monthlyEquivalent: 179,
      description: 'Para usuários regulares',
      features: ['3 modelos de IA por mês', '200 créditos por mês', 'Alta resolução'],
      popular: true,
      color: 'purple'
    },
    GOLD: {
      id: 'GOLD',
      name: 'Gold',
      monthlyPrice: 449,
      annualPrice: 3588,
      monthlyEquivalent: 299,
      description: 'Para uso intensivo',
      features: ['10 modelos de IA por mês', '1000 créditos por mês', 'Máxima resolução'],
      popular: false,
      color: 'yellow'
    }
  }

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const savings = (monthlyPrice * 12) - annualPrice
    const monthsEquivalent = Math.round(savings / monthlyPrice)
    return { savings, monthsEquivalent }
  }

  const currentPlan = planDetails[selectedPlan as keyof typeof planDetails]

  const handleCreateCustomer = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/asaas/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', response.status, errorText)
        alert(`Erro do servidor (${response.status}): ${errorText}`)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse)
        alert('Resposta inválida do servidor')
        return
      }

      const data = await response.json()
      
      if (data.success) {
        setStep(2)
      } else {
        alert('Erro ao criar cliente: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Client error:', error)
      alert('Erro na comunicação com servidor: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    setLoading(true)
    try {
      const subscriptionData = {
        customerId: session?.user?.stripeCustomerId, // Asaas customer ID salvo na sessão
        plan: selectedPlan,
        cycle: billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY',
        billingType: paymentMethod,
        ...(paymentMethod === 'CREDIT_CARD' && {
          creditCard: {
            holderName: creditCardData.holderName,
            number: creditCardData.number,
            expiryMonth: creditCardData.expiryMonth,
            expiryYear: creditCardData.expiryYear,
            ccv: creditCardData.ccv
          },
          creditCardHolderInfo: creditCardData.holderInfo
        })
      }

      const response = await fetch('/api/payments/asaas/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', response.status, errorText)
        alert(`Erro do servidor (${response.status}): ${errorText}`)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse)
        alert('Resposta inválida do servidor')
        return
      }

      const data = await response.json()
      
      if (data.success) {
        if (data.subscription.paymentLink) {
          // Redirect to payment link for non-credit card payments
          window.location.href = data.subscription.paymentLink
        } else {
          // Payment processed, redirect to success
          router.push('/billing/success')
        }
      } else {
        alert('Erro ao criar assinatura: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Client error:', error)
      alert('Erro na comunicação com servidor: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/billing">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Billing
                </Link>
              </Button>
            </div>
            <Badge variant="secondary">
              {step === 0 ? 'Escolha do Plano' : `Etapa ${step} de 2`}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Summary - Only show if plan is selected */}
        {step > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Upgrading to {currentPlan.name}
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setStep(0)}
                      className="text-xs"
                    >
                      Alterar Plano
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    R$ {billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice}{billingCycle === 'annual' ? '/ano' : '/mês'} • {currentPlan.features.slice(0, 2).join(' • ')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Escolha Seu Novo Plano</CardTitle>
              <CardDescription>
                {session?.user?.plan && (
                  <span className="text-sm">
                    Plano atual: <Badge variant="outline">{session.user.plan}</Badge>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-8 py-2 rounded-md text-sm font-medium transition-all relative ${
                      billingCycle === 'annual'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anual
                    <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                      4 meses grátis
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {Object.values(planDetails).map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-colors border-2 ${
                      selectedPlan === plan.id 
                        ? `border-${plan.color}-500 bg-${plan.color}-50 scale-105` 
                        : `border-gray-200 hover:border-${plan.color}-300`
                    } ${plan.popular ? 'relative' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                        Mais Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-center">
                        {billingCycle === 'annual' ? (
                          <>
                            <div className="text-2xl font-bold">
                              R$ {plan.annualPrice}
                              <span className="text-sm font-normal text-gray-500">/ano</span>
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              R$ {plan.monthlyEquivalent}/mês
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              💸 Economize {calculateSavings(plan.monthlyPrice, plan.annualPrice).monthsEquivalent} meses!
                            </div>
                          </>
                        ) : (
                          <div className="text-2xl font-bold">
                            R$ {plan.monthlyPrice}
                            <span className="text-sm font-normal text-gray-500">/mês</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-gray-600 mb-3">{plan.description}</div>
                      <div className="space-y-1 text-sm">
                        {plan.features.map((feature, index) => (
                          <div key={index}>✓ {feature}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={() => setStep(1)} 
                className="w-full mt-6"
                size="lg"
              >
                Continuar com {planDetails[selectedPlan].name} - R$ {
                  billingCycle === 'annual' 
                    ? planDetails[selectedPlan].annualPrice
                    : planDetails[selectedPlan].monthlyPrice
                }{billingCycle === 'annual' ? '/ano' : '/mês'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                We need some basic information to process your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={customerData.cpfCnpj}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, cpfCnpj: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="11144477735 (apenas números)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Para testes, use: 11144477735
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <Button onClick={handleCreateCustomer} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
                <CardDescription>
                  Select how you'd like to pay for your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'CREDIT_CARD' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Cartão de Crédito</div>
                    <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('DEBIT_CARD')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'DEBIT_CARD' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Cartão de Débito</div>
                    <div className="text-sm text-gray-600">Débito à vista</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'PIX' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Form */}
            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Cartão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={creditCardData.holderName}
                        onChange={(e) => setCreditCardData(prev => ({ ...prev, holderName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={creditCardData.number}
                        onChange={(e) => setCreditCardData(prev => ({ ...prev, number: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Month
                      </label>
                      <input
                        type="text"
                        value={creditCardData.expiryMonth}
                        onChange={(e) => setCreditCardData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="MM"
                        maxLength={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Year
                      </label>
                      <input
                        type="text"
                        value={creditCardData.expiryYear}
                        onChange={(e) => setCreditCardData(prev => ({ ...prev, expiryYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="YYYY"
                        maxLength={4}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={creditCardData.ccv}
                        onChange={(e) => setCreditCardData(prev => ({ ...prev, ccv: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleCreateSubscription} disabled={loading} className="w-full">
              {loading ? 'Processando...' : `Finalizar Pagamento - R$ ${billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <UpgradePageContent />
    </Suspense>
  )
}