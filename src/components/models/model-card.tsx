'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Play, 
  Eye, 
  Trash2, 
  Download, 
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Users,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { AIModel } from '@/types'
import { formatDate } from '@/lib/utils'

interface ModelCardProps {
  model: any // Using any for now since we have the Prisma model
  showProgress?: boolean
  showError?: boolean
}

export function ModelCard({ model, showProgress, showError }: ModelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getStatusIcon = () => {
    switch (model.status) {
      case 'READY':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'TRAINING':
      case 'PROCESSING':
      case 'UPLOADING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (model.status) {
      case 'READY':
        return 'Pronto'
      case 'TRAINING':
        return 'Treinando'
      case 'PROCESSING':
        return 'Processando'
      case 'UPLOADING':
        return 'Carregando'
      case 'ERROR':
        return 'Erro'
      default:
        return model.status
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

  const getClassIcon = () => {
    const iconClass = "w-8 h-8 text-gray-600"
    
    switch (model.class) {
      case 'MAN':
      case 'MULHER':
        return <User className={iconClass} />
      case 'BOY':
      case 'GIRL':
        return <Users className={iconClass} />
      default:
        return <User className={iconClass} />
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/models/${model.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Falha ao excluir modelo')
      }
    } catch (error) {
      alert('Erro ao excluir modelo')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSyncStatus = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch(`/api/models/${model.id}/sync-status`, {
        method: 'POST',
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        alert(`Falha ao sincronizar status: ${result.error || result.message}`)
      }
    } catch (error) {
      alert('Erro ao sincronizar status do modelo')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with model info */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              {getClassIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight">{model.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {model.class === 'WOMAN' ? 'mulher' : model.class === 'MAN' ? 'homem' : model.class.toLowerCase().replace('_', ' ')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Criado em {formatDate(model.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Actions dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                <div className="py-1">
                  <Link
                    href={`/models/${model.id}`}
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Link>
                  
                  {model.status === 'READY' && (
                    <Link
                      href={`/generate?model=${model.id}`}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Gerar Fotos
                    </Link>
                  )}
                  
                  {model.status === 'TRAINING' && (
                    <button
                      onClick={handleSyncStatus}
                      disabled={isSyncing}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 w-full text-left"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar Status'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge variant="secondary" className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          
          {model.qualityScore && (
            <div className="text-sm text-gray-600">
              Qualidade: {Math.round(model.qualityScore * 100)}%
            </div>
          )}
        </div>

        {/* Progress bar for training models */}
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso do Treinamento</span>
              <span>{model.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${model.progress}%` }}
              />
            </div>
            {model.estimatedTime && (
              <p className="text-xs text-gray-500 mt-1">
                ~{model.estimatedTime} minutos restantes
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {showError && model.errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{model.errorMessage}</p>
          </div>
        )}

        {/* Model stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total de Fotos</p>
            <p className="font-semibold">{model.totalPhotos}</p>
          </div>
          <div>
            <p className="text-gray-600">Gerações</p>
            <p className="font-semibold">{model.generations?.length || 0}</p>
          </div>
        </div>

        {/* Sample images preview */}
        {model.sampleImages && model.sampleImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Exemplos de Resultados</p>
            <div className="grid grid-cols-3 gap-2">
              {model.sampleImages.slice(0, 3).map((image: string, index: number) => (
                <div key={`${model.id}-sample-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Sample ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2 mt-4">
          {model.status === 'READY' && (
            <Button size="sm" asChild className="flex-1">
              <Link href={`/generate?model=${model.id}`}>
                <Play className="w-4 h-4 mr-1" />
                Gerar
              </Link>
            </Button>
          )}
          
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/models/${model.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              Detalhes
            </Link>
          </Button>
        </div>
      </CardContent>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </Card>
  )
}