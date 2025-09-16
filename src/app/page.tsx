'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowDown, Sparkles, Users, Zap, Shield, Plus, ImageIcon, TrendingUp, Crown, CreditCard, Upload, Bot, Wand2, Camera, Star, User, X, Calendar, Check } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface CreditPackage {
  id: 'ESSENCIAL' | 'AVANÇADO' | 'PRO' | 'ENTERPRISE'
  name: string
  price: number
  credits: number
  photos: number
  resolution: string
  processing: string
  support: string
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
    processing: 'Processamento padrão',
    support: 'Suporte ao cliente',
    popular: false
  },
  {
    id: 'AVANÇADO',
    name: 'Pacote Avançado',
    price: 179,
    credits: 1000,
    photos: 100,
    resolution: 'Alta resolução',
    processing: 'Processamento prioritário',
    support: 'Suporte ao cliente',
    popular: true
  },
  {
    id: 'PRO',
    name: 'Pacote Pro',
    price: 359,
    credits: 2200,
    photos: 220,
    resolution: 'Máxima resolução',
    processing: 'Processamento rápido',
    support: 'Suporte prioritário',
    popular: false
  },
  {
    id: 'ENTERPRISE',
    name: 'Pacote Enterprise',
    price: 899,
    credits: 5000,
    photos: 500,
    resolution: 'Máxima resolução',
    processing: 'Processamento ultra rápido',
    support: 'Suporte prioritário',
    popular: false
  }
]

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
    description: 'Perfeito para começar sua jornada com IA',
    features: [
      '1 modelo de IA por mês',
      '500 créditos por mês',
      '50 fotos por mês',
      'Resolução padrão',
      'Processamento padrão',
      'Suporte ao cliente'
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
      'Processamento prioritário',
      'Suporte prioritário'
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
      'Processamento rápido',
      'Suporte prioritário'
    ],
    popular: false,
    color: 'yellow'
  }
]

// Exemplos de galeria
const galleryExamples = [
  {
    category: "Profissional",
    description: "Headshots executivos",
    examples: [
      "Executivo em escritório moderno",
      "LinkedIn profissional feminino",
      "Advogado em tribunal",
      "CEO para revista"
    ]
  },
  {
    category: "Lifestyle",
    description: "Estilo de vida casual",
    examples: [
      "Café da manhã em Paris",
      "Caminhada na praia",
      "Leitura em biblioteca",
      "Workout no parque"
    ]
  },
  {
    category: "Artístico",
    description: "Retratos criativos",
    examples: [
      "Preto e branco dramático",
      "Luz dourada ao pôr do sol",
      "Retrato urbano noturno",
      "Estúdio com smoke"
    ]
  }
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PREMIUM' | 'GOLD'>('PREMIUM')
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string, title: string} | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<'ESSENCIAL' | 'AVANÇADO' | 'PRO' | 'ENTERPRISE'>('AVANÇADO')
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const handlePackageSelect = (packageId: 'ESSENCIAL' | 'AVANÇADO' | 'PRO' | 'ENTERPRISE') => {
    setSelectedPackage(packageId)
    if (!session?.user) {
      window.location.href = '/auth/signup'
    } else {
      window.location.href = `/billing/upgrade?package=${packageId}&type=credits`
    }
  }

  const handlePlanSelect = (planId: 'STARTER' | 'PREMIUM' | 'GOLD') => {
    setSelectedPlan(planId)
    if (!session?.user) {
      window.location.href = '/auth/signup'
    } else {
      window.location.href = `/billing/upgrade?plan=${planId}&cycle=${billingCycle}`
    }
  }
  
  // Skip loading state - show content immediately after mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-6 text-center py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          {!session ? (
            <>
              <div className="mb-8 flex justify-center">
                <div className="w-48 h-48 flex items-center justify-center">
                  <img 
                    src="/examples/selo-numero-1.png" 
                    alt="Número 1 em fotografias de IA" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Crie Fotos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profissionais</span> com IA
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Treine seu modelo de IA personalizado e crie imagens incríveis.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-8 py-3 shadow-xl border border-gray-700 hover:border-gray-600 transform hover:scale-105 transition-all duration-200">
                  <Link href="/auth/signup">
                    Começar Agora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
                  onClick={() => {
                    const gallerySection = document.querySelector('#gallery-section');
                    if (gallerySection) {
                      gallerySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Ver Exemplos
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bem-vindo de volta
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Olá, {session.user?.name || 'Usuário'}!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Continue criando fotos incríveis com IA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white">
                  <Link href="/generate">
                    Gerar Fotos
                    <Wand2 className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/models/create">
                    Novo Modelo
                    <Plus className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      {!session && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transforme suas selfies em fotos profissionais em 3 passos simples
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center border-gradient-to-r from-[#667EEA] to-[#764BA2] hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <CardTitle className="text-xl">Upload das Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Carregue 10-20 fotos suas em diferentes poses. Nossa IA analisará seus traços únicos.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-gradient-to-r from-[#667EEA] to-[#764BA2] hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <CardTitle className="text-xl">Treinamento de Modelo</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Nossa IA treina um modelo personalizado baseado nas suas fotos em alguns minutos.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-gradient-to-r from-[#667EEA] to-[#764BA2] hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <CardTitle className="text-xl">Gerar Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Digite qualquer cenário e sua IA criará fotos profissionais realistas.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 border border-[#667EEA]/30">
                  <Sparkles className="w-5 h-5 text-[#667EEA]" />
                  <span className="text-sm font-medium text-[#764BA2]">Tecnologia Avançada</span>
                  <Sparkles className="w-5 h-5 text-[#764BA2]" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 max-w-3xl mx-auto">
                <span className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                  O melhor gerador de fotos de IA do mercado com um nível de realismo inacreditável.
                </span>
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <CardTitle className="text-lg">Modelos Personalizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    IA treinada com suas próprias fotos para resultados únicos
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Super Rápido</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Fotos de alta qualidade geradas em segundos
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Privacidade Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Suas fotos são privadas e protegidas
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Real Examples Gallery Section */}
            <div className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Escolha Sua Vibe</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  De executivo a wanderlust — descubra qual estilo combina mais com você.
                </p>
              </div>
              
              <div id="gallery-section" className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4 mb-16">
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/card-executive-minimalista.jpg",
                    alt: "Mulher executiva - foto profissional gerada por IA",
                    title: "Executive Minimalist"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/card-executive-minimalista.jpg" 
                      alt="Mulher executiva - foto profissional gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Executive Minimalist</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/business-presentation.jpg",
                    alt: "Palestrante executivo - foto profissional gerada por IA",
                    title: "Fitness Aesthetic"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/business-presentation.jpg" 
                      alt="Palestrante executivo - foto profissional gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Fitness Aesthetic</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/professional-woman.jpg",
                    alt: "Quiet luxury style - foto gerada por IA",
                    title: "Quiet Luxury"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/professional-woman.jpg" 
                      alt="Quiet luxury style - foto gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Quiet Luxury</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/mirror-selfie.jpg",
                    alt: "Mirror selfie - foto casual gerada por IA",
                    title: "Mirror Selfie"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/mirror-selfie.jpg" 
                      alt="Mirror selfie - foto casual gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Mirror Selfie</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/desert-adventure.png",
                    alt: "Aventura no deserto - foto lifestyle gerada por IA",
                    title: "Wanderlust"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/desert-adventure.png" 
                      alt="Aventura no deserto - foto lifestyle gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Wanderlust</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/urban-style.jpg",
                    alt: "Urban style - foto urbana gerada por IA",
                    title: "Urban"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/urban-style.jpg" 
                      alt="Urban style - foto urbana gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Urban</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/rebel-style.jpg",
                    alt: "Rebel style - foto rebelde gerada por IA",
                    title: "Rebel"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/rebel-style.jpg" 
                      alt="Rebel style - foto rebelde gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Rebel</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/neo-casual.jpg",
                    alt: "Neo casual style - foto casual moderna gerada por IA",
                    title: "Neo Casual"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/neo-casual.jpg" 
                      alt="Neo casual style - foto casual moderna gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Neo Casual</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/conceitual.jpg",
                    alt: "Conceitual style - foto conceitual gerada por IA",
                    title: "Conceitual"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/conceitual.jpg" 
                      alt="Conceitual style - foto conceitual gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Conceitual</p>
                </div>
                
                <div 
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage({
                    src: "/examples/soft-power.jpg",
                    alt: "Soft power style - foto soft power gerada por IA",
                    title: "Soft Power"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/soft-power.jpg" 
                      alt="Soft power style - foto soft power gerada por IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">Soft Power</p>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Before & After Transformation Section */}
      {!session && (
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Transforme suas selfies em fotos profissionais
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Carregue suas selfies e comece a gerar fotos incríveis agora mesmo
              </p>
            </div>
            
            {/* Before After Showcase */}
            <div className="relative">
              {/* Before Photos Grid - Selfies Originais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 max-w-[150px] mx-auto">
                  <img 
                    src="/examples/transformation/before-1.jpg" 
                    alt="Selfie original 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 max-w-[150px] mx-auto">
                  <img 
                    src="/examples/transformation/before-2.jpg" 
                    alt="Selfie original 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 max-w-[150px] mx-auto">
                  <img 
                    src="/examples/transformation/before-3.jpg" 
                    alt="Selfie original 3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 max-w-[150px] mx-auto">
                  <img 
                    src="/examples/transformation/before-4.jpg" 
                    alt="Selfie original 4"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <ArrowDown className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              
              {/* After Photos - Professional Results */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Professional Portrait */}
                    <div className="text-center">
                      <div 
                        className="aspect-square rounded-xl overflow-hidden mb-3 hover:scale-105 transition-transform duration-300 shadow-lg max-w-[180px] mx-auto cursor-pointer relative"
                        onClick={() => setSelectedImage({
                          src: "/examples/transformation/after-1.jpg",
                          alt: "Foto profissional gerada por IA - resultado 1",
                          title: "Fotos Profissionais"
                        })}
                      >
                        <img 
                          src="/examples/transformation/after-1.jpg" 
                          alt="Foto profissional gerada por IA - resultado 1"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                          <span className="font-medium">IA</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Presentation */}
                    <div className="text-center">
                      <div 
                        className="aspect-square rounded-xl overflow-hidden mb-3 hover:scale-105 transition-transform duration-300 shadow-lg max-w-[180px] mx-auto cursor-pointer relative"
                        onClick={() => setSelectedImage({
                          src: "/examples/transformation/after-2.jpg",
                          alt: "Foto profissional gerada por IA - resultado 2",
                          title: "Apresentações"
                        })}
                      >
                        <img 
                          src="/examples/transformation/after-2.jpg" 
                          alt="Foto profissional gerada por IA - resultado 2"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                          <span className="font-medium">IA</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Casual Professional */}
                    <div className="text-center">
                      <div 
                        className="aspect-square rounded-xl overflow-hidden mb-3 hover:scale-105 transition-transform duration-300 shadow-lg max-w-[180px] mx-auto cursor-pointer relative"
                        onClick={() => setSelectedImage({
                          src: "/examples/transformation/after-3.jpg",
                          alt: "Foto profissional gerada por IA - resultado 3",
                          title: "Casual Profissional"
                        })}
                      >
                        <img 
                          src="/examples/transformation/after-3.jpg" 
                          alt="Foto profissional gerada por IA - resultado 3"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                          <span className="font-medium">IA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Fotos profissionais de você em qualquer pose, cenário ou ação!
                    </h3>
                    <Button size="lg" asChild className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-200 border border-[#667EEA]/20 hover:border-[#667EEA]/40">
                      <Link href="/auth/signup">
                        Começar Minha Transformação
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Table Section */}
      {!session && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Escolha seu Plano</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Escolha o plano ideal para suas necessidades
              </p>
              
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center mb-8 mt-4">
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
              <div className="flex items-center justify-center mb-8">
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
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
            <div className="mt-20">
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
                  Prefere pagar apenas uma vez? Escolha um pacote de créditos sem recorrência.
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

          </div>
        </section>
      )}

      {/* Hero Image Section */}
      {!session && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              {/* Subtle Breathing Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#667EEA]/30 to-[#764BA2]/30 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              <div className="relative aspect-[2/1] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-transparent group-hover:border-gradient-to-r group-hover:from-[#667EEA]/40 group-hover:to-[#764BA2]/40 bg-white">
                {/* Gradient Border Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#667EEA]/10 via-transparent to-[#764BA2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <img 
                  src="/examples/hero/hero-image.jpg" 
                  alt="Transforme suas fotos com IA - Exemplo profissional"
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-all duration-700 ease-out"
                />
                
                {/* Subtle Light Sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {session ? (
        /* User Dashboard Section */
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Seus Projetos</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Wand2 className="w-5 h-5 mr-2 text-blue-600" />
                    Gerar Fotos
                  </CardTitle>
                  <CardDescription>
                    Use seus modelos para criar fotos profissionais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white">
                    <Link href="/generate">Começar</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Plus className="w-5 h-5 mr-2 text-green-600" />
                    Novo Modelo
                  </CardTitle>
                  <CardDescription>
                    Treine um novo modelo de IA com suas fotos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/models/create">Criar</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      ) : (
        /* Email CTA for Non-Logged Users */
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              Digite seu email para começar sua jornada com IA
            </p>
            <div className="max-w-md mx-auto">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  const email = (e.target as HTMLFormElement).email.value
                  if (email) {
                    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Seu melhor email"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667EEA] focus:border-transparent"
                />
                <Button 
                  type="submit"
                  size="lg" 
                  className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white px-8"
                >
                  Começar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full backdrop-blur-sm transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
                <h3 className="text-white text-lg font-medium">{selectedImage.title}</h3>
                <p className="text-gray-200 text-sm mt-1">Clique fora da imagem para fechar</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}