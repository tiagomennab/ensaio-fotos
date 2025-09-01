'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Shield, Cookie, BarChart3, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onConsentGiven: (consents: ConsentPreferences) => void
}

interface ConsentPreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const defaultPreferences: ConsentPreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false
}

export function ConsentModal({ isOpen, onClose, onConsentGiven }: ConsentModalProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: false // We don't use marketing cookies
    }
    setPreferences(allAccepted)
    onConsentGiven(allAccepted)
    onClose()
  }

  const handleAcceptSelected = () => {
    onConsentGiven(preferences)
    onClose()
  }

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    }
    setPreferences(essentialOnly)
    onConsentGiven(essentialOnly)
    onClose()
  }

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === 'essential') return // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <Badge variant="secondary">LGPD</Badge>
          </div>
          
          <CardTitle className="text-xl">Consentimento para Cookies e Privacidade</CardTitle>
          
          <p className="text-gray-600 text-sm">
            Respeitamos sua privacidade e seguimos a Lei Geral de Proteção de Dados (LGPD). 
            Escolha como deseja que seus dados sejam utilizados.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Actions */}
          {!showDetails && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-900 mb-2">🛡️ Sobre a Privacidade dos Seus Dados</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Para utilizar nosso serviço de IA para geração de fotos, precisamos processar suas imagens pessoais. 
                  Suas fotos são utilizadas exclusivamente para criar seu modelo personalizado e nunca são compartilhadas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/legal/privacy" target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Política de Privacidade <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link href="/legal/terms" target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Termos de Uso <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Consentimentos Necessários:</h3>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <Checkbox checked={true} disabled />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Processamento de Dados Biométricos (Obrigatório)</p>
                      <p className="text-sm text-red-800">
                        Suas fotografias faciais serão processadas por nossa IA para criar seu modelo personalizado. 
                        Este consentimento é essencial para o funcionamento do serviço.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox checked={true} disabled />
                    <div className="flex-1">
                      <p className="font-medium">Cookies Essenciais</p>
                      <p className="text-sm text-gray-600">
                        Necessários para funcionamento básico (login, segurança, carrinho).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowDetails(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personalizar
                </Button>
              </div>
            </div>
          )}

          {/* Detailed Settings */}
          {showDetails && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Configurações Detalhadas</h3>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="ghost"
                  size="sm"
                >
                  Voltar
                </Button>
              </div>

              <div className="space-y-4">
                {/* Essential */}
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-red-50 border-red-200">
                  <Checkbox checked={true} disabled />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-red-600" />
                      <p className="font-medium">Cookies Essenciais</p>
                      <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Login, segurança, carrinho de compras. Não podem ser desabilitados.
                    </p>
                  </div>
                </div>

                {/* Functional */}
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Checkbox 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => updatePreference('functional', !!checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="w-4 h-4 text-blue-600" />
                      <p className="font-medium">Cookies Funcionais</p>
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Lembrar suas preferências (tema, idioma, configurações de visualização).
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Checkbox 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference('analytics', !!checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <p className="font-medium">Cookies de Análise</p>
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Entender como você usa nosso site para melhorar a experiência (dados anônimos).
                    </p>
                  </div>
                </div>

                {/* Marketing - Disabled */}
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50 opacity-50">
                  <Checkbox checked={false} disabled />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Cookie className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">Cookies de Marketing</p>
                      <Badge variant="outline" className="text-xs">Não utilizamos</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Não utilizamos cookies de marketing ou publicidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleAcceptAll}
                className="flex-1"
                size="sm"
              >
                Aceitar Todos
              </Button>
              <Button 
                onClick={handleAcceptSelected}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Aceitar Selecionados
              </Button>
            </div>
            <Button 
              onClick={handleRejectAll}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              Apenas Essenciais
            </Button>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 space-y-2 pt-4 border-t">
            <p>
              Ao utilizar nossos serviços, você concorda com o processamento de suas fotografias 
              para criação de modelos de IA personalizados, conforme nossa Política de Privacidade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                Política de Privacidade
              </Link>
              <Link href="/legal/cookies" className="text-blue-600 hover:underline">
                Política de Cookies
              </Link>
              <Link href="/legal/terms" className="text-blue-600 hover:underline">
                Termos de Uso
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}