import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/db/users'
import { Plan } from '@prisma/client'
import { getSubscriptionInfo, isSubscriptionActive } from '@/lib/subscription'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isValid = await verifyPassword(credentials.password, user.password)
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            plan: user.plan,
            creditsUsed: user.creditsUsed,
            creditsLimit: user.creditsLimit
          }
        } catch (error) {
          console.error('Database connection error during authentication:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.plan = user.plan
        token.creditsUsed = user.creditsUsed
        token.creditsLimit = user.creditsLimit
        // Subscription fields commented out for testing - no payment system active
        // @ts-ignore dynamic fields on token
        token.stripeCustomerId = null // (user as any).stripeCustomerId || null
        // @ts-ignore
        token.subscriptionId = null // (user as any).subscriptionId || null
        // @ts-ignore
        token.subscriptionStatus = null // (user as any).subscriptionStatus || null
        
        // Update lastLoginAt when user signs in (with error handling)
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() } as any
          })
        } catch (error) {
          console.error('Error updating lastLoginAt:', error)
          // Continue without failing authentication
        }
      }
      
      // For OAuth providers, create user with STARTER plan if first time (with error handling)
      if (account && user && !token.plan) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
          })
          
          if (dbUser) {
            token.plan = dbUser.plan
            token.creditsUsed = dbUser.creditsUsed
            token.creditsLimit = dbUser.creditsLimit
          }
        } catch (error) {
          console.error('Error fetching OAuth user plan:', error)
          // Continue with default values
        }
      }
      
      // Refresh subscription status on each JWT refresh (for real-time updates)
      if (token.sub) {
        try {
          const subscriptionInfo = await getSubscriptionInfo(token.sub)
          // @ts-ignore
          token.hasActiveSubscription = subscriptionInfo.hasActiveSubscription
          // @ts-ignore
          token.subscriptionStatus = subscriptionInfo.subscriptionStatus
          // @ts-ignore
          token.subscriptionId = subscriptionInfo.subscriptionId
          // @ts-ignore
          token.isInDevelopmentMode = subscriptionInfo.isInDevelopmentMode
        } catch (error) {
          console.error('Error refreshing subscription status in JWT:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.plan = token.plan as Plan
        session.user.creditsUsed = token.creditsUsed as number
        session.user.creditsLimit = token.creditsLimit as number
        // @ts-ignore surfaced billing fields - commented for testing
        session.user.stripeCustomerId = null // (token as any).stripeCustomerId || null
        // @ts-ignore
        session.user.subscriptionId = null // (token as any).subscriptionId || null
        // @ts-ignore
        session.user.subscriptionStatus = null // (token as any).subscriptionStatus || null
        // @ts-ignore enhanced subscription fields
        session.user.hasActiveSubscription = (token as any).hasActiveSubscription || false
        // @ts-ignore
        session.user.isInDevelopmentMode = (token as any).isInDevelopmentMode || false
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has a plan (with error handling)
      if (account?.provider !== 'credentials') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            // User will be created by Prisma adapter with STARTER plan (default)
            // New OAuth users should go to pricing page
            return `/pricing?newuser=true`
          } else {
            // Existing OAuth users - check if they have active subscription
            try {
              const subscriptionInfo = await getSubscriptionInfo(existingUser.id)
              if (!subscriptionInfo.hasActiveSubscription) {
                return `/pricing?required=true`
              }
            } catch (error) {
              console.error('Error checking subscription for OAuth user:', error)
              // Continue with normal sign in
            }
          }
        } catch (error) {
          console.error('Database error during OAuth signin:', error)
          // Continue with normal sign in
        }
      } else {
        // For credentials provider, also check subscription after successful login
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (existingUser) {
            const subscriptionInfo = await getSubscriptionInfo(existingUser.id)
            if (!subscriptionInfo.hasActiveSubscription) {
              return `/pricing?required=true`
            }
          }
        } catch (error) {
          console.error('Error checking subscription for credentials user:', error)
          // Continue with normal sign in
        }
      }
      return true
    }
  },
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }
  
  return session
}

// Separate function for API routes that returns JSON error instead of redirect
export async function requireAuthAPI() {
  const session = await getSession()
  
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized')
  }
  
  return session
}

export async function requirePlan(requiredPlan: 'PREMIUM' | 'GOLD') {
  const session = await requireAuth()
  
  const planHierarchy = {
    'STARTER': 0,
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