import { Plan } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      plan: Plan
      creditsUsed: number
      creditsLimit: number
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    image?: string
    plan: Plan
    creditsUsed: number
    creditsLimit: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    plan: Plan
    creditsUsed: number
    creditsLimit: number
  }
}