import { requireAuth } from '@/lib/auth'
import { getModelsByUserId, canUserCreateModel, getModelLimitsByPlan } from '@/lib/db/models'
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

  const modelLimits = getModelLimitsByPlan(session.user.plan)
  const activeModels = models.filter(m => m.status !== 'DELETED').length

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
              <h1 className="text-3xl font-bold text-gray-900">Meus Modelos de IA</h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus modelos personalizados de IA para geração de fotos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">
                  Plano {session.user.plan}
                </Badge>
                <p className="text-xs text-gray-500">
                  {activeModels}/{modelLimits.limit === 10 ? '∞' : modelLimits.limit} modelos
                </p>
              </div>
              {canCreate ? (
                <Button asChild>
                  <Link href="/models/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Modelo
                  </Link>
                </Button>
              ) : (
                <div className="text-right">
                  <Button disabled>
                    <Plus className="w-4 h-4 mr-2" />
                    Limite Atingido
                  </Button>
                  <p className="text-xs text-amber-600 mt-1">
                    Seu plano permite {modelLimits.label}
                  </p>
                </div>
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
              <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeModels}
                <span className="text-lg text-gray-500">
                  /{modelLimits.limit === 10 ? '∞' : modelLimits.limit}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {modelsByStatus.ready.length} prontos para uso
              </p>
              {!canCreate && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Limite do {session.user.plan} atingido
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {modelsByStatus.ready.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Disponíveis para geração
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treinando</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {modelsByStatus.training.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Em progresso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Erros</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {modelsByStatus.error.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Precisam de atenção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Limits Info */}
        {!canCreate && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Limite de Modelos: {activeModels}/{modelLimits.limit}
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    {(() => {
                      switch (session.user.plan) {
                        case 'STARTER':
                          return 'Upgrade para Premium (3 modelos/mês) ou Gold (10 modelos/mês)'
                        case 'PREMIUM':
                          return 'Upgrade para Gold para ter até 10 modelos por mês'
                        default:
                          return 'Entre em contato para planos customizados'
                      }
                    })()}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/billing">Upgrade do Plano</Link>
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
                Nenhum Modelo de IA Ainda
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Crie seu primeiro modelo de IA enviando fotos suas ou de outras pessoas. 
                O modelo irá aprender a gerar novas fotos em diferentes estilos e cenários.
              </p>
              {canCreate ? (
                <Button asChild size="lg">
                  <Link href="/models/create">
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Seu Primeiro Modelo
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled size="lg">
                    Limite de Modelos Atingido
                  </Button>
                  <p className="text-sm text-gray-500">
                    Upgrade seu plano para criar mais modelos
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
                  Modelos Prontos ({modelsByStatus.ready.length})
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
                  Modelos em Treinamento ({modelsByStatus.training.length})
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
                  Modelos com Erros ({modelsByStatus.error.length})
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
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Tarefas comuns para gerenciar seus modelos de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/generate">
                    <Play className="w-4 h-4 mr-2" />
                    Gerar Fotos
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/gallery">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Galeria
                  </Link>
                </Button>
                
                {canCreate && (
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/models/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Novo Modelo
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