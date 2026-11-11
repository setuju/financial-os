import { NextResponse } from 'next/server';

interface UsgsFeature {
  id: string;
  properties: {
    title: string;
    place: string;
    time: number;
    url: string;
    mag: number;
  };
}

export async function GET() {
  try {
    // Mengambil gempa signifikan 30 hari terakhir dari USGS
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error('Failed to fetch from USGS');
    
    const data = await res.json();
    const disasters = data.features?.slice(0, 5).map((item: UsgsFeature) => ({
      id: item.id,
      title: item.properties.title,
      source: 'USGS Earthquake Hazards Program',
      date: new Date(item.properties.time).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      url: item.properties.url,
    })) || [];
    
    return NextResponse.json({ disasters });
  } catch (error) {
    console.error('Disaster API Error:', error);
    return NextResponse.json({ disasters: [] }, { status: 500 });
  }
}
