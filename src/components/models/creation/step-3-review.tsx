'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Zap, Image, User, AlertTriangle, Sparkles } from 'lucide-react'

interface ModelCreationStep3Props {
  modelData: {
    name: string
    class: 'MAN' | 'WOMAN' | 'BOY' | 'GIRL' | 'ANIMAL'
    facePhotos: File[]
    halfBodyPhotos: File[]
    fullBodyPhotos: File[]
  }
  isSubmitting: boolean
  onSubmit: () => void
}

export function ModelCreationStep3({ modelData, isSubmitting, onSubmit }: ModelCreationStep3Props) {
  const totalPhotos = modelData.facePhotos.length + modelData.halfBodyPhotos.length + modelData.fullBodyPhotos.length
  const totalSizeMB = (modelData.facePhotos.reduce((acc, file) => acc + file.size, 0) +
                      modelData.halfBodyPhotos.reduce((acc, file) => acc + file.size, 0) +
                      modelData.fullBodyPhotos.reduce((acc, file) => acc + file.size, 0)) / (1024 * 1024)

  const estimatedTrainingTime = Math.max(15, Math.min(45, totalPhotos * 1.5)) // 15-45 minutes based on photo count

  const getClassLabel = (modelClass: string) => {
    const labels = {
      MAN: 'Homem',
      WOMAN: 'Mulher',
      BOY: 'Menino',
      GIRL: 'Menina',
      ANIMAL: 'Animal'
    }
    return labels[modelClass as keyof typeof labels] || modelClass
  }

  const qualityChecks = [
    {
      check: 'Mínimo de fotos do rosto',
      passed: modelData.facePhotos.length >= 4,
      required: true,
      description: `${modelData.facePhotos.length}/4 fotos mínimas do rosto`
    },
    {
      check: 'Mínimo de fotos de meio corpo',
      passed: modelData.halfBodyPhotos.length >= 5,
      required: true,
      description: `${modelData.halfBodyPhotos.length}/5 fotos mínimas de meio corpo`
    },
    {
      check: 'Mínimo de fotos de corpo inteiro',
      passed: modelData.fullBodyPhotos.length >= 10,
      required: true,
      description: `${modelData.fullBodyPhotos.length}/10 fotos mínimas de corpo inteiro`
    },
    {
      check: 'Boa variedade de fotos',
      passed: totalPhotos >= 20,
      required: false,
      description: `${totalPhotos} fotos no total (20+ recomendado)`
    },
    {
      check: 'Tamanhos de arquivo razoáveis',
      passed: totalSizeMB < 100,
      required: false,
      description: `${totalSizeMB.toFixed(1)}MB total (menos de 100MB recomendado)`
    }
  ]

  const allRequiredPassed = qualityChecks.filter(c => c.required).every(c => c.passed)

  return (
    <div className="space-y-6">
      {/* Model Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            Pronto para Treinar seu Modelo de IA
          </CardTitle>
          <CardDescription>
            Revise os detalhes do seu modelo e inicie o processo de treinamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-900 mb-3">Detalhes do Modelo</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Nome:</span>
                  <span className="font-medium text-purple-900">{modelData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Classe:</span>
                  <span className="font-medium text-purple-900">{getClassLabel(modelData.class)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Total de Fotos:</span>
                  <span className="font-medium text-purple-900">{totalPhotos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Tamanho Total:</span>
                  <span className="font-medium text-purple-900">{totalSizeMB.toFixed(1)} MB</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-900 mb-3">Informações do Treinamento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Tempo Estimado:</span>
                  <span className="font-medium text-purple-900">~{estimatedTrainingTime} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Custo em Créditos:</span>
                  <span className="font-medium text-purple-900">5 créditos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Resolução:</span>
                  <span className="font-medium text-purple-900">512x512</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento das Fotos</CardTitle>
          <CardDescription>
            Resumo de todas as fotos enviadas por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Fotos do Rosto</h4>
                <Badge variant="secondary">{modelData.facePhotos.length}</Badge>
              </div>
              <p className="text-sm text-blue-700">
                Fotos claras do rosto para aprendizado das características faciais
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {modelData.facePhotos.slice(0, 4).map((file, index) => (
                  <div key={index} className="aspect-square bg-blue-100 rounded border overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Face ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-900">Meio Corpo</h4>
                <Badge variant="secondary">{modelData.halfBodyPhotos.length}</Badge>
              </div>
              <p className="text-sm text-green-700">
                Fotos da cintura para cima para aprendizado de poses e estilos
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {modelData.halfBodyPhotos.slice(0, 4).map((file, index) => (
                  <div key={index} className="aspect-square bg-green-100 rounded border overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Half body ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-900">Corpo Inteiro</h4>
                <Badge variant="secondary">{modelData.fullBodyPhotos.length}</Badge>
              </div>
              <p className="text-sm text-purple-700">
                Fotos de corpo completo para geração de poses completas
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {modelData.fullBodyPhotos.slice(0, 4).map((file, index) => (
                  <div key={index} className="aspect-square bg-purple-100 rounded border overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Full body ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Qualidade</CardTitle>
          <CardDescription>
            Validando se suas fotos atendem aos requisitos de treinamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {check.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  ) : (
                    <AlertTriangle className={`w-5 h-5 mr-3 ${check.required ? 'text-red-500' : 'text-yellow-500'}`} />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{check.check}</p>
                    <p className="text-sm text-gray-600">{check.description}</p>
                  </div>
                </div>
                <Badge variant={check.passed ? 'default' : check.required ? 'destructive' : 'secondary'}>
                  {check.passed ? 'Aprovado' : check.required ? 'Obrigatório' : 'Opcional'}
                </Badge>
              </div>
            ))}
          </div>

          {!allRequiredPassed && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Requisitos em Falta</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Por favor, volte e envie as fotos obrigatórias antes de iniciar o treinamento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Information */}
      <Card>
        <CardHeader>
          <CardTitle>O que Acontece Agora?</CardTitle>
          <CardDescription>
            Entendendo o processo de treinamento do modelo de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Processamento de Fotos</h4>
              <p className="text-sm text-gray-600">
                Suas fotos são analisadas e preparadas para treinamento (~5 minutos)
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Treinamento da IA</h4>
              <p className="text-sm text-gray-600">
                A rede neural aprende suas características únicas (~{estimatedTrainingTime-5} minutos)
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Modelo Pronto</h4>
              <p className="text-sm text-gray-600">
                Seu modelo de IA está pronto para gerar fotos incríveis!
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Enquanto Você Espera</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Você receberá uma notificação por email quando o treinamento estiver completo</p>
              <p>• Você pode fechar esta página e verificar mais tarde</p>
              <p>• O progresso ficará visível no seu painel de modelos</p>
              <p>• O treinamento geralmente leva {estimatedTrainingTime} minutos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Training */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Pronto para Iniciar o Treinamento</h3>
              <p className="text-gray-600">
                Isso custará 5 créditos e levará aproximadamente {estimatedTrainingTime} minutos
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPhotos}</div>
                <div className="text-sm text-gray-600">fotos enviadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600">créditos necessários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">~{estimatedTrainingTime}</div>
                <div className="text-sm text-gray-600">minutos para completar</div>
              </div>
            </div>

            <Button 
              onClick={onSubmit}
              disabled={!allRequiredPassed || isSubmitting}
              size="lg"
              className="w-full max-w-md"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando Treinamento...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Iniciar Treinamento da IA
                </>
              )}
            </Button>

            {!allRequiredPassed && (
              <p className="text-sm text-red-600">
                Por favor, complete todos os uploads de fotos obrigatórias antes de iniciar o treinamento
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}