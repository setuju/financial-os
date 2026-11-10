import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  for (const k of ['fos_session_id', 'fos_name', 'fos_is_admin', 'fos_auth']) {
    res.cookies.set(k, '', { maxAge: 0, path: '/' });
  }
  return res;
}
