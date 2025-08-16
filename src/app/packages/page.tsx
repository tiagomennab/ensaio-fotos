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
    // Professional Packages
    {
      id: '1',
      name: 'Executive Professional',
      category: 'PROFESSIONAL',
      description: 'High-end corporate headshots and business portraits',
      prompts: [
        'Professional headshot in business attire, confident expression, office background',
        'Corporate portrait with suit and tie, executive lighting',
        'Business casual portrait, approachable and professional',
        'LinkedIn-style headshot with neutral background'
      ],
      previewImages: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ],
      price: 15,
      isPremium: true,
      estimatedTime: '2-3 minutes',
      popularity: 95,
      rating: 4.9,
      uses: 12543,
      tags: ['headshot', 'business', 'corporate', 'professional']
    },
    {
      id: '2',
      name: 'Creative Professional',
      category: 'PROFESSIONAL',
      description: 'Artistic and creative professional portraits',
      prompts: [
        'Creative professional portrait with artistic lighting',
        'Designer workspace portrait with creative elements',
        'Artistic headshot with dramatic shadows',
        'Creative industry professional with modern aesthetic'
      ],
      previewImages: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ],
      price: 12,
      isPremium: true,
      estimatedTime: '2-3 minutes',
      popularity: 87,
      rating: 4.8,
      uses: 8765,
      tags: ['creative', 'artistic', 'professional', 'modern']
    },
    // Social Media Packages
    {
      id: '3',
      name: 'Instagram Ready',
      category: 'SOCIAL',
      description: 'Perfect portraits for social media profiles',
      prompts: [
        'Instagram-style portrait with soft natural lighting',
        'Social media headshot with vibrant colors',
        'Casual lifestyle portrait for social profiles',
        'Trendy social media photo with modern aesthetic'
      ],
      previewImages: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ],
      price: 8,
      isPremium: false,
      estimatedTime: '1-2 minutes',
      popularity: 92,
      rating: 4.7,
      uses: 15234,
      tags: ['instagram', 'social', 'casual', 'lifestyle']
    },
    {
      id: '4',
      name: 'Dating Profile Pro',
      category: 'SOCIAL',
      description: 'Attractive and authentic photos for dating apps',
      prompts: [
        'Natural dating profile photo with genuine smile',
        'Casual outdoor portrait for dating apps',
        'Friendly and approachable dating photo',
        'Confident dating profile picture with good lighting'
      ],
      previewImages: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ],
      price: 10,
      isPremium: false,
      estimatedTime: '1-2 minutes',
      popularity: 89,
      rating: 4.6,
      uses: 9876,
      tags: ['dating', 'casual', 'attractive', 'authentic']
    },
    // Fantasy & Art Packages
    {
      id: '5',
      name: 'Fantasy Warrior',
      category: 'FANTASY',
      description: 'Epic fantasy warrior and hero portraits',
      prompts: [
        'Epic fantasy warrior with armor and sword',
        'Medieval knight in shining armor',
        'Fantasy hero with magical elements',
        'Warrior portrait with dramatic lighting and effects'
      ],
      previewImages: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ],
      price: 20,
      isPremium: true,
      estimatedTime: '3-4 minutes',
      popularity: 78,
      rating: 4.9,
      uses: 5432,
      tags: ['fantasy', 'warrior', 'epic', 'armor']
    },
    {
      id: '6',
      name: 'Anime Style',
      category: 'ARTISTIC',
      description: 'Anime and manga-inspired portraits',
      prompts: [
        'Anime-style portrait with large expressive eyes',
        'Manga character design with vibrant colors',
        'Anime aesthetic with detailed hair and features',
        'Japanese animation style portrait'
      ],
      previewImages: [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ],
      price: 15,
      isPremium: true,
      estimatedTime: '2-3 minutes',
      popularity: 85,
      rating: 4.8,
      uses: 7123,
      tags: ['anime', 'manga', 'artistic', 'stylized']
    }
  ]

  // Mock stats
  const stats = {
    totalPackages: 45,
    premiumPackages: 28,
    freePackages: 17,
    totalGenerations: 156789,
    averageRating: 4.7
  }

  const categories = [
    { id: 'PROFESSIONAL', name: 'Professional', count: 12 },
    { id: 'SOCIAL', name: 'Social Media', count: 8 },
    { id: 'FANTASY', name: 'Fantasy', count: 15 },
    { id: 'ARTISTIC', name: 'Artistic', count: 10 }
  ]

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || pkg.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Photo Packages</h1>
            <p className="text-gray-600 mt-1">
              Pre-built prompt collections for instant professional results
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center">
              <Package className="w-4 h-4 mr-1" />
              {stats.totalPackages} Packages
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              {stats.premiumPackages} Premium
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPackages}</div>
              <p className="text-xs text-muted-foreground">
                Ready to use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumPackages}</div>
              <p className="text-xs text-muted-foreground">
                High-quality packs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Access</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.freePackages}</div>
              <p className="text-xs text-muted-foreground">
                No credits required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total uses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                User satisfaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Packages</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New Releases</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search packages by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories ({packages.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Results */}
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredPackages.length} of {packages.length} packages
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Popular Packages</h3>
            <p className="text-gray-600">
              Discover the most used and highest-rated photo packages
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Latest Releases</h3>
            <p className="text-gray-600">
              Fresh new packages added this week
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
  )
}