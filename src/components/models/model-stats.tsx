'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Image, Zap, TrendingUp } from 'lucide-react'

interface ModelStatsProps {
  stats: {
    totalGenerations: number
    averageProcessingTime: number
    totalCreditsUsed: number
    successRate: number
    popularPrompts: Array<{
      prompt: string
      count: number
    }>
  }
}

export function ModelStats({ stats }: ModelStatsProps) {
  const formatTime = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
    return `${(milliseconds / 60000).toFixed(1)}min`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalGenerations}</div>
          <p className="text-xs text-muted-foreground">
            Images created with this model
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(stats.averageProcessingTime)}
          </div>
          <p className="text-xs text-muted-foreground">
            Average generation time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCreditsUsed}</div>
          <p className="text-xs text-muted-foreground">
            Total credits consumed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Successful generations
          </p>
        </CardContent>
      </Card>

      {/* Popular Prompts */}
      {stats.popularPrompts.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Most Used Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.popularPrompts.slice(0, 5).map((prompt, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1 mr-4">
                    {prompt.prompt}
                  </span>
                  <Badge variant="secondary">
                    {prompt.count} uses
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}