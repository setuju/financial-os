/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/app/api/proxy/[...path]/route.ts
 * │  Purpose   : Route
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

import { NextRequest } from 'next/server';

// Server-only: reads API_URL from Vercel env (not exposed to browser).
// Client-side callers hit /api/proxy/* which lands here (same origin,
// no CORS), and this handler forwards to the Render backend.
const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const UPSTREAM_TIMEOUT_MS = 60_000;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handle(
  req: NextRequest,
  ctx: { params: { path: string[] } },
): Promise<Response> {
  const path = ctx.params.path.join('/');
  const search = req.nextUrl.search;
  const target = `${API_URL}/${path}${search}`;

  const headers = new Headers();
  const ct = req.headers.get('content-type');
  if (ct) headers.set('content-type', ct);

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    body = await req.text();
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const respHeaders = new Headers();
    const respCt = upstream.headers.get('content-type');
    if (respCt) respHeaders.set('content-type', respCt);

    return new Response(upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: 'upstream_unreachable', message }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as DELETE,
  handle as OPTIONS,
};
