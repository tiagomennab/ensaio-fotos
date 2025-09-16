'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, HelpCircle, Sparkles, Clock, Camera, CreditCard, Shield, Users } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  category: 'geral' | 'funcionamento' | 'pagamento' | 'privacidade' | 'tecnico'
}

const faqData: FAQItem[] = [
  // Geral
  {
    category: 'geral',
    question: 'O que é o Vibe Photo?',
    answer: 'O Vibe Photo é uma plataforma que utiliza inteligência artificial para gerar fotos profissionais personalizadas. Você envia suas selfies, nossa IA treina um modelo único baseado no seu rosto e depois pode gerar fotos suas em qualquer cenário, pose ou estilo que desejar.'
  },
  {
    category: 'geral',
    question: 'Como funciona o sistema de créditos?',
    answer: 'Cada geração de foto consome créditos do seu plano. O plano Starter oferece 500 créditos/mês, Premium 1200 créditos/mês e Gold 2500 créditos/mês. Os créditos são renovados mensalmente e não acumulam entre os períodos. Você também pode comprar pacotes de créditos únicos que são válidos por 1 ano.'
  },
  {
    category: 'geral',
    question: 'Posso usar as fotos geradas comercialmente?',
    answer: 'Sim! Todas as fotos geradas pela nossa IA são de sua propriedade e podem ser usadas para fins comerciais, redes sociais, marketing pessoal, portfólios e qualquer outro propósito que desejar.'
  },
  {
    category: 'geral',
    question: 'Quantos modelos de IA posso criar com cada plano?',
    answer: 'O plano Starter permite 1 modelo de IA por mês, o Premium permite 2 modelos por mês, e o Gold permite 5 modelos por mês. Os pacotes de créditos únicos não incluem treinamento de modelos - você precisaria de um plano de assinatura ativo para treinar novos modelos.'
  },
  {
    category: 'geral',
    question: 'Qual o melhor plano para iniciantes?',
    answer: 'Para iniciantes, recomendamos o plano Premium (R$ 179/mês) que oferece 1200 créditos, 2 modelos de IA e processamento rápido. Se você quer apenas testar, pode começar com o Pacote Avançado (R$ 179) que oferece 1000 créditos únicos válidos por 1 ano.'
  },
  
  // Funcionamento
  {
    category: 'funcionamento',
    question: 'Quantas fotos preciso enviar para treinar meu modelo?',
    answer: 'Recomendamos entre 19-33 fotos de alta qualidade. Inclua selfies em diferentes ângulos, expressões e iluminações. Quanto mais variadas as fotos de treinamento, melhor será a qualidade dos resultados gerados.'
  },
  {
    category: 'funcionamento',
    question: 'Quanto tempo demora para treinar um modelo?',
    answer: 'O treinamento de um modelo personalizado leva entre 10-30 minutos, dependendo da complexidade e qualidade das fotos enviadas. Você receberá uma notificação por email quando o modelo estiver pronto para uso.'
  },
  {
    category: 'funcionamento',
    question: 'Que tipos de fotos posso gerar?',
    answer: 'Você pode gerar fotos em praticamente qualquer cenário: profissionais (linkedin, currículos), casuais (redes sociais), artísticas, em diferentes locações (praia, cidade, natureza), com diferentes roupas e estilos. As possibilidades são praticamente ilimitadas!'
  },
  {
    category: 'funcionamento',
    question: 'Qual a qualidade das fotos geradas?',
    answer: 'A qualidade das fotos varia conforme seu plano e o tipo de pacote utilizado. Planos de assinatura oferecem maior resolução e processamento prioritário. Pacotes de créditos únicos também têm especificações próprias de qualidade. Pacotes de fotos premium garantem resultados com maior fidelidade e detalhamento. A qualidade final também depende da qualidade das suas fotos de treinamento.'
  },
  {
    category: 'funcionamento',
    question: 'Posso editar ou refazer uma foto gerada?',
    answer: 'Cada geração é única e não pode ser editada diretamente. Porém, você pode gerar novas variações ajustando o prompt ou gerando novamente com parâmetros similares. Recomendamos salvar as fotos que gostar.'
  },
  
  // Pagamento
  {
    category: 'pagamento',
    question: 'Quais formas de pagamento vocês aceitam?',
    answer: 'Aceitamos cartões de crédito e débito (Visa, Mastercard, Elo) e PIX através da nossa parceira Asaas. Todos os pagamentos são processados de forma segura e criptografada.'
  },
  {
    category: 'pagamento',
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento através da área "Minha Conta > Assinatura". O cancelamento será efetivo no final do período atual, e você continuará tendo acesso até o vencimento.'
  },
  {
    category: 'pagamento',
    question: 'Vocês oferecem reembolso?',
    answer: 'Conforme o Código de Defesa do Consumidor (Art. 49), você tem direito ao reembolso integral em até 7 dias da contratação, APENAS se nenhuma solicitação de geração de imagem ou treinamento de modelo for realizada. Após o primeiro uso dos recursos computacionais (GPU/IA), não há direito de desistência devido aos custos imediatos e irreversíveis de processamento.'
  },
  {
    category: 'pagamento',
    question: 'O que acontece se eu ultrapassar meu limite de créditos?',
    answer: 'Quando seus créditos acabarem, você não conseguirá gerar novas fotos até o próximo período de renovação ou upgrade de plano. Você pode fazer upgrade a qualquer momento ou comprar um pacote de créditos únicos para obter mais créditos imediatamente.'
  },
  {
    category: 'pagamento',
    question: 'Qual a diferença entre planos de assinatura e pacotes de créditos?',
    answer: 'Os planos de assinatura (Starter, Premium, Gold) renovam automaticamente a cada mês com créditos novos, além de incluir benefícios como múltiplos modelos de IA e processamento prioritário. Os pacotes de créditos únicos são compras únicas (Essencial, Avançado, Pro, Enterprise) que não renovam, são válidos por 1 ano e ideais para uso esporádico.'
  },
  {
    category: 'pagamento',
    question: 'Os pacotes de créditos únicos expiram?',
    answer: 'Sim, os créditos dos pacotes únicos são válidos por 1 ano após a compra. Após esse período, os créditos não utilizados expiram. Recomendamos o uso dentro do prazo de validade para aproveitar ao máximo seu investimento.'
  },
  {
    category: 'pagamento',
    question: 'Posso combinar plano de assinatura com pacotes de créditos?',
    answer: 'Sim! Você pode ter um plano de assinatura ativo e ainda comprar pacotes de créditos únicos quando necessário. Os créditos são consumidos primeiro dos pacotes únicos (por ordem de expiração) e depois dos créditos mensais da assinatura.'
  },
  
  // Privacidade
  {
    category: 'privacidade',
    question: 'Minhas fotos estão seguras?',
    answer: 'Sim! Suas fotos são armazenadas com criptografia de nível militar em servidores seguros. Apenas você tem acesso às suas fotos e modelos. Nunca compartilhamos, vendemos ou usamos suas imagens para outros fins que não sejam gerar seu modelo personalizado.'
  },
  {
    category: 'privacidade',
    question: 'Vocês usam minhas fotos para treinar outros modelos?',
    answer: 'Não! Suas fotos são usadas exclusivamente para criar seu modelo pessoal. Não utilizamos suas imagens para melhorar nossos algoritmos ou treinar modelos para outros usuários. Sua privacidade é nossa prioridade máxima.'
  },
  {
    category: 'privacidade',
    question: 'Posso excluir meus dados e fotos?',
    answer: 'Sim, você pode solicitar a exclusão completa de todos os seus dados, fotos e modelos a qualquer momento através de nossa área de privacidade ou entrando em contato conosco. O processo é irreversível e ocorre em até 30 dias.'
  },
  {
    category: 'privacidade',
    question: 'Onde meus dados são armazenados?',
    answer: 'Seus dados são armazenados em servidores seguros na AWS (Amazon Web Services) e podem ser processados em centros de dados nos EUA e Brasil. Seguimos rigorosamente as normas da LGPD para transferência internacional de dados.'
  },
  
  // Técnico
  {
    category: 'tecnico',
    question: 'Qual formato de fotos devo enviar?',
    answer: 'Aceitamos formatos JPG, PNG e WebP. Recomendamos fotos com pelo menos 512x512 pixels, bem iluminadas e com o rosto claramente visível. Evite fotos muito escuras, borradas ou com óculos escuros.'
  },
  {
    category: 'tecnico',
    question: 'Posso usar o serviço no celular?',
    answer: 'Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente em celulares, tablets e computadores. Você pode fazer upload de fotos e gerar imagens diretamente do seu smartphone.'
  },
  {
    category: 'tecnico',
    question: 'Há limite de armazenamento para minhas fotos?',
    answer: 'Não há limite específico de armazenamento. Você pode manter todas as fotos geradas em sua galeria. Fotos de treinamento são mantidas apenas durante o processo e podem ser excluídas após a criação do modelo, se desejar.'
  },
  {
    category: 'tecnico',
    question: 'O serviço funciona offline?',
    answer: 'Não, o Vibe Photo é um serviço online que requer conexão com a internet para funcionar. O processamento de IA acontece em nossos servidores para garantir a máxima qualidade e velocidade.'
  },
  {
    category: 'funcionamento',
    question: 'Quantos créditos cada foto consome?',
    answer: 'Cada foto gerada consome exatamente 10 créditos, independentemente do plano, pacote ou estilo escolhido. Isso significa que com 100 créditos você pode gerar 10 fotos, com 500 créditos pode gerar 50 fotos, e assim por diante.'
  },
  {
    category: 'pagamento',
    question: 'Qual é o valor dos pacotes de créditos únicos?',
    answer: 'Oferecemos 4 opções: Pacote Essencial (R$ 89 - 350 créditos), Pacote Avançado (R$ 179 - 1000 créditos), Pacote Pro (R$ 359 - 2200 créditos) e Pacote Enterprise (R$ 899 - 5000 créditos). Todos são válidos por 1 ano.'
  }
]

const categories = {
  geral: { name: 'Geral', icon: HelpCircle, color: 'bg-blue-100 text-blue-800' },
  funcionamento: { name: 'Como Funciona', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
  pagamento: { name: 'Pagamento', icon: CreditCard, color: 'bg-green-100 text-green-800' },
  privacidade: { name: 'Privacidade', icon: Shield, color: 'bg-red-100 text-red-800' },
  tecnico: { name: 'Técnico', icon: Users, color: 'bg-orange-100 text-orange-800' }
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const filteredFAQ = selectedCategory 
    ? faqData.filter(item => item.category === selectedCategory)
    : faqData

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667EEA]/10 via-white to-[#764BA2]/10">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white border-none">
            <HelpCircle className="w-4 h-4 mr-2" />
            Perguntas Frequentes
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent mb-4">
            Como podemos te ajudar?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossa plataforma de geração de fotos com IA
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory 
                ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas as Categorias
          </button>
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white' 
                    : `${category.color} hover:opacity-80`
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => {
            const isOpen = openItems.includes(index)
            const category = categories[item.category]
            const Icon = category.icon
            
            return (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all duration-200 hover:shadow-[#667EEA]/10">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className={category.color}>
                        <Icon className="w-3 h-3" />
                      </Badge>
                      <CardTitle className="text-left text-lg text-gray-900">
                        {item.question}
                      </CardTitle>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="pt-0">
                    <div className="ml-9">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-[#667EEA]/5 to-[#764BA2]/5 border-[#667EEA]/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                <HelpCircle className="w-5 h-5 text-[#667EEA]" />
                Não encontrou sua resposta?
              </CardTitle>
              <CardDescription>
                Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="mailto:support@ensaiofotos.com"
                  className="px-6 py-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white rounded-lg hover:from-[#5A6FDB] hover:to-[#6B4493] transition-all text-center"
                >
                  Entrar em Contato
                </Link>
                <Link 
                  href="/legal/privacy"
                  className="px-6 py-2 border border-[#667EEA] text-[#667EEA] rounded-lg hover:bg-[#667EEA]/10 transition-colors text-center"
                >
                  Política de Privacidade
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}