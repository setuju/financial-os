import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PAGES = new Set([
  '/', '/login', '/signup', '/reset', '/privacy', '/terms', '/legal', '/security', '/support',
]);
const PUBLIC_API = new Set(['/api/login', '/api/logout', '/api/signup']);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PAGES.has(pathname) || PUBLIC_API.has(pathname)) {
    return NextResponse.next();
  }

  if (/\.(svg|ico|png|jpg|jpeg|webp|gif|woff|woff2|ttf|otf)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const authed = Boolean(req.cookies.get('fos_session_id')?.value);
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
