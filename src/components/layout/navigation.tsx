'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Image, 
  Package, 
  Sparkles, 
  FolderOpen,
  Home,
  Settings
} from 'lucide-react'

interface NavigationProps {
  userPlan?: string
}

export function Navigation({ userPlan }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/models',
      label: 'Models',
      icon: User,
      description: 'Manage AI models'
    },
    {
      href: '/generate',
      label: 'Generate',
      icon: Sparkles,
      description: 'Create photos'
    },
    {
      href: '/gallery',
      label: 'Gallery',
      icon: FolderOpen,
      description: 'View creations'
    },
    {
      href: '/packages',
      label: 'Packages',
      icon: Package,
      description: 'Prompt collections'
    }
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Ensaio Fotos</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {userPlan && (
              <Badge variant="secondary">
                {userPlan} Plan
              </Badge>
            )}
            
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="w-full flex flex-col items-center py-2 h-auto"
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}