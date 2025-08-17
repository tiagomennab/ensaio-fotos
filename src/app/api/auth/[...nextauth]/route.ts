import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/db/users'
import { Plan } from '@prisma/client'

const handler = NextAuth({
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

        const isPasswordValid = await verifyPassword(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.avatar || undefined,
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
      if (session.user) {
        session.user.id = token.sub!
        session.user.plan = token.plan as Plan || Plan.FREE
        session.user.creditsUsed = token.creditsUsed as number || 0
        session.user.creditsLimit = token.creditsLimit as number || 10
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has default plan
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        if (!existingUser) {
          // Will be created by Prisma adapter with default values
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
    signUp: '/auth/signup',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }