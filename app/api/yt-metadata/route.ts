import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch YouTube page' }, { status: response.status });
    }

    const html = await response.text();
    
    // Extract duration from <meta itemprop="duration" content="PT4M55S">
    const durationMatch = html.match(/itemprop="duration" content="([^"]+)"/i);
    const duration = durationMatch ? durationMatch[1] : null;

    // Extract title from <meta name="title" content="..."> or <title>
    const titleMatch = html.match(/<meta name="title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : null;

    return NextResponse.json({
      duration,
      title
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
