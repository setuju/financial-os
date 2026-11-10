import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PAGES = new Set([
  '/', '/login', '/privacy', '/terms', '/legal', '/security', '/support',
]);
const PUBLIC_API = new Set(['/api/login', '/api/logout']);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PAGES.has(pathname) || PUBLIC_API.has(pathname)) {
    return NextResponse.next();
  }

  if (/\.(svg|ico|png|jpg|jpeg|webp|gif|woff|woff2|ttf|otf)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const authed = req.cookies.get('fos_auth')?.value === 'ok';
  if (authed) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
