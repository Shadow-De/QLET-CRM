import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/settings']
const PROTECTED_API_PREFIXES = ['/api/leads', '/api/properties', '/api/growth', '/api/intake-links', '/api/agent']

// Public API routes (excluded from auth check)
const PUBLIC_API_ROUTES = ['/api/leads/public', '/api/auth']

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl

  // Check if this is a public API route
  const isPublicApi = PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))
  if (isPublicApi) return NextResponse.next()

  // Check if this is a protected API route
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (isProtectedApi) {
    if (!req.auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Check if this is a protected page route
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (isProtectedPage) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
