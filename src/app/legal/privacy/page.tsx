import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Database, Globe, UserCheck, FileText, Calendar, Mail, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const lastUpdated = '26 de Agosto de 2025'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Política de Privacidade - LGPD
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidade e Proteção de Dados
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            Última atualização: {lastUpdated}
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                1. Introdução e Compromisso com a LGPD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A <strong>Ensaio Fotos</strong> está comprometida com a proteção da sua privacidade e dos seus dados pessoais. Esta Política de Privacidade detalha como coletamos, usamos, compartilhamos e protegemos suas informações em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong> e demais normas aplicáveis.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800">
                  <strong>🛡️ Compromisso LGPD:</strong> Respeitamos todos os seus direitos como titular de dados pessoais e implementamos medidas técnicas e organizacionais adequadas para proteger suas informações.
                </p>
              </div>
              <p>
                <strong>Controlador de Dados:</strong> [Nome da Empresa], CNPJ [CNPJ], com sede em [Endereço Completo]<br/>
                <strong>DPO (Encarregado de Dados):</strong> dpo@ensaiofotos.com
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                2. Dados Pessoais Coletados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">2.1 Dados de Identificação</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Nome completo:</strong> Para identificação da conta</li>
                <li><strong>E-mail:</strong> Para comunicação e autenticação</li>
                <li><strong>CPF:</strong> Para emissão de notas fiscais (quando aplicável)</li>
                <li><strong>Data de nascimento:</strong> Para verificação de idade mínima</li>
              </ul>

              <h3 className="text-lg font-semibold">2.2 Dados Sensíveis (Art. 5º, II da LGPD)</h3>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-red-800 font-medium">
                  ⚠️ <strong>Dados Biométricos:</strong> Coletamos e processamos suas fotografias faciais para identificação e criação do modelo de IA personalizado.
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Fotografias pessoais:</strong> Imagens do seu rosto para treinamento de IA</li>
                <li><strong>Características biométricas:</strong> Extraídas das fotos para criação do modelo</li>
                <li><strong>Padrões faciais:</strong> Dados processados pelo algoritmo de IA</li>
              </ul>

              <h3 className="text-lg font-semibold">2.3 Dados de Pagamento</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados do cartão:</strong> Processados por terceiros certificados (PCI DSS)</li>
                <li><strong>Histórico de transações:</strong> Para controle financeiro e fiscal</li>
                <li><strong>Dados bancários:</strong> Para reembolsos (quando aplicável)</li>
              </ul>

              <h3 className="text-lg font-semibold">2.4 Dados de Uso</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Logs de acesso:</strong> IP, data/hora, páginas visitadas</li>
                <li><strong>Dados de dispositivo:</strong> Tipo, sistema operacional, navegador</li>
                <li><strong>Cookies:</strong> Para funcionalidade e análise (com seu consentimento)</li>
                <li><strong>Métricas de uso:</strong> Frequência, recursos utilizados, créditos consumidos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Legal Basis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                3. Base Legal e Finalidades do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">3.1 Consentimento Específico (Art. 7º, I da LGPD)</h3>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-green-800">
                  <strong>Para dados sensíveis:</strong> Solicitamos seu consentimento livre, informado e específico para processar suas fotografias e dados biométricos.
                </p>
              </div>
              <p><strong>Finalidades:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treinamento de modelo de IA personalizado</li>
                <li>Geração de imagens fotorrealísticas personalizadas</li>
                <li>Armazenamento seguro das imagens geradas</li>
              </ul>

              <h3 className="text-lg font-semibold">3.2 Execução de Contrato (Art. 7º, V da LGPD)</h3>
              <p><strong>Para dados de identificação e pagamento:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prestação dos serviços contratados</li>
                <li>Processamento de pagamentos e emissão de notas fiscais</li>
                <li>Comunicação sobre o serviço e suporte técnico</li>
                <li>Gestão da conta e autenticação</li>
              </ul>

              <h3 className="text-lg font-semibold">3.3 Legítimo Interesse (Art. 7º, IX da LGPD)</h3>
              <p><strong>Para dados de uso e logs:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Segurança da informação e prevenção de fraudes</li>
                <li>Melhoria dos serviços e desenvolvimento de novos recursos</li>
                <li>Análises estatísticas e de performance (dados anonimizados)</li>
                <li>Cumprimento de obrigações legais e regulamentares</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-600" />
                4. Compartilhamento e Transferência de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">4.1 Terceiros Autorizados</h3>
              <p>Compartilhamos seus dados apenas quando necessário com:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold">🤖 Replicate (IA)</h4>
                  <p className="text-sm text-gray-600">Processamento de IA nos EUA</p>
                  <p className="text-sm text-gray-600">Dados: Fotos para treinamento</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold">☁️ AWS (Armazenamento)</h4>
                  <p className="text-sm text-gray-600">Armazenamento seguro nos EUA</p>
                  <p className="text-sm text-gray-600">Dados: Imagens e backups</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold">💳 Asaas (Pagamentos)</h4>
                  <p className="text-sm text-gray-600">Gateway de pagamento no Brasil</p>
                  <p className="text-sm text-gray-600">Dados: Informações de cobrança</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold">📧 Serviços de Email</h4>
                  <p className="text-sm text-gray-600">Comunicação com usuários</p>
                  <p className="text-sm text-gray-600">Dados: Email e nome</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold">4.2 Transferência Internacional</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-800 font-medium">
                  ⚠️ <strong>Importante:</strong> Alguns de seus dados podem ser processados nos Estados Unidos por nossos parceiros tecnológicos (Replicate, AWS).
                </p>
              </div>
              <p><strong>Medidas de Proteção:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contratos com cláusulas de proteção de dados</li>
                <li>Certificações internacionais dos fornecedores</li>
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>

              <h3 className="text-lg font-semibold">4.3 Quando Não Compartilhamos</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Nunca vendemos</strong> seus dados para terceiros</li>
                <li><strong>Não usamos</strong> suas fotos para treinar modelos de outros usuários</li>
                <li><strong>Não compartilhamos</strong> dados para marketing de terceiros</li>
                <li><strong>Não fornecemos</strong> dados para autoridades sem ordem judicial</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Segurança e Proteção dos Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">5.1 Medidas Técnicas</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Criptografia:</strong> AES-256 para dados em repouso, TLS 1.3 em trânsito</li>
                <li><strong>Autenticação:</strong> Multi-fator disponível, senhas hasheadas</li>
                <li><strong>Monitoramento:</strong> Logs de acesso, detecção de anomalias</li>
                <li><strong>Backup:</strong> Backups criptografados e testados regularmente</li>
              </ul>

              <h3 className="text-lg font-semibold">5.2 Medidas Organizacionais</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acesso restrito:</strong> Apenas funcionários autorizados</li>
                <li><strong>Treinamento:</strong> Equipe capacitada em proteção de dados</li>
                <li><strong>Políticas internas:</strong> Procedimentos de segurança documentados</li>
                <li><strong>Auditoria:</strong> Revisões periódicas de segurança</li>
              </ul>

              <h3 className="text-lg font-semibold">5.3 Tempo de Retenção</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Fotos de treinamento:</strong> Mantidas durante a vigência da conta + 30 dias</li>
                <li><strong>Imagens geradas:</strong> Mantidas enquanto você desejar (sem limite)</li>
                <li><strong>Dados de pagamento:</strong> 5 anos para fins fiscais</li>
                <li><strong>Logs de acesso:</strong> 6 meses para segurança</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                6. Seus Direitos como Titular (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Conforme a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">Acesso</h4>
                  </div>
                  <p className="text-sm">Consultar quais dados temos sobre você</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Correção</h4>
                  </div>
                  <p className="text-sm">Atualizar dados incorretos ou desatualizados</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold">Portabilidade</h4>
                  </div>
                  <p className="text-sm">Receber seus dados em formato estruturado</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <h4 className="font-semibold">Exclusão</h4>
                  </div>
                  <p className="text-sm">Solicitar remoção dos seus dados</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold">6.1 Como Exercer Seus Direitos</h3>
              <p>
                Para exercer qualquer um destes direitos, entre em contato conosco através de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email do DPO:</strong> dpo@ensaiofotos.com</li>
                <li><strong>Formulário online:</strong> Disponível em sua área da conta</li>
                <li><strong>Suporte:</strong> support@ensaiofotos.com</li>
              </ul>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>📋 Processo:</strong> Responderemos sua solicitação em até 15 dias úteis. Para solicitações complexas, o prazo pode ser estendido por mais 15 dias úteis, com justificativa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Cookies e Tecnologias Similares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência. Consulte nossa{' '}
                <Link href="/legal/cookies" className="text-purple-600 hover:underline">
                  Política de Cookies
                </Link>{' '}
                para mais detalhes.
              </p>

              <h3 className="text-lg font-semibold">7.1 Tipos de Cookies</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essenciais:</strong> Necessários para funcionamento (sem consentimento)</li>
                <li><strong>Funcionais:</strong> Melhoram a experiência (com consentimento)</li>
                <li><strong>Analíticos:</strong> Métricas de uso (com consentimento)</li>
                <li><strong>Marketing:</strong> Não utilizamos cookies de marketing</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Proteção de Menores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-red-800 font-medium">
                  🔒 <strong>Importante:</strong> Nossos serviços são destinados apenas a maiores de 18 anos ou menores com autorização dos pais/responsáveis.
                </p>
              </div>
              <p>
                Para menores de idade, exigimos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Consentimento específico dos pais ou responsáveis legais</li>
                <li>Supervisão durante o uso da plataforma</li>
                <li>Verificação de identidade do responsável</li>
                <li>Maior proteção e cuidado no tratamento dos dados</li>
              </ul>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas serão comunicadas através de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email para todos os usuários cadastrados</li>
                <li>Notificação destacada em nossa plataforma</li>
                <li>Atualização da data de &quot;última modificação&quot;</li>
              </ul>
              <p>
                Recomendamos revisar esta política regularmente para se manter informado sobre como protegemos seus dados.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                10. Contato e Encarregado de Dados (DPO)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Dados da Empresa</h3>
                  <ul className="list-none space-y-2 text-sm">
                    <li><strong>Razão Social:</strong> [Nome da Empresa]</li>
                    <li><strong>CNPJ:</strong> [CNPJ]</li>
                    <li><strong>Endereço:</strong> [Endereço Completo]</li>
                    <li><strong>Email:</strong> legal@ensaiofotos.com</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Encarregado de Dados (DPO)</h3>
                  <ul className="list-none space-y-2 text-sm">
                    <li><strong>Nome:</strong> [Nome do DPO]</li>
                    <li><strong>Email:</strong> dpo@ensaiofotos.com</li>
                    <li><strong>Telefone:</strong> [Telefone]</li>
                    <li><strong>Horário:</strong> Seg-Sex, 9h às 18h</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-green-800">
                  <strong>✅ Compromisso:</strong> Respeitamos todos os seus direitos de privacidade e estamos sempre disponíveis para esclarecer dúvidas sobre o tratamento dos seus dados pessoais.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <Link href="/legal/terms" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Termos de Uso</h3>
                  <p className="text-sm text-gray-600 mt-1">Condições de uso da plataforma</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/legal/cookies" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Política de Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">Como usamos cookies</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="mailto:dpo@ensaiofotos.com" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Contato DPO</h3>
                  <p className="text-sm text-gray-600 mt-1">Questões sobre privacidade</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}