'use client'

import { useState, useEffect } from 'react'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { ModelCard } from './model-card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface RealtimeModelListProps {
  initialModels: any[]
  userId: string
}

export function RealtimeModelList({ initialModels, userId }: RealtimeModelListProps) {
  const [models, setModels] = useState(initialModels)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const { isConnected, connectionError } = useRealtimeUpdates({
    onModelStatusChange: (modelId, status, data) => {
      console.log(`🤖 Real-time model update: ${modelId} -> ${status}`)
      
      setModels(prevModels => 
        prevModels.map(model => {
          if (model.id === modelId) {
            return {
              ...model,
              status,
              progress: data.progress ?? model.progress,
              qualityScore: data.qualityScore ?? model.qualityScore,
              errorMessage: data.errorMessage ?? model.errorMessage,
              modelUrl: data.modelUrl ?? model.modelUrl,
              trainedAt: status === 'READY' ? new Date() : model.trainedAt,
              updatedAt: new Date()
            }
          }
          return model
        })
      )
      
      setLastUpdated(new Date())
    },
    onTrainingProgress: (modelId, progress, message) => {
      console.log(`📈 Training progress: ${modelId} -> ${progress}%`)
      
      setModels(prevModels => 
        prevModels.map(model => {
          if (model.id === modelId) {
            return {
              ...model,
              progress,
              trainingMessage: message
            }
          }
          return model
        })
      )
      
      setLastUpdated(new Date())
    },
    onConnect: () => {
      console.log('🔗 Model list connected to real-time updates')
    },
    onDisconnect: () => {
      console.log('❌ Model list disconnected from real-time updates')
    }
  })

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to refresh models:', error)
    }
  }

  const modelsByStatus = {
    ready: models.filter(m => m.status === 'READY'),
    training: models.filter(m => ['TRAINING', 'PROCESSING', 'UPLOADING'].includes(m.status)),
    error: models.filter(m => m.status === 'ERROR'),
    draft: models.filter(m => m.status === 'DRAFT')
  }

  return (
    <div className="space-y-6">
      {/* Status discreto apenas se houver problemas */}
      {(!isConnected || connectionError) && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              Verificando atualizações dos modelos...
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-amber-100 text-amber-700 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar</span>
          </button>
        </div>
      )}

      {/* Models by Status */}
      {modelsByStatus.training.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
            Modelos em Treinamento ({modelsByStatus.training.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelsByStatus.training.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                showProgress={true}
              />
            ))}
          </div>
        </div>
      )}

      {modelsByStatus.ready.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Modelos Prontos ({modelsByStatus.ready.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelsByStatus.ready.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                showProgress={false}
              />
            ))}
          </div>
        </div>
      )}

      {modelsByStatus.error.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Modelos com Erro ({modelsByStatus.error.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelsByStatus.error.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                showProgress={false}
              />
            ))}
          </div>
        </div>
      )}

      {modelsByStatus.draft.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            Rascunhos ({modelsByStatus.draft.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelsByStatus.draft.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                showProgress={false}
              />
            ))}
          </div>
        </div>
      )}

      {models.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nenhum modelo encontrado</p>
          <p className="text-sm">Crie seu primeiro modelo para começar a gerar fotos</p>
        </div>
      )}
    </div>
  )
}