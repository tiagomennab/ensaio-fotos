'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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

const plans: Plan[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 89,
    annualPrice: 708,
    monthlyEquivalent: 59,
    description: 'Ideal para começar com geração de fotos profissionais',
    features: [
      '1 modelo de IA por mês',
      '50 créditos por mês',
      'Resolução padrão'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    monthlyPrice: 269,
    annualPrice: 2148,
    monthlyEquivalent: 179,
    description: 'Ótimo para criadores de conteúdo e profissionais',
    features: [
      '3 modelos de IA por mês',
      '200 créditos por mês',
      'Alta resolução'
    ],
    popular: true,
    color: 'purple'
  },
  {
    id: 'GOLD',
    name: 'Gold',
    monthlyPrice: 449,
    annualPrice: 3588,
    monthlyEquivalent: 299,
    description: 'Para agências e usuários avançados',
    features: [
      '10 modelos de IA por mês',
      '1000 créditos por mês',
      'Máxima resolução'
    ],
    popular: false,
    color: 'yellow'
  }
]

const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
  const savings = (monthlyPrice * 12) - annualPrice
  const monthsEquivalent = Math.round(savings / monthlyPrice)
  return { savings, monthsEquivalent }
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  // Mock subscription data for demo
  const subscription = {
    subscriptionStatus: 'ACTIVE',
    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
  }

  if (!session) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Acesso negado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cobrança e Planos</h1>
              <p className="text-gray-600 mt-1">Gerencie sua assinatura e cobrança</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                Plano {(session.user as any)?.plan || 'STARTER'}
              </Badge>
              <div className="text-sm text-gray-600">
                {(session.user as any)?.creditsUsed || 0}/{(session.user as any)?.creditsLimit || 50} créditos usados
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription Info */}
        {subscription && subscription.subscriptionStatus && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Assinatura Atual</CardTitle>
                  <CardDescription>Detalhes do seu plano atual</CardDescription>
                </div>
                {((session.user as any)?.plan || 'STARTER') !== 'GOLD' && (
                  <Button asChild variant="default">
                    <Link href="/billing/upgrade">
                      <Crown className="w-4 h-4 mr-2" />
                      Fazer Upgrade
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plano</p>
                  <p className="font-semibold">{(session.user as any)?.plan || 'STARTER'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={subscription.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                    {subscription.subscriptionStatus === 'ACTIVE' ? 'ATIVO' : subscription.subscriptionStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Próxima cobrança</p>
                  <p className="font-semibold">
                    {subscription.subscriptionEndsAt 
                      ? new Date(subscription.subscriptionEndsAt).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              
              {/* Usage Progress Bar */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Créditos utilizados</span>
                  <span className="text-sm text-gray-600">
                    {(session.user as any)?.creditsUsed || 0} / {(session.user as any)?.creditsLimit || 50}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      ((((session.user as any)?.creditsUsed || 0) / ((session.user as any)?.creditsLimit || 50)) * 100) > 80 
                        ? 'bg-red-500' 
                        : ((((session.user as any)?.creditsUsed || 0) / ((session.user as any)?.creditsLimit || 50)) * 100) > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(((((session.user as any)?.creditsUsed || 0) / ((session.user as any)?.creditsLimit || 50)) * 100), 100)}%` 
                    }}
                  />
                </div>
                {((session.user as any)?.creditsUsed || 0) / ((session.user as any)?.creditsLimit || 50) > 0.8 && (
                  <div className="mt-2 flex items-center text-orange-600">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span className="text-xs">Você está próximo do limite. Considere fazer upgrade!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {((session.user as any)?.plan || 'STARTER') === 'GOLD' 
                ? 'Você já possui o melhor plano!' 
                : 'Escolha Seu Plano'
              }
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {((session.user as any)?.plan || 'STARTER') === 'GOLD' 
                ? 'Aproveite todos os recursos premium disponíveis' 
                : 'Desbloqueie todo o potencial da geração de fotos com IA com nossos planos flexíveis'
              }
            </p>
            
            {/* Strategic Upgrade Banner for non-GOLD users */}
            {((session.user as any)?.plan || 'STARTER') !== 'GOLD' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-purple-900">
                      🚀 Maximize seu potencial criativo
                    </h3>
                    <p className="text-purple-700 text-sm mt-1">
                      Upgrade para ter acesso a mais modelos, créditos e recursos premium
                    </p>
                  </div>
                  <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Link href="/billing/upgrade">
                      <Zap className="w-4 h-4 mr-2" />
                      Fazer Upgrade Agora
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-12">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrentPlan = ((session.user as any)?.plan || 'STARTER') === plan.id
              return (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-purple-500 border-2 scale-105' : 'border-gray-200'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      plan.color === 'purple' 
                        ? 'bg-purple-100' 
                        : plan.color === 'yellow' 
                          ? 'bg-yellow-100' 
                          : 'bg-blue-100'
                    }`}>
                      {plan.color === 'purple' && <Crown className="w-6 h-6 text-purple-600" />}
                      {plan.color === 'yellow' && <Zap className="w-6 h-6 text-yellow-600" />}
                      {plan.color === 'blue' && <Sparkles className="w-6 h-6 text-blue-600" />}
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
                            💸 Economize {calculateSavings(plan.monthlyPrice, plan.annualPrice).monthsEquivalent} meses!
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
                  
                  <CardContent className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {isCurrentPlan ? (
                      <Button disabled className="w-full mt-6">
                        <Check className="w-4 h-4 mr-2" />
                        Plano Atual
                      </Button>
                    ) : (
                      <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'} asChild>
                        <Link href={`/billing/upgrade?plan=${plan.id}`}>
                          <Crown className="w-4 h-4 mr-2" />
                          Fazer Upgrade
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Formas de Pagamento
            </CardTitle>
            <CardDescription>
              Aceitamos as principais formas de pagamento do Brasil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">PIX</div>
                <div className="text-sm text-gray-600">Pagamento instantâneo</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Cartão de Crédito</div>
                <div className="text-sm text-gray-600">Até 12x sem juros</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Cartão de Débito</div>
                <div className="text-sm text-gray-600">Débito à vista</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}