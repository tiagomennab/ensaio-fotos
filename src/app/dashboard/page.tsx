import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditsOverview } from '@/components/dashboard/credits-overview'
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard'
import { Navigation } from '@/components/layout/navigation'
import { 
  BarChart3, 
  Coins, 
  Image as ImageIcon, 
  Users, 
  TrendingUp,
  Plus,
  Zap,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = session.user.id

  if (!userId) {
    redirect('/auth/signin')
  }

  // Fetch user data and statistics
  const [user, models, recentGenerations, recentActivity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        creditsUsed: true,
        creditsLimit: true,
        createdAt: true
      }
    }),
    prisma.aIModel.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        qualityScore: true,
        createdAt: true,
        _count: {
          select: {
            generations: true
          }
        }
      }
    }),
    prisma.generation.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prompt: true,
        status: true,
        imageUrls: true,
        createdAt: true,
        model: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.usageLog.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        creditsUsed: true,
        details: true,
        createdAt: true
      }
    })
  ])

  // Get quick stats from user record (updated by cron job) and calculate completed generations
  // NOTE: After applying migration_fix_inconsistencies.sql, run: npx prisma generate
  const stats = {
    totalModels: (user as any)?.totalModels || 0,
    totalGenerations: (user as any)?.totalGenerations || 0,
    completedGenerations: await prisma.generation.count({ 
      where: { userId, status: 'COMPLETED' } 
    }),
    totalCreditsUsed: (user as any)?.totalCreditsUsed || 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'TRAINING':
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ERROR':
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const successRate = stats.totalGenerations > 0 
    ? Math.round((stats.completedGenerations / stats.totalGenerations) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userPlan={user?.plan} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your AI models and generations
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center">
                <Coins className="w-4 h-4 mr-1" />
                {(user?.creditsLimit || 0) - (user?.creditsUsed || 0)} credits
              </Badge>
              <Badge variant="outline">
                {user?.plan} Plan
              </Badge>
              <Button asChild>
                <Link href="/models/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Model
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalModels}</div>
              <p className="text-xs text-muted-foreground">
                AI models created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generations</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
              <p className="text-xs text-muted-foreground">
                Images generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Successful generations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCreditsUsed || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total credits spent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="credits">Credits & Usage</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Models */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Models
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/models">View All</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {models.length > 0 ? (
                    <div className="space-y-3">
                      {models.map((model) => (
                        <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{model.name}</div>
                            <div className="text-sm text-gray-500">
                              {model._count.generations} generations
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {model.qualityScore && (
                              <Badge variant="outline" className="text-xs">
                                {model.qualityScore}%
                              </Badge>
                            )}
                            <Badge variant="secondary" className={getStatusColor(model.status)}>
                              {model.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">No models yet</p>
                      <Button asChild size="sm">
                        <Link href="/models/create">Create Your First Model</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Generations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Generations
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/gallery">View All</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentGenerations.length > 0 ? (
                    <div className="space-y-3">
                      {recentGenerations.map((generation) => (
                        <div key={generation.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 line-clamp-2">
                              {generation.prompt}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {generation.model?.name} • {new Date(generation.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-3 flex items-center space-x-2">
                            {generation.imageUrls.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {generation.imageUrls.length} images
                              </Badge>
                            )}
                            <Badge variant="secondary" className={getStatusColor(generation.status)}>
                              {generation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">No generations yet</p>
                      <Button asChild size="sm">
                        <Link href="/generate">Generate Your First Image</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.creditsUsed < 0 ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {(activity.details as any)?.description || activity.action}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className={`font-medium ${
                          activity.creditsUsed < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.creditsUsed < 0 ? '+' : ''}{Math.abs(activity.creditsUsed)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <CreditsOverview userPlan={user?.plan || 'FREE'} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}