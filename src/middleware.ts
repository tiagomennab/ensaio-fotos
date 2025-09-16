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

    // Check if this is an API route
    const isApiRoute = pathname.startsWith('/api/')
    
    // Protect dashboard and other authenticated routes
    const protectedPaths = ['/dashboard', '/models', '/generate', '/billing', '/gallery']
    const protectedApiPaths = ['/api/generations', '/api/models', '/api/gallery', '/api/media', '/api/upscale', '/api/video']
    
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
    const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path))

    if ((isProtectedPath || isProtectedApiPath) && !token) {
      if (isApiRoute) {
        // Return JSON error for API routes
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      } else {
        // Redirect to sign in for web routes
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Check if user has active plan for premium features
    if (token && (isProtectedPath || isProtectedApiPath)) {
      const userPlan = token.plan as string
      
      // Allow access to billing pages for plan management
      if (pathname.startsWith('/billing')) {
        return NextResponse.next()
      }
      
      // Check if user needs a premium plan
      if (!userPlan || userPlan === 'FREE' || userPlan === 'TRIAL') {
        if (isApiRoute || isProtectedApiPath) {
          // Return JSON error for API routes
          return NextResponse.json(
            { 
              error: 'Premium plan required', 
              code: 'PLAN_REQUIRED',
              userPlan: userPlan || 'FREE',
              upgradeUrl: '/pricing'
            },
            { status: 403 }
          )
        } else {
          // Redirect to pricing page for web routes
          const pricingUrl = new URL('/pricing', request.url)
          pricingUrl.searchParams.set('required', 'true')
          return NextResponse.redirect(pricingUrl)
        }
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