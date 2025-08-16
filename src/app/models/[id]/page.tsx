import { requireAuth } from '@/lib/auth'
import { getModelById, getModelStats } from '@/lib/db/models'
import { getGenerationsByUserId } from '@/lib/db/generations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Eye, Download, Trash2, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ModelStats } from '@/components/models/model-stats'
import { formatDate } from '@/lib/utils'

interface ModelPageProps {
  params: {
    id: string
  }
}

export default async function ModelPage({ params }: ModelPageProps) {
  const session = await requireAuth()
  const modelId = params.id

  const model = await getModelById(modelId, session.user.id)
  
  if (!model) {
    notFound()
  }

  const [modelStats, recentGenerations] = await Promise.all([
    getModelStats(modelId),
    getGenerationsByUserId(session.user.id, 1, 10, modelId)
  ])

  const getStatusIcon = () => {
    switch (model.status) {
      case 'READY':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'TRAINING':
      case 'PROCESSING':
      case 'UPLOADING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (model.status) {
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'TRAINING':
      case 'PROCESSING':
      case 'UPLOADING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statsData = {
    totalGenerations: modelStats.totalGenerations,
    averageProcessingTime: modelStats.averageProcessingTime,
    totalCreditsUsed: modelStats.totalGenerations * 1, // Assuming 1 credit per generation
    successRate: 95, // This would need to be calculated from actual data
    popularPrompts: [] // This would need to be implemented in the stats function
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/models">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Models
                </Link>
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
                  <Badge className={getStatusColor()}>
                    {model.status}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1 capitalize">
                  {model.class.toLowerCase().replace('_', ' ')} • Created {formatDate(model.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {model.status === 'READY' && (
                <Button asChild>
                  <Link href={`/generate?model=${model.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Photos
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href={`/gallery?model=${model.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Model Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Progress */}
            {['TRAINING', 'PROCESSING', 'UPLOADING'].includes(model.status) && (
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>
                    Your model is currently being trained
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{model.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${model.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {model.estimatedTime && (
                      <p className="text-sm text-gray-600">
                        Estimated time remaining: ~{model.estimatedTime} minutes
                      </p>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>What's happening:</strong> Your photos are being processed and the AI model is learning your unique features. You'll receive an email when training is complete.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {model.status === 'ERROR' && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Training Error</CardTitle>
                  <CardDescription>
                    There was an issue training your model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 text-sm">
                      {model.errorMessage || 'An unknown error occurred during training.'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline">
                      Retry Training
                    </Button>
                    <Button variant="outline">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Model Statistics */}
            {model.status === 'READY' && (
              <Card>
                <CardHeader>
                  <CardTitle>Model Statistics</CardTitle>
                  <CardDescription>
                    Performance and usage metrics for this model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelStats stats={statsData} />
                </CardContent>
              </Card>
            )}

            {/* Sample Images */}
            {model.sampleImages && model.sampleImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sample Results</CardTitle>
                  <CardDescription>
                    Examples of photos generated with this model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {model.sampleImages.map((image: string, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Generations */}
            {recentGenerations.generations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Generations</CardTitle>
                  <CardDescription>
                    Latest photos created with this model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGenerations.generations.slice(0, 5).map((generation) => (
                      <div key={generation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium truncate max-w-md">
                            {generation.prompt}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(generation.createdAt)} • {generation.imageUrls.length} images
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {generation.status}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/gallery?generation=${generation.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {recentGenerations.generations.length > 5 && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/gallery?model=${model.id}`}>
                          View All Generations
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Model Info */}
          <div className="space-y-6">
            {/* Model Information */}
            <Card>
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Class</p>
                    <p className="font-semibold capitalize">{model.class.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Photos</p>
                    <p className="font-semibold">{model.totalPhotos}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-semibold">{formatDate(model.createdAt)}</p>
                  </div>
                  {model.trainedAt && (
                    <div>
                      <p className="text-gray-600">Trained</p>
                      <p className="font-semibold">{formatDate(model.trainedAt)}</p>
                    </div>
                  )}
                  {model.qualityScore && (
                    <div>
                      <p className="text-gray-600">Quality Score</p>
                      <p className="font-semibold">{Math.round(model.qualityScore * 100)}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Training Data */}
            <Card>
              <CardHeader>
                <CardTitle>Training Data</CardTitle>
                <CardDescription>
                  Photos used to train this model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Face Photos</span>
                  <span className="font-semibold">{model.facePhotos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Half Body Photos</span>
                  <span className="font-semibold">{model.halfBodyPhotos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Full Body Photos</span>
                  <span className="font-semibold">{model.fullBodyPhotos?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {model.status === 'READY' && (
                  <>
                    <Button asChild className="w-full">
                      <Link href={`/generate?model=${model.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Generate Photos
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/gallery?model=${model.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Gallery
                      </Link>
                    </Button>
                  </>
                )}
                
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Model
                </Button>
                
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Model
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}