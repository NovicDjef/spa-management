import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques et API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')  // Fichiers avec extension (images, etc.)
  ) {
    return NextResponse.next();
  }

  console.log(`🌐 Middleware - Host: ${hostname}, Path: ${pathname}`);

  // Site marketing principal (dospa.ca ou www.dospa.ca)
  if (hostname === 'dospa.ca' || hostname === 'www.dospa.ca' || hostname === 'localhost:3000') {
    // Routes publiques du site marketing
    if (pathname === '/' || pathname.startsWith('/marketing') || pathname.startsWith('/signup')) {
      return NextResponse.next();
    }

    // Rediriger vers page marketing pour autres routes
    // TODO: Ajuster selon besoins, peut-être rediriger vers login si on essaie d'accéder à /admin sans sous-domaine
    if (pathname.startsWith('/professionnel') || pathname.startsWith('/admin')) {
        // Pour l'instant on redirige vers la home
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // Tenant subdomain (spa1.dospa.ca) ou custom domain (myspa.com)
  // Extraire le sous-domaine
  let tenantSlug = '';

  if (hostname.includes('dospa.ca')) {
    // Sous-domaine: spa1.dospa.ca
    tenantSlug = hostname.split('.dospa.ca')[0];
    if (tenantSlug === 'www' || tenantSlug === 'api') {
      // Ignorer www et api
      return NextResponse.next();
    }
  } else if (hostname.includes('localhost')) {
    // Mode développement local
    // Utiliser query param ?tenant=spa1 pour tester
    tenantSlug = request.nextUrl.searchParams.get('tenant') || 'sparenaissance';
  } else {
    // Domaine personnalisé (myspa.com)
    // Le tenant sera résolu côté API via le hostname
    tenantSlug = hostname;
  }

  // Attacher tenant info aux headers pour l'API
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-tenant-host', hostname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Ajouter cookie avec tenant slug pour utilisation client-side
  response.cookies.set('tenant-slug', tenantSlug, {
    httpOnly: false,  // Accessible en JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,  // 1 an
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - fichiers publics statiques (*.png, *.jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
