import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.reliefweb.int/v2/reports?appname=financial-os-demo&limit=5&preset=latest',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error('Failed to fetch from ReliefWeb');
    const data = await res.json();
    const disasters = data.data?.map((item: any) => ({
      id: item.id,
      title: item.fields.title,
      source: item.fields.source?.[0]?.name || 'Unknown Source',
      date: new Date(item.fields.date.created).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      url: item.fields.url,
    })) || [];
    return NextResponse.json({ disasters });
  } catch (error) {
    console.error('Disaster API Error:', error);
    return NextResponse.json({ disasters: [] }, { status: 500 });
  }
}
