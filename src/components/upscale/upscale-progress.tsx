'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, Clock, X, AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface UpscaleProgressProps {
  jobId: string
  originalImage: string
  scaleFactor: number
  onComplete: (result: { resultImages: string[]; downloadUrl: string }) => void
  onCancel?: () => void
  onError?: (error: string) => void
  className?: string
}

export function UpscaleProgress({
  jobId,
  originalImage,
  scaleFactor,
  onComplete,
  onCancel,
  onError,
  className = ''
}: UpscaleProgressProps) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>('pending')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [resultImages, setResultImages] = useState<string[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    let timeInterval: NodeJS.Timeout
    let cancelled = false

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/upscale/status/${jobId}`)
        const data = await response.json()

        if (cancelled) return

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao verificar status')
        }

        setStatus(data.status)
        setProgress(data.progress || 0)
        setEstimatedTime(data.estimatedTime || 0)

        if (data.status === 'succeeded') {
          setResultImages(data.resultImages || [])
          if (data.resultImages && data.resultImages.length > 0) {
            onComplete({
              resultImages: data.resultImages,
              downloadUrl: data.downloadUrl || data.resultImages[0]
            })
          }
          if (interval) clearInterval(interval)
          if (timeInterval) clearInterval(timeInterval)
        } else if (data.status === 'failed') {
          setError(data.error || 'Upscale falhou')
          onError?.(data.error || 'Upscale falhou')
          if (interval) clearInterval(interval)
          if (timeInterval) clearInterval(timeInterval)
        }
      } catch (err) {
        if (cancelled) return
        
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        setStatus('failed')
        onError?.(errorMessage)
        
        if (interval) clearInterval(interval)
        if (timeInterval) clearInterval(timeInterval)
      }
    }

    // Inicia verificação de status
    checkStatus()
    interval = setInterval(checkStatus, 3000) // Verifica a cada 3 segundos

    // Timer para tempo decorrido
    const startTime = Date.now()
    timeInterval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
      if (timeInterval) clearInterval(timeInterval)
    }
  }, [jobId, onComplete, onError])

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/upscale/status/${jobId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStatus('cancelled')
        onCancel?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Falha ao cancelar')
      }
    } catch (err) {
      setError('Erro ao cancelar upscale')
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${remainingSeconds}s`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-500" />
      default:
        return <ZoomIn className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Iniciando upscale...'
      case 'processing':
        return 'Processando imagem...'
      case 'completed':
        return 'Upscale concluído!'
      case 'failed':
        return 'Upscale falhou'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Status desconhecido'
    }
  }

  if (status === 'completed') return null // Componente pai deve mostrar resultado

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2">Upscale {scaleFactor}x</span>
        </CardTitle>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          
          {status === 'processing' && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview da imagem original */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso do upscale</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Informações de tempo */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tempo decorrido:</span>
            <span className="font-medium">{formatTime(elapsedTime)}</span>
          </div>
          {estimatedTime > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tempo estimado:</span>
              <span className="font-medium">{formatTime(estimatedTime)}</span>
            </div>
          )}
        </div>

        {/* Mensagem de status detalhada */}
        {status === 'pending' && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⏳ Seu upscale está na fila de processamento. Isso pode levar alguns momentos...
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              🔄 Processando sua imagem com Clarity AI. Aumentando resolução para {scaleFactor}x...
            </p>
          </div>
        )}

        {status === 'failed' && error && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ {error}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Seus créditos foram estornados automaticamente.
            </p>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-800">
              🛑 Upscale cancelado. Seus créditos foram estornados.
            </p>
          </div>
        )}

        {/* Dicas durante processamento */}
        {(status === 'pending' || status === 'processing') && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              💡 <strong>Dica:</strong> Mantenha esta aba aberta para acompanhar o progresso. 
              O resultado aparecerá automaticamente quando pronto.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}