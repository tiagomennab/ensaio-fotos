'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CreditsDisplay } from '@/components/ui/credits-display'
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
  Bell,
  Menu,
  ChevronDown,
  BarChart3
} from 'lucide-react'

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

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and statistics'
    },
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
            {/* Credits Display */}
            {creditsLimit > 0 && (
              <CreditsDisplay
                creditsUsed={creditsUsed}
                creditsLimit={creditsLimit}
                plan={userPlan || 'FREE'}
                compact
                className="hidden sm:flex"
              />
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
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
                    <div className="flex flex-col items-start text-sm min-w-0">
                      <span className="font-medium text-gray-900 truncate max-w-24">
                        {userName || session?.user?.name || 'Usuário'}
                      </span>
                      {userPlan && (
                        <span className="text-xs text-gray-500 capitalize">
                          {userPlan.toLowerCase()}
                        </span>
                      )}
                    </div>
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
                    {userPlan && (
                      <Badge variant="secondary" className="w-fit mt-1">
                        Plano {userPlan}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                {/* Credits info for mobile */}
                {creditsLimit > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2 sm:hidden">
                      <CreditsDisplay
                        creditsUsed={creditsUsed}
                        creditsLimit={creditsLimit}
                        plan={userPlan || 'FREE'}
                        compact
                      />
                    </div>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
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
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full flex flex-col items-center py-2 h-auto min-h-[3rem]"
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">{item.label}</span>
                    </Button>
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