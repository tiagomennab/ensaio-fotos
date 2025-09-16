import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Shield, Eye, Database, Lock, UserCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const lastUpdated = '26 de Agosto de 2025'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667EEA]/10 via-white to-[#764BA2]/10">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white border-none">
            <Shield className="w-4 h-4 mr-2" />
            Política de Privacidade
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent mb-4">
            Política de Privacidade do Vibe Photo
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
                Esta Política de Privacidade descreve como a <strong>Vibe Photo</strong> coleta, usa, 
                armazena e protege suas informações pessoais quando você utiliza nossos serviços 
                de geração de fotos com inteligência artificial.
              </p>
              <p>
                Estamos comprometidos em proteger sua privacidade e seguir rigorosamente a 
                <strong> Lei Geral de Proteção de Dados (LGPD)</strong> e demais normas aplicáveis.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 font-medium">
                  💡 Importante: Ao utilizar nossos serviços, você concorda with esta política. 
                  Se não concorda, não utilize nossa plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <Database className="w-5 h-5 text-[#667EEA]" />
                2. Dados que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">2.1 Dados Fornecidos por Você</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informações de cadastro:</strong> nome, email, telefone</li>
                <li><strong>Dados de pagamento:</strong> informações de cobrança (processadas por parceiros seguros)</li>
                <li><strong>Fotografias:</strong> imagens faciais e corporais para treinamento de IA</li>
                <li><strong>Preferências:</strong> configurações de conta e preferências de geração</li>
              </ul>
              
              <h3 className="text-lg font-semibold">2.2 Dados Coletados Automaticamente</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informações técnicas:</strong> IP, navegador, sistema operacional</li>
                <li><strong>Dados de uso:</strong> páginas visitadas, recursos utilizados, tempo de sessão</li>
                <li><strong>Cookies:</strong> conforme nossa <Link href="/legal/cookies" className="text-[#667EEA] hover:underline">Política de Cookies</Link></li>
              </ul>

              <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-semibold text-amber-800 mb-2">🔐 Dados Biométricos - Consentimento Especial</h4>
                <p className="text-amber-700 text-sm">
                  Suas fotografias são consideradas dados biométricos pela LGPD. Coletamos e processamos 
                  esses dados APENAS com seu consentimento explícito e exclusivamente para gerar seu 
                  modelo de IA personalizado.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <Eye className="w-5 h-5 text-[#667EEA]" />
                3. Como Utilizamos seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Finalidades do Tratamento</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">Execução do Serviço</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Treinamento de modelos de IA</li>
                    <li>Geração de imagens personalizadas</li>
                    <li>Armazenamento de resultados</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">Gestão da Conta</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Autenticação e segurança</li>
                    <li>Processamento de pagamentos</li>
                    <li>Suporte ao cliente</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">Melhorias do Produto</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Análise de uso (dados anonimizados)</li>
                    <li>Otimização de algoritmos</li>
                    <li>Desenvolvimento de recursos</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">Obrigações Legais</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Cumprimento da LGPD</li>
                    <li>Resposta a autoridades</li>
                    <li>Prevenção de fraudes</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2">✅ Base Legal (LGPD Art. 7º)</h4>
                <p className="text-green-700 text-sm">
                  Processamos seus dados com base em: <strong>consentimento</strong> (para dados biométricos), 
                  <strong>execução de contrato</strong> (para prestação do serviço), 
                  <strong>interesse legítimo</strong> (para melhorias de produto) e 
                  <strong>cumprimento de obrigação legal</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <Lock className="w-5 h-5 text-[#667EEA]" />
                4. Compartilhamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-800 mb-2">🚫 Nunca Compartilhamos</h4>
                <p className="text-red-700 text-sm">
                  Suas fotografias pessoais nunca são compartilhadas, vendidas ou utilizadas 
                  para outros fins além da geração do seu modelo personalizado.
                </p>
              </div>

              <h3 className="text-lg font-semibold">Compartilhamento Limitado</h3>
              <p>Compartilhamos dados apenas nas seguintes situações:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Processadores de pagamento:</strong> para processar cobranças (dados bancários criptografados)</li>
                <li><strong>Provedores de infraestrutura:</strong> para armazenamento seguro e processamento (AWS, etc.)</li>
                <li><strong>Ordem judicial:</strong> quando legalmente obrigatório</li>
                <li><strong>Proteção de direitos:</strong> para prevenir fraudes ou atividades ilegais</li>
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">🔒 Contratos de Processamento</h4>
                <p className="text-blue-700 text-sm">
                  Todos os fornecedores assinam contratos de processamento de dados conforme LGPD, 
                  garantindo o mesmo nível de proteção dos seus dados.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <Shield className="w-5 h-5 text-[#667EEA]" />
                5. Segurança dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold">Medidas Técnicas</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Criptografia de dados em trânsito e repouso</li>
                    <li>Servidores seguros com certificação SSL</li>
                    <li>Backups automatizados e seguros</li>
                    <li>Monitoramento 24/7 de segurança</li>
                    <li>Controle de acesso baseado em funções</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Medidas Administrativas</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Treinamento regular da equipe</li>
                    <li>Políticas internas de segurança</li>
                    <li>Auditorias periódicas</li>
                    <li>Plano de resposta a incidentes</li>
                    <li>Contratos de confidencialidade</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-800 mb-2">🛡️ Compromisso com a Segurança</h4>
                <p className="text-purple-700 text-sm">
                  Implementamos as melhores práticas da indústria para proteger seus dados. 
                  Em caso de incidente, você será notificado conforme exige a LGPD.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <UserCheck className="w-5 h-5 text-[#667EEA]" />
                6. Seus Direitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Conforme a LGPD, você possui os seguintes direitos sobre seus dados pessoais:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">📋 Acesso e Informação</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Confirmar se processamos seus dados</li>
                    <li>Acessar seus dados pessoais</li>
                    <li>Saber com quem compartilhamos</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">✏️ Correção e Atualização</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Corrigir dados incompletos/inexatos</li>
                    <li>Atualizar informações desatualizadas</li>
                    <li>Completar dados faltantes</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">🗑️ Exclusão</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Solicitar exclusão de dados</li>
                    <li>Cancelar conta e dados</li>
                    <li>Revogar consentimento</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">📤 Portabilidade</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Exportar seus dados</li>
                    <li>Receber em formato estruturado</li>
                    <li>Transmitir para outro fornecedor</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">📧 Como Exercer seus Direitos</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Para exercer qualquer direito, entre em contato conosco através:
                </p>
                <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                  <li><strong>Email:</strong> dpo@vibephoto.com</li>
                  <li><strong>Formulário:</strong> Configurações da conta → Privacidade</li>
                  <li><strong>Prazo de resposta:</strong> Até 15 dias conforme LGPD</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">7. Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas:</p>
              
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">📸 Dados de Treinamento (Fotos)</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Durante a conta ativa:</strong> Mantemos para gerar novos modelos<br/>
                    <strong>Após cancelamento:</strong> Excluídos em até 30 dias
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">🤖 Modelos de IA Gerados</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Durante a conta ativa:</strong> Disponíveis para geração<br/>
                    <strong>Após cancelamento:</strong> Excluídos em até 30 dias
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">🖼️ Imagens Geradas</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Propriedade sua:</strong> Mantemos até você solicitar exclusão<br/>
                    <strong>Backup disponível:</strong> Para download por até 90 dias após cancelamento
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-[#667eea] mb-2">💼 Dados de Conta e Pagamento</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Obrigação legal:</strong> 5 anos (legislação fiscal)<br/>
                    <strong>Dados anonimizados:</strong> Para análises e melhorias
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                <h4 className="font-semibold text-gray-800 mb-2">⏰ Exclusão Automática</h4>
                <p className="text-gray-700 text-sm">
                  Implementamos processos automatizados para exclusão de dados conforme os prazos estabelecidos, 
                  garantindo que nenhum dado seja mantido além do necessário.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">8. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças 
                em nossas práticas ou por outros motivos operacionais, legais ou regulatórios.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">📢 Como você será notificado</h4>
                <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                  <li><strong>Email:</strong> Para mudanças significativas</li>
                  <li><strong>Notificação na plataforma:</strong> Ao fazer login</li>
                  <li><strong>Prazo:</strong> 30 dias antes das alterações entrarem em vigor</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Recomendamos que você revise esta política periodicamente para se manter informado 
                sobre como protegemos suas informações.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-8 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">9. Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Para dúvidas sobre esta Política de Privacidade, entre em contato:
              </p>
              
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> dpo@vibephoto.com</li>
                <li><strong>Suporte:</strong> support@vibephoto.com</li>
                <li><strong>Endereço:</strong> [Endereço Completo da Empresa]</li>
              </ul>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2">🕒 Prazo de Resposta</h4>
                <p className="text-green-700 text-sm">
                  Respondemos solicitações relacionadas à LGPD em até <strong>15 dias úteis</strong>, 
                  conforme estabelecido pela legislação.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <Link href="/legal/terms" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Termos de Uso</h3>
                  <p className="text-sm text-gray-600 mt-1">Regras de uso da plataforma</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/legal/cookies" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Política de Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">Como usamos cookies</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="mailto:dpo@vibephoto.com" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Exercer Direitos LGPD</h3>
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