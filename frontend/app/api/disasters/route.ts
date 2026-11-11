import { NextResponse } from 'next/server';

interface FeedItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  type: 'earthquake' | 'news';
}

interface UsgsFeature {
  id: string;
  properties: {
    title: string;
    time: number;
    url: string;
  };
}

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const normalRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  const normalMatch = xml.match(normalRegex);
  return normalMatch ? normalMatch[1].trim() : '';
}

async function fetchGoogleNews(query: string, sourceName: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: FeedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;
    while ((match = itemRegex.exec(xml)) !== null && count < 1) {
      const itemXml = match[1];
      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link');
      const pubDate = extractTag(itemXml, 'pubDate');
      if (title && link) {
        items.push({
          id: `news-${sourceName.replace(/\s+/g, '-').toLowerCase()}-${count}`,
          title: title.replace(/ - .*$/, ''),
          source: sourceName,
          date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          url: link,
          type: 'news',
        });
        count++;
      }
    }
    return items;
  } catch { return []; }
}

async function fetchEarthquakes(): Promise<FeedItem[]> {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const features = (data.features || []) as UsgsFeature[];
    return features.slice(0, 3).map((f: UsgsFeature) => ({
      id: f.id,
      title: f.properties.title,
      source: 'USGS Earthquake Hazards Program',
      date: new Date(f.properties.time).toISOString(),
      url: f.properties.url,
      type: 'earthquake',
    }));
  } catch { return []; }
}

export async function GET() {
  const orgs = [
    { query: 'American Red Cross', name: 'American Red Cross' },
    { query: 'Direct Relief', name: 'Direct Relief' },
    { query: 'UNICEF', name: 'UNICEF' },
    { query: 'World Central Kitchen', name: 'World Central Kitchen' },
    { query: 'Water.org', name: 'Water.org' },
    { query: 'Doctors Without Borders', name: 'Doctors Without Borders' },
    { query: 'Rainforest Alliance', name: 'Rainforest Alliance' },
    { query: 'Save the Children', name: 'Save the Children' },
  ];

  const [earthquakes, ...newsResults] = await Promise.all([
    fetchEarthquakes(),
    ...orgs.map(o => fetchGoogleNews(o.query, o.name)),
  ]);

  const news = newsResults.flat();
  const combined = [...earthquakes, ...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ disasters: combined });
}
