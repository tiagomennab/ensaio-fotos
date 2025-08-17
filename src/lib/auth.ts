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
          name: user.name,
          plan: user.plan,
          creditsUsed: user.creditsUsed,
          creditsLimit: user.creditsLimit
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
        
        // Update lastLoginAt when user signs in
        // NOTE: After applying migration_fix_inconsistencies.sql, run: npx prisma generate
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() } as any
        })
      }
      
      // For OAuth providers, create user with FREE plan if first time
      if (account && user && !token.plan) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })
        
        if (dbUser) {
          token.plan = dbUser.plan
          token.creditsUsed = dbUser.creditsUsed
          token.creditsLimit = dbUser.creditsLimit
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
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has a plan
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        if (!existingUser) {
          // User will be created by Prisma adapter with FREE plan (default)
          return true
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