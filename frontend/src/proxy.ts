import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/constants';

const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
});

// Malicious scanner paths & injection probes blocked immediately at Edge
const BLOCKED_PATH_PATTERNS = [
  /\.env/i,
  /\.git/i,
  /\.htaccess/i,
  /wp-admin/i,
  /wp-login/i,
  /wp-content/i,
  /phpmyadmin/i,
  /xmlrpc\.php/i,
  /\.php$/i,
  /\.asp$/i,
  /\.aspx$/i,
  /etc\/passwd/i,
  /\.\.[\/\\]/,
  /%2e%2e/i,
  /frontend\/data\//i,
];

const BLOCKED_QUERY_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /union\s+(all\s+)?select/i,
  /information_schema/i,
  /benchmark\s*\(/i,
  /sleep\s*\(\s*\d/i,
];

const PUBLIC_ADMIN_AUTH_ENDPOINTS = ['/api/v1/admin/auth'];

function applySecurityHeaders(response: NextResponse, pathname: string): NextResponse {
  const isDev = process.env.NODE_ENV !== 'production';

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // Content Security Policy tuned to protect against XSS while allowing Google Fonts, Nominatim Geocoding & Next.js
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";
  const connectSrc = isDev
    ? "connect-src 'self' https://nominatim.openstreetmap.org http://localhost:* ws://localhost:*"
    : "connect-src 'self' https://nominatim.openstreetmap.org";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob:",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent browser & proxy caching on Admin Dashboard and API endpoints
  if (pathname.startsWith('/admin') || pathname.startsWith('/ar/admin') || pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Block vulnerability scanners, path traversal, and XSS/SQLi query probes
  const decodedSearch = (() => {
    try {
      return decodeURIComponent(search);
    } catch {
      return search;
    }
  })();

  if (
    BLOCKED_PATH_PATTERNS.some((rx) => rx.test(pathname)) ||
    BLOCKED_QUERY_PATTERNS.some((rx) => rx.test(decodedSearch) || rx.test(pathname))
  ) {
    return new NextResponse(
      JSON.stringify({ message: 'Forbidden — Blocked by L’VENUS Security Shield' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. API Security Layer (CSRF Origin Check + Early Admin Cookie Gate)
  if (pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase();
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (isMutating) {
      // Check Sec-Fetch-Site against cross-site CSRF attacks
      const secFetchSite = request.headers.get('sec-fetch-site');
      if (secFetchSite === 'cross-site') {
        return NextResponse.json(
          { message: 'CSRF Violation — Cross-origin mutations are prohibited' },
          { status: 403 }
        );
      }

      // Check Origin header matches Host when present
      const origin = request.headers.get('origin');
      const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
      const host = rawHost ? rawHost.split(',')[0].trim() : null;
      if (origin && host) {
        try {
          const originHost = new URL(origin).host.toLowerCase();
          const expectedHost = host.toLowerCase();
          if (originHost !== expectedHost) {
            return NextResponse.json(
              { message: 'CSRF Violation — Origin mismatch' },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json({ message: 'Invalid Origin header' }, { status: 403 });
        }
      }
    }

    // Early Edge Gate on /api/v1/admin/* (except auth login/status endpoint)
    if (
      pathname.startsWith('/api/v1/admin/') &&
      !PUBLIC_ADMIN_AUTH_ENDPOINTS.some((pub) => pathname.startsWith(pub))
    ) {
      const adminCookie = request.cookies.get('lv_admin_session')?.value;
      if (!adminCookie || !adminCookie.includes('.')) {
        return NextResponse.json(
          { message: 'Unauthorized — Admin session required' },
          { status: 401 }
        );
      }
    }

    const apiResponse = NextResponse.next();
    return applySecurityHeaders(apiResponse, pathname);
  }

  // 3. Frontend Localized Pages via next-intl
  const response = intlMiddleware(request);
  return applySecurityHeaders(response, pathname);
}

export const config = {
  // Run security middleware on all pages & API routes, skipping purely static bundles
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|brand/).*)'],
};
