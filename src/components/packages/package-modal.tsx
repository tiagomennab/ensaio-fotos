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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
                <Badge variant="secondary" className={getCategoryColor(pkg.category)}>
                  {pkg.category.toLowerCase()}
                </Badge>
                {pkg.isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {pkg.rating} ({pkg.uses.toLocaleString()} uses)
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {pkg.estimatedTime}
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  {pkg.prompts.length} prompts
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="preview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="prompts">Prompts ({pkg.prompts.length})</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-6">
              {/* Preview Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pkg.previewImages.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                      <span className="text-3xl opacity-50">🖼️</span>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate All ({pkg.prompts.length})
                    </>
                  )}
                </Button>
                
                <Button variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Favorites
                </Button>
                
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Package
                </Button>
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Generating images...</span>
                      <span className="text-sm text-gray-500">{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
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
                    className={`cursor-pointer transition-all ${
                      selectedPrompt === index 
                        ? 'ring-2 ring-purple-500 bg-purple-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPrompt(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Prompt {index + 1}</Badge>
                            {selectedPrompt === index && (
                              <Badge variant="default">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700">{prompt}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
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
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle individual prompt generation
                            }}
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Generate
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
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{pkg.rating}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{pkg.uses.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Uses</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{pkg.estimatedTime}</div>
                    <div className="text-sm text-gray-500">Est. Time</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{pkg.prompts.length}</div>
                    <div className="text-sm text-gray-500">Prompts</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {pkg.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Package Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Package Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{pkg.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{pkg.isPremium ? 'Premium' : 'Free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${pkg.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Popularity:</span>
                      <span className="font-medium">{pkg.popularity}%</span>
                    </div>
                  </div>
                </div>

                {/* Usage Tips */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Usage Tips</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Best Results:</p>
                        <ul className="space-y-1">
                          <li>• Use high-quality training photos for better results</li>
                          <li>• Ensure your model has been properly trained</li>
                          <li>• Consider batch generation for consistent styling</li>
                          <li>• Premium packages often provide more detailed prompts</li>
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
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
              <span className="text-gray-500">
                {pkg.prompts.length} prompts • {pkg.estimatedTime}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {pkg.isPremium ? 'Unlock & Generate' : 'Generate Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}