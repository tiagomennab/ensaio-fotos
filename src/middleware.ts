import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Simple middleware for basic auth checks
// Rate limiting moved to API routes to avoid Edge Runtime issues with Prisma
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  try {
    // Get user session for protected routes
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Protect dashboard and other authenticated routes
    const protectedPaths = ['/dashboard', '/models', '/generate', '/billing', '/gallery']
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    if (isProtectedPath && !token) {
      // Redirect to sign in for protected routes
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user has active plan for premium features
    if (token && isProtectedPath) {
      const userPlan = token.plan as string
      
      // Allow access to billing pages for plan management
      if (pathname.startsWith('/billing')) {
        return NextResponse.next()
      }
      
      // Redirect users without active plan to pricing page
      if (!userPlan || userPlan === 'FREE' || userPlan === 'TRIAL') {
        const pricingUrl = new URL('/pricing', request.url)
        pricingUrl.searchParams.set('required', 'true')
        return NextResponse.redirect(pricingUrl)
      }
    }

    // Add basic security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}