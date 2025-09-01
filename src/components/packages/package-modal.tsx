'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Crown, 
  Star, 
  Users, 
  Clock, 
  Eye,
  Download,
  Play,
  Copy,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react'

interface Package {
  id: string
  name: string
  category: string
  description: string
  prompts: string[]
  previewImages: string[]
  price: number
  isPremium: boolean
  estimatedTime: string
  popularity: number
  rating: number
  uses: number
  tags: string[]
  features?: string[]
}

interface PackageModalProps {
  package: Package
  onClose: () => void
}

export function PackageModal({ package: pkg, onClose }: PackageModalProps) {
  const [selectedPrompt, setSelectedPrompt] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const handleGenerate = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    // You could add a toast notification here
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      SOCIAL: 'bg-pink-100 text-pink-800',
      FANTASY: 'bg-purple-100 text-purple-800',
      ARTISTIC: 'bg-green-100 text-green-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{pkg.name}</h2>
                <Badge variant="secondary" className="bg-blue-100/20 text-blue-300 border border-blue-400/20">
                  {pkg.category.toLowerCase()}
                </Badge>
                {pkg.isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-900">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-300 mb-4">{pkg.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  {pkg.rating} ({pkg.uses.toLocaleString()} uses)
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {pkg.estimatedTime}
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-purple-400" />
                  {pkg.prompts.length} prompts
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-700">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="preview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700 border border-gray-600">
              <TabsTrigger value="preview" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">Visualizar</TabsTrigger>
              <TabsTrigger value="prompts" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">Prompts ({pkg.prompts.length})</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-6">
              {/* Preview Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pkg.previewImages.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-900 rounded-lg overflow-hidden group cursor-pointer border border-gray-700">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative hidden">
                      <span className="text-3xl opacity-50 text-gray-400">🖼️</span>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 hover:bg-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Gerar Todos ({pkg.prompts.length})
                    </>
                  )}
                </Button>
                
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Adicionar aos Favoritos
                </Button>
                
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar Pacote
                </Button>
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Gerando imagens...</span>
                      <span className="text-sm text-gray-300">{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="prompts" className="space-y-4">
              <div className="grid gap-4">
                {pkg.prompts.map((prompt, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all border-gray-600 ${
                      selectedPrompt === index 
                        ? 'ring-2 ring-blue-500 bg-gray-700 border-blue-500' 
                        : 'bg-gray-800 hover:bg-gray-700 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPrompt(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="border-gray-500 text-gray-300">Prompt {index + 1}</Badge>
                            {selectedPrompt === index && (
                              <Badge variant="default" className="bg-blue-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Selecionado
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300">{prompt}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-gray-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyPrompt(prompt)
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle individual prompt generation
                            }}
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Gerar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Package Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{pkg.rating}</div>
                    <div className="text-sm text-gray-400">Avaliação</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{pkg.uses.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total de Usos</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{pkg.estimatedTime}</div>
                    <div className="text-sm text-gray-400">Tempo Est.</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{pkg.prompts.length}</div>
                    <div className="text-sm text-gray-400">Prompts</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-medium text-white mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {pkg.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-gray-600 text-gray-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Package Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Informações do Pacote</h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2 border border-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Categoria:</span>
                      <span className="font-medium text-white">{pkg.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="font-medium text-white">{pkg.isPremium ? 'Premium' : 'Gratuito'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Preço:</span>
                      <span className="font-medium text-white">R$ {pkg.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Popularidade:</span>
                      <span className="font-medium text-white">{pkg.popularity}%</span>
                    </div>
                  </div>
                </div>

                {/* Usage Tips */}
                <div>
                  <h3 className="font-medium text-white mb-2">Dicas de Uso</h3>
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">Melhores Resultados:</p>
                        <ul className="space-y-1">
                          <li>• Use fotos de treinamento de alta qualidade para melhores resultados</li>
                          <li>• Certifique-se de que seu modelo foi treinado adequadamente</li>
                          <li>• Considere gerar em lote para estilo consistente</li>
                          <li>• Pacotes premium geralmente fornecem prompts mais detalhados</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-white">R$ {pkg.price}</span>
              <span className="text-gray-400">
                {pkg.prompts.length} prompts • {pkg.estimatedTime}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {pkg.isPremium ? 'Desbloquear e Gerar' : 'Gerar Agora'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}