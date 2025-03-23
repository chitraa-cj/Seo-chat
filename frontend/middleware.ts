import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/'

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value || ''

  // Redirect logic
  if (!isPublicPath && !token) {
    // If trying to access a protected route without a token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicPath && token) {
    // If trying to access login/register with a token, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/seo-agent/:path*',
    // Add other protected routes here
  ]
} 