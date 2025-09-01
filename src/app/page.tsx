'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowDown, Sparkles, Users, Zap, Shield, Plus, ImageIcon, TrendingUp, Crown, CreditCard, Upload, Bot, Wand2, Camera, Star, User, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'


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
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string, title: string} | null>(null)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
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
                    src: "/examples/card-fotos-ceo.jpg",
                    alt: "Mulher executiva - foto profissional gerada por IA",
                    title: "Executive Minimalist"
                  })}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="/examples/card-fotos-ceo.jpg" 
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
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Escolha o plano ideal para suas necessidades
              </p>
              
              {/* Monthly/Annual Toggle */}
              <div className="flex items-center justify-center mt-8 mb-8">
                <div className="flex items-center bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 rounded-full p-1 border border-[#667EEA]/20">
                  <button 
                    onClick={() => setIsAnnual(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      !isAnnual 
                        ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-sm' 
                        : 'text-[#667EEA] hover:text-[#764BA2]'
                    }`}
                  >
                    Mensal
                  </button>
                  <button 
                    onClick={() => setIsAnnual(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isAnnual 
                        ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-sm' 
                        : 'text-[#667EEA] hover:text-[#764BA2]'
                    }`}
                  >
                    Anual
                    <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white text-xs rounded-full font-semibold shadow-sm">
                      4 meses grátis
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <Card className="border-[#667EEA]/30 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-gray-900">Starter</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {isAnnual ? '59' : '89'}
                    </span>
                    <span className="text-gray-500">/{isAnnual ? 'mês' : 'mês'}</span>
                    {isAnnual && (
                      <div className="text-sm text-gray-500 mt-1">
                        R$ 708/ano • Economize R$ 360
                      </div>
                    )}
                  </div>
                  <CardDescription>Perfeito para começar</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      1 modelo de IA
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      50 créditos/mês
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      Resolução 512x512
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white" asChild>
                    <Link href="/auth/signup">Começar</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-[#667EEA] ring-2 ring-[#667EEA] shadow-xl relative bg-gradient-to-br from-white to-purple-50">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white">
                  Popular
                </Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-gray-900">Premium</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {isAnnual ? '179' : '269'}
                    </span>
                    <span className="text-gray-500">/{isAnnual ? 'mês' : 'mês'}</span>
                    {isAnnual && (
                      <div className="text-sm text-gray-500 mt-1">
                        R$ 2.148/ano • Economize R$ 1.080
                      </div>
                    )}
                  </div>
                  <CardDescription>Ideal para criadores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      3 modelos de IA
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      200 créditos/mês
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      Alta resolução 1024x1024
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white shadow-lg" asChild>
                    <Link href="/auth/signup">Começar</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Gold Plan */}
              <Card className="border-[#764BA2]/30 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-gray-900">Gold</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {isAnnual ? '299' : '449'}
                    </span>
                    <span className="text-gray-500">/{isAnnual ? 'mês' : 'mês'}</span>
                    {isAnnual && (
                      <div className="text-sm text-gray-500 mt-1">
                        R$ 3.588/ano • Economize R$ 1.800
                      </div>
                    )}
                  </div>
                  <CardDescription>Para profissionais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      10 modelos de IA
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      1000 créditos/mês
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-[#667EEA]/10 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-[#667EEA] rounded-full"></div>
                      </div>
                      Máxima resolução 1536x1536
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white shadow-lg" asChild>
                    <Link href="/auth/signup">Começar</Link>
                  </Button>
                </CardContent>
              </Card>
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
            
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  Ver Planos
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        /* Pricing CTA for Non-Logged Users */
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para Começar?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Escolha o plano ideal para suas necessidades
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A6FDB] hover:to-[#6B4493] text-white">
              <Link href="/pricing">
                Ver Planos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
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