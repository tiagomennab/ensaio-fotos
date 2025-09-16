'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Lock,
  Sparkles,
  Calendar,
  Loader2
} from 'lucide-react'

import { PaymentMethodSelector, PaymentMethod } from './payment-method-selector'
import { CustomerForm, CustomerData } from './customer-form'
import { CreditCardForm, CreditCardData } from './credit-card-form'
import { PixPayment } from './pix-payment'
import { formatBrazilianCurrency } from '@/lib/utils/brazilian-validators'

export interface CheckoutPlan {
  plan: 'STARTER' | 'PREMIUM' | 'GOLD'
  cycle: 'MONTHLY' | 'YEARLY'
  price: number
  originalPrice?: number
  discount?: number
}

interface CheckoutFlowProps {
  plan: CheckoutPlan
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

type CheckoutStep = 'payment-method' | 'customer-info' | 'payment-details' | 'processing' | 'confirmation'

export function CheckoutFlow({
  plan,
  onSuccess,
  onError,
  onCancel
}: CheckoutFlowProps) {
  const { data: session } = useSession()
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('payment-method')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>()
  const [customerData, setCustomerData] = useState<Partial<CustomerData>>({
    name: session?.user?.name || '',
    email: session?.user?.email || ''
  })
  const [creditCardData, setCreditCardData] = useState<Partial<CreditCardData>>({
    holderInfo: {
      name: '',
      email: '',
      cpfCnpj: '',
      postalCode: '',
      addressNumber: '',
      phone: ''
    }
  })
  const [installments, setInstallments] = useState(1)
  
  const [isCustomerValid, setIsCustomerValid] = useState(false)
  const [isCreditCardValid, setIsCreditCardValid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [paymentResult, setPaymentResult] = useState<any>(null)

  // Auto-advance from payment method selection
  useEffect(() => {
    if (paymentMethod && currentStep === 'payment-method') {
      setCurrentStep('customer-info')
    }
  }, [paymentMethod, currentStep])

  const handleNext = useCallback(() => {
    switch (currentStep) {
      case 'payment-method':
        if (paymentMethod) {
          setCurrentStep('customer-info')
        }
        break
      case 'customer-info':
        if (isCustomerValid) {
          if (paymentMethod === 'CREDIT_CARD') {
            setCurrentStep('payment-details')
          } else {
            handleProcessPayment()
          }
        }
        break
      case 'payment-details':
        if (isCreditCardValid) {
          handleProcessPayment()
        }
        break
    }
  }, [currentStep, paymentMethod, isCustomerValid, isCreditCardValid])

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'customer-info':
        setCurrentStep('payment-method')
        break
      case 'payment-details':
        setCurrentStep('customer-info')
        break
      case 'confirmation':
        setCurrentStep('payment-method')
        break
    }
  }, [currentStep])

  const handleProcessPayment = async () => {
    setIsProcessing(true)
    setError('')
    setCurrentStep('processing')

    try {
      const payload = {
        plan: {
          plan: plan.plan,
          cycle: plan.cycle,
          paymentMethod
        },
        customer: customerData,
        creditCard: paymentMethod === 'CREDIT_CARD' ? {
          ...creditCardData,
          holderInfo: {
            ...creditCardData.holderInfo,
            // Use customer data as fallback
            name: creditCardData.holderInfo?.name || customerData.name || '',
            email: creditCardData.holderInfo?.email || customerData.email || '',
            cpfCnpj: creditCardData.holderInfo?.cpfCnpj || customerData.cpfCnpj || '',
            postalCode: creditCardData.holderInfo?.postalCode || customerData.postalCode || '',
            addressNumber: creditCardData.holderInfo?.addressNumber || customerData.addressNumber || '',
            phone: creditCardData.holderInfo?.phone || customerData.phone || '',
            addressComplement: creditCardData.holderInfo?.addressComplement || customerData.complement,
            province: creditCardData.holderInfo?.province || customerData.province,
            city: creditCardData.holderInfo?.city || customerData.city,
            state: creditCardData.holderInfo?.state || customerData.state
          }
        } : undefined
      }

      const response = await fetch('/api/payments/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento')
      }

      setPaymentResult(result)
      
      // For PIX and Boleto, show confirmation with payment details
      if (paymentMethod === 'PIX' || paymentMethod === 'BOLETO') {
        setCurrentStep('confirmation')
      } else {
        // For credit card, success is immediate
        setCurrentStep('confirmation')
        setTimeout(() => {
          onSuccess?.(result.subscriptionId)
        }, 2000)
      }

    } catch (err: any) {
      setError(err.message)
      onError?.(err.message)
      setCurrentStep('customer-info') // Go back to allow retry
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentConfirmed = () => {
    onSuccess?.(paymentResult?.subscriptionId)
  }

  const handlePaymentExpired = () => {
    setError('PIX expirado. Tente novamente.')
    setCurrentStep('payment-method')
  }

  const getStepTitle = (step: CheckoutStep): string => {
    switch (step) {
      case 'payment-method': return 'Forma de Pagamento'
      case 'customer-info': return 'Dados Pessoais'
      case 'payment-details': return 'Dados do Cartão'
      case 'processing': return 'Processando...'
      case 'confirmation': return 'Confirmação'
      default: return ''
    }
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'payment-method': return !!paymentMethod
      case 'customer-info': return isCustomerValid
      case 'payment-details': return isCreditCardValid
      default: return false
    }
  }

  const maxInstallments = plan.plan === 'GOLD' ? 12 : plan.plan === 'PREMIUM' ? 6 : 3

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Finalizar Assinatura
            </CardTitle>
            <Badge variant="secondary" className="px-3 py-1">
              {getStepTitle(currentStep)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Plano {plan.plan}
                  <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600">
                    {plan.cycle === 'YEARLY' ? 'Anual' : 'Mensal'}
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600">
                  {plan.cycle === 'YEARLY' ? '12 meses' : '1 mês'} • Renovação automática
                </p>
                {plan.discount && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm line-through text-gray-500">
                      {formatBrazilianCurrency(plan.originalPrice || 0)}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      -{plan.discount}% OFF
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatBrazilianCurrency(plan.price)}
                </div>
                {paymentMethod === 'CREDIT_CARD' && installments > 1 && (
                  <p className="text-sm text-gray-600">
                    ou {installments}x de {formatBrazilianCurrency(plan.price / installments)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            {['payment-method', 'customer-info', 'payment-details', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-blue-600 text-white' :
                  ['payment-method', 'customer-info', 'payment-details'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {['payment-method', 'customer-info', 'payment-details'].indexOf(currentStep) > index ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    ['payment-method', 'customer-info', 'payment-details'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Payment Method Selection */}
          {currentStep === 'payment-method' && (
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodSelect={setPaymentMethod}
              plan={plan.plan}
            />
          )}

          {/* Customer Information */}
          {currentStep === 'customer-info' && (
            <CustomerForm
              data={customerData}
              onChange={setCustomerData}
              onValidationChange={setIsCustomerValid}
              showAddressFields={paymentMethod === 'BOLETO'}
            />
          )}

          {/* Credit Card Details */}
          {currentStep === 'payment-details' && paymentMethod === 'CREDIT_CARD' && (
            <CreditCardForm
              data={creditCardData}
              onChange={setCreditCardData}
              onValidationChange={setIsCreditCardValid}
              maxInstallments={maxInstallments}
              installments={installments}
              onInstallmentsChange={setInstallments}
              customerData={customerData}
            />
          )}

          {/* Processing */}
          {currentStep === 'processing' && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processando seu pagamento...
                </h3>
                <p className="text-gray-600">
                  Isso pode levar alguns instantes. Não feche esta página.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Confirmation */}
          {currentStep === 'confirmation' && paymentResult && (
            <div>
              {paymentMethod === 'PIX' && paymentResult.pix && (
                <PixPayment
                  paymentId={paymentResult.pix.paymentId}
                  qrCode={paymentResult.pix.qrCode}
                  payload={paymentResult.pix.payload}
                  amount={plan.price}
                  onPaymentConfirmed={handlePaymentConfirmed}
                  onPaymentExpired={handlePaymentExpired}
                />
              )}

              {paymentMethod === 'CREDIT_CARD' && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      Pagamento Aprovado!
                    </h3>
                    <p className="text-green-700 mb-4">
                      Sua assinatura foi ativada com sucesso.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Plano:</strong> {plan.plan} {plan.cycle === 'YEARLY' ? 'Anual' : 'Mensal'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Valor:</strong> {formatBrazilianCurrency(plan.price)}
                        {installments > 1 && ` (${installments}x)`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === 'BOLETO' && paymentResult.boleto && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Boleto Gerado</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription>
                        Seu boleto foi gerado. O pagamento deve ser realizado em até 7 dias para ativar sua assinatura.
                      </AlertDescription>
                    </Alert>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Código do boleto:</p>
                      <code className="text-sm font-mono bg-white p-2 rounded border">
                        {paymentResult.boleto.identificationField}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {!['processing', 'confirmation'].includes(currentStep) && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={currentStep === 'payment-method' ? onCancel : handleBack}
            disabled={isProcessing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 'payment-method' ? 'Cancelar' : 'Voltar'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                {currentStep === 'customer-info' && paymentMethod !== 'CREDIT_CARD' ? 'Finalizar' : 'Continuar'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Pagamento 100% seguro e criptografado</span>
        </div>
      </div>
    </div>
  )
}