import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function POST() {
  const sid = cookies().get('fos_session_id')?.value;
  if (!sid) {
    return NextResponse.json({ error: 'session_required' }, { status: 401 });
  }
  try {
    const upstream = await fetch(`${API_URL}/demo/reset`, {
      method: 'POST',
      headers: { 'x-session-id': sid },
      signal: AbortSignal.timeout(60_000),
    });
    if (!upstream.ok) {
      const data = await upstream.json().catch(() => ({}));
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? 'reset_failed' },
        { status: upstream.status },
      );
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'backend_unreachable' }, { status: 502 });
  }
}
