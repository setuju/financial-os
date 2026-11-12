import { NextResponse } from 'next/server';
import { Channel3 } from '@channel3/sdk';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.CHANNEL3_API_KEY;
    console.log('[Channel3 API] Key present:', !!apiKey, '| Prefix:', apiKey?.slice(0, 5));

    if (!apiKey) {
      return NextResponse.json({ error: 'CHANNEL3_API_KEY is missing in Vercel' }, { status: 503 });
    }

    const { query, limit = 5 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const client = new Channel3({ apiKey });

    const page = await client.products.search({
      query,
      limit,
      config: { country: 'US', currency: 'USD' },
    });

    // SDK mengembalikan objek Page (Async Iterable)
    const products = [];
    for await (const product of page) {
      products.push(product);
      if (products.length >= limit) break;
    }

    console.log('[Channel3 API] Found products:', products.length);

    return NextResponse.json({ products });
  } catch (error: unknown) {
    console.error('[Channel3 API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search products' }, 
      { status: 500 }
    );
  }
}
