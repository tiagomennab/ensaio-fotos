'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  CreditCard, 
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Plan {
  id: 'STARTER' | 'PREMIUM' | 'GOLD'
  name: string
  monthlyPrice: number
  annualPrice: number
  monthlyEquivalent: number
  description: string
  features: string[]
  popular: boolean
  credits: number
  models: number
}

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonus?: number
  popular?: boolean
  description: string
}

interface PaymentMethod {
  id: string
  type: 'credit' | 'debit'
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

const plans: Plan[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 89,
    annualPrice: 708,
    monthlyEquivalent: 59,
    description: 'Ideal para começar com geração de fotos profissionais',
    features: [
      '500 créditos mensais',
      '1 modelo de IA',
      'Resolução padrão',
      'Suporte por email'
    ],
    popular: false,
    credits: 500,
    models: 1
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    monthlyPrice: 179,
    annualPrice: 1788,
    monthlyEquivalent: 149,
    description: 'Ótimo para criadores de conteúdo e profissionais',
    features: [
      '1200 créditos mensais',
      '2 modelos de IA',
      'Alta resolução',
      'Processamento prioritário',
      'Suporte prioritário'
    ],
    popular: true,
    credits: 1200,
    models: 2
  },
  {
    id: 'GOLD',
    name: 'Gold',
    monthlyPrice: 299,
    annualPrice: 2988,
    monthlyEquivalent: 249,
    description: 'Para agências e usuários avançados',
    features: [
      '2500 créditos mensais',
      '5 modelos de IA',
      'Máxima resolução',
      'Processamento super rápido',
      'Suporte dedicado',
      'API access'
    ],
    popular: false,
    credits: 2500,
    models: 5
  }
]

const creditPackages: CreditPackage[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    credits: 350,
    price: 89,
    description: 'Perfeito para projetos pequenos'
  },
  {
    id: 'avancado',
    name: 'Avançado',
    credits: 1000,
    price: 179,
    bonus: 100,
    popular: true,
    description: 'Ideal para uso frequente'
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 2200,
    price: 359,
    bonus: 300,
    description: 'Para profissionais e agências'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 5000,
    price: 899,
    bonus: 1000,
    description: 'Volume máximo para grandes projetos'
  }
]

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit',
    brand: 'Visa',
    last4: '4532',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true
  },
  {
    id: '2',
    type: 'debit',
    brand: 'Mastercard',
    last4: '8765',
    expiryMonth: 8,
    expiryYear: 2025,
    isDefault: false
  }
]

export default function BillingPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)

  // Mock subscription data
  const subscription = {
    subscriptionStatus: 'ACTIVE',
    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667EEA]/10 via-white to-[#764BA2]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#667EEA] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando assinatura...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667EEA]/10 via-white to-[#764BA2]/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Você precisa estar logado para acessar sua assinatura.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlan = plans.find(plan => plan.id === ((session.user as any)?.plan || 'STARTER'))

  const handleCancelSubscription = () => {
    // Lógica de cancelamento
    console.log('Cancelando assinatura...')
    setShowCancelModal(false)
  }

  const handleDeleteAccount = () => {
    // Lógica de exclusão de conta
    console.log('Excluindo conta...')
  }

  const handleRemoveCard = (cardId: string) => {
    setPaymentMethods(prev => prev.filter(card => card.id !== cardId))
  }

  const handleSetDefaultCard = (cardId: string) => {
    setPaymentMethods(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667EEA]/10 via-white to-[#764BA2]/10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                  Minha Assinatura
                </h1>
              </div>
              <p className="text-gray-600">
                Gerencie seu plano, pagamentos e configurações de cobrança
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Plano {(session.user as any)?.plan || 'STARTER'}
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {(session.user as any)?.creditsUsed || 0}/{(session.user as any)?.creditsLimit || 500} créditos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667EEA] data-[state=active]:to-[#764BA2] data-[state=active]:text-white"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="plans"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667EEA] data-[state=active]:to-[#764BA2] data-[state=active]:text-white"
            >
              Planos
            </TabsTrigger>
            <TabsTrigger 
              value="credits"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667EEA] data-[state=active]:to-[#764BA2] data-[state=active]:text-white"
            >
              Pacotes de Créditos
            </TabsTrigger>
            <TabsTrigger 
              value="cards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667EEA] data-[state=active]:to-[#764BA2] data-[state=active]:text-white"
            >
              Cartões
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Subscription */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Assinatura Atual</span>
                  <div className="flex gap-2">
                    {((session.user as any)?.plan || 'STARTER') !== 'GOLD' && (
                      <Button asChild variant="default" size="sm">
                        <Link href="#plans" onClick={() => setActiveTab('plans')}>
                          <Crown className="w-4 h-4 mr-2" />
                          Fazer Upgrade
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 rounded-lg">
                    <Crown className="w-8 h-8 mx-auto mb-3 text-[#667EEA]" />
                    <p className="text-sm text-gray-600 mb-1">Plano Atual</p>
                    <p className="text-xl font-bold">{currentPlan?.name || 'Starter'}</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-green-600" />
                    <p className="text-sm text-gray-600 mb-1">Créditos Mensais</p>
                    <p className="text-xl font-bold text-green-600">{currentPlan?.credits || 500}</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <p className="text-sm text-gray-600 mb-1">Modelos de IA</p>
                    <p className="text-xl font-bold text-blue-600">{currentPlan?.models || 1}</p>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Uso de Créditos</span>
                    <span className="text-sm text-gray-600">
                      {(session.user as any)?.creditsUsed || 0} / {(session.user as any)?.creditsLimit || 500}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((((session.user as any)?.creditsUsed || 0) / ((session.user as any)?.creditsLimit || 500)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Próxima Renovação</p>
                      <p className="text-sm text-yellow-700">
                        {subscription.subscriptionEndsAt.toLocaleDateString('pt-BR')} - R$ {billingCycle === 'monthly' ? currentPlan?.monthlyPrice : currentPlan?.annualPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-red-600">Gerenciar Assinatura</CardTitle>
                  <CardDescription>
                    Cancelar ou modificar sua assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Assinatura
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancelar Assinatura</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período atual.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                          Manter Assinatura
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSubscription}>
                          Confirmar Cancelamento
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    className="w-full text-red-700 border-red-300 hover:bg-red-100"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Conta
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-green-600">Ações Rápidas</CardTitle>
                  <CardDescription>
                    Comprar créditos e gerenciar pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => setActiveTab('credits')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar Créditos
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('cards')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gerenciar Cartões
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <div className="bg-white p-1 rounded-lg flex border border-gray-200 shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-8 py-2 rounded-md text-sm font-medium transition-all relative ${
                    billingCycle === 'annual'
                      ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual
                  <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Economize!
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const isCurrentPlan = ((session.user as any)?.plan || 'STARTER') === plan.id
                const savings = plan.monthlyPrice * 12 - plan.annualPrice
                
                return (
                  <Card key={plan.id} className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'border-2 border-[#667EEA] scale-105' : ''
                  }`}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white">
                        Mais Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 flex items-center justify-center mb-4">
                        {plan.id === 'STARTER' && <Sparkles className="w-8 h-8 text-[#667EEA]" />}
                        {plan.id === 'PREMIUM' && <Crown className="w-8 h-8 text-[#667EEA]" />}
                        {plan.id === 'GOLD' && <Zap className="w-8 h-8 text-[#667EEA]" />}
                      </div>
                      
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="text-center">
                        {billingCycle === 'annual' ? (
                          <>
                            <div className="text-3xl font-bold">
                              R$ {plan.annualPrice}
                              <span className="text-sm font-normal text-gray-500">/ano</span>
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              R$ {plan.monthlyEquivalent}/mês
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Economize R$ {savings}
                            </div>
                          </>
                        ) : (
                          <div className="text-3xl font-bold">
                            R$ {plan.monthlyPrice}
                            <span className="text-sm font-normal text-gray-500">/mês</span>
                          </div>
                        )}
                      </div>
                      <div className="text-base text-center text-gray-600">
                        {plan.description}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      
                      {isCurrentPlan ? (
                        <Button disabled className="w-full mt-6 h-12">
                          <Check className="w-4 h-4 mr-2" />
                          Plano Atual
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full mt-6 h-12 ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493]' 
                              : ''
                          }`}
                          variant={plan.popular ? 'default' : 'outline'} 
                          asChild
                        >
                          <Link href={`/billing/upgrade?plan=${plan.id}`}>
                            <Crown className="w-4 h-4 mr-2" />
                            {((session.user as any)?.plan || 'STARTER') < plan.id ? 'Fazer Upgrade' : 'Trocar Plano'}
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {/* Cancellation info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Cancele a qualquer momento</h3>
                  <p className="text-blue-800 text-sm">
                    Não há compromissos. Cancele ou altere seu plano quando quiser. Você continuará tendo acesso até o final do período pago.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Credit Packages Tab */}
          <TabsContent value="credits" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent mb-4">
                Pacotes de Créditos
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Compre créditos únicos válidos por 1 ano. Ideal para uso esporádico ou complementar sua assinatura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditPackages.map((pkg) => (
                <Card key={pkg.id} className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
                  pkg.popular ? 'border-2 border-[#667EEA] scale-105' : ''
                }`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white">
                      Melhor Custo-Benefício
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-[#667EEA]" />
                    </div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#667EEA]">
                        R$ {pkg.price}
                      </div>
                      <div className="text-lg font-medium text-gray-600">
                        {pkg.credits + (pkg.bonus || 0)} créditos
                      </div>
                      {pkg.bonus && (
                        <div className="text-sm text-green-600 font-medium">
                          +{pkg.bonus} bônus grátis
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-center text-gray-600">
                      {pkg.description}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span>Créditos base:</span>
                        <span className="font-medium">{pkg.credits}</span>
                      </div>
                      {pkg.bonus && (
                        <div className="flex items-center justify-between text-sm text-green-600">
                          <span>Bônus:</span>
                          <span className="font-medium">+{pkg.bonus}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm font-medium border-t pt-2">
                        <span>Total:</span>
                        <span>{pkg.credits + (pkg.bonus || 0)}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Válido por 1 ano
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493]' 
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Comprar Agora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Valid for 1 year info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Créditos válidos por 1 ano após a compra</h3>
                  <p className="text-green-800 text-sm">
                    Todos os pacotes de créditos são válidos por 1 ano a partir da data de compra. Use quando precisar, sem pressa!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cartões Salvos</h2>
                <p className="text-gray-600">Gerencie seus métodos de pagamento</p>
              </div>
              
              <Dialog open={showCardModal} onOpenChange={setShowCardModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cartão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                    <DialogDescription>
                      Adicione um cartão de crédito ou débito para facilitar suas compras
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Validade</Label>
                        <Input id="expiryDate" placeholder="MM/AA" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input id="cardName" placeholder="Nome conforme impresso no cartão" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCardModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setShowCardModal(false)}>
                      Salvar Cartão
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {paymentMethods.map((card) => (
                <Card key={card.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 rounded-lg">
                          <CreditCard className="w-6 h-6 text-[#667EEA]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium capitalize">
                              {card.brand} •••• {card.last4}
                            </p>
                            {card.isDefault && (
                              <Badge variant="secondary">Padrão</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {card.type === 'credit' ? 'Crédito' : 'Débito'} • Expira {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!card.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefaultCard(card.id)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Tornar Padrão
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRemoveCard(card.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum cartão salvo
                </h3>
                <p className="text-gray-500 mb-4">
                  Adicione um cartão para facilitar suas compras futuras
                </p>
                <Button 
                  onClick={() => setShowCardModal(true)}
                  className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}