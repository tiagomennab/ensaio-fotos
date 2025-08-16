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
      MAN: 'Man',
      WOMAN: 'Woman',
      BOY: 'Boy',
      GIRL: 'Girl',
      ANIMAL: 'Animal'
    }
    return labels[modelClass as keyof typeof labels] || modelClass
  }

  const qualityChecks = [
    {
      check: 'Minimum face photos',
      passed: modelData.facePhotos.length >= 4,
      required: true,
      description: `${modelData.facePhotos.length}/4 minimum face photos`
    },
    {
      check: 'Minimum half body photos',
      passed: modelData.halfBodyPhotos.length >= 5,
      required: true,
      description: `${modelData.halfBodyPhotos.length}/5 minimum half body photos`
    },
    {
      check: 'Minimum full body photos',
      passed: modelData.fullBodyPhotos.length >= 10,
      required: true,
      description: `${modelData.fullBodyPhotos.length}/10 minimum full body photos`
    },
    {
      check: 'Good photo variety',
      passed: totalPhotos >= 20,
      required: false,
      description: `${totalPhotos} total photos (20+ recommended)`
    },
    {
      check: 'Reasonable file sizes',
      passed: totalSizeMB < 100,
      required: false,
      description: `${totalSizeMB.toFixed(1)}MB total (under 100MB recommended)`
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
            Ready to Train Your AI Model
          </CardTitle>
          <CardDescription>
            Review your model details and start the training process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-900 mb-3">Model Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Name:</span>
                  <span className="font-medium text-purple-900">{modelData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Class:</span>
                  <span className="font-medium text-purple-900">{getClassLabel(modelData.class)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Photos:</span>
                  <span className="font-medium text-purple-900">{totalPhotos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Size:</span>
                  <span className="font-medium text-purple-900">{totalSizeMB.toFixed(1)} MB</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-900 mb-3">Training Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Estimated Time:</span>
                  <span className="font-medium text-purple-900">~{estimatedTrainingTime} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Credits Cost:</span>
                  <span className="font-medium text-purple-900">5 credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Resolution:</span>
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
          <CardTitle>Photo Breakdown</CardTitle>
          <CardDescription>
            Summary of all uploaded photos by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Face Photos</h4>
                <Badge variant="secondary">{modelData.facePhotos.length}</Badge>
              </div>
              <p className="text-sm text-blue-700">
                Clear face shots for facial feature learning
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
                <h4 className="font-medium text-green-900">Half Body</h4>
                <Badge variant="secondary">{modelData.halfBodyPhotos.length}</Badge>
              </div>
              <p className="text-sm text-green-700">
                Waist-up photos for pose and style learning
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
                <h4 className="font-medium text-purple-900">Full Body</h4>
                <Badge variant="secondary">{modelData.fullBodyPhotos.length}</Badge>
              </div>
              <p className="text-sm text-purple-700">
                Complete body shots for full pose generation
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
          <CardTitle>Quality Checks</CardTitle>
          <CardDescription>
            Validating your photos meet training requirements
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
                  {check.passed ? 'Passed' : check.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
            ))}
          </div>

          {!allRequiredPassed && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Missing Requirements</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Please go back and upload the required photos before starting training.
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
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>
            Understanding the AI model training process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Photo Processing</h4>
              <p className="text-sm text-gray-600">
                Your photos are analyzed and prepared for training (~5 minutes)
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">AI Training</h4>
              <p className="text-sm text-gray-600">
                Neural network learns your unique features (~{estimatedTrainingTime-5} minutes)
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Model Ready</h4>
              <p className="text-sm text-gray-600">
                Your AI model is ready to generate amazing photos!
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 While You Wait</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• You'll receive an email notification when training is complete</p>
              <p>• You can close this page and check back later</p>
              <p>• Progress will be visible in your models dashboard</p>
              <p>• Training typically takes {estimatedTrainingTime} minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Training */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Ready to Start Training</h3>
              <p className="text-gray-600">
                This will cost 5 credits and take approximately {estimatedTrainingTime} minutes
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPhotos}</div>
                <div className="text-sm text-gray-600">photos uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600">credits required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">~{estimatedTrainingTime}</div>
                <div className="text-sm text-gray-600">minutes to complete</div>
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
                  Starting Training...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start AI Training
                </>
              )}
            </Button>

            {!allRequiredPassed && (
              <p className="text-sm text-red-600">
                Please complete all required photo uploads before starting training
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}