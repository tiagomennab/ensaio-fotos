'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  X
} from 'lucide-react'
import { GalleryGrid } from './gallery-grid'
import { GalleryList } from './gallery-list'
import { GalleryStats } from './gallery-stats'
import { FilterPanel } from './filter-panel'
import { ImageModal } from './image-modal'

interface GalleryInterfaceProps {
  generations: any[]
  pagination: {
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
  filters: {
    model?: string
    search?: string
    sort: string
    view: string
    page: number
  }
}

export function GalleryInterface({ 
  generations, 
  pagination, 
  models, 
  stats, 
  filters 
}: GalleryInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'model', label: 'By Model' },
    { value: 'prompt', label: 'By Prompt' }
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
    
    router.push(`/gallery?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', searchQuery || null)
  }

  const clearFilters = () => {
    router.push('/gallery')
    setSearchQuery('')
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'download':
        // Implement bulk download
        console.log('Bulk download:', selectedImages)
        break
      case 'favorite':
        // Implement bulk favorite
        console.log('Bulk favorite:', selectedImages)
        break
      case 'delete':
        // Implement bulk delete
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

  const hasActiveFilters = filters.model || filters.search

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <GalleryStats stats={stats} />

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by prompt, model name..."
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

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>

            {/* View Toggle */}
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

            {/* Sort */}
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {filters.model && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Model: {models.find(m => m.id === filters.model)?.name}
                  <button onClick={() => updateFilter('model', null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <button onClick={() => updateFilter('search', null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
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
                  {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedImages([])
                    setBulkSelectMode(false)
                  }}
                >
                  Cancel Selection
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('download')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('favorite')}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Favorite
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Content */}
      {generations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No Results Found' : 'No Photos Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms'
                : 'Start generating AI photos to build your gallery'
              }
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearFilters}>Clear Filters</Button>
            ) : (
              <Button asChild>
                <a href="/generate">Generate Your First Photo</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Toggle Bulk Select */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {generations.length} of {pagination.total} generations
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkSelectMode(!bulkSelectMode)}
            >
              {bulkSelectMode ? 'Exit' : 'Select'} Multiple
            </Button>
          </div>

          {/* Gallery Grid or List */}
          {filters.view === 'grid' ? (
            <GalleryGrid
              generations={generations}
              bulkSelectMode={bulkSelectMode}
              selectedImages={selectedImages}
              onImageSelect={toggleImageSelection}
              onImageClick={setSelectedImage}
            />
          ) : (
            <GalleryList
              generations={generations}
              bulkSelectMode={bulkSelectMode}
              selectedImages={selectedImages}
              onImageSelect={toggleImageSelection}
              onImageClick={setSelectedImage}
            />
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => updateFilter('page', (pagination.page - 1).toString())}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1
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
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => updateFilter('page', (pagination.page + 1).toString())}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          generations={generations}
        />
      )}
    </div>
  )
}