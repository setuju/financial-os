import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const sid = cookies().get('fos_session_id')?.value;
  if (!sid) {
    return Response.json({ error: 'no_session' }, { status: 401 });
  }
  return Response.json({ id: sid });
}
