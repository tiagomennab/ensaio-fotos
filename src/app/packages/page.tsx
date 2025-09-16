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
      category: 'PREMIUM',
      description: 'Elegância discreta e sofisticação sutil para um visual de luxo silencioso',
      promptCount: 4,
      previewImages: [
        '/packages/previews/quiet-luxury/preview-1.jpg',
        '/packages/previews/quiet-luxury/preview-2.jpg',
        '/packages/previews/quiet-luxury/preview-3.jpg',
        '/packages/previews/quiet-luxury/preview-4.jpg'
      ],
      price: 99,
      isPremium: true,
      estimatedTime: '3-4 minutos',
      popularity: 92,
      rating: 4.9,
      uses: 8567,
      tags: ['luxury', 'elegante', 'minimalista', 'sofisticado'],
      features: ['20 fotos geradas', 'Estilo luxury', 'Paleta neutra', 'Sofisticação sutil']
    },
    {
      id: '8',
      name: 'Executive Minimalist',
      category: 'PREMIUM',
      description: 'Estilo executivo moderno com linhas limpas e abordagem minimalista',
      promptCount: 4,
      previewImages: [
        '/packages/previews/executive-minimalist/preview-1.jpg',
        '/packages/previews/executive-minimalist/preview-2.jpg',
        '/packages/previews/executive-minimalist/preview-3.jpg',
        '/packages/previews/executive-minimalist/preview-4.jpg'
      ],
      price: 89,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 88,
      rating: 4.8,
      uses: 9234,
      tags: ['executivo', 'minimalista', 'clean', 'moderno'],
      features: ['20 fotos geradas', 'Estilo clean', 'Fundo minimalista', 'Visual executivo']
    },
    {
      id: '9',
      name: 'Wanderlust',
      category: 'LIFESTYLE',
      description: 'Espírito wanderlust e paixão por viagens com cenários naturais únicos',
      promptCount: 4,
      previewImages: [
        '/packages/previews/nomade/preview-1.jpg',
        '/packages/previews/nomade/preview-2.jpg',
        '/packages/previews/nomade/preview-3.jpg',
        '/packages/previews/nomade/preview-4.jpg'
      ],
      price: 69,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 85,
      rating: 4.7,
      uses: 6789,
      tags: ['aventura', 'wanderlust', 'natureza', 'lifestyle'],
      features: ['20 fotos geradas', 'Cenários naturais', 'Luz dourada', 'Espírito wanderlust']
    },
    {
      id: '10',
      name: 'Fitness Aesthetic',
      category: 'LIFESTYLE',
      description: 'Visual fitness motivacional com estética atlética e energia positiva',
      promptCount: 4,
      previewImages: [
        '/packages/previews/fitness-aesthetic/preview-1.jpg',
        '/packages/previews/fitness-aesthetic/preview-2.jpg',
        '/packages/previews/fitness-aesthetic/preview-3.jpg',
        '/packages/previews/fitness-aesthetic/preview-4.jpg'
      ],
      price: 49,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 90,
      rating: 4.6,
      uses: 11234,
      tags: ['fitness', 'atlético', 'motivacional', 'saúde'],
      features: ['20 fotos geradas', 'Poses atléticas', 'Iluminação dramática', 'Energia positiva']
    },
    {
      id: '11',
      name: 'Conceptual',
      category: 'PREMIUM',
      description: 'Arte conceitual e fotografia experimental com elementos criativos únicos',
      promptCount: 4,
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
      features: ['20 fotos geradas', 'Arte conceitual', 'Elementos criativos', 'Composição única']
    },
    {
      id: '12',
      name: 'Mirror Selfie',
      category: 'LIFESTYLE',
      description: 'Selfies autênticas no espelho com estilo casual e natural',
      promptCount: 4,
      previewImages: [
        '/packages/previews/mirror-selfie/preview-1.jpg',
        '/packages/previews/mirror-selfie/preview-2.jpg',
        '/packages/previews/mirror-selfie/preview-3.jpg',
        '/packages/previews/mirror-selfie/preview-4.jpg'
      ],
      price: 39,
      isPremium: true,
      estimatedTime: '1-2 minutos',
      popularity: 93,
      rating: 4.5,
      uses: 18765,
      tags: ['selfie', 'espelho', 'casual', 'autêntico'],
      features: ['20 fotos geradas', 'Poses naturais', 'Look casual', 'Vibe autêntica']
    },
    {
      id: '13',
      name: 'Rebel',
      category: 'FASHION',
      description: 'Estilo rebelde e alternativo com atitude e personalidade marcante',
      promptCount: 4,
      previewImages: [
        '/packages/previews/rebel/preview-1.jpg',
        '/packages/previews/rebel/preview-2.jpg',
        '/packages/previews/rebel/preview-3.jpg',
        '/packages/previews/rebel/preview-4.jpg'
      ],
      price: 59,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 82,
      rating: 4.7,
      uses: 7891,
      tags: ['rebelde', 'alternativo', 'punk', 'atitude'],
      features: ['20 fotos geradas', 'Estilo alternativo', 'Atitude rebelde', 'Visual marcante']
    },
    {
      id: '14',
      name: 'Urban',
      category: 'FASHION',
      description: 'Vibe urbana moderna com cenários da cidade e estilo street',
      promptCount: 4,
      previewImages: [
        '/packages/previews/urban/preview-1.jpg',
        '/packages/previews/urban/preview-2.jpg',
        '/packages/previews/urban/preview-3.jpg',
        '/packages/previews/urban/preview-4.jpg'
      ],
      price: 49,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 87,
      rating: 4.6,
      uses: 10345,
      tags: ['urbano', 'street', 'cidade', 'moderno'],
      features: ['20 fotos geradas', 'Cenário urbano', 'Estilo street', 'Vibe cosmopolita']
    },
    {
      id: '15',
      name: 'Soft Power',
      category: 'LIFESTYLE',
      description: 'Liderança feminina com força sutil e elegância profissional',
      promptCount: 4,
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
      features: ['20 fotos geradas', 'Força sutil', 'Elegância profissional', 'Presença marcante']
    },
    {
      id: '16',
      name: 'Neo Casual',
      category: 'LIFESTYLE',
      description: 'Casual moderno e contemporâneo com toque sofisticado e trendy',
      promptCount: 4,
      previewImages: [
        '/packages/previews/neo-casual/preview-1.jpg',
        '/packages/previews/neo-casual/preview-2.jpg',
        '/packages/previews/neo-casual/preview-3.jpg',
        '/packages/previews/neo-casual/preview-4.jpg'
      ],
      price: 49,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 91,
      rating: 4.7,
      uses: 12678,
      tags: ['casual', 'moderno', 'trendy', 'sofisticado'],
      features: ['20 fotos geradas', 'Casual refinado', 'Estilo contemporâneo', 'Toque sofisticado']
    },
    
    // Additional Lifestyle & Creative Packages
    {
      id: '17',
      name: 'Flight Mode',
      category: 'CREATIVE',
      description: 'Vibes de viagem e aventuras aéreas com estética de voo e destinos',
      promptCount: 4,
      previewImages: [
        '/packages/previews/flight-mode/preview-1.jpg',
        '/packages/previews/flight-mode/preview-2.jpg',
        '/packages/previews/flight-mode/preview-3.jpg',
        '/packages/previews/flight-mode/preview-4.jpg'
      ],
      price: 59,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 86,
      rating: 4.6,
      uses: 9432,
      tags: ['viagem', 'avião', 'aventura', 'destinos'],
      features: ['20 fotos geradas', 'Cenários de viagem', 'Estética aérea', 'Look jet setter']
    },
    {
      id: '18',
      name: 'Summer Vibes',
      category: 'LIFESTYLE',
      description: 'Energia solar e vibes de verão com cenários tropicais e look fresh',
      promptCount: 4,
      previewImages: [
        '/packages/previews/summer-vibes/preview-1.jpg',
        '/packages/previews/summer-vibes/preview-2.jpg',
        '/packages/previews/summer-vibes/preview-3.jpg',
        '/packages/previews/summer-vibes/preview-4.jpg'
      ],
      price: 59,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 94,
      rating: 4.8,
      uses: 15678,
      tags: ['verão', 'praia', 'tropical', 'solar'],
      features: ['20 fotos geradas', 'Cenários tropicais', 'Luz solar dourada', 'Energia positiva']
    },
    {
      id: '19',
      name: 'Golden Hour',
      category: 'CREATIVE',
      description: 'Magia do pôr do sol com iluminação cinematográfica dourada',
      promptCount: 4,
      previewImages: [
        '/packages/previews/golden-hour/preview-1.jpg',
        '/packages/previews/golden-hour/preview-2.jpg',
        '/packages/previews/golden-hour/preview-3.jpg',
        '/packages/previews/golden-hour/preview-4.jpg'
      ],
      price: 69,
      isPremium: true,
      estimatedTime: '3-4 minutos',
      popularity: 91,
      rating: 4.9,
      uses: 8234,
      tags: ['golden hour', 'pôr do sol', 'cinematográfico', 'romântico'],
      features: ['20 fotos geradas', 'Luz dourada', 'Atmosfera cinematográfica', 'Tons quentes']
    },
    {
      id: '20',
      name: 'Vintage',
      category: 'FASHION',
      description: 'Estética retrô nostálgica com filtros vintage e vibe clássica',
      promptCount: 4,
      previewImages: [
        '/packages/previews/vintage/preview-1.jpg',
        '/packages/previews/vintage/preview-2.jpg',
        '/packages/previews/vintage/preview-3.jpg',
        '/packages/previews/vintage/preview-4.jpg'
      ],
      price: 69,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 83,
      rating: 4.7,
      uses: 7891,
      tags: ['vintage', 'retrô', 'nostálgico', 'clássico'],
      features: ['20 fotos geradas', 'Filtros vintage', 'Estética retrô', 'Texturas analógicas']
    },
    {
      id: '21',
      name: '360 Cam',
      category: 'CREATIVE',
      description: 'Perspectivas únicas e ângulos criativos com visual panorâmico',
      promptCount: 4,
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
      features: ['20 fotos geradas', 'Perspectivas únicas', 'Ângulos criativos', 'Visual panorâmico']
    },
    {
      id: '22',
      name: 'Food Mood',
      category: 'LIFESTYLE',
      description: 'Lifestyle gastronômico com cenários culinários e vibe foodie',
      promptCount: 4,
      previewImages: [
        '/packages/previews/food-mood/preview-1.jpg',
        '/packages/previews/food-mood/preview-2.jpg',
        '/packages/previews/food-mood/preview-3.jpg',
        '/packages/previews/food-mood/preview-4.jpg'
      ],
      price: 49,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 88,
      rating: 4.6,
      uses: 10234,
      tags: ['food', 'gastronomia', 'lifestyle', 'café'],
      features: ['20 fotos geradas', 'Cenários gastronômicos', 'Props culinários', 'Vibe foodie']
    },
    {
      id: '23',
      name: 'Outfit',
      category: 'FASHION',
      description: 'Fotos de outfit do dia com foco no styling e moda pessoal',
      promptCount: 4,
      previewImages: [
        '/packages/previews/outfit/preview-1.jpg',
        '/packages/previews/outfit/preview-2.jpg',
        '/packages/previews/outfit/preview-3.jpg',
        '/packages/previews/outfit/preview-4.jpg'
      ],
      price: 39,
      isPremium: true,
      estimatedTime: '1-2 minutos',
      popularity: 95,
      rating: 4.7,
      uses: 18934,
      tags: ['outfit', 'moda', 'styling', 'OOTD'],
      features: ['20 fotos geradas', 'Foco no styling', 'Poses de moda', 'Look completo']
    },
    {
      id: '24',
      name: '2000s Cam',
      category: 'CREATIVE',
      description: 'Nostalgia Y2K com estética de câmera digital dos anos 2000',
      promptCount: 4,
      previewImages: [
        '/packages/previews/2000s-cam/preview-1.jpg',
        '/packages/previews/2000s-cam/preview-2.jpg',
        '/packages/previews/2000s-cam/preview-3.jpg',
        '/packages/previews/2000s-cam/preview-4.jpg'
      ],
      price: 59,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 84,
      rating: 4.6,
      uses: 8765,
      tags: ['2000s', 'Y2K', 'nostálgico', 'digital'],
      features: ['20 fotos geradas', 'Estética Y2K', 'Grain digital', 'Vibe millennium']
    },
    {
      id: '25',
      name: 'Life Aesthetic',
      category: 'LIFESTYLE',
      description: 'Momentos cotidianos com estética minimalista e lifestyle autêntico',
      promptCount: 4,
      previewImages: [
        '/packages/previews/life-aesthetic/preview-1.jpg',
        '/packages/previews/life-aesthetic/preview-2.jpg',
        '/packages/previews/life-aesthetic/preview-3.jpg',
        '/packages/previews/life-aesthetic/preview-4.jpg'
      ],
      price: 59,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 90,
      rating: 4.8,
      uses: 12456,
      tags: ['lifestyle', 'minimalista', 'cotidiano', 'estético'],
      features: ['20 fotos geradas', 'Estética clean', 'Momentos autênticos', 'Vibe aspiracional']
    },
    {
      id: '27',
      name: 'Pet Shot',
      category: 'LIFESTYLE',
      description: 'Fotos adoráveis com pets, capturando momentos especiais com seus companheiros',
      promptCount: 4,
      previewImages: [
        '/packages/previews/pet-shot/preview-1.jpg',
        '/packages/previews/pet-shot/preview-2.jpg',
        '/packages/previews/pet-shot/preview-3.jpg',
        '/packages/previews/pet-shot/preview-4.jpg'
      ],
      price: 39,
      isPremium: true,
      estimatedTime: '2-3 minutos',
      popularity: 92,
      rating: 4.9,
      uses: 14567,
      tags: ['pets', 'animais', 'fofo', 'lifestyle', 'família'],
      features: ['20 fotos geradas', 'Poses naturais com pets', 'Momentos genuínos', 'Conexão emocional']
    },
    {
      id: '28',
      name: 'Makeup',
      category: 'LIFESTYLE',
      description: 'Selfies com foco na maquiagem, destacando diferentes looks e estilos de beleza',
      promptCount: 4,
      previewImages: [
        '/packages/previews/makeup/preview-1.jpg',
        '/packages/previews/makeup/preview-2.jpg',
        '/packages/previews/makeup/preview-3.jpg',
        '/packages/previews/makeup/preview-4.jpg'
      ],
      price: 39,
      isPremium: true,
      estimatedTime: '1-2 minutos',
      popularity: 88,
      rating: 4.6,
      uses: 12543,
      tags: ['makeup', 'beleza', 'selfie', 'maquiagem'],
      features: ['20 fotos geradas', 'Foco na maquiagem', 'Iluminação para beleza', 'Diversos looks']
    }
  ]

  // Mock stats
  const stats = {
    totalPackages: 21,
    premiumPackages: 3,
    totalGenerations: 261110,
    averageRating: 4.7
  }

  const categories = [
    { id: 'PREMIUM', name: 'Premium', count: 3 },
    { id: 'LIFESTYLE', name: 'Lifestyle', count: 10 },
    { id: 'FASHION', name: 'Fashion', count: 4 },
    { id: 'CREATIVE', name: 'Creative', count: 4 }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            packages={packages.filter(pkg => pkg.popularity > 90).sort((a, b) => b.popularity - a.popularity)}
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