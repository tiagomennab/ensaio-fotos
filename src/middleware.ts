import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { RateLimiter } from '@/lib/security/rate-limiter'
import { ContentModerator } from '@/lib/security/content-moderator'

// Security middleware for rate limiting and content moderation
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
    // Get user session
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Rate limiting for authenticated users
    if (token?.sub) {
      const userId = token.sub
      const userPlan = (token.plan as 'FREE' | 'PREMIUM' | 'GOLD') || 'FREE'

      // Check if user is blocked
      const blockStatus = await RateLimiter.isUserBlocked(userId)
      if (blockStatus.isBlocked) {
        return new NextResponse(
          JSON.stringify({
            error: 'User blocked',
            reason: blockStatus.reason,
            unblockTime: blockStatus.unblockTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': blockStatus.unblockTime 
                ? Math.ceil((blockStatus.unblockTime.getTime() - Date.now()) / 1000).toString()
                : '3600'
            }
          }
        )
      }

      // Rate limit API calls
      if (pathname.startsWith('/api/')) {
        const limit = await RateLimiter.checkLimit(userId, 'api', userPlan)
        
        if (!limit.allowed) {
          // Record violation
          await RateLimiter.recordAttempt(userId, 'api', {
            violation: true,
            ip: request.ip,
            userAgent: request.headers.get('user-agent'),
            path: pathname
          })

          return new NextResponse(
            JSON.stringify({
              error: 'Rate limit exceeded',
              limit: limit.limit,
              resetTime: limit.resetTime,
              retryAfter: limit.retryAfter
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': limit.limit.toString(),
                'X-RateLimit-Remaining': limit.remaining.toString(),
                'X-RateLimit-Reset': limit.resetTime.toISOString(),
                'Retry-After': limit.retryAfter?.toString() || '3600'
              }
            }
          )
        }

        // Record successful attempt
        await RateLimiter.recordAttempt(userId, 'api', {
          ip: request.ip,
          userAgent: request.headers.get('user-agent'),
          path: pathname
        })

        // Add rate limit headers to response
        const response = NextResponse.next()
        response.headers.set('X-RateLimit-Limit', limit.limit.toString())
        response.headers.set('X-RateLimit-Remaining', limit.remaining.toString())
        response.headers.set('X-RateLimit-Reset', limit.resetTime.toISOString())
        
        return response
      }
    }

    // Rate limiting for unauthenticated users (stricter limits)
    if (!token && pathname.startsWith('/api/')) {
      const ip = request.ip || 'unknown'
      const limit = await RateLimiter.checkLimit(ip, 'api', 'FREE')
      
      if (!limit.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Please sign in for higher rate limits'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': limit.retryAfter?.toString() || '900'
            }
          }
        )
      }

      await RateLimiter.recordAttempt(ip, 'api', {
        unauthenticated: true,
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        path: pathname
      })
    }

    return NextResponse.next()
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