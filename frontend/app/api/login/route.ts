import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let password = '';
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password ?? '';
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const expected = process.env.APP_PASSWORD ?? 'financial-os';
  if (!password || password !== expected) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('fos_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
