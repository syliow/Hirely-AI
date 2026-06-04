import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set Security Headers

  // HSTS: Enforce HTTPS for 1 year
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // X-Frame-Options: Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options: Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy: Privacy (send full URL to same origin, origin only to others)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Disable sensitive features like camera, microphone, and geolocation
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
