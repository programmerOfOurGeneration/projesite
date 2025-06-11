import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')

  // Yetkilendirme gerektiren sayfalar
  const protectedPaths = ['/admin', '/sohbet']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Auth sayfaları için kontrol
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Korumalı sayfalar için kontrol
  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin sayfaları için ek kontrol
    if (request.nextUrl.pathname.startsWith('/admin') && !token.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/admin/:path*',
    '/sohbet/:path*'
  ]
}
