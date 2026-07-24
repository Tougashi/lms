import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch YouTube page" },
        { status: response.status }
      );
    }

    const html = await response.text();

    // 1. Try to extract from <meta itemprop="duration" content="PT4M55S">
    let durationMatch = html.match(/itemprop="duration" content="([^"]+)"/i);
    let duration = durationMatch ? durationMatch[1] : null;

    // 2. Try to extract from "lengthSeconds":"..." in ytInitialPlayerResponse
    if (!duration) {
      const lengthSecondsMatch = html.match(/"lengthSeconds":"(\d+)"/);
      if (lengthSecondsMatch) {
        duration = lengthSecondsMatch[1]; // Will be parsed by parseYouTubeDuration
      }
    }

    // Extract title
    const titleMatch =
      html.match(/<meta name="title" content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1] : null;
    
    if (title && title.endsWith(" - YouTube")) {
      title = title.replace(" - YouTube", "");
    }

    return NextResponse.json({
      title,
      duration,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
