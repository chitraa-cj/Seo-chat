import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value || ''

  // Handle root path redirection
  if (path === '/') {
    if (!token) {
      // If not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    } else {
      // If logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login'

  // Redirect logic for other paths
  if (!isPublicPath && !token) {
    // If trying to access a protected route without a token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicPath && token) {
    // If trying to access login with a token, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 