'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Mail, 
  FileText, 
  ExternalLink, 
  ArrowLeft,
  HelpCircle,
  Book,
  Bug,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  const supportOptions = [
    {
      title: 'Central de Ajuda',
      description: 'Encontre respostas para perguntas frequentes',
      icon: HelpCircle,
      href: '#help-center',
      available: false,
      badge: 'Em breve'
    },
    {
      title: 'Documentação',
      description: 'Guias completos sobre como usar a plataforma',
      icon: Book,
      href: '#docs',
      available: false,
      badge: 'Em breve'
    },
    {
      title: 'Contato por Email',
      description: 'Entre em contato conosco por email',
      icon: Mail,
      href: 'mailto:suporte@vibephoto.com',
      available: true,
      badge: null
    },
    {
      title: 'Reportar Bug',
      description: 'Reporte problemas técnicos ou bugs',
      icon: Bug,
      href: 'mailto:bugs@vibephoto.com',
      available: true,
      badge: null
    },
    {
      title: 'Sugerir Melhorias',
      description: 'Envie sugestões para melhorar a plataforma',
      icon: Lightbulb,
      href: 'mailto:sugestoes@vibephoto.com',
      available: true,
      badge: null
    }
  ]

  const quickTips = [
    'Para melhores resultados, use fotos de alta qualidade com boa iluminação',
    'O treinamento de modelos pode levar de 15-30 minutos para ser concluído',
    'Verifique sua caixa de spam se não receber emails de notificação',
    'Use prompts detalhados para gerar imagens mais precisas',
    'Mantenha suas fotos organizadas em coleções para fácil acesso'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Suporte</h1>
                <p className="text-gray-600 mt-1">
                  Encontre ajuda e entre em contato conosco
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Support Options */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Como podemos ajudar?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <Icon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{option.title}</h3>
                            {option.badge && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {option.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                      {option.available ? (
                        <Button asChild size="sm" className="w-full">
                          <Link href={option.href} target={option.href.startsWith('mailto:') ? '_blank' : '_self'}>
                            Acessar
                            {option.href.startsWith('mailto:') && <ExternalLink className="w-3 h-3 ml-1" />}
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled size="sm" className="w-full">
                          Em desenvolvimento
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Outras formas de entrar em contato conosco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Email Geral</h4>
                  <p className="text-sm text-gray-600 mb-2">Para dúvidas gerais sobre a plataforma</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:suporte@vibephoto.com">
                      <Mail className="w-4 h-4 mr-2" />
                      suporte@vibephoto.com
                    </Link>
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tempo de Resposta</h4>
                  <p className="text-sm text-gray-600 mb-2">Respondemos em até 24 horas úteis</p>
                  <Badge variant="default">
                    Segunda a Sexta, 9h-18h
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Dicas Rápidas
              </CardTitle>
              <CardDescription>
                Algumas dicas para aproveitar melhor a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {quickTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* FAQ Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Perguntas Frequentes (Preview)
              </CardTitle>
              <CardDescription>
                Algumas das perguntas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Como cancelar minha assinatura?</h4>
                  <p className="text-sm text-gray-600">
                    Vá para Faturamento &gt; Gerenciar Assinatura e clique em "Cancelar Plano".
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Quanto tempo leva para treinar um modelo?</h4>
                  <p className="text-sm text-gray-600">
                    O treinamento geralmente leva entre 15-30 minutos, dependendo da complexidade.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Posso usar as imagens comercialmente?</h4>
                  <p className="text-sm text-gray-600">
                    Sim, você possui os direitos das imagens geradas e pode usá-las comercialmente.
                  </p>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button variant="outline" disabled>
                  Ver todas as perguntas (Em breve)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}