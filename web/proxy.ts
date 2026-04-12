import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/availability']
const AUTH_ROUTES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api')) return NextResponse.next()

  const token = request.cookies.get('slotlock_auth')?.value

  if (AUTH_ROUTES.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (AUTH_ROUTES.includes(pathname)) return NextResponse.next() 

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/webpack|favicon.ico|.*\\..*).*)' 
  ],
}