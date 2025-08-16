'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, Upload, User, Users, Heart } from 'lucide-react'
import Link from 'next/link'
import { ModelCreationStep1 } from '@/components/models/creation/step-1-photos'
import { ModelCreationStep2 } from '@/components/models/creation/step-2-body-photos'
import { ModelCreationStep3 } from '@/components/models/creation/step-3-review'

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

  const steps = [
    {
      number: 1,
      title: 'Face Photos',
      description: '4-8 clear face photos',
      completed: modelData.facePhotos.length >= 4
    },
    {
      number: 2,
      title: 'Body Photos',
      description: '15-25 half & full body photos',
      completed: modelData.halfBodyPhotos.length >= 5 && modelData.fullBodyPhotos.length >= 10
    },
    {
      number: 3,
      title: 'Review & Train',
      description: 'Review and start training',
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
      alert('Error creating model')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/models">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Models
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create AI Model</h1>
                <p className="text-gray-600 mt-1">
                  Train a custom AI model with your photos
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              Step {currentStep} of 3
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
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
        <div className="mb-8">
          {currentStep === 1 && (
            <ModelCreationStep1
              modelData={modelData}
              setModelData={setModelData}
            />
          )}
          
          {currentStep === 2 && (
            <ModelCreationStep2
              modelData={modelData}
              setModelData={setModelData}
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {currentStep < 3 ? (
                  <Button 
                    onClick={handleNextStep}
                    disabled={!canProceedToNext()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceedToNext()}
                    size="lg"
                  >
                    {isSubmitting ? 'Creating Model...' : 'Start Training'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Results</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use high-quality photos (at least 512x512 pixels)</li>
              <li>• Ensure good lighting and clear facial features</li>
              <li>• Include variety in expressions, angles, and backgrounds</li>
              <li>• Avoid heavily filtered or edited photos</li>
              <li>• Training typically takes 15-30 minutes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}