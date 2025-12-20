import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all API routes to pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Public paths that don't require authentication
  const publicPaths = ['/']
  
  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value

  // If no token, redirect to landing page
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verify token
  const user = verifyToken(token)
  
  // If token is invalid, redirect to landing page
  if (!user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && !user.isAdmin) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
