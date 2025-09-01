'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  User, 
  Image, 
  Package, 
  Sparkles, 
  FolderOpen,
  Home,
  Settings,
  LogOut,
  CreditCard,
  UserCircle,
  Menu,
  ChevronDown,
  BarChart3
} from 'lucide-react'
import { VibePhotoLogo } from '@/components/ui/vibephoto-logo'

// Client-side component for sign out functionality
function SignOutMenuItem() {
  return (
    <DropdownMenuItem
      className="text-red-600 focus:text-red-600 cursor-pointer"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sair</span>
    </DropdownMenuItem>
  )
}

interface NavigationProps {
  userPlan?: string
  userName?: string
  userEmail?: string
  userImage?: string
  creditsUsed?: number
  creditsLimit?: number
}

function getInitials(name?: string): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function Navigation({ 
  userPlan,
  userName,
  userEmail,
  userImage,
  creditsUsed = 0,
  creditsLimit = 0
}: NavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const effectivePlan = userPlan || (session?.user as any)?.plan

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral e estatísticas'
    },
    {
      href: '/models',
      label: 'Modelos',
      icon: User,
      description: 'Gerenciar modelos de IA'
    },
    {
      href: '/generate',
      label: 'Gerar',
      icon: Sparkles,
      description: 'Criar fotos'
    },
    {
      href: '/gallery',
      label: 'Galeria',
      icon: FolderOpen,
      description: 'Ver criações'
    },
    {
      href: '/packages',
      label: 'Pacotes',
      icon: Package,
      description: 'Coleções de prompts'
    }
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200" role="navigation" aria-label="Primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="site-navbar">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard">
            <VibePhotoLogo size="md" showText={true} />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 border-2 border-transparent ${
                      isActive 
                        ? 'bg-gray-800 text-white shadow-lg hover:bg-gray-900 hover:shadow-xl hover:-translate-y-0.5' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'text-white' : ''}`} />
                    <span className={`transition-all duration-300 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>

          {/* User Section (no credits/notifications to avoid duplication with page headers) */}
          <div className="flex items-center space-x-3">
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-2 hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userImage || session?.user?.image || ''} alt={userName || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium">
                        {getInitials(userName || session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block font-medium text-gray-900 truncate max-w-24">
                      {userName || session?.user?.name || 'Usuário'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName || session?.user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail || session?.user?.email}
                    </p>
                    {effectivePlan && (
                      <Badge variant="secondary" className="w-fit mt-1">
                        Plano {String(effectivePlan)}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/account" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Conta</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Faturamento</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>Espaço de trabalho</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/support" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Suporte</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutMenuItem />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex justify-between items-center py-3 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full flex flex-col items-center py-2 h-auto min-h-[3rem] rounded-xl font-medium transition-all duration-300 border-2 border-transparent ${
                        isActive 
                          ? 'bg-gray-800 text-white shadow-lg' 
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 transition-all duration-300 ${isActive ? 'text-white' : ''}`} />
                      <span className={`text-xs leading-tight transition-all duration-300 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    </button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}