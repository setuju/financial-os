/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/app/api/channel3/search/route.ts
 * │  Purpose   : Proxy for Channel3 Product Search
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  Created   : 12-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 */
import { NextResponse } from 'next/server';
import { Channel3 } from '@channel3/sdk';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.CHANNEL3_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'CHANNEL3_API_KEY is missing in Vercel' }, { status: 503 });
    }

    const { query, limit = 5 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Inisialisasi di dalam handler untuk mencegah crash saat load
    const client = new Channel3({ apiKey });

    const page = await client.products.search({
      query,
      limit,
      config: { country: 'US', currency: 'USD' },
    });

    const products = [];
    for await (const product of page) {
      products.push(product);
      if (products.length >= limit) break;
    }

    return NextResponse.json({ products });
  } catch (error: unknown) {
    console.error('Channel3 Search Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search products' }, 
      { status: 500 }
    );
  }
}
