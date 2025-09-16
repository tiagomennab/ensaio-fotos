'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  History, 
  TrendingDown, 
  TrendingUp, 
  RefreshCcw, 
  ShoppingCart,
  Sparkles,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { useState } from 'react'

interface CreditTransaction {
  id: string
  date: string
  type: 'usage' | 'purchase' | 'renewal' | 'bonus'
  amount: number
  balance: number
  description: string
  relatedAction?: string
}

// Mock data para demonstração
const mockTransactions: CreditTransaction[] = [
  {
    id: '1',
    date: '2025-01-03T14:30:00Z',
    type: 'usage',
    amount: -10,
    balance: 240,
    description: 'Geração de foto - Pacote Quiet Luxury',
    relatedAction: 'Foto profissional gerada'
  },
  {
    id: '2',
    date: '2025-01-03T10:15:00Z',
    type: 'usage',
    amount: -10,
    balance: 250,
    description: 'Geração de foto - Pacote Mirror Selfie',
    relatedAction: 'Selfie casual gerada'
  },
  {
    id: '3',
    date: '2025-01-02T16:45:00Z',
    type: 'purchase',
    amount: 100,
    balance: 260,
    description: 'Compra de Pacote Essencial',
    relatedAction: 'Pagamento via PIX'
  },
  {
    id: '4',
    date: '2025-01-01T00:00:00Z',
    type: 'renewal',
    amount: 200,
    balance: 160,
    description: 'Renovação mensal - Plano Premium',
    relatedAction: 'Assinatura renovada automaticamente'
  },
  {
    id: '5',
    date: '2024-12-31T18:20:00Z',
    type: 'usage',
    amount: -10,
    balance: 160,
    description: 'Geração de foto - Pacote Summer Vibes',
    relatedAction: 'Foto lifestyle gerada'
  },
  {
    id: '6',
    date: '2024-12-30T12:30:00Z',
    type: 'bonus',
    amount: 50,
    balance: 170,
    description: 'Bônus de primeira compra',
    relatedAction: 'Créditos extras concedidos'
  }
]

const getTransactionIcon = (type: CreditTransaction['type']) => {
  switch (type) {
    case 'usage':
      return <TrendingDown className="w-4 h-4 text-red-500" />
    case 'purchase':
      return <ShoppingCart className="w-4 h-4 text-green-500" />
    case 'renewal':
      return <RefreshCcw className="w-4 h-4 text-blue-500" />
    case 'bonus':
      return <Sparkles className="w-4 h-4 text-purple-500" />
    default:
      return <History className="w-4 h-4 text-gray-500" />
  }
}

const getTransactionBadge = (type: CreditTransaction['type']) => {
  switch (type) {
    case 'usage':
      return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Uso</Badge>
    case 'purchase':
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Compra</Badge>
    case 'renewal':
      return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Renovação</Badge>
    case 'bonus':
      return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Bônus</Badge>
    default:
      return <Badge variant="secondary">Outro</Badge>
  }
}

export default function CreditsHistoryPage() {
  const { data: session, status } = useSession()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Você precisa estar logado para ver seu histórico de créditos.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredTransactions = filterType 
    ? mockTransactions.filter(t => t.type === filterType)
    : mockTransactions

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const currentBalance = 240 // Mock current balance
  const totalUsed = mockTransactions
    .filter(t => t.type === 'usage')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalPurchased = mockTransactions
    .filter(t => t.type === 'purchase' || t.type === 'renewal' || t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Histórico de Créditos
                </h1>
              </div>
              <p className="text-gray-600">
                Acompanhe todas as suas transações e uso de créditos
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {currentBalance} créditos disponíveis
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{currentBalance}</div>
              <p className="text-xs text-gray-500 mt-1">Créditos disponíveis</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Usado</CardTitle>
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalUsed}</div>
              <p className="text-xs text-gray-500 mt-1">Créditos consumidos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Adquirido</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalPurchased}</div>
              <p className="text-xs text-gray-500 mt-1">Créditos obtidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(null)}
                  className={filterType === null ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  Todos
                </Button>
                <Button 
                  variant={filterType === 'usage' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('usage')}
                  className={filterType === 'usage' ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  Uso
                </Button>
                <Button 
                  variant={filterType === 'purchase' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('purchase')}
                  className={filterType === 'purchase' ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  Compras
                </Button>
                <Button 
                  variant={filterType === 'renewal' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('renewal')}
                  className={filterType === 'renewal' ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  Renovações
                </Button>
                <Button 
                  variant={filterType === 'bonus' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('bonus')}
                  className={filterType === 'bonus' ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  Bônus
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Transactions List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Transações
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1"
              >
                {sortOrder === 'desc' ? 'Mais recente' : 'Mais antigo'}
                <TrendingDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {sortedTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          {getTransactionBadge(transaction.type)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleString('pt-BR')}
                        </p>
                        {transaction.relatedAction && (
                          <p className="text-xs text-gray-400 mt-1">
                            {transaction.relatedAction}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Saldo: {transaction.balance}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {sortedTransactions.length === 0 && (
              <div className="p-12 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-gray-500">
                  {filterType ? `Não há transações do tipo "${filterType}"` : 'Seu histórico aparecerá aqui conforme você usar créditos'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}