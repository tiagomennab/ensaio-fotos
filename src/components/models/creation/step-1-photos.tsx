'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, User, Users, Heart, AlertCircle, CheckCircle } from 'lucide-react'

interface ModelCreationStep1Props {
  modelData: {
    name: string
    class: 'MAN' | 'WOMAN' | 'BOY' | 'GIRL' | 'ANIMAL'
    facePhotos: File[]
  }
  setModelData: (data: any) => void
}

export function ModelCreationStep1({ modelData, setModelData }: ModelCreationStep1Props) {
  const [dragActive, setDragActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const classOptions = [
    { value: 'MAN', label: 'Man', icon: User, description: 'Adult male person' },
    { value: 'WOMAN', label: 'Woman', icon: User, description: 'Adult female person' },
    { value: 'BOY', label: 'Boy', icon: Users, description: 'Young male person' },
    { value: 'GIRL', label: 'Girl', icon: Users, description: 'Young female person' },
    { value: 'ANIMAL', label: 'Animal', icon: Heart, description: 'Pet or animal' }
  ]

  const validateFile = (file: File): string[] => {
    const errors: string[] = []
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image')
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB')
    }
    
    return errors
  }

  const validateImage = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        const errors: string[] = []
        
        // Check minimum resolution
        if (img.width < 256 || img.height < 256) {
          errors.push('Image must be at least 256x256 pixels')
        }
        
        // Check aspect ratio (should be roughly square for face photos)
        const aspectRatio = img.width / img.height
        if (aspectRatio < 0.5 || aspectRatio > 2) {
          errors.push('Image aspect ratio should be closer to square')
        }
        
        URL.revokeObjectURL(url)
        resolve(errors)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(['Invalid image file'])
      }
      
      img.src = url
    })
  }

  const handleFileSelect = async (files: FileList) => {
    const newFiles: File[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Basic validation
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`)
        continue
      }
      
      // Image validation
      const imageErrors = await validateImage(file)
      if (imageErrors.length > 0) {
        errors.push(`${file.name}: ${imageErrors.join(', ')}`)
        continue
      }
      
      newFiles.push(file)
    }

    // Check total count
    const totalFiles = modelData.facePhotos.length + newFiles.length
    if (totalFiles > 8) {
      errors.push(`Maximum 8 face photos allowed (you selected ${totalFiles})`)
      setValidationErrors(errors)
      return
    }

    setValidationErrors(errors)
    
    if (newFiles.length > 0) {
      setModelData({
        ...modelData,
        facePhotos: [...modelData.facePhotos, ...newFiles]
      })
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [modelData])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const removePhoto = (index: number) => {
    const newPhotos = modelData.facePhotos.filter((_, i) => i !== index)
    setModelData({
      ...modelData,
      facePhotos: newPhotos
    })
  }

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Model Name */}
      <Card>
        <CardHeader>
          <CardTitle>Model Details</CardTitle>
          <CardDescription>
            Give your AI model a name and select the appropriate class
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Model Name
            </label>
            <input
              id="name"
              type="text"
              value={modelData.name}
              onChange={(e) => setModelData({ ...modelData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., John's Model, Sarah's AI, etc."
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a name that helps you identify this model
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Class
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {classOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setModelData({ ...modelData, class: option.value as any })}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      modelData.class === option.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Face Photos Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Face Photos
            <Badge variant={modelData.facePhotos.length >= 4 ? 'default' : 'secondary'}>
              {modelData.facePhotos.length}/8 photos
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload 4-8 clear face photos. These should focus on the face with good lighting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Drop face photos here, or{' '}
                <label className="text-purple-600 cursor-pointer hover:underline">
                  browse files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WebP up to 10MB each
              </p>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Upload Issues</h4>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Photo Preview Grid */}
          {modelData.facePhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modelData.facePhotos.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getImagePreview(file)}
                      alt={`Face photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(file.size / 1024)}KB
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Requirements Check */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Photo Requirements</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                {modelData.facePhotos.length >= 4 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded-full mr-2" />
                )}
                <span className={modelData.facePhotos.length >= 4 ? 'text-green-700' : 'text-blue-800'}>
                  At least 4 face photos (you have {modelData.facePhotos.length})
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-green-700">Clear, well-lit face photos</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-green-700">Various angles and expressions</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-green-700">High resolution (min 256x256)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Good vs Bad Examples</CardTitle>
          <CardDescription>
            See what makes a good training photo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Good Examples
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>✓ Clear, sharp facial features</p>
                <p>✓ Good lighting (natural light preferred)</p>
                <p>✓ Face takes up 30-70% of the image</p>
                <p>✓ Minimal makeup or filters</p>
                <p>✓ Various expressions and angles</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center">
                <X className="w-5 h-5 mr-2" />
                Avoid These
              </h4>
              <div className="space-y-2 text-sm text-red-700">
                <p>✗ Blurry or low-quality images</p>
                <p>✗ Heavy shadows or poor lighting</p>
                <p>✗ Face covered or very small</p>
                <p>✗ Heavy filters or editing</p>
                <p>✗ Group photos with multiple people</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}