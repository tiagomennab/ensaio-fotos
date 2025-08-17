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
  const selectedPlan = searchParams.get('plan') || 'PREMIUM'

  const [step, setStep] = useState(1)
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

  const planDetails = {
    PREMIUM: {
      name: 'Premium',
      price: 19.90,
      features: ['3 AI models', '100 generations/month', '1024x1024 resolution', 'No watermarks']
    },
    GOLD: {
      name: 'Gold',
      price: 49.90,
      features: ['Unlimited models', '500 generations/month', '2048x2048 resolution', 'API access']
    }
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

      const data = await response.json()
      
      if (data.success) {
        setStep(2)
      } else {
        alert('Erro ao criar cliente: ' + data.error)
      }
    } catch (error) {
      alert('Erro na comunicação com servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    setLoading(true)
    try {
      const subscriptionData = {
        customerId: session?.user?.id, // This should be the Asaas customer ID
        plan: selectedPlan,
        cycle: 'MONTHLY',
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
        alert('Erro ao criar assinatura: ' + data.error)
      }
    } catch (error) {
      alert('Erro na comunicação com servidor')
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
              Step {step} of 2
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upgrading to {currentPlan.name}</CardTitle>
            <CardDescription>
              R$ {currentPlan.price}/month • {currentPlan.features.join(' • ')}
            </CardDescription>
          </CardHeader>
        </Card>

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
                    onChange={(e) => setCustomerData(prev => ({ ...prev, cpfCnpj: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="000.000.000-00"
                    required
                  />
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'CREDIT_CARD' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-gray-600">Instant</div>
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
                    <div className="text-sm text-gray-600">Instant</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('BOLETO')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'BOLETO' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Boleto</div>
                    <div className="text-sm text-gray-600">1-2 days</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'BANK_TRANSFER' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-600">1-2 days</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Form */}
            {paymentMethod === 'CREDIT_CARD' && (
              <Card>
                <CardHeader>
                  <CardTitle>Credit Card Information</CardTitle>
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
              {loading ? 'Processing...' : `Complete Payment - R$ ${currentPlan.price}`}
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