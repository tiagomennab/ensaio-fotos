import { requireActiveSubscription } from '@/lib/subscription'
import { CreditPackagesInterface } from '@/components/credits/credit-packages-interface'

export const metadata = {
  title: 'Pacotes de Créditos - VibePhoto',
  description: 'Compre créditos adicionais para criar mais fotos com IA'
}

export default async function CreditsPage() {
  const session = await requireActiveSubscription()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pacotes de Créditos</h1>
              <p className="text-gray-600 mt-1">
                Compre créditos adicionais que não expiram mensalmente
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Plano Atual</div>
                <div className="font-semibold text-gray-900">{session.user.plan}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreditPackagesInterface user={session.user} />
      </div>
    </div>
  )
}