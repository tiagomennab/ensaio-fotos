'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PackageGrid } from '@/components/packages/package-grid'
import { PackageFilters } from '@/components/packages/package-filters'
import { PackageModal } from '@/components/packages/package-modal'
import { 
  Search, 
  Crown, 
  Package, 
  TrendingUp, 
  Clock,
  Users,
  Sparkles,
  Filter,
  SlidersHorizontal
} from 'lucide-react'

export default function PackagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

  // Mock data for photo packages
  const packages = [
    
    // New Landing Page Styles
    {
      id: '7',
      name: 'Quiet Luxury',
      category: 'PROFESSIONAL',
      description: 'Elegância discreta e sofisticação sutil para um visual de luxo silencioso',
      prompts: [
        'Retrato elegante com estilo quiet luxury, roupas neutras de alta qualidade',
        'Foto sofisticada com acessórios minimalistas e cores neutras',
        'Retrato discreto e elegante com tecidos nobres e corte impecável',
        'Estilo quiet luxury com paleta neutra e elementos sutis de luxo'
      ],
      previewImages: [
        '/packages/previews/quiet-luxury/preview-1.jpg',
        '/packages/previews/quiet-luxury/preview-2.jpg',
        '/packages/previews/quiet-luxury/preview-3.jpg',
        '/packages/previews/quiet-luxury/preview-4.jpg'
      ],
      price: 89,
      isPremium: true,
      estimatedTime: '3-4 minutos',
      popularity: 92,
      rating: 4.9,
      uses: 8567,
      tags: ['luxury', 'elegante', 'minimalista', 'sofisticado'],
      features: ['30 fotos geradas', 'Estilo luxury', 'Paleta neutra', 'Sofisticação sutil']
    },
    {
      id: '8',
      name: 'Executive Minimalist',
      category: 'PROFESSIONAL',
      description: 'Estilo executivo moderno com linhas limpas e abordagem minimalista',
      prompts: [
        'Retrato executivo minimalista com linhas limpas e fundo neutro',
        'Foto profissional com estética clean e moderna',
        'Executivo com visual simplificado e elegante',
        'Retrato corporativo com abordagem minimalista e sofisticada'
      ],
      previewImages: [
        '/packages/previews/executive-minimalist/preview-1.jpg',
        '/packages/previews/executive-minimalist/preview-2.jpg',
        '/packages/previews/executive-minimalist/preview-3.jpg',
        '/packages/previews/executive-minimalist/preview-4.jpg'
      ],
      price: 79,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 88,
      rating: 4.8,
      uses: 9234,
      tags: ['executivo', 'minimalista', 'clean', 'moderno'],
      features: ['30 fotos geradas', 'Estilo clean', 'Fundo minimalista', 'Visual executivo']
    },
    {
      id: '9',
      name: 'Wanderlust',
      category: 'ARTISTIC',
      description: 'Espírito wanderlust e paixão por viagens com cenários naturais únicos',
      prompts: [
        'Aventureiro wanderlust em paisagem desértica com luz dourada',
        'Foto lifestyle wanderlust com mochila e cenário natural',
        'Retrato de viajante em ambiente selvagem e autêntico',
        'Estilo wanderlust com elementos de aventura e natureza'
      ],
      previewImages: [
        '/packages/previews/nomade/preview-1.jpg',
        '/packages/previews/nomade/preview-2.jpg',
        '/packages/previews/nomade/preview-3.jpg',
        '/packages/previews/nomade/preview-4.jpg'
      ],
      price: 69,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 85,
      rating: 4.7,
      uses: 6789,
      tags: ['aventura', 'wanderlust', 'natureza', 'lifestyle'],
      features: ['30 fotos geradas', 'Cenários naturais', 'Luz dourada', 'Espírito wanderlust']
    },
    {
      id: '10',
      name: 'Fitness Aesthetic',
      category: 'SOCIAL',
      description: 'Visual fitness motivacional com estética atlética e energia positiva',
      prompts: [
        'Foto fitness com iluminação dramática e pose atlética',
        'Retrato motivacional de treino com energia e determinação',
        'Estética fitness com roupas esportivas e ambiente de academia',
        'Foto atlética com foco na forma física e bem-estar'
      ],
      previewImages: [
        '/packages/previews/fitness-aesthetic/preview-1.jpg',
        '/packages/previews/fitness-aesthetic/preview-2.jpg',
        '/packages/previews/fitness-aesthetic/preview-3.jpg',
        '/packages/previews/fitness-aesthetic/preview-4.jpg'
      ],
      price: 59,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 90,
      rating: 4.6,
      uses: 11234,
      tags: ['fitness', 'atlético', 'motivacional', 'saúde'],
      features: ['30 fotos geradas', 'Poses atléticas', 'Iluminação dramática', 'Energia positiva']
    },
    {
      id: '11',
      name: 'Conceptual',
      category: 'ARTISTIC',
      description: 'Arte conceitual e fotografia experimental com elementos criativos únicos',
      prompts: [
        'Retrato conceitual com elementos artísticos e composição criativa',
        'Foto experimental com conceitos abstratos e visuais únicos',
        'Arte conceitual com simbolismo e narrativa visual',
        'Retrato artístico com abordagem conceitual e elementos surreais'
      ],
      previewImages: [
        '/packages/previews/conceitual/preview-1.jpg',
        '/packages/previews/conceitual/preview-2.jpg',
        '/packages/previews/conceitual/preview-3.jpg',
        '/packages/previews/conceitual/preview-4.jpg'
      ],
      price: 99,
      isPremium: true,
      estimatedTime: '4-5 minutos',
      popularity: 78,
      rating: 4.9,
      uses: 4567,
      tags: ['conceptual', 'artístico', 'experimental', 'criativo'],
      features: ['30 fotos geradas', 'Arte conceitual', 'Elementos criativos', 'Composição única']
    },
    {
      id: '12',
      name: 'Mirror Selfie',
      category: 'SOCIAL',
      description: 'Selfies autênticas no espelho com estilo casual e natural',
      prompts: [
        'Mirror selfie casual com boa iluminação e pose natural',
        'Selfie no espelho com outfit stylish e ambiente descontraído',
        'Foto no espelho com estilo autêntico e vibe casual',
        'Mirror selfie com look do dia e expressão natural'
      ],
      previewImages: [
        '/packages/previews/mirror-selfie/preview-1.jpg',
        '/packages/previews/mirror-selfie/preview-2.jpg',
        '/packages/previews/mirror-selfie/preview-3.jpg',
        '/packages/previews/mirror-selfie/preview-4.jpg'
      ],
      price: 49,
      isPremium: false,
      estimatedTime: '1-2 minutos',
      popularity: 93,
      rating: 4.5,
      uses: 18765,
      tags: ['selfie', 'espelho', 'casual', 'autêntico'],
      features: ['30 fotos geradas', 'Poses naturais', 'Look casual', 'Vibe autêntica']
    },
    {
      id: '13',
      name: 'Rebel',
      category: 'ARTISTIC',
      description: 'Estilo rebelde e alternativo com atitude e personalidade marcante',
      prompts: [
        'Retrato rebelde com estilo alternativo e atitude confiante',
        'Foto com vibe rebelde, roupas escuras e expressão marcante',
        'Estilo punk/rock com elementos rebeldes e energia intensa',
        'Retrato alternativo com personalidade forte e visual impactante'
      ],
      previewImages: [
        '/packages/previews/rebel/preview-1.jpg',
        '/packages/previews/rebel/preview-2.jpg',
        '/packages/previews/rebel/preview-3.jpg',
        '/packages/previews/rebel/preview-4.jpg'
      ],
      price: 69,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 82,
      rating: 4.7,
      uses: 7891,
      tags: ['rebelde', 'alternativo', 'punk', 'atitude'],
      features: ['30 fotos geradas', 'Estilo alternativo', 'Atitude rebelde', 'Visual marcante']
    },
    {
      id: '14',
      name: 'Urban',
      category: 'SOCIAL',
      description: 'Vibe urbana moderna com cenários da cidade e estilo street',
      prompts: [
        'Retrato urbano com cenário de cidade e estilo street',
        'Foto urbana moderna com elementos arquitetônicos e vibe cosmopolita',
        'Estilo street wear em ambiente urbano contemporâneo',
        'Retrato urbano com energia da cidade e visual moderno'
      ],
      previewImages: [
        '/packages/previews/urban/preview-1.jpg',
        '/packages/previews/urban/preview-2.jpg',
        '/packages/previews/urban/preview-3.jpg',
        '/packages/previews/urban/preview-4.jpg'
      ],
      price: 59,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 87,
      rating: 4.6,
      uses: 10345,
      tags: ['urbano', 'street', 'cidade', 'moderno'],
      features: ['30 fotos geradas', 'Cenário urbano', 'Estilo street', 'Vibe cosmopolita']
    },
    {
      id: '15',
      name: 'Soft Power',
      category: 'PROFESSIONAL',
      description: 'Liderança feminina com força sutil e elegância profissional',
      prompts: [
        'Retrato de liderança feminina com elegância e força sutil',
        'Foto profissional com soft power, confiança e sofisticação',
        'Executiva moderna com presença marcante e estilo refinado',
        'Liderança com abordagem suave mas determinada e elegante'
      ],
      previewImages: [
        '/packages/previews/soft-power/preview-1.jpg',
        '/packages/previews/soft-power/preview-2.jpg',
        '/packages/previews/soft-power/preview-3.jpg',
        '/packages/previews/soft-power/preview-4.jpg'
      ],
      price: 79,
      isPremium: true,
      estimatedTime: '3-4 minutos',
      popularity: 89,
      rating: 4.8,
      uses: 8901,
      tags: ['liderança', 'feminino', 'elegante', 'profissional'],
      features: ['30 fotos geradas', 'Força sutil', 'Elegância profissional', 'Presença marcante']
    },
    {
      id: '16',
      name: 'Neo Casual',
      category: 'SOCIAL',
      description: 'Casual moderno e contemporâneo com toque sofisticado e trendy',
      prompts: [
        'Estilo neo casual com roupas modernas e toque sofisticado',
        'Casual contemporâneo com elementos trendy e atuais',
        'Look casual refinado com detalhes modernos e elegantes',
        'Neo casual com mistura de conforto e estilo urbano'
      ],
      previewImages: [
        '/packages/previews/neo-casual/preview-1.jpg',
        '/packages/previews/neo-casual/preview-2.jpg',
        '/packages/previews/neo-casual/preview-3.jpg',
        '/packages/previews/neo-casual/preview-4.jpg'
      ],
      price: 59,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 91,
      rating: 4.7,
      uses: 12678,
      tags: ['casual', 'moderno', 'trendy', 'sofisticado'],
      features: ['30 fotos geradas', 'Casual refinado', 'Estilo contemporâneo', 'Toque sofisticado']
    },
    
    // Additional Lifestyle & Creative Packages
    {
      id: '17',
      name: 'Flight Mode',
      category: 'SOCIAL',
      description: 'Vibes de viagem e aventuras aéreas com estética de voo e destinos',
      prompts: [
        'Foto em aeroporto com look de viagem e mala vintage',
        'Retrato em cabine de avião com luz natural e vibe aventureira',
        'Selfie de viagem com paisagem aérea ao fundo',
        'Look de jet setter com acessórios de viagem elegantes'
      ],
      previewImages: [
        '/packages/previews/flight-mode/preview-1.jpg',
        '/packages/previews/flight-mode/preview-2.jpg',
        '/packages/previews/flight-mode/preview-3.jpg',
        '/packages/previews/flight-mode/preview-4.jpg'
      ],
      price: 69,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 86,
      rating: 4.6,
      uses: 9432,
      tags: ['viagem', 'avião', 'aventura', 'destinos'],
      features: ['30 fotos geradas', 'Cenários de viagem', 'Estética aérea', 'Look jet setter']
    },
    {
      id: '18',
      name: 'Summer Vibes',
      category: 'SOCIAL',
      description: 'Energia solar e vibes de verão com cenários tropicais e look fresh',
      prompts: [
        'Foto de verão na praia com luz solar dourada e roupa tropical',
        'Retrato refrescante à beira da piscina com drink colorido',
        'Look summer com óculos escuros e cenário paradisíaco',
        'Selfie de verão com flores tropicais e energia positiva'
      ],
      previewImages: [
        '/packages/previews/summer-vibes/preview-1.jpg',
        '/packages/previews/summer-vibes/preview-2.jpg',
        '/packages/previews/summer-vibes/preview-3.jpg',
        '/packages/previews/summer-vibes/preview-4.jpg'
      ],
      price: 59,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 94,
      rating: 4.8,
      uses: 15678,
      tags: ['verão', 'praia', 'tropical', 'solar'],
      features: ['30 fotos geradas', 'Cenários tropicais', 'Luz solar dourada', 'Energia positiva']
    },
    {
      id: '19',
      name: 'Golden Hour',
      category: 'ARTISTIC',
      description: 'Magia do pôr do sol com iluminação cinematográfica dourada',
      prompts: [
        'Retrato golden hour com luz dourada suave e atmosfera romântica',
        'Foto ao pôr do sol com contraluz dramático e tons quentes',
        'Silhueta artística com luz dourada e céu colorido',
        'Retrato cinematográfico com iluminação golden hour perfeita'
      ],
      previewImages: [
        '/packages/previews/golden-hour/preview-1.jpg',
        '/packages/previews/golden-hour/preview-2.jpg',
        '/packages/previews/golden-hour/preview-3.jpg',
        '/packages/previews/golden-hour/preview-4.jpg'
      ],
      price: 79,
      isPremium: true,
      estimatedTime: '3-4 minutos',
      popularity: 91,
      rating: 4.9,
      uses: 8234,
      tags: ['golden hour', 'pôr do sol', 'cinematográfico', 'romântico'],
      features: ['30 fotos geradas', 'Luz dourada', 'Atmosfera cinematográfica', 'Tons quentes']
    },
    {
      id: '20',
      name: 'Vintage',
      category: 'ARTISTIC',
      description: 'Estética retrô nostálgica com filtros vintage e vibe clássica',
      prompts: [
        'Retrato vintage com filtro sépia e estética anos 70',
        'Foto retrô com roupas clássicas e ambiente nostálgico',
        'Estilo pin-up vintage com poses e cenário dos anos 50',
        'Retrato nostálgico com textura analógica e cores desbotadas'
      ],
      previewImages: [
        '/packages/previews/vintage/preview-1.jpg',
        '/packages/previews/vintage/preview-2.jpg',
        '/packages/previews/vintage/preview-3.jpg',
        '/packages/previews/vintage/preview-4.jpg'
      ],
      price: 69,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 83,
      rating: 4.7,
      uses: 7891,
      tags: ['vintage', 'retrô', 'nostálgico', 'clássico'],
      features: ['30 fotos geradas', 'Filtros vintage', 'Estética retrô', 'Texturas analógicas']
    },
    {
      id: '21',
      name: '360 Cam',
      category: 'ARTISTIC',
      description: 'Perspectivas únicas e ângulos criativos com visual panorâmico',
      prompts: [
        'Selfie 360 graus com perspectiva panorâmica única',
        'Foto com ângulo criativo e distorção artística interessante',
        'Retrato com perspectiva fish-eye e visual dinâmico',
        'Foto 360 com múltiplos ângulos e composição inovadora'
      ],
      previewImages: [
        '/packages/previews/360-cam/preview-1.jpg',
        '/packages/previews/360-cam/preview-2.jpg',
        '/packages/previews/360-cam/preview-3.jpg',
        '/packages/previews/360-cam/preview-4.jpg'
      ],
      price: 89,
      isPremium: true,
      estimatedTime: '4-5 minutos',
      popularity: 77,
      rating: 4.5,
      uses: 4567,
      tags: ['360', 'panorâmico', 'criativo', 'inovador'],
      features: ['30 fotos geradas', 'Perspectivas únicas', 'Ângulos criativos', 'Visual panorâmico']
    },
    {
      id: '22',
      name: 'Food Mood',
      category: 'SOCIAL',
      description: 'Lifestyle gastronômico com cenários culinários e vibe foodie',
      prompts: [
        'Foto lifestyle em café charmoso com croissant e cappuccino',
        'Retrato em cozinha gourmet preparando pratos deliciosos',
        'Selfie foodie em restaurante elegante com pratos artísticos',
        'Foto casual com comida de rua e energia urbana gastronômica'
      ],
      previewImages: [
        '/packages/previews/food-mood/preview-1.jpg',
        '/packages/previews/food-mood/preview-2.jpg',
        '/packages/previews/food-mood/preview-3.jpg',
        '/packages/previews/food-mood/preview-4.jpg'
      ],
      price: 59,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 88,
      rating: 4.6,
      uses: 10234,
      tags: ['food', 'gastronomia', 'lifestyle', 'café'],
      features: ['30 fotos geradas', 'Cenários gastronômicos', 'Props culinários', 'Vibe foodie']
    },
    {
      id: '23',
      name: 'Outfit',
      category: 'SOCIAL',
      description: 'Fotos de outfit do dia com foco no styling e moda pessoal',
      prompts: [
        'OOTD completo com look coordenado e pose confiante',
        'Foto de outfit casual chic com acessórios em destaque',
        'Styling do dia com mix de texturas e cores harmoniosas',
        'Look of the day com pose dinâmica e fundo urbano clean'
      ],
      previewImages: [
        '/packages/previews/outfit/preview-1.jpg',
        '/packages/previews/outfit/preview-2.jpg',
        '/packages/previews/outfit/preview-3.jpg',
        '/packages/previews/outfit/preview-4.jpg'
      ],
      price: 49,
      isPremium: false,
      estimatedTime: '1-2 minutos',
      popularity: 95,
      rating: 4.7,
      uses: 18934,
      tags: ['outfit', 'moda', 'styling', 'OOTD'],
      features: ['30 fotos geradas', 'Foco no styling', 'Poses de moda', 'Look completo']
    },
    {
      id: '24',
      name: '2000s Cam',
      category: 'ARTISTIC',
      description: 'Nostalgia Y2K com estética de câmera digital dos anos 2000',
      prompts: [
        'Foto com estética Y2K e qualidade de câmera digital dos anos 2000',
        'Retrato nostálgico com filtros e cores saturadas dos 2000s',
        'Selfie com vibe millennium e elementos tecnológicos retrô',
        'Foto com grain digital e estética cyber dos primeiros anos 2000'
      ],
      previewImages: [
        '/packages/previews/2000s-cam/preview-1.jpg',
        '/packages/previews/2000s-cam/preview-2.jpg',
        '/packages/previews/2000s-cam/preview-3.jpg',
        '/packages/previews/2000s-cam/preview-4.jpg'
      ],
      price: 69,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 84,
      rating: 4.6,
      uses: 8765,
      tags: ['2000s', 'Y2K', 'nostálgico', 'digital'],
      features: ['30 fotos geradas', 'Estética Y2K', 'Grain digital', 'Vibe millennium']
    },
    {
      id: '25',
      name: 'Life Aesthetic',
      category: 'SOCIAL',
      description: 'Momentos cotidianos com estética minimalista e lifestyle autêntico',
      prompts: [
        'Momento cotidiano estético com luz natural suave e ambiente clean',
        'Lifestyle minimalista com elementos simples e composição harmoniosa',
        'Retrato de vida real com estética Pinterest e vibe aspiracional',
        'Foto lifestyle com decoração minimalista e energia positiva'
      ],
      previewImages: [
        '/packages/previews/life-aesthetic/preview-1.jpg',
        '/packages/previews/life-aesthetic/preview-2.jpg',
        '/packages/previews/life-aesthetic/preview-3.jpg',
        '/packages/previews/life-aesthetic/preview-4.jpg'
      ],
      price: 59,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 90,
      rating: 4.8,
      uses: 12456,
      tags: ['lifestyle', 'minimalista', 'cotidiano', 'estético'],
      features: ['30 fotos geradas', 'Estética clean', 'Momentos autênticos', 'Vibe aspiracional']
    },
    {
      id: '27',
      name: 'Pet Shot',
      category: 'SOCIAL',
      description: 'Fotos adoráveis com pets, capturando momentos especiais com seus companheiros',
      prompts: [
        'Retrato amoroso com cachorro fiel, luz natural suave e conexão emocional',
        'Selfie divertida com gato no colo, ambiente aconchegante e momento espontâneo',
        'Foto lifestyle com pet ao ar livre, cenário natural e energia brincalhona',
        'Momento família com animal de estimação, carinho genuíno e felicidade compartilhada'
      ],
      previewImages: [
        '/packages/previews/pet-shot/preview-1.jpg',
        '/packages/previews/pet-shot/preview-2.jpg',
        '/packages/previews/pet-shot/preview-3.jpg',
        '/packages/previews/pet-shot/preview-4.jpg'
      ],
      price: 49,
      isPremium: false,
      estimatedTime: '2-3 minutos',
      popularity: 92,
      rating: 4.9,
      uses: 14567,
      tags: ['pets', 'animais', 'fofo', 'lifestyle', 'família'],
      features: ['30 fotos geradas', 'Poses naturais com pets', 'Momentos genuínos', 'Conexão emocional']
    },
    {
      id: '28',
      name: 'Makeup',
      category: 'SOCIAL',
      description: 'Selfies com foco na maquiagem, destacando diferentes looks e estilos de beleza',
      prompts: [
        'Selfie com maquiagem natural e iluminação suave para destacar a pele',
        'Close-up da maquiagem dramática com foco nos olhos e contorno',
        'Selfie com batom vermelho clássico e maquiagem elegante',
        'Look de maquiagem colorida e criativa com tons vibrantes'
      ],
      previewImages: [
        '/packages/previews/makeup/preview-1.jpg',
        '/packages/previews/makeup/preview-2.jpg',
        '/packages/previews/makeup/preview-3.jpg',
        '/packages/previews/makeup/preview-4.jpg'
      ],
      price: 49,
      isPremium: false,
      estimatedTime: '1-2 minutos',
      popularity: 88,
      rating: 4.6,
      uses: 12543,
      tags: ['makeup', 'beleza', 'selfie', 'maquiagem'],
      features: ['30 fotos geradas', 'Foco na maquiagem', 'Iluminação para beleza', 'Diversos looks']
    }
  ]

  // Mock stats
  const stats = {
    totalPackages: 21,
    premiumPackages: 6,
    freePackages: 15,
    totalGenerations: 261110,
    averageRating: 4.7
  }

  const categories = [
    { id: 'PROFESSIONAL', name: 'Profissional', count: 3 },
    { id: 'SOCIAL', name: 'Redes Sociais', count: 11 },
    { id: 'FANTASY', name: 'Fantasia', count: 0 },
    { id: 'ARTISTIC', name: 'Artístico', count: 7 }
  ]

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || pkg.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Pacotes de Fotos
              </h1>
              <p className="text-gray-300 mt-1">
                Coleções de prompts pré-construídas para resultados profissionais instantâneos
              </p>
            </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center bg-gray-700 text-gray-200 hover:bg-gray-600">
              <Package className="w-4 h-4 mr-1" />
              {stats.totalPackages} Pacotes
            </Badge>
            <Badge variant="secondary" className="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 text-yellow-100 hover:from-yellow-500 hover:to-yellow-400">
              <Crown className="w-4 h-4 mr-1" />
              {stats.premiumPackages} Premium
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total de Pacotes</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPackages}</div>
              <p className="text-xs text-gray-400">
                Prontos para usar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Premium</CardTitle>
              <Crown className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.premiumPackages}</div>
              <p className="text-xs text-gray-400">
                Pacotes de alta qualidade
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Acesso Gratuito</CardTitle>
              <Sparkles className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.freePackages}</div>
              <p className="text-xs text-gray-400">
                Sem créditos necessários
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Gerações</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalGenerations.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                Total de usos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Avaliação Média</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.averageRating}</div>
              <p className="text-xs text-gray-400">
                Satisfação do usuário
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border-gray-700">
          <TabsTrigger 
            value="browse" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
          >
            Navegar Pacotes
          </TabsTrigger>
          <TabsTrigger 
            value="popular"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
          >
            Populares
          </TabsTrigger>
          <TabsTrigger 
            value="new"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
          >
            Lançamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar pacotes por nome, descrição ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" 
                : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            >
              Todas as Categorias ({packages.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                }
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Results */}
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  Mostrando {filteredPackages.length} de {packages.length} pacotes
                </p>
              </div>
              
              <PackageGrid
                packages={filteredPackages}
                onPackageSelect={setSelectedPackage}
              />
            </div>

            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80">
                <PackageFilters
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="text-center py-8">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Pacotes Mais Populares</h3>
            <p className="text-gray-400">
              Descubra os pacotes de fotos mais usados e melhor avaliados
            </p>
          </div>
          
          <PackageGrid
            packages={packages.sort((a, b) => b.popularity - a.popularity)}
            onPackageSelect={setSelectedPackage}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Últimos Lançamentos</h3>
            <p className="text-gray-400">
              Novos pacotes frescos adicionados esta semana
            </p>
          </div>
          
          <PackageGrid
            packages={packages.slice(0, 3)}
            onPackageSelect={setSelectedPackage}
          />
        </TabsContent>
      </Tabs>

        {/* Package Modal */}
        {selectedPackage && (
          <PackageModal
            package={selectedPackage}
            onClose={() => setSelectedPackage(null)}
          />
        )}
      </div>
    </div>
  )
}