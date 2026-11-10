import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  let name = '';
  let password = '';
  try {
    const body = (await req.json()) as { name?: string; password?: string };
    name = String(body.name ?? '').trim();
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!name || !password) {
    return NextResponse.json({ error: 'name_and_password_required' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/demo/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, password }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return NextResponse.json({ error: 'backend_unreachable' }, { status: 502 });
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (data as { error?: string }).error ?? 'invalid_credentials' },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as {
    sessionId: string;
    name: string;
    is_admin: boolean;
  };

  const res = NextResponse.json({ ok: true, name: data.name });
  const common = { path: '/', sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: SEVEN_DAYS };
  res.cookies.set('fos_session_id', data.sessionId, { ...common, httpOnly: true });
  res.cookies.set('fos_name', data.name, common);
  res.cookies.set('fos_is_admin', data.is_admin ? '1' : '0', common);
  return res;
}
