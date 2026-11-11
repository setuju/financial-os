import { NextResponse } from 'next/server';
import { Channel3 } from '@channel3/sdk';

const client = new Channel3({
  apiKey: process.env.CHANNEL3_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query, limit = 5 } = await req.json();
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

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
  } catch (error) {
    console.error('Channel3 Search Error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
