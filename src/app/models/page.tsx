import { requireAuth } from '@/lib/auth'
import { getModelsByUserId, canUserCreateModel } from '@/lib/db/models'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Clock, CheckCircle, AlertCircle, XCircle, Trash2, Eye, Play, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { ModelCard } from '@/components/models/model-card'
import { ModelStats } from '@/components/models/model-stats'

export default async function ModelsPage() {
  const session = await requireAuth()
  const userId = session.user.id

  const [models, canCreate] = await Promise.all([
    getModelsByUserId(userId),
    canUserCreateModel(userId)
  ])

  const modelsByStatus = {
    ready: models.filter(m => m.status === 'READY'),
    training: models.filter(m => ['TRAINING', 'PROCESSING', 'UPLOADING'].includes(m.status)),
    error: models.filter(m => m.status === 'ERROR'),
    deleted: models.filter(m => m.status === 'DELETED')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My AI Models</h1>
              <p className="text-gray-600 mt-1">
                Manage your custom AI models for photo generation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {session.user.plan} Plan
              </Badge>
              {canCreate ? (
                <Button asChild>
                  <Link href="/models/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Model
                  </Link>
                </Button>
              ) : (
                <Button disabled>
                  <Plus className="w-4 h-4 mr-2" />
                  Limit Reached
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
              <p className="text-xs text-muted-foreground">
                {modelsByStatus.ready.length} ready to use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {modelsByStatus.ready.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for generation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {modelsByStatus.training.length}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {modelsByStatus.error.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Limits Info */}
        {session.user.plan !== 'GOLD' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Model Limit: {models.length}/{session.user.plan === 'FREE' ? '1' : '3'}
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    {session.user.plan === 'FREE' 
                      ? 'Upgrade to Premium for 3 models, or Gold for unlimited models'
                      : 'Upgrade to Gold for unlimited models'
                    }
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/billing">Upgrade Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {models.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No AI Models Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first AI model by uploading photos of yourself or others. 
                The model will learn to generate new photos in different styles and scenarios.
              </p>
              {canCreate ? (
                <Button asChild size="lg">
                  <Link href="/models/create">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Model
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled size="lg">
                    Model Limit Reached
                  </Button>
                  <p className="text-sm text-gray-500">
                    Upgrade your plan to create more models
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Ready Models */}
            {modelsByStatus.ready.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Ready Models ({modelsByStatus.ready.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modelsByStatus.ready.map((model) => (
                    <ModelCard key={model.id} model={model} />
                  ))}
                </div>
              </div>
            )}

            {/* Training Models */}
            {modelsByStatus.training.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                  Training Models ({modelsByStatus.training.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modelsByStatus.training.map((model) => (
                    <ModelCard key={model.id} model={model} showProgress />
                  ))}
                </div>
              </div>
            )}

            {/* Error Models */}
            {modelsByStatus.error.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  Models with Errors ({modelsByStatus.error.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modelsByStatus.error.map((model) => (
                    <ModelCard key={model.id} model={model} showError />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {models.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for managing your AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/generate">
                    <Play className="w-4 h-4 mr-2" />
                    Generate Photos
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/gallery">
                    <Eye className="w-4 h-4 mr-2" />
                    View Gallery
                  </Link>
                </Button>
                
                {canCreate && (
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/models/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Model
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}