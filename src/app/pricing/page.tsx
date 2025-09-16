'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, ArrowRight, AlertCircle, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'

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

interface CreditPackage {
  id: 'ESSENCIAL' | 'AVANÇADO' | 'PRO' | 'ENTERPRISE'
  name: string
  price: number
  credits: number
  photos: number
  resolution: string
  support: string
  processing: string
  popular: boolean
}

const creditPackages: CreditPackage[] = [
  {
    id: 'ESSENCIAL',
    name: 'Pacote Essencial',
    price: 89,
    credits: 350,
    photos: 35,
    resolution: 'Resolução padrão',
    support: 'Suporte por e-mail',
    processing: 'Processamento padrão',
    popular: false
  },
  {
    id: 'AVANÇADO',
    name: 'Pacote Avançado',
    price: 179,
    credits: 1000,
    photos: 100,
    resolution: 'Alta resolução',
    support: 'Suporte por e-mail',
    processing: 'Processamento prioritário',
    popular: true
  },
  {
    id: 'PRO',
    name: 'Pacote Pro',
    price: 359,
    credits: 2200,
    photos: 220,
    resolution: 'Máxima resolução',
    support: 'Suporte prioritário',
    processing: 'Processamento rápido',
    popular: false
  },
  {
    id: 'ENTERPRISE',
    name: 'Pacote Enterprise',
    price: 899,
    credits: 5000,
    photos: 500,
    resolution: 'Máxima resolução',
    support: 'Suporte prioritário',
    processing: 'Processamento ultra rápido',
    popular: false
  }
]

const plans: Plan[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 89,
    annualPrice: 708,
    monthlyEquivalent: 59,
    description: 'Perfeito para começar sua jornada com IA',
    features: [
      '1 modelo de IA por mês',
      '500 créditos por mês',
      '50 fotos por mês',
      'Resolução padrão',
      'Suporte ao cliente',
      'Processamento padrão'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    monthlyPrice: 179,
    annualPrice: 1428,
    monthlyEquivalent: 119,
    description: 'Ideal para criadores de conteúdo',
    features: [
      '2 modelos de IA por mês',
      '1200 créditos por mês',
      '120 fotos por mês',
      'Alta resolução',
      'Suporte prioritário',
      'Processamento prioritário'
    ],
    popular: true,
    color: 'purple'
  },
  {
    id: 'GOLD',
    name: 'Gold',
    monthlyPrice: 359,
    annualPrice: 2868,
    monthlyEquivalent: 239,
    description: 'Para profissionais e agências',
    features: [
      '5 modelos de IA por mês',
      '2500 créditos por mês',
      '250 fotos por mês',
      'Máxima resolução',
      'Suporte prioritário',
      'Processamento rápido'
    ],
    popular: false,
    color: 'yellow'
  }
]

// Exemplos de uso da IA
const aiExamples = [
  {
    title: "Instagram & Redes Sociais",
    description: "Conteúdo profissional para suas redes sociais",
    image: "/examples/card-instagram-redes-sociais.jpg",
    scenarios: [
      "Posts estilo lifestyle",
      "Stories profissionais",
      "Feed curado e consistente",
      "Conteúdo para influencer"
    ]
  },
  {
    title: "Campanhas Publicitárias",
    description: "Imagens comerciais de alto impacto",
    image: "/examples/card-fotos-profissionais.jpg",
    scenarios: [
      "Anúncios e publicidade",
      "Campanhas de marketing",
      "Material promocional",
      "Catálogos comerciais"
    ]
  },
  {
    title: "Selfies de IA",
    description: "Selfies perfeitas em qualquer cenário",
    image: "/examples/card-selfies-ia.jpg",
    scenarios: [
      "Selfies em espelho",
      "Fotos casuais naturais",
      "Retratos em casa",
      "Selfies para redes sociais"
    ]
  },
  {
    title: "Fotos de CEO",
    description: "Imagens executivas de alto padrão",
    image: "/examples/card-fotos-ceo.jpg",
    scenarios: [
      "Retratos executivos",
      "Fotos para imprensa",
      "Material institucional",
      "Perfil de liderança"
    ]
  },
  {
    title: "Artísticas & Conceituais",
    description: "Expressão criativa e artística",
    image: "/examples/card-artisticas-conceituais.jpg",
    scenarios: [
      "Retratos artísticos",
      "Fotos conceituais",
      "Ensaios criativos",
      "Arte visual"
    ]
  },
  {
    title: "Fitness & Lifestyle",
    description: "Fotos motivacionais e de estilo de vida",
    image: "/examples/card-fitness-lifestyle.jpg",
    scenarios: [
      "Fotos fitness",
      "Lifestyle saudável",
      "Aventuras e viagens",
      "Esportes e atividades"
    ]
  },
  {
    title: "Urbano & Street",
    description: "Estilo urbano e moderno",
    image: "/examples/card-urbano-street.jpg",
    scenarios: [
      "Fotos urbanas",
      "Street style",
      "Cenários modernos",
      "Moda urbana"
    ]
  },
  {
    title: "Nômade Digital",
    description: "Para profissionais em movimento",
    image: "/examples/card-nomade-digital.jpg",
    scenarios: [
      "Trabalho remoto",
      "Viagens profissionais",
      "Lifestyle nômade",
      "Escritórios alternativos"
    ]
  }
]

// Depoimentos de clientes
const testimonials = [
  {
    name: "Tainá Bueno",
    role: "Influenciadora Digital",
    avatar: "/avatars/marina.jpg",
    content: "Consegui criar conteúdo profissional para minhas redes sociais sem precisar de fotógrafo. As fotos ficaram incríveis!",
    rating: 5
  },
  {
    name: "Fabrício Tavares",
    role: "Médico",
    avatar: "/avatars/carlos.jpg", 
    content: "Usei para criar fotos profissionais para congressos e palestras médicas. A qualidade impressionou meus colegas!",
    rating: 5
  },
  {
    name: "Bruna Puga",
    role: "Advogada",
    avatar: "/avatars/ana.jpg",
    content: "Uso as fotos para meu escritório e materiais profissionais. A seriedade e qualidade transmitem credibilidade aos clientes.",
    rating: 5
  },
  {
    name: "Marcella Melo",
    role: "Empresária",
    avatar: "/avatars/marcella.jpg",
    content: "Perfeito para uso pessoal e profissional! Uso as fotos tanto para minhas redes sociais quanto para apresentações da empresa.",
    rating: 5
  }
]

// FAQ - Perguntas frequentes
const faqItems = [
  {
    question: "O que é o Vibe Photo?",
    answer: "O Vibe Photo é uma plataforma que utiliza inteligência artificial para gerar fotos profissionais personalizadas. Você envia suas selfies, nossa IA treina um modelo único baseado no seu rosto e depois pode gerar fotos suas em qualquer cenário, pose ou estilo que desejar."
  },
  {
    question: "Qual a diferença entre Assinaturas e Pacotes de Créditos?",
    answer: "As Assinaturas são planos recorrentes (mensais/anuais) que renovam créditos automaticamente - ideais para uso constante. Os Pacotes de Créditos são compras únicas com validade de 1 ano - perfeitos para quem quer usar esporadicamente ou fazer um grande projeto específico. Nas assinaturas os créditos não utilizados expiram no final do período, nos pacotes únicos você tem 1 ano inteiro para usar."
  },
  {
    question: "Como funciona o sistema de créditos?",
    answer: "Cada foto gerada consome 10 créditos. Criar modelos de IA é GRATUITO. Nas assinaturas: Starter 500 créditos/mês (50 fotos), Premium 1200 créditos/mês (120 fotos) e Gold 2500 créditos/mês (250 fotos) - créditos são renovados mensalmente e não acumulam. Nos pacotes únicos: de 350 a 5000 créditos válidos por 1 ano inteiro (não renovam, mas você tem muito mais tempo para usar)."
  },
  {
    question: "Quantas fotos preciso enviar para treinar meu modelo?",
    answer: "Recomendamos entre 19-33 fotos de alta qualidade. Inclua selfies em diferentes ângulos, expressões e iluminações. Quanto mais variadas as fotos de treinamento, melhor será a qualidade dos resultados gerados."
  },
  {
    question: "Quanto tempo demora para treinar um modelo?",
    answer: "O treinamento de um modelo personalizado leva entre 10-30 minutos, dependendo da complexidade e qualidade das fotos enviadas. Você receberá uma notificação por email quando o modelo estiver pronto para uso."
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer: "Aceitamos cartões de crédito e débito (Visa, Mastercard, Elo) e PIX através da nossa parceira Asaas. Todos os pagamentos são processados de forma segura e criptografada."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento através da área \"Minha Conta > Assinatura\". O cancelamento será efetivo no final do período atual, e você continuará tendo acesso até o vencimento."
  },
  {
    question: "Vocês oferecem reembolso?",
    answer: "Conforme o Código de Defesa do Consumidor (Art. 49), você tem direito ao reembolso integral em até 7 dias da contratação, APENAS se nenhuma solicitação de geração de imagem ou treinamento de modelo for realizada. Após o primeiro uso dos recursos computacionais (GPU/IA), não há direito de desistência devido aos custos imediatos e irreversíveis de processamento."
  },
  {
    question: "Minhas fotos estão seguras?",
    answer: "Sim! Suas fotos são armazenadas com criptografia de nível militar em servidores seguros. Apenas você tem acesso às suas fotos e modelos. Nunca compartilhamos, vendemos ou usamos suas imagens para outros fins que não sejam gerar seu modelo personalizado."
  },
  {
    question: "Vocês usam minhas fotos para treinar outros modelos?",
    answer: "Não! Suas fotos são usadas exclusivamente para criar seu modelo pessoal. Não utilizamos suas imagens para melhorar nossos algoritmos ou treinar modelos para outros usuários. Sua privacidade é nossa prioridade máxima."
  },
  {
    question: "Qual formato de fotos devo enviar?",
    answer: "Aceitamos formatos JPG, PNG e WebP. Recomendamos fotos com pelo menos 512x512 pixels, bem iluminadas e com o rosto claramente visível. Evite fotos muito escuras, borradas ou com óculos escuros."
  }
]


function PricingPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PREMIUM' | 'GOLD'>('PREMIUM')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPackage, setSelectedPackage] = useState<'ESSENCIAL' | 'AVANÇADO' | 'PRO' | 'ENTERPRISE'>('AVANÇADO')
  const [mounted, setMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const isRequired = searchParams.get('required') === 'true'
  const isNewUser = searchParams.get('newuser') === 'true'

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect users with active plan to dashboard (unless they are accessing specific flows)
  useEffect(() => {
    if (mounted && session?.user && !isRequired && !isNewUser) {
      // Check if user has an active plan - if yes, redirect to dashboard
      const userPlan = session.user.plan
      if (userPlan && userPlan !== 'STARTER') {
        router.push('/dashboard')
        return
      }
    }
  }, [mounted, session, isRequired, isNewUser, router])

  // Skip loading - show content immediately  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const savings = (monthlyPrice * 12) - annualPrice
    const monthsEquivalent = Math.round(savings / monthlyPrice)
    return { savings, monthsEquivalent }
  }

  const handlePlanSelect = (planId: 'STARTER' | 'PREMIUM' | 'GOLD') => {
    setSelectedPlan(planId)
    if (!session?.user) {
      router.push('/auth/signup')
    } else {
      router.push(`/billing/upgrade?plan=${planId}&cycle=${billingCycle}`)
    }
  }

  const handlePackageSelect = (packageId: 'ESSENCIAL' | 'AVANÇADO' | 'PRO' | 'ENTERPRISE') => {
    setSelectedPackage(packageId)
    if (!session?.user) {
      router.push('/auth/signup')
    } else {
      router.push(`/billing/upgrade?package=${packageId}&type=credits`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {(isRequired || isNewUser) && (
          <div className="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 mt-0.5 mr-3 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {isNewUser ? 'Bem-vindo! Escolha seu plano' : 'Plano necessário'}
                </h3>
                <p className="text-sm mt-1 text-blue-700">
                  {isNewUser 
                    ? 'Escolha o plano ideal para suas necessidades.'
                    : 'Selecione um plano para continuar usando os recursos de IA.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
              <Crown className="w-4 h-4 mr-2" />
              Planos
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Escolha seu <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Plano</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Crie fotos profissionais com IA personalizada para suas necessidades.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 p-1 rounded-lg flex border border-[#667EEA]/20">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-sm'
                    : 'text-[#667EEA] hover:text-[#764BA2]'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative mr-16 ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-sm'
                    : 'text-[#667EEA] hover:text-[#764BA2]'
                }`}
              >
                Anual
                <span className="absolute -top-3 -right-14 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm whitespace-nowrap">
                  4 meses grátis
                </span>
              </button>
            </div>
          </div>
          
          {/* Subscription Cancellation Notice */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-50/80 border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex items-center justify-center text-center">
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Check className="w-2.5 h-2.5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  Cancele a qualquer momento
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-xl border-[#667EEA]/30 bg-gradient-to-br from-white ${
                plan.popular ? 'ring-2 ring-[#667EEA] shadow-lg to-purple-50' : plan.id === 'STARTER' ? 'to-blue-50' : 'to-indigo-50'
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-[#764BA2]' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white">
                  Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  {billingCycle === 'annual' ? (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {plan.annualPrice}
                        <span className="text-sm font-normal text-gray-500">/ano</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        R$ {plan.monthlyEquivalent}/mês
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">
                      R$ {plan.monthlyPrice}
                      <span className="text-sm font-normal text-gray-500">/mês</span>
                    </div>
                  )}
                </div>
                <CardDescription className="text-sm text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full transition-colors ${
                    plan.popular || selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlanSelect(plan.id)
                  }}
                >
                  Escolher Plano
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credit Packages Section */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-[#764BA2] to-[#667EEA] text-white border-0 shadow-lg px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Pacotes de Créditos
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ou compre <span className="bg-gradient-to-r from-[#764BA2] via-[#8B5CF6] to-[#667EEA] bg-clip-text text-transparent">Créditos Únicos</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Prefere pagar apenas uma vez? Escolha um pacote de créditos sem recorrência. Cada foto gerada consome 10 créditos.
            </p>
            
            {/* Credits Validity Notice */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-50/80 border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
                <div className="flex items-center justify-center text-center">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    Créditos válidos por 1 ano
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative transition-all hover:shadow-xl bg-gradient-to-br from-white ${
                  pkg.popular 
                    ? 'ring-2 ring-[#764BA2]/30 shadow-lg to-purple-50 border-[#764BA2]/30' 
                    : 'to-purple-50/30 border-[#667EEA]/20 hover:border-[#764BA2]/30'
                } ${
                  selectedPackage === pkg.id ? 'ring-2 ring-[#667EEA]/40 border-[#667EEA]/40' : ''
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#764BA2] to-[#667EEA] text-white">
                    Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl mb-2">{pkg.name}</CardTitle>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      R$ {pkg.price}
                    </div>
                    <div className="text-sm text-[#764BA2] font-medium">
                      Pagamento único
                    </div>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Válido por 1 ano após a compra
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Credits and Photos highlight */}
                  <div className="bg-[#667EEA]/5 border border-[#667EEA]/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Créditos:
                      </span>
                      <span className="text-lg font-bold text-[#764BA2]">
                        {pkg.credits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Fotos:
                      </span>
                      <span className="text-lg font-bold text-[#764BA2]">
                        {pkg.photos}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{pkg.resolution}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{pkg.support}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{pkg.processing}</span>
                    </li>
                  </ul>

                  <Button 
                    className={`w-full transition-colors ${
                      pkg.popular || selectedPackage === pkg.id
                        ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePackageSelect(pkg.id)
                    }}
                  >
                    Comprar Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Examples Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que você pode criar</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore as infinitas possibilidades com sua IA personalizada
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {aiExamples.map((example, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedImage(example.image)}>
                  <img 
                    src={example.image} 
                    alt={example.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{example.title}</CardTitle>
                  <CardDescription className="text-sm">{example.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {example.scenarios.map((scenario, scenarioIndex) => (
                      <li key={scenarioIndex} className="flex items-center text-xs text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {scenario}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos usuários dizem</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Histórias reais de pessoas que transformaram sua presença digital
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative bg-gradient-to-br from-white to-blue-50/30 border-2 border-[#667EEA]/20 hover:border-[#667EEA]/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-[#667EEA]/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <span className="text-sm font-medium text-white">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-[#667EEA] text-base drop-shadow-sm">★</span>
                    ))}
                  </div>
                  
                  {/* Efeito de borda decorativa */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#667EEA] via-[#764BA2] to-[#667EEA] rounded-t-lg opacity-60"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#667EEA]/5 to-transparent rounded-full -z-10"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa saber para começar
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-medium text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Terms Footer */}
        <div className="border-t border-gray-200 pt-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Termos de Uso - Informações Importantes</h3>
            <div className="text-xs text-gray-600 leading-relaxed space-y-2">
              <p>
                <strong>Política de Reembolso e Direito de Desistência (CDC Art. 49):</strong> Conforme o Código de Defesa do Consumidor, você tem <strong>7 dias</strong> para desistir do serviço com reembolso integral <strong>APENAS</strong> se nenhuma solicitação de geração de imagem ou treinamento de modelo for realizada. Após o primeiro uso dos recursos computacionais (GPU/IA), não há direito de desistência devido aos custos imediatos e irreversíveis de processamento.
              </p>
              <p>
                <strong>Renovação Automática:</strong> Sua assinatura será renovada automaticamente ao final de cada período (mensal ou anual) usando o mesmo método de pagamento cadastrado. Você receberá lembretes por email antes de cada renovação.
              </p>
              <p>
                <strong>Cancelamento:</strong> Para cancelar sua assinatura, você deve fazê-lo antes da data de renovação através da sua área de usuário. O cancelamento deve ser efetuado com pelo menos 24 horas de antecedência da próxima cobrança.
              </p>
              <p>
                <strong>Créditos:</strong> Cada foto gerada consome 10 créditos. Criar modelos de IA é GRATUITO. Nas assinaturas, créditos não utilizados expiram ao final do período (mês/ano) e não são transferidos. Nos pacotes únicos, créditos são válidos por 1 ano inteiro após a compra. Créditos não são reembolsáveis em nenhuma modalidade. Escolha a opção que melhor se adequa ao seu padrão de uso.
              </p>
              <p>
                <strong>Acesso à Plataforma:</strong> O acesso completo às funcionalidades da plataforma está condicionado ao pagamento confirmado de um plano ativo. Usuários sem plano ativo terão acesso limitado ou bloqueado a certas áreas do sistema.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Ao prosseguir com a assinatura, você concorda com nossos{' '}
                <Link href="/legal/terms" className="underline hover:text-gray-700">
                  Termos de Uso
                </Link>
                {' '}e{' '}
                <Link href="/legal/privacy" className="underline hover:text-gray-700">
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para exibir imagem */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Botão de fechar fixo */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-20 bg-black bg-opacity-70 rounded-full p-3 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Container da imagem ajustado */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Imagem expandida"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  )
}