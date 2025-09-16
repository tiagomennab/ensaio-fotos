'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortDesc, 
  Download, 
  Heart,
  Share2,
  Trash2,
  Image,
  Calendar,
  Eye,
  ChevronDown,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Film
} from 'lucide-react'
import { GalleryGrid } from './gallery-grid'
import { GalleryList } from './gallery-list'
import { GalleryStats } from './gallery-stats'
import { FilterPanel } from './filter-panel'
import { ImageModal } from './image-modal'
import { UpscaleModal } from '@/components/upscale/upscale-modal'
import { UpscaleProgress } from '@/components/upscale/upscale-progress'
import { UpscalePreview } from '@/components/upscale/upscale-preview'
import { VideoGallery } from './video-gallery'

interface AutoSyncGalleryInterfaceProps {
  initialGenerations: any[]
  initialVideos?: any[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  videoPagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  models: any[]
  stats: {
    totalGenerations: number
    completedGenerations: number
    totalImages: number
    favoriteImages: number
    collections: number
  }
  videoStats?: {
    totalVideos: number
    completedVideos: number
    processingVideos: number
    failedVideos: number
    totalCreditsUsed: number
  }
  filters: {
    model?: string
    search?: string
    sort: string
    view: string
    page: number
    tab?: string
  }
}

export function AutoSyncGalleryInterface({ 
  initialGenerations, 
  initialVideos = [],
  pagination, 
  videoPagination,
  models, 
  stats: initialStats, 
  videoStats,
  filters 
}: AutoSyncGalleryInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // State para dados da galeria
  const [generations, setGenerations] = useState(initialGenerations)
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [videos, setVideos] = useState(initialVideos)
  const [stats, setStats] = useState(initialStats)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [pendingUpdates, setPendingUpdates] = useState(0)

  // State para contadores globais de cada tab (independente da tab ativa)
  const [globalCounts, setGlobalCounts] = useState({
    totalGenerations: initialStats.totalGenerations,
    totalEdited: 0,
    totalVideos: videoStats?.totalVideos || 0
  })
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados originais da interface
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'generated' | 'edited' | 'videos'>(
    (filters.tab as any) || 'generated'
  )
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Upscale states
  const [upscaleModal, setUpscaleModal] = useState({
    isOpen: false,
    imageUrl: '',
    generation: null
  })
  const [activeUpscale, setActiveUpscale] = useState<{
    jobId: string
    originalImage: string
    scaleFactor: number
  } | null>(null)
  const [upscaleResult, setUpscaleResult] = useState<{
    originalImage: string
    upscaledImage: string
    scaleFactor: number
  } | null>(null)

  // Função para recarregar dados da galeria
  const refreshGalleryData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true)
    }

    try {
      // Carregar dados da tab ativa e contadores globais em paralelo para máxima performance
      const params = new URLSearchParams(searchParams.toString())
      const [response, statsResponse] = await Promise.all([
        fetch(`/api/gallery/data?${params.toString()}`),
        fetch('/api/gallery/stats')
      ])

      if (response.ok) {
        const data = await response.json()

        // Update current tab data
        setGenerations(data.generations || [])
        setEditHistory(data.editHistory || [])
        setVideos(data.videos || [])
        setStats(data.stats)
        setLastUpdate(new Date())

        // Update global counters for all tabs using optimized endpoint
        try {
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            if (statsData.success) {
              setGlobalCounts({
                totalGenerations: statsData.stats.totalGenerations || 0,
                totalEdited: statsData.stats.totalEdited || 0,
                totalVideos: statsData.stats.totalVideos || 0
              })

              console.log(`🔄 Gallery refreshed [${activeTab}]: Global counts updated - Generated: ${statsData.stats.totalGenerations}, Edited: ${statsData.stats.totalEdited}, Videos: ${statsData.stats.totalVideos}`)
            } else {
              console.warn('Failed to fetch gallery stats:', statsData.error)
            }
          } else {
            console.warn('Stats API request failed:', statsResponse.statusText)
          }
        } catch (countError) {
          console.warn('Failed to update global counts:', countError)
        }

        // Log current tab data
        console.log(`📊 Current tab [${activeTab}] data loaded: ${data.generations?.length || 0} generations, ${data.videos?.length || 0} videos, ${data.editHistory?.length || 0} edited`)
        
        // Verificar se há gerações presas em PROCESSING há mais de 10 minutos
        const stuckGenerations = (data.generations || []).filter((gen: any) => {
          if (gen.status !== 'PROCESSING') return false
          const minutesAgo = Math.round((new Date().getTime() - new Date(gen.createdAt).getTime()) / (1000 * 60))
          return minutesAgo > 10
        })
        
        if (stuckGenerations.length > 0) {
          console.log(`⚠️ Found ${stuckGenerations.length} stuck generation(s), attempting to fix...`)
          
          // Tentar corrigir cada geração presa
          for (const gen of stuckGenerations) {
            try {
              const checkResponse = await fetch(`/api/generations/${gen.id}/check-status`, {
                method: 'POST'
              })
              
              if (checkResponse.ok) {
                const result = await checkResponse.json()
                if (result.action === 'timeout') {
                  console.log(`✅ Fixed stuck generation: ${gen.id}`)
                }
              }
            } catch (error) {
              console.error(`❌ Failed to fix generation ${gen.id}:`, error)
            }
          }
          
          // Refresh novamente após correções
          setTimeout(() => refreshGalleryData(false), 2000)
        }
      } else {
        console.error('❌ Failed to fetch gallery data:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to refresh gallery data:', error)
    } finally {
      if (showLoading) {
        setIsRefreshing(false)
      }
    }
  }, [searchParams])

  // Handler para atualizações em tempo real
  const handleGenerationStatusChange = useCallback((
    generationId: string, 
    status: string, 
    data: any
  ) => {
    console.log(`🔄 Real-time update: Generation ${generationId} -> ${status}`, data)
    
    setGenerations(prev => {
      const updated = prev.map(gen => {
        if (gen.id === generationId) {
          return {
            ...gen,
            status: status === 'succeeded' ? 'COMPLETED' : 
                   status === 'failed' ? 'FAILED' :
                   status === 'canceled' ? 'CANCELLED' : gen.status,
            imageUrls: data.imageUrls || gen.imageUrls,
            thumbnailUrls: data.thumbnailUrls || gen.thumbnailUrls,
            errorMessage: data.errorMessage || gen.errorMessage,
            processingTime: data.processingTime || gen.processingTime,
            completedAt: status === 'succeeded' ? new Date().toISOString() : gen.completedAt
          }
        }
        return gen
      })
      
      // Se a geração foi atualizada, incrementa contador de updates
      if (updated.some(gen => gen.id === generationId)) {
        setPendingUpdates(prev => prev + 1)
        
        // Reset contador após 3 segundos
        setTimeout(() => {
          setPendingUpdates(prev => Math.max(0, prev - 1))
        }, 3000)
      }
      
      return updated
    })

    // Atualizar estatísticas se necessário
    if (status === 'succeeded') {
      setStats(prev => ({
        ...prev,
        completedGenerations: prev.completedGenerations + 1,
        totalImages: prev.totalImages + (data.imageUrls?.length || 1)
      }))
    }
    
    setLastUpdate(new Date())
  }, [])

  // Handler para atualizações de upscale via WebSocket
  const handleUpscaleUpdate = useCallback((generationId: string, status: string, data: any) => {
    if (data.isUpscale && activeUpscale?.jobId) {
      if (status === 'succeeded' && data.imageUrls?.length > 0) {
        handleUpscaleComplete({
          resultImages: data.imageUrls,
          downloadUrl: data.imageUrls[0]
        })
      } else if (status === 'failed') {
        handleUpscaleError(data.errorMessage || 'Upscale failed')
      }
    }
    
    // Também atualizar a galeria se for um upscale que virou uma nova geração
    handleGenerationStatusChange(generationId, status, data)
  }, [activeUpscale, handleGenerationStatusChange])

  // Set mounted flag on client-side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setLastUpdate(new Date())
  }, [])

  // Configurar WebSocket para atualizações em tempo real
  const { isConnected, connectionError } = useRealtimeUpdates({
    onGenerationStatusChange: handleUpscaleUpdate, // Usa o handler que suporta upscale
    onConnect: () => {
      console.log('✅ Gallery WebSocket connected - isConnected should be true')
    },
    onDisconnect: () => {
      console.log('🔌 Gallery WebSocket disconnected - isConnected should be false')
    },
    onError: (error) => {
      console.error('❌ Gallery WebSocket error:', error)
    }
  })

  // Debug connection state in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Gallery connection state:', { isConnected, connectionError })
    }
  }, [isConnected, connectionError])

  // Fallback polling mechanism when WebSocket connection fails
  useEffect(() => {
    if (!isConnected || connectionError) {
      console.log('🔄 WebSocket not connected, falling back to polling mode')
      // Use different polling intervals based on active tab
      const getPollingInterval = () => {
        if (activeTab === 'edited' || activeTab === 'videos') {
          return 10000 // Poll every 10 seconds for edited/videos
        }
        return 15000 // Poll every 15 seconds for generated images
      }

      const pollInterval = setInterval(() => {
        console.log(`🔄 Polling for gallery updates [${activeTab}] (fallback mode)`)
        refreshGalleryData()
      }, getPollingInterval())
      
      return () => clearInterval(pollInterval)
    }
  }, [isConnected, connectionError, refreshGalleryData, activeTab])

  // Force refresh when activeTab changes to get latest data for that tab
  useEffect(() => {
    console.log(`🔄 Tab switched to [${activeTab}], refreshing data...`)
    refreshGalleryData(false)
  }, [activeTab, refreshGalleryData])

  const sortOptions = [
    { value: 'newest', label: 'Mais Recentes' },
    { value: 'oldest', label: 'Mais Antigas' },
    { value: 'model', label: 'Por Modelo' },
    { value: 'prompt', label: 'Por Prompt' }
  ]

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filtering
    if (key !== 'page') {
      params.set('page', '1')
    }
    
    // Preserve tab when updating filters
    if (key !== 'tab' && activeTab !== 'generated') {
      params.set('tab', activeTab)
    }
    
    router.push(`/gallery?${params.toString()}`)
  }

  const switchTab = (tab: 'generated' | 'edited' | 'videos') => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (tab === 'generated') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    
    // Reset page when switching tabs
    params.set('page', '1')
    
    router.push(`/gallery?${params.toString()}`)
    setActiveTab(tab)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', searchQuery || null)
  }

  const clearFilters = () => {
    router.push('/gallery')
    setSearchQuery('')
    setStatusFilter('all')
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'download':
        console.log('Bulk download:', selectedImages)
        break
      case 'favorite':
        console.log('Bulk favorite:', selectedImages)
        break
      case 'delete':
        console.log('Bulk delete:', selectedImages)
        break
    }
    
    setSelectedImages([])
    setBulkSelectMode(false)
  }

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    )
  }

  // Upscale functions (mantidas iguais)
  const handleOpenUpscale = async (imageUrl: string, generation?: any) => {
    const isReplicateUrl = imageUrl.includes('replicate.delivery') || imageUrl.includes('pbxt.replicate.delivery')
    
    if (isReplicateUrl && generation) {
      const shouldRecover = confirm(
        'Esta imagem usa uma URL temporária que pode ter expirado. Deseja tentar recuperar a imagem permanentemente antes do upscale?'
      )
      
      if (shouldRecover) {
        try {
          const response = await fetch('/api/images/recover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ generationId: generation.id })
          })
          
          const result = await response.json()
          
          if (result.success && result.recovered) {
            alert(`Imagem recuperada com sucesso! Agora você pode fazer o upscale.`)
            const newImageUrl = result.imageUrls[0]
            setUpscaleModal({
              isOpen: true,
              imageUrl: newImageUrl,
              generation
            })
            refreshGalleryData() // Refresh automático
            return
          } else if (response.status === 410) {
            alert('As imagens expiraram e não podem mais ser recuperadas. Gere novas imagens.')
            return
          } else {
            alert(`Falha na recuperação: ${result.error}. Você pode tentar novamente ou gerar novas imagens.`)
            return
          }
        } catch (error) {
          console.error('Recovery error:', error)
          alert('Erro ao tentar recuperar a imagem. Tente novamente ou gere novas imagens.')
          return
        }
      } else {
        alert('Upscale cancelado. Para fazer upscale, é necessário ter URLs permanentes.')
        return
      }
    }
    
    // No need to check image availability with fetch/HEAD since:
    // 1. If image is displayed in gallery, it's accessible
    // 2. CORS restrictions can block HEAD requests while allowing img tags
    // 3. The upscale API will validate the URL anyway
    setUpscaleModal({
      isOpen: true,
      imageUrl,
      generation
    })
  }

  const handleCloseUpscale = () => {
    setUpscaleModal({
      isOpen: false,
      imageUrl: '',
      generation: null
    })
  }

  const handleStartUpscale = async (options: any) => {
    try {
      const requestBody = {
        imageUrl: upscaleModal.imageUrl,
        options: options
      }
      
      const response = await fetch('/api/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar upscale')
      }

      setActiveUpscale({
        jobId: data.jobIds?.[0] || data.jobId,
        originalImage: upscaleModal.imageUrl,
        scaleFactor: options.scale_factor || 2
      })

      setUpscaleModal({
        isOpen: false,
        imageUrl: '',
        generation: null
      })

    } catch (error) {
      console.error('Error starting upscale:', error)
      alert('Erro ao iniciar upscale: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    }
  }

  const handleUpscaleComplete = (result: { resultImages: string[]; downloadUrl: string }) => {
    if (activeUpscale && result.resultImages?.length > 0) {
      setUpscaleResult({
        originalImage: activeUpscale.originalImage,
        upscaledImage: result.resultImages[0],
        scaleFactor: activeUpscale.scaleFactor
      })
    }
    setActiveUpscale(null)
    
    // Refresh automático da galeria para mostrar novo upscale
    setTimeout(() => refreshGalleryData(), 1000)
  }

  const handleUpscaleCancel = () => {
    setActiveUpscale(null)
  }

  const handleUpscaleError = (error: string) => {
    alert('Erro no upscale: ' + error)
    setActiveUpscale(null)
  }

  const handleResetUpscale = () => {
    setUpscaleResult(null)
  }

  // Filter generations based on active tab and status
  const filteredGenerations = (() => {
    let tabData = []

    if (activeTab === 'videos') {
      tabData = videos
    } else {
      // For both 'generated' and 'edited' tabs, use generations (API handles the transformation)
      tabData = generations
    }

    // Apply status filter if not on videos tab
    if (activeTab !== 'videos' && statusFilter !== 'all') {
      return tabData.filter(item => item.status === statusFilter)
    }

    return tabData
  })()
  
  const hasActiveFilters = filters.model || filters.search || statusFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Manual refresh button always visible for better UX */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {(!isConnected || connectionError) ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">Verificando atualizações...</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Atualizações automáticas ativas</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshGalleryData(true)}
            className="h-8 px-3"
            title="Atualizar galeria manualmente"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Processing Status Alert */}
      {generations.some(g => g.status === 'PROCESSING') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Gerações em Processamento
              </h3>
              <p className="text-sm text-blue-700">
                {generations.filter(g => g.status === 'PROCESSING').length} imagem(ns) sendo processada(s). 
                As imagens aparecerão aqui quando ficarem prontas.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline" 
              onClick={() => refreshGalleryData(true)}
              disabled={isRefreshing}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <GalleryStats stats={stats} />

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => switchTab('generated')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'generated'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🎨 Fotos Geradas ({globalCounts.totalGenerations})
          </button>
          <button
            onClick={() => switchTab('edited')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'edited'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ✨ Fotos Editadas ({globalCounts.totalEdited})
          </button>
          <button
            onClick={() => switchTab('videos')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'videos'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Film className="w-4 h-4 inline mr-2" />
            Vídeos ({globalCounts.totalVideos})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por prompt, nome do modelo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      updateFilter('search', null)
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Ativo
                </Badge>
              )}
            </Button>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todas ({generations.length})</option>
                <option value="COMPLETED">Completas ({generations.filter(g => g.status === 'COMPLETED').length})</option>
                <option value="PROCESSING">Processando ({generations.filter(g => g.status === 'PROCESSING').length})</option>
                <option value="FAILED">Falharam ({generations.filter(g => g.status === 'FAILED').length})</option>
              </select>
            </div>

            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={filters.view === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('view', 'grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={filters.view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('view', 'list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              
              {filters.model && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Modelo: {models.find(m => m.id === filters.model)?.name}
                  <button onClick={() => updateFilter('model', null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: "{filters.search}"
                  <button onClick={() => updateFilter('search', null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar todos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          models={models}
          selectedModel={filters.model}
          onModelSelect={(modelId) => updateFilter('model', modelId)}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bulk Actions */}
      {bulkSelectMode && selectedImages.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900">
                  {selectedImages.length} imagem{selectedImages.length !== 1 ? 'ns' : ''} selecionada{selectedImages.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedImages([])
                    setBulkSelectMode(false)
                  }}
                >
                  Cancelar Seleção
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('download')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Baixar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('favorite')}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Favoritar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Content */}
      {activeTab === 'videos' ? (
        <VideoGallery
          videos={videos}
          stats={videoStats || {
            totalVideos: 0,
            completedVideos: 0,
            processingVideos: 0,
            failedVideos: 0,
            totalCreditsUsed: 0
          }}
          pagination={videoPagination || pagination}
          filters={{
            status: filters.search ? undefined : undefined,
            quality: undefined,
            search: filters.search,
            sort: filters.sort
          }}
        />
      ) : (
        <>
          {filteredGenerations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? 'Nenhum Resultado Encontrado' : 'Nenhuma Foto Ainda'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? 'Tente ajustar seus filtros ou termos de busca'
                    : 'Comece gerando fotos com IA para construir sua galeria'
                  }
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters}>Limpar Filtros</Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button asChild>
                      <a href="/generate">Gere Sua Primeira Foto</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/editor">✨ Editar com IA</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredGenerations.length} de {filteredGenerations.length} {activeTab === 'generated' ? 'fotos geradas' : 'fotos editadas'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkSelectMode(!bulkSelectMode)}
                >
                  {bulkSelectMode ? 'Sair' : 'Selecionar'} Múltiplas
                </Button>
              </div>

              {filteredGenerations.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activeTab === 'generated' ? 'Nenhuma Foto Gerada' : 'Nenhuma Foto Editada'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === 'generated' 
                        ? 'Comece gerando fotos com IA para construir sua galeria'
                        : 'Edite suas fotos existentes com nosso Editor IA'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {activeTab === 'generated' ? (
                        <>
                          <Button asChild>
                            <a href="/generate">Gere Sua Primeira Foto</a>
                          </Button>
                          <Button variant="outline" onClick={() => switchTab('edited')}>
                            Ver Fotos Editadas
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild>
                            <a href="/editor">✨ Editar com IA</a>
                          </Button>
                          <Button variant="outline" onClick={() => switchTab('generated')}>
                            Ver Fotos Geradas
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filters.view === 'grid' ? (
                    <GalleryGrid
                      generations={filteredGenerations}
                      bulkSelectMode={bulkSelectMode}
                      selectedImages={selectedImages}
                      onImageSelect={toggleImageSelection}
                      onImageClick={setSelectedImage}
                      onUpscale={handleOpenUpscale}
                      userPlan={(session?.user as any)?.plan || 'STARTER'}
                    />
                  ) : (
                    <GalleryList
                      generations={filteredGenerations}
                      bulkSelectMode={bulkSelectMode}
                      selectedImages={selectedImages}
                      onImageSelect={toggleImageSelection}
                      onImageClick={setSelectedImage}
                      onUpscale={handleOpenUpscale}
                    />
                  )}
                </>
              )}

              {/* Pagination */}
              <div className="flex flex-col items-center space-y-4">
                {/* Stats Info */}
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} fotos
                  {pagination.pages > 1 && (
                    <span className="ml-2">• Página {pagination.page} de {pagination.pages}</span>
                  )}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => updateFilter('page', '1')}
                    >
                      ≪ Primeira
                    </Button>
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => updateFilter('page', (pagination.page - 1).toString())}
                    >
                      ‹ Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const currentPage = pagination.page
                        const totalPages = pagination.pages
                        const showPages = []
                        
                        // Always show first page
                        if (totalPages > 0) showPages.push(1)
                        
                        // Show pages around current page
                        for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                          if (!showPages.includes(i)) showPages.push(i)
                        }
                        
                        // Always show last page (if different from first)
                        if (totalPages > 1 && !showPages.includes(totalPages)) {
                          showPages.push(totalPages)
                        }
                        
                        // Sort and fill gaps
                        showPages.sort((a, b) => a - b)
                        const finalPages = []
                        for (let i = 0; i < showPages.length; i++) {
                          if (i > 0 && showPages[i] - showPages[i-1] > 1) {
                            finalPages.push('...')
                          }
                          finalPages.push(showPages[i])
                        }
                        
                        return finalPages.map((pageItem, index) => {
                          if (pageItem === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                                ...
                              </span>
                            )
                          }
                          
                          const pageNum = pageItem as number
                          return (
                            <Button
                              key={pageNum}
                              variant={pagination.page === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateFilter('page', pageNum.toString())}
                            >
                              {pageNum}
                            </Button>
                          )
                        })
                      })()}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => updateFilter('page', (pagination.page + 1).toString())}
                    >
                      Próxima ›
                    </Button>
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => updateFilter('page', pagination.pages.toString())}
                    >
                      Última ≫
                    </Button>
                  </div>
                )}

                {/* Quick page size selector */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Itens por página:</span>
                  {[10, 20, 50].map(size => (
                    <Button
                      key={size}
                      variant={pagination.limit === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateFilter('limit', size.toString())
                        updateFilter('page', '1')
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (() => {
        // Find the generation that contains this image
        const generation = filteredGenerations.find(gen =>
          gen.imageUrls.includes(selectedImage)
        )

        if (!generation) return null

        // Create MediaItem for the selected image
        const mediaItem = {
          id: `${generation.id}-${selectedImage}`,
          url: selectedImage,
          thumbnailUrl: generation.thumbnailUrls?.[generation.imageUrls.indexOf(selectedImage)] || selectedImage,
          operationType: 'generated' as const,
          status: generation.status,
          generation,
          metadata: {
            width: generation.width,
            height: generation.height
          }
        }

        // Create MediaItem array for all images
        const allImages = filteredGenerations.flatMap(gen =>
          gen.imageUrls.map((url, index) => ({
            id: `${gen.id}-${url}`,
            url,
            thumbnailUrl: gen.thumbnailUrls?.[index] || url,
            operationType: 'generated' as const,
            status: gen.status,
            generation: gen,
            metadata: {
              width: gen.width,
              height: gen.height
            }
          }))
        )

        return (
          <ImageModal
            mediaItem={mediaItem}
            onClose={() => setSelectedImage(null)}
            allImages={allImages}
          />
        )
      })()}

      {/* Upscale Modal */}
      {upscaleModal.isOpen && (
        <UpscaleModal
          isOpen={upscaleModal.isOpen}
          imageUrl={upscaleModal.imageUrl}
          generation={upscaleModal.generation}
          onClose={handleCloseUpscale}
          onUpscale={handleStartUpscale}
          userPlan={session?.user?.plan || 'FREE'}
        />
      )}

      {/* Upscale Progress */}
      {activeUpscale && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <UpscaleProgress
            jobId={activeUpscale.jobId}
            originalImage={activeUpscale.originalImage}
            scaleFactor={activeUpscale.scaleFactor}
            onComplete={handleUpscaleComplete}
            onCancel={handleUpscaleCancel}
            onError={handleUpscaleError}
          />
        </div>
      )}

      {/* Upscale Result */}
      {upscaleResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <UpscalePreview
              originalImage={upscaleResult.originalImage}
              upscaledImage={upscaleResult.upscaledImage}
              scaleFactor={upscaleResult.scaleFactor}
              onReset={handleResetUpscale}
            />
          </div>
        </div>
      )}
    </div>
  )
}