import { NextResponse, NextRequest } from 'next/server';

// Middleware to enforce no-cache headers on critical authentication and consent routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Critical paths that need aggressive cache prevention
  const criticalPaths = [
    '/login',
    '/meetings/new',
    '/consent',
    '/dashboard'
  ];

  // Check if current path is a critical path
  const isCriticalPath = criticalPaths.some(path => pathname.startsWith(path));

  if (isCriticalPath) {
    // Continue with the request but add aggressive cache prevention headers
    const response = NextResponse.next();

    // Add comprehensive cache prevention headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${Date.now()}"`);

    console.log(`[Middleware] Applied no-cache headers to critical path: ${pathname}`);
    return response;
  }

  // For non-critical paths, continue normally
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes are handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (sw.js, manifest.json, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)',
  ],
}