'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Heart, FolderOpen, Sparkles, TrendingUp } from 'lucide-react'

interface GalleryStatsProps {
  stats: {
    totalGenerations: number
    completedGenerations: number
    totalImages: number
    favoriteImages: number
    collections: number
  }
}

export function GalleryStats({ stats }: GalleryStatsProps) {
  const successRate = stats.totalGenerations > 0 
    ? Math.round((stats.completedGenerations / stats.totalGenerations) * 100)
    : 0

  const avgImagesPerGeneration = stats.completedGenerations > 0
    ? Math.round(stats.totalImages / stats.completedGenerations * 10) / 10
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Imagens</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalImages}</div>
          <p className="text-xs text-muted-foreground">
            Fotos geradas por IA
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gerações</CardTitle>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedGenerations}</div>
          <p className="text-xs text-muted-foreground">
            de {stats.totalGenerations} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Gerações bem-sucedidas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Favoritas</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.favoriteImages}</div>
          <p className="text-xs text-muted-foreground">
            Imagens salvas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média por Ger</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgImagesPerGeneration}</div>
          <p className="text-xs text-muted-foreground">
            Imagens por geração
          </p>
        </CardContent>
      </Card>
    </div>
  )
}