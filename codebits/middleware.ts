import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Mandatory Authentication Gate for Studying PDFs, Contributing Materials or AI Question Solver
  // Without logging in, users CANNOT access /viewer, /upload, or /solver
  if (pathname.startsWith('/viewer') || pathname.startsWith('/upload') || pathname.startsWith('/solver')) {
    const token = request.cookies.get('codebits_token')?.value;
    if (!token) {
      const fullPath = pathname + (request.nextUrl.search || '');
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('redirect', fullPath);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('cb_intended_url', fullPath, {
        path: '/',
        maxAge: 60 * 15, // 15 minutes
        sameSite: 'lax',
      });
      return response;
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
  matcher: ['/', '/viewer/:path*', '/upload', '/solver/:path*'],
};
