'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Share2,
  Copy,
  Check,
  Clock,
  Calendar,
  Film,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react'

interface VideoGeneration {
  id: string
  sourceImageUrl: string
  sourceGenerationId: string | null
  prompt: string
  negativePrompt: string | null
  duration: number
  aspectRatio: string
  quality: 'standard' | 'pro'
  template: string | null
  status: 'STARTING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  videoUrl: string | null
  thumbnailUrl: string | null
  creditsUsed: number
  progress: number
  errorMessage: string | null
  processingTime: number | null
  fileSize: number | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  startedAt: string | null
  sourceGeneration?: {
    id: string
    prompt: string
    imageUrls: any[]
  } | null
}

interface VideoModalProps {
  video: VideoGeneration
  onClose: () => void
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const updateTime = () => setCurrentTime(videoElement.currentTime)
    const updateDuration = () => setDuration(videoElement.duration)

    videoElement.addEventListener('timeupdate', updateTime)
    videoElement.addEventListener('loadedmetadata', updateDuration)
    videoElement.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime)
      videoElement.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const togglePlay = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isPlaying) {
      videoElement.pause()
    } else {
      videoElement.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    videoElement.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (!isFullscreen) {
      videoElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current
    if (!videoElement || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    videoElement.currentTime = newTime
    setCurrentTime(newTime)
  }

  const copyVideoUrl = async () => {
    if (video.videoUrl) {
      try {
        await navigator.clipboard.writeText(video.videoUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'STARTING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluído'
      case 'PROCESSING':
        return 'Processando'
      case 'STARTING':
        return 'Iniciando'
      case 'FAILED':
        return 'Falhou'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Film className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Vídeo Gerado</h2>
            <Badge className={getStatusColor(video.status)}>
              {getStatusText(video.status)}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {video.status === 'COMPLETED' && video.videoUrl ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  poster={video.thumbnailUrl || video.sourceImageUrl}
                  className="w-full aspect-video object-contain"
                  onClick={togglePlay}
                />

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer mb-3"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>

                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : video.status === 'PROCESSING' ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <div className="text-center space-y-2">
                  <p className="text-gray-900 font-medium">Processando vídeo...</p>
                  <p className="text-gray-600 text-sm">Progresso: {video.progress}%</p>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : video.status === 'FAILED' ? (
              <div className="aspect-video bg-red-50 rounded-lg flex flex-col items-center justify-center space-y-4">
                <X className="w-12 h-12 text-red-600" />
                <div className="text-center space-y-2">
                  <p className="text-red-900 font-medium">Falha no processamento</p>
                  {video.errorMessage && (
                    <p className="text-red-700 text-sm max-w-md">{video.errorMessage}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <img
                  src={video.sourceImageUrl}
                  alt="Source"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            )}

            {/* Source Image */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagem de Origem
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {video.sourceImageUrl ? (
                  <img
                    src={video.sourceImageUrl}
                    alt="Imagem original usada para gerar o vídeo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = document.createElement('div')
                      fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200 text-gray-500'
                      fallback.innerHTML = '<span class="text-sm">Imagem não disponível</span>'
                      target.parentNode?.appendChild(fallback)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm">Vídeo gerado apenas com texto</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-col space-y-2">
              {video.videoUrl && video.status === 'COMPLETED' && (
                <>
                  <Button asChild className="w-full">
                    <a href={video.videoUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Vídeo
                    </a>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={copyVideoUrl}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        URL Copiada!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar URL
                      </>
                    )}
                  </Button>
                </>
              )}

              {video.sourceGeneration && (
                <Button variant="outline" asChild className="w-full">
                  <a href={`/gallery?generation=${video.sourceGeneration.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Foto Original
                  </a>
                </Button>
              )}
            </div>

            {/* Video Details */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Detalhes do Vídeo</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-medium">{video.duration}s</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proporção:</span>
                    <span className="font-medium">{video.aspectRatio}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qualidade:</span>
                    <span className="font-medium">
                      {video.quality === 'pro' ? '1080p (Pro)' : '720p (Padrão)'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Créditos:</span>
                    <span className="font-medium">{video.creditsUsed}</span>
                  </div>

                  {video.fileSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tamanho:</span>
                      <span className="font-medium">{formatFileSize(video.fileSize)}</span>
                    </div>
                  )}

                  {video.processingTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo de processamento:</span>
                      <span className="font-medium">{Math.round(video.processingTime / 1000)}s</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prompt */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Prompt</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {video.prompt}
                </p>
                
                {video.negativePrompt && (
                  <>
                    <h4 className="font-medium text-gray-900 text-sm">Prompt Negativo</h4>
                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-md">
                      {video.negativePrompt}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Cronologia</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="mr-2">Criado:</span>
                    <span className="font-medium">
                      {new Date(video.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  {video.startedAt && (
                    <div className="flex items-center text-gray-600">
                      <Play className="w-4 h-4 mr-2" />
                      <span className="mr-2">Iniciado:</span>
                      <span className="font-medium">
                        {new Date(video.startedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  
                  {video.completedAt && (
                    <div className="flex items-center text-gray-600">
                      <Check className="w-4 h-4 mr-2" />
                      <span className="mr-2">Concluído:</span>
                      <span className="font-medium">
                        {new Date(video.completedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}