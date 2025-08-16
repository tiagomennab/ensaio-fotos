import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { NextAuthOptions } from 'next-auth'

export async function getSession() {
  return await getServerSession()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return session
}

export async function requirePlan(requiredPlan: 'PREMIUM' | 'GOLD') {
  const session = await requireAuth()
  
  const planHierarchy = {
    'FREE': 0,
    'PREMIUM': 1,
    'GOLD': 2
  }
  
  const userPlanLevel = planHierarchy[session.user.plan]
  const requiredPlanLevel = planHierarchy[requiredPlan]
  
  if (userPlanLevel < requiredPlanLevel) {
    redirect('/billing/upgrade')
  }
  
  return session
}