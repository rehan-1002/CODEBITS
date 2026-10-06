import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Mandatory Authentication Gate for Studying PDFs or Contributing Materials
  // Without logging in, users CANNOT access /viewer or /upload
  if (pathname.startsWith('/viewer') || pathname.startsWith('/upload')) {
    const token = request.cookies.get('codebits_token')?.value;
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Root path ('/') First-Time vs Returning Visitor Routing
  if (pathname === '/') {
    // If the user explicitly requested to view the landing page via ?home=1 or ?story=1
    const explicitHome = searchParams.get('home') === '1' || searchParams.get('story') === '1';
    const hasVisited = request.cookies.get('cb_visited')?.value;

    if (explicitHome) {
      const response = NextResponse.next();
      if (!hasVisited) {
        response.cookies.set('cb_visited', 'true', {
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
          sameSite: 'lax',
        });
      }
      return response;
    }

    // 2nd visit onwards: redirect returning user directly to /about
    if (hasVisited === 'true') {
      const aboutUrl = request.nextUrl.clone();
      aboutUrl.pathname = '/about';
      return NextResponse.redirect(aboutUrl);
    }

    // 1st visit: allow landing page storytelling to render and set cookie for next time
    const response = NextResponse.next();
    response.cookies.set('cb_visited', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/viewer/:path*', '/upload'],
};
