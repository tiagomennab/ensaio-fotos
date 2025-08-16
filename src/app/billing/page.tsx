import { requireAuth } from '@/lib/auth'
import { getSubscriptionByUserId } from '@/lib/db/subscriptions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function BillingPage() {
  const session = await requireAuth()
  const subscription = await getSubscriptionByUserId(session.user.id)

  const plans = [
    {
      name: 'FREE',
      price: 0,
      period: 'Forever',
      description: 'Perfect for trying out AI photo generation',
      features: [
        '1 AI model',
        '10 generations per month',
        '512x512 resolution',
        'Community support',
        'Watermark on images'
      ],
      limitations: ['Limited features', 'Watermark'],
      buttonText: 'Current Plan',
      current: session.user.plan === 'FREE'
    },
    {
      name: 'PREMIUM',
      price: 19.90,
      period: 'month',
      description: 'Great for content creators and professionals',
      features: [
        '3 AI models',
        '100 generations per month',
        'Up to 1024x1024 resolution',
        'No watermarks',
        'Premium photo packages',
        'Priority processing'
      ],
      limitations: [],
      buttonText: session.user.plan === 'PREMIUM' ? 'Current Plan' : 'Upgrade Now',
      current: session.user.plan === 'PREMIUM',
      popular: true
    },
    {
      name: 'GOLD',
      price: 49.90,
      period: 'month',
      description: 'For agencies and power users',
      features: [
        'Unlimited AI models',
        '500 generations per month',
        'Up to 2048x2048 resolution',
        'All premium features',
        'API access',
        'Priority support',
        'Custom integrations'
      ],
      limitations: [],
      buttonText: session.user.plan === 'GOLD' ? 'Current Plan' : 'Upgrade Now',
      current: session.user.plan === 'GOLD'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
              <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {session.user.plan} Plan
              </Badge>
              <div className="text-sm text-gray-600">
                {session.user.creditsUsed}/{session.user.creditsLimit} credits used
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
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your current plan details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold">{session.user.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={subscription.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                    {subscription.subscriptionStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next billing</p>
                  <p className="font-semibold">
                    {subscription.subscriptionEndsAt 
                      ? new Date(subscription.subscriptionEndsAt).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock the full potential of AI photo generation with our flexible plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-purple-500 border-2' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                    <Crown className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    R$ {plan.price.toFixed(2)}
                    <span className="text-sm font-normal text-gray-600">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.current ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/billing/upgrade?plan=${plan.name}`}>
                        {plan.buttonText}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              We accept multiple payment methods for your convenience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">PIX</div>
                <div className="text-sm text-gray-600">Instant payment</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Credit Card</div>
                <div className="text-sm text-gray-600">Up to 12x installments</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Boleto</div>
                <div className="text-sm text-gray-600">Bank slip</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold">Bank Transfer</div>
                <div className="text-sm text-gray-600">Direct transfer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}