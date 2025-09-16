'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Zap, 
  Gift, 
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Award
} from 'lucide-react'
import { CreditBalance } from './credit-balance'

interface CreditPackage {
  id: string
  name: string
  description?: string
  creditAmount: number
  bonusCredits: number
  price: number
  validityMonths: number
  isActive: boolean
  sortOrder: number
}

interface CreditPackagesInterfaceProps {
  user: {
    id: string
    plan: string
    creditsUsed: number
    creditsLimit: number
  }
}

export function CreditPackagesInterface({ user }: CreditPackagesInterfaceProps) {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    loadPackagesAndBalance()
  }, [])

  const loadPackagesAndBalance = async () => {
    try {
      const [packagesRes, balanceRes] = await Promise.all([
        fetch('/api/credit-packages'),
        fetch('/api/credits/balance')
      ])

      const packagesData = await packagesRes.json()
      const balanceData = await balanceRes.json()

      if (packagesData.success) {
        setPackages(packagesData.packages)
      }

      if (balanceData.success) {
        setBalance(balanceData.balance)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId)
    
    try {
      const response = await fetch('/api/credit-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      const data = await response.json()

      if (data.success) {
        // TODO: Redirecionar para página de pagamento
        alert('Redirecionando para pagamento...')
      } else {
        alert(data.error || 'Erro ao iniciar compra')
      }
    } catch (error) {
      alert('Erro ao processar compra')
    } finally {
      setPurchasing(null)
    }
  }

  const getPackageIcon = (packageId: string) => {
    const icons = {
      ESSENTIAL: Wallet,
      ADVANCED: Zap,
      PRO: Star,
      BUSINESS: TrendingUp,
      ENTERPRISE: Award
    }
    return icons[packageId as keyof typeof icons] || Wallet
  }

  const getPackageColor = (packageId: string) => {
    const colors = {
      ESSENTIAL: 'from-blue-500 to-blue-600',
      ADVANCED: 'from-green-500 to-green-600', 
      PRO: 'from-purple-500 to-purple-600',
      BUSINESS: 'from-orange-500 to-orange-600',
      ENTERPRISE: 'from-red-500 to-red-600'
    }
    return colors[packageId as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Saldo Atual */}
      <CreditBalance balance={balance} user={user} />

      {/* Explicação do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Como Funcionam os Pacotes de Créditos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Complementares</h4>
                <p className="text-sm text-gray-600">
                  Créditos comprados complementam sua assinatura mensal
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">12 Meses de Validade</h4>
                <p className="text-sm text-gray-600">
                  Ao contrário da assinatura, não expiram mensalmente
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Créditos Bônus</h4>
                <p className="text-sm text-gray-600">
                  Todos os pacotes incluem créditos bônus gratuitos
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pacotes de Créditos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const Icon = getPackageIcon(pkg.id)
          const totalCredits = pkg.creditAmount + pkg.bonusCredits
          const isPopular = pkg.id === 'PRO'

          return (
            <Card 
              key={pkg.id} 
              className={`relative transition-all hover:shadow-lg ${
                isPopular ? 'border-2 border-purple-200 shadow-lg' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 hover:bg-purple-600">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getPackageColor(pkg.id)} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription className="text-sm">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    R$ {pkg.price.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {totalCredits.toLocaleString()} créditos
                  </div>
                  <div className="text-sm text-gray-600">
                    {pkg.creditAmount.toLocaleString()} + {pkg.bonusCredits} bônus
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Validade:</span>
                    <span>{pkg.validityMonths} meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por crédito:</span>
                    <span>R$ {(pkg.price / totalCredits).toFixed(3).replace('.', ',')}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className={`w-full ${
                    isPopular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {purchasing === pkg.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    `Comprar ${pkg.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Pagamento processado pelo Asaas (PIX, cartão de crédito ou boleto)</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Créditos são adicionados automaticamente após confirmação do pagamento</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Sistema usa primeiro os créditos da assinatura, depois os créditos comprados</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Créditos comprados não expiram mensalmente como os da assinatura</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}