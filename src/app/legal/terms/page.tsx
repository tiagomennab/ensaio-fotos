import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Shield, AlertTriangle, CreditCard, Zap } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  const lastUpdated = '26 de Agosto de 2025'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667EEA]/10 via-white to-[#764BA2]/10">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white border-none">
            <FileText className="w-4 h-4 mr-2" />
            Termos de Uso
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent mb-4">
            Termos de Uso do Vibe Photo
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            Última atualização: {lastUpdated}
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <Shield className="w-5 h-5 text-[#667EEA]" />
                1. Introdução
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bem-vindo ao <strong>Vibe Photo</strong>! Estes Termos de Uso regulamentam o uso de nossa plataforma de geração de fotos com inteligência artificial. Ao acessar ou utilizar nossos serviços, você concorda em cumprir estes termos.
              </p>
              <p>
                O <strong>Vibe Photo</strong> é operado por [Nome da Empresa], empresa brasileira inscrita no CNPJ [CNPJ], com sede em [Endereço Completo].
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 font-medium">
                  ⚠️ Importante: Se você não concorda com estes termos, não utilize nossos serviços.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <Zap className="w-5 h-5 text-[#667EEA]" />
                2. Descrição do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                O Vibe Photo oferece um serviço de Software como Serviço (SaaS) que utiliza inteligência artificial para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treinar modelos de IA personalizados baseados nas fotos do usuário</li>
                <li>Gerar imagens fotorrealísticas do usuário em diferentes cenários</li>
                <li>Fornecer ferramentas de edição e personalização de imagens</li>
                <li>Armazenar e organizar as imagens geradas em galerias pessoais</li>
              </ul>
              <p>
                Nossos serviços são oferecidos através de diferentes planos de assinatura com limitações de uso específicas.
              </p>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <AlertTriangle className="w-5 h-5 text-[#667EEA]" />
                3. Obrigações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">3.1 Uso Aceitável</h3>
              <p>Você se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações verdadeiras e atualizadas durante o cadastro</li>
                <li>Usar apenas fotos próprias ou com autorização expressa das pessoas retratadas</li>
                <li>Não criar conteúdo que viole direitos de terceiros</li>
                <li>Não utilizar o serviço para fins ilegais, fraudulentos ou prejudiciais</li>
                <li>Respeitar os limites de uso do seu plano contratado</li>
              </ul>

              <h3 className="text-lg font-semibold">3.2 Uso Proibido</h3>
              <p>É expressamente proibido:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gerar conteúdo pornográfico, violento ou discriminatório</li>
                <li>Criar deepfakes ou conteúdo enganoso de terceiros sem consentimento</li>
                <li>Usar fotos de menores de idade (exceto pelos próprios pais/responsáveis)</li>
                <li>Tentar contornar as limitações técnicas ou de segurança da plataforma</li>
                <li>Revender ou redistribuir nossos serviços sem autorização</li>
              </ul>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-red-800 font-medium">
                  🚨 Violações podem resultar em suspensão imediata da conta sem reembolso.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <CreditCard className="w-5 h-5 text-[#667EEA]" />
                4. Pagamentos e Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">4.1 Planos e Preços</h3>
              <p>
                Oferecemos três planos de assinatura: Starter, Premium e Gold. Os preços e recursos estão descritos em nossa página de preços e podem ser alterados mediante aviso prévio de 30 dias.
              </p>

              <h3 className="text-lg font-semibold">4.2 Cobrança</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>As assinaturas são cobradas mensalmente ou anualmente</li>
                <li>A cobrança ocorre no início de cada período</li>
                <li>Créditos não utilizados não são acumulados entre períodos</li>
                <li>Upgrades são cobrados proporcionalmente no período atual</li>
              </ul>

              <h3 className="text-lg font-semibold">4.3 Cancelamento</h3>
              <p>
                Você pode cancelar sua assinatura a qualquer momento. O cancelamento será efetivo no final do período de cobrança atual, sem direito a reembolso proporcional, exceto conforme previsto em nossa política de reembolso.
              </p>

              <h3 className="text-lg font-semibold">4.4 Política de Reembolso e Direito de Desistência</h3>
              
              <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500 mb-4">
                <h4 className="font-semibold text-amber-800 mb-2">📋 Direito de Desistência (CDC Art. 49)</h4>
                <p className="text-amber-700 text-sm">
                  Conforme o Código de Defesa do Consumidor, você tem <strong>7 dias</strong> para desistir do serviço <strong>APENAS</strong> se nenhuma solicitação de geração de imagem ou treinamento de modelo for realizada.
                </p>
              </div>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Reembolso integral:</strong> Disponível em até 7 dias da contratação, exclusivamente se nenhum recurso computacional for utilizado (treinamento de modelo ou geração de imagens)</li>
                <li><strong>Após primeiro uso:</strong> Devido aos custos imediatos e irreversíveis de processamento em GPU/IA, não há direito de desistência ou reembolso</li>
                <li><strong>Falhas técnicas:</strong> Reembolso proporcional em caso de indisponibilidade prolongada por nossa responsabilidade</li>
                <li><strong>Violações de termos:</strong> Não há reembolso para contas suspensas por violação destes termos</li>
              </ul>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mt-4">
                <p className="text-red-800 text-sm">
                  <strong>⚠️ Importante:</strong> Uma vez iniciado qualquer processamento de IA (treinamento ou geração), os custos computacionais são imediatos e irreversíveis, não cabendo reembolso conforme política transparente de custos de infraestrutura.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">5. Propriedade Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">5.1 Propriedade das Imagens Geradas</h3>
              <p>
                Você mantém todos os direitos sobre as imagens geradas através de nossa plataforma e pode usá-las livremente para fins pessoais e comerciais.
              </p>

              <h3 className="text-lg font-semibold">5.2 Licença para Nossos Serviços</h3>
              <p>
                Ao utilizar nossos serviços, você nos concede uma licença limitada, não exclusiva e revogável para processar suas fotos exclusivamente para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treinar seu modelo personalizado de IA</li>
                <li>Gerar as imagens solicitadas por você</li>
                <li>Melhorar nossos algoritmos (apenas dados anonimizados)</li>
              </ul>

              <h3 className="text-lg font-semibold">5.3 Propriedade da Plataforma</h3>
              <p>
                Todos os direitos sobre nossa plataforma, código, algoritmos e marca permanecem nossa propriedade exclusiva.
              </p>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">6. Limitações de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">6.1 Disponibilidade</h3>
              <p>
                Nos esforçamos para manter nossos serviços disponíveis 24/7, mas não garantimos 100% de uptime. Manutenções programadas serão comunicadas com antecedência.
              </p>

              <h3 className="text-lg font-semibold">6.2 Qualidade dos Resultados</h3>
              <p>
                A qualidade das imagens geradas depende de vários fatores, incluindo a qualidade das fotos de treinamento. Não garantimos resultados específicos.
              </p>

              <h3 className="text-lg font-semibold">6.3 Limitação de Danos</h3>
              <p>
                Nossa responsabilidade total não excederá o valor pago por você nos 12 meses anteriores ao evento que originou a reclamação.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Você é responsável pelo uso adequado das imagens geradas e por respeitar direitos de terceiros.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">7. Privacidade e Proteção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                O tratamento dos seus dados pessoais é regido por nossa{' '}
                <Link href="/legal/privacy" className="text-purple-600 hover:underline">
                  Política de Privacidade
                </Link>
                , que faz parte integrante destes Termos de Uso.
              </p>
              <p>
                Cumprimos integralmente a Lei Geral de Proteção de Dados (LGPD) e todas as normas aplicáveis de proteção de dados.
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">8. Modificações dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Podemos atualizar estes Termos de Uso periodicamente. Alterações significativas serão comunicadas por email ou através de notificação em nossa plataforma com pelo menos 30 dias de antecedência.
              </p>
              <p>
                O uso continuado dos serviços após as modificações constitui aceitação dos novos termos.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">9. Encerramento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violação destes Termos de Uso</li>
                <li>Atividade fraudulenta ou ilegal</li>
                <li>Não pagamento de taxas devidas</li>
                <li>Comportamento prejudicial a outros usuários</li>
              </ul>
              <p>
                Você pode encerrar sua conta a qualquer momento através das configurações da conta.
              </p>
            </CardContent>
          </Card>

          {/* Applicable Law */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">10. Lei Aplicável e Jurisdição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Estes Termos de Uso são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro da comarca de [Cidade/Estado], com renúncia expressa a qualquer outro foro.
              </p>
              <p>
                Tentaremos resolver disputas através de mediação antes de recorrer ao judiciário.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">11. Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> legal@ensaiofotos.com</li>
                <li><strong>Suporte:</strong> support@ensaiofotos.com</li>
                <li><strong>Endereço:</strong> [Endereço Completo da Empresa]</li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <Link href="/legal/privacy" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Política de Privacidade</h3>
                  <p className="text-sm text-gray-600 mt-1">Como protegemos seus dados</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/legal/faq" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">FAQ</h3>
                  <p className="text-sm text-gray-600 mt-1">Perguntas frequentes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="mailto:support@ensaiofotos.com" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Suporte</h3>
                  <p className="text-sm text-gray-600 mt-1">Entre em contato</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}