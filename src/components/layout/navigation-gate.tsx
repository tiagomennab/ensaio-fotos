'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'

export function NavigationGate() {
  const { status } = useSession()
  const pathname = usePathname()

  // Don't show navigation for non-authenticated users
  if (status !== 'authenticated') return null

  // Don't show navigation on pricing page (indicates user doesn't have active subscription)
  if (pathname === '/pricing') return null

  return <Navigation />
}


