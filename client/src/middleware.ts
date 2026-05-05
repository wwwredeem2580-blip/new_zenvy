import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const path = request.nextUrl.pathname;

  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect agent routes
  if (path.startsWith('/agent')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect profile routes
  if (path.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/agent/:path*', '/profile/:path*'],
};
