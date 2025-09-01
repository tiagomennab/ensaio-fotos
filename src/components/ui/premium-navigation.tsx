'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, User, Settings, LogOut, CreditCard, Camera, ImageIcon, Users, Package, Crown } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { VibePhotoLogo } from '@/components/ui/vibephoto-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PremiumNavigationProps {
  className?: string
}

export function PremiumNavigation({ className }: PremiumNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = session ? [
    { name: 'Dashboard', href: '/dashboard', icon: <Settings className="w-4 h-4" /> },
    { name: 'Modelos', href: '/models', icon: <Users className="w-4 h-4" /> },
    { name: 'Gerar', href: '/generate', icon: <Camera className="w-4 h-4" /> },
    { name: 'Galeria', href: '/gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'Pacotes', href: '/packages', icon: <Package className="w-4 h-4" /> },
  ] : []

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        {
          'bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg': isScrolled,
          'bg-transparent': !isScrolled,
        },
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <VibePhotoLogo size="md" showText={true} />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {session.user?.plan || 'STARTER'}
                  </span>
                </motion.div>
                
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                      </div>
                    )}
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{session.user?.name}</p>
                      <p className="text-sm text-slate-600">{session.user?.email}</p>
                    </div>
                    <nav className="p-2">
                      <Link href="/billing" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">Minha Assinatura</span>
                      </Link>
                      <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">Configurações</span>
                      </Link>
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">Sair</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Entrar</Link>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2" 
                    asChild
                  >
                    <Link href="/auth/signup">
                      Começar Agora
                      <Sparkles className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-white/20"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Items */}
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {session ? (
                  <>
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <p className="font-semibold text-slate-900">{session.user?.name}</p>
                      <p className="text-sm text-purple-600">{session.user?.plan || 'STARTER'} Plan</p>
                    </div>
                    <Link href="/billing" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                      <CreditCard className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700">Minha Assinatura</span>
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-600">Sair</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/auth/signin">Entrar</Link>
                    </Button>
                    <Button className="w-full bg-gray-900 hover:bg-gray-800" asChild>
                      <Link href="/auth/signup">
                        Começar Agora
                        <Sparkles className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}