'use client'

import { useState, useEffect } from 'react'
import { useEditHistory } from '@/hooks/useEditHistory'
import { ImageUpload } from './image-upload'
import { PromptInput } from './prompt-input'
import { ResultPreview } from './result-preview'
import { EditHistory } from './edit-history'
import { Edit3, Plus, Minus, Palette, Combine, Blend, Wand2 } from 'lucide-react'
import { ImageEditResponse } from '@/lib/ai/image-editor'

type EditOperation = 'edit' | 'add' | 'remove' | 'style' | 'blend' | 'combine'

interface ImageEditorInterfaceProps {
  className?: string
  preloadedImageUrl?: string
}

export function ImageEditorInterface({ className = '', preloadedImageUrl }: ImageEditorInterfaceProps) {
  const [operation, setOperation] = useState<EditOperation>('edit')
  const [images, setImages] = useState<File[]>([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImageEditResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { saveEditSession, currentSession, setCurrentSession, loadEditSession } = useEditHistory()

  // Load preloaded image if provided
  useEffect(() => {
    if (preloadedImageUrl && images.length === 0) {
      const loadPreloadedImage = async () => {
        try {
          const response = await fetch(preloadedImageUrl)
          const blob = await response.blob()
          const fileName = preloadedImageUrl.split('/').pop() || 'preloaded-image.jpg'
          const file = new File([blob], fileName, { type: blob.type })
          setImages([file])
        } catch (error) {
          console.error('Failed to load preloaded image:', error)
          setError('Failed to load preloaded image')
        }
      }
      loadPreloadedImage()
    }
  }, [preloadedImageUrl, images.length])

  const operations = [
    { id: 'edit' as const, label: 'Edit Image', icon: Edit3, description: 'Modify existing elements' },
    { id: 'add' as const, label: 'Add Element', icon: Plus, description: 'Add new objects or elements' },
    { id: 'remove' as const, label: 'Remove Element', icon: Minus, description: 'Remove unwanted parts' },
    { id: 'style' as const, label: 'Style Transfer', icon: Palette, description: 'Apply artistic styles' },
    { id: 'blend' as const, label: 'Blend Avançado', icon: Blend, description: 'Fusão inteligente (2-3 imagens)' },
    { id: 'combine' as const, label: 'Combine Images', icon: Combine, description: 'Merge multiple images (legacy)' }
  ]

  const getPromptExamples = (op: EditOperation) => {
    switch (op) {
      case 'edit':
        return [
          'Make the sky more dramatic',
          'Change the lighting to golden hour',
          'Enhance the colors and contrast',
          'Make it look more professional'
        ]
      case 'add':
        return [
          'Add a beautiful sunset in the background',
          'Add flowers in the foreground',
          'Add mountains in the distance',
          'Add a reflection in the water'
        ]
      case 'remove':
        return [
          'Remove the person in the background',
          'Remove all text and watermarks',
          'Remove the power lines',
          'Remove the clutter from the scene'
        ]
      case 'style':
        return [
          'Make it look like a Van Gogh painting',
          'Apply a vintage film photography style',
          'Make it look like a digital art illustration',
          'Apply a black and white artistic style'
        ]
      case 'blend':
        return [
          'Seamlessly blend the best elements from both images',
          'Create a natural fusion of lighting and colors',
          'Merge the textures and objects into one cohesive image',
          'Combine facial features while maintaining identity'
        ]
      case 'combine':
        return [
          'Combine these images into a collage',
          'Blend the images seamlessly together',
          'Create a panoramic view from these images',
          'Merge the best elements from each image'
        ]
      default:
        return []
    }
  }

  const getPromptPlaceholder = (op: EditOperation) => {
    switch (op) {
      case 'edit':
        return 'Describe how you want to modify the image...'
      case 'add':
        return 'Describe what you want to add to the image...'
      case 'remove':
        return 'Describe what you want to remove from the image...'
      case 'style':
        return 'Describe the style you want to apply...'
      case 'blend':
        return 'Describe how you want to blend the images together...'
      case 'combine':
        return 'Describe how you want to combine the images...'
      default:
        return 'Describe what you want to do...'
    }
  }

  const handleSubmit = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if ((operation === 'combine' || operation === 'blend') && images.length < 2) {
      setError(`Please upload at least 2 images to ${operation}`)
      return
    }

    if (operation === 'blend' && images.length > 3) {
      setError('Blend avançado suporta máximo 3 imagens')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      
      if (operation === 'combine' || operation === 'blend') {
        // For combine/blend operations, add all images
        images.forEach((image, index) => {
          formData.append(`image${index}`, image)
        })
        formData.append('prompt', prompt)
      } else {
        // For other operations, use the first image
        formData.append('image', images[0])
        if (operation === 'style') {
          formData.append('stylePrompt', prompt)
        } else {
          formData.append('prompt', prompt)
        }
      }

      const response = await fetch(`/api/image-editor/${operation}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image')
      }

      if (data.success) {
        setResult(data.data)
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }

    } catch (err) {
      console.error('Image editing error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Save edit session when result is available
  useEffect(() => {
    if (result && images.length > 0 && result.id) {
      // Only save if this result hasn't been saved before
      const sessionId = `edit_${result.id}_${Date.now()}`
      const editSession = {
        id: sessionId,
        originalImage: images[0] ? URL.createObjectURL(images[0]) : '',
        result,
        operation,
        prompt,
        timestamp: Date.now()
      }
      saveEditSession(editSession)
    }
  }, [result?.id, operation, prompt]) // Removed images and saveEditSession from deps

  const handleReset = () => {
    setResult(null)
    setError(null)
    setPrompt('')
    // Keep images for easier retry
  }

  const handleSave = (success: boolean) => {
    if (success) {
      // Show success message
      const successMessage = document.createElement('div')
      successMessage.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; font-family: system-ui; font-size: 14px; font-weight: 500;">
          ✅ Imagem salva na galeria com sucesso!
        </div>
      `
      document.body.appendChild(successMessage)
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 3000)
      
      // Clear current session after successful save
      setCurrentSession(null)
    } else {
      // Show error message
      const errorMessage = document.createElement('div')
      errorMessage.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #EF4444; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; font-family: system-ui; font-size: 14px; font-weight: 500;">
          ❌ Erro ao salvar imagem. Tente novamente.
        </div>
      `
      document.body.appendChild(errorMessage)
      setTimeout(() => {
        document.body.removeChild(errorMessage)
      }, 4000)
    }
  }

  const handleLoadSession = (sessionId: string) => {
    const session = loadEditSession(sessionId)
    if (session) {
      setResult(session.result)
      setOperation(session.operation as EditOperation)
      setPrompt(session.prompt)
      setError(null)
      console.log('✅ Session loaded:', sessionId)
    }
  }

  const canSubmit = images.length > 0 && 
                   prompt.trim().length > 0 && 
                   !loading &&
                   (operation !== 'combine' || images.length >= 2) &&
                   (operation !== 'blend' || (images.length >= 2 && images.length <= 3))

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
          <Wand2 className="w-8 h-8 mr-3 text-blue-600" />
          AI Image Editor
        </h1>
        <p className="text-lg text-gray-600">
          Transform your images with the power of AI
        </p>
      </div>

      {/* Operation Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Choose Operation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {operations.map((op) => {
            const Icon = op.icon
            return (
              <button
                key={op.id}
                onClick={() => {
                  setOperation(op.id)
                  setResult(null)
                  setError(null)
                }}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  operation === op.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium text-sm">{op.label}</div>
                <div className="text-xs text-gray-500 mt-1">{op.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload Image{(operation === 'combine' || operation === 'blend') ? 's' : ''}
              {operation === 'blend' && <span className="text-sm text-blue-600 ml-2">(2-3 imagens para blend)</span>}
            </h2>
            <ImageUpload
              onImagesChange={setImages}
              multiple={operation === 'combine' || operation === 'blend'}
              maxFiles={operation === 'blend' ? 3 : operation === 'combine' ? 5 : 1}
            />
          </div>

          {/* Prompt Input */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {operation === 'style' ? 'Style Description' : 'Edit Instructions'}
            </h2>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              placeholder={getPromptPlaceholder(operation)}
              examples={getPromptExamples(operation)}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              `${operations.find(op => op.id === operation)?.label} Image`
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          <ResultPreview
            result={result}
            originalImage={images[0] ? URL.createObjectURL(images[0]) : undefined}
            loading={loading}
            onReset={handleReset}
            onSave={handleSave}
          />
          
          {/* Edit History */}
          <EditHistory
            onLoadSession={handleLoadSession}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  )
}