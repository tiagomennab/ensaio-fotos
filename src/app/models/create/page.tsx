'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, Upload, User, Users, Heart, Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { ModelCreationStep1 } from '@/components/models/creation/step-1-photos'
import { ModelCreationStep2 } from '@/components/models/creation/step-2-body-photos'
import { ModelCreationStep3 } from '@/components/models/creation/step-3-review'
import { SubscriptionGate } from '@/components/subscription/subscription-gate'

export default function CreateModelPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [modelData, setModelData] = useState({
    name: '',
    class: 'MAN' as 'MAN' | 'WOMAN' | 'BOY' | 'GIRL' | 'ANIMAL',
    facePhotos: [] as File[],
    halfBodyPhotos: [] as File[],
    fullBodyPhotos: [] as File[]
  })
  
  const [consentAccepted, setConsentAccepted] = useState(false)

  const steps = [
    {
      number: 1,
      title: 'Fotos do Rosto',
      description: '4-8 fotos claras do rosto',
      completed: modelData.facePhotos.length >= 4
    },
    {
      number: 2,
      title: 'Fotos do Corpo',
      description: '15-25 fotos de meio corpo e corpo inteiro',
      completed: modelData.halfBodyPhotos.length >= 5 && modelData.fullBodyPhotos.length >= 10
    },
    {
      number: 3,
      title: 'Revisar e Treinar',
      description: 'Revisar e iniciar treinamento',
      completed: false
    }
  ]

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Here we would upload photos and create the model
      // For now, we'll just simulate the process
      
      console.log('Creating model with data:', {
        name: modelData.name,
        class: modelData.class,
        facePhotosCount: modelData.facePhotos.length,
        halfBodyPhotosCount: modelData.halfBodyPhotos.length,
        fullBodyPhotosCount: modelData.fullBodyPhotos.length
      })

      // Simulate upload time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/models?created=true')
    } catch (error) {
      alert('Erro ao criar modelo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return modelData.name && modelData.class && modelData.facePhotos.length >= 4
      case 2:
        return modelData.halfBodyPhotos.length >= 5 && modelData.fullBodyPhotos.length >= 10
      case 3:
        return true
      default:
        return false
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <SubscriptionGate feature="criação de modelos de IA">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/models">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar aos Modelos
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Criar Modelo de IA</h1>
                  <p className="text-gray-600 mt-1">
                    Treine um modelo personalizado de IA com suas fotos
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                Etapa {currentStep} de 3
              </Badge>
            </div>
          </div>
        </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legal Consent - Global */}
        <Card className="mb-8 border-amber-200 bg-amber-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="global-consent-checkbox"
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="global-consent-checkbox" className="text-sm text-gray-700 cursor-pointer">
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Consentimento para uso de imagens:</span>
                      <span className="ml-1">
                        Confirmo que tenho direitos sobre todas as fotos que irei enviar (faciais e corporais) e autorizo seu uso responsável para treinamento de IA. Li e aceito os{' '}
                        <Link href="/legal/terms" className="text-purple-600 hover:underline inline-flex items-center" target="_blank">
                          Termos de Uso
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                        {' '}e{' '}
                        <Link href="/legal/privacy" className="text-purple-600 hover:underline inline-flex items-center" target="_blank">
                          Política de Privacidade
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                        .
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className={`mb-8 ${!consentAccepted ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.number
                        ? 'bg-purple-600 text-white'
                        : step.completed
                        ? 'bg-green-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.completed || currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep === step.number ? 'text-purple-600' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className={`mb-8 ${!consentAccepted ? 'opacity-50 pointer-events-none' : ''}`}>
          {!consentAccepted && (
            <div className="mb-6 text-center">
              <p className="text-amber-600 font-medium flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                Aceite o consentimento acima para continuar com o upload das fotos
              </p>
            </div>
          )}
          
          {currentStep === 1 && (
            <ModelCreationStep1
              modelData={modelData}
              setModelData={setModelData}
              consentAccepted={consentAccepted}
            />
          )}
          
          {currentStep === 2 && (
            <ModelCreationStep2
              modelData={modelData}
              setModelData={setModelData}
              consentAccepted={consentAccepted}
            />
          )}
          
          {currentStep === 3 && (
            <ModelCreationStep3
              modelData={modelData}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Navigation */}
        <Card className={!consentAccepted ? 'opacity-50 pointer-events-none' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {currentStep < 3 ? (
                  <Button 
                    onClick={handleNextStep}
                    disabled={!canProceedToNext() || !consentAccepted}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceedToNext() || !consentAccepted}
                    size="lg"
                  >
                    {isSubmitting ? 'Criando Modelo...' : 'Iniciar Treinamento'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas para Melhores Resultados</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use fotos de alta qualidade (pelo menos 512x512 pixels)</li>
              <li>• Garanta boa iluminação e traços faciais claros</li>
              <li>• Inclua variedade em expressões, ângulos e fundos</li>
              <li>• Evite fotos com muito filtro ou editadas</li>
              <li>• O treinamento geralmente leva 15-30 minutos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    </SubscriptionGate>
  )
}