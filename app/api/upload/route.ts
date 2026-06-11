import { NextRequest, NextResponse } from 'next/server';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lms-express-api-o5uk.vercel.app';

// Normalise: ensure we always append /api/v1 exactly once
const getApiBase = () => {
  const base = API_BASE.replace(/\/$/, '');
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
};

export async function POST(request: NextRequest) {
  try {
    const apiUrl = `${getApiBase()}/upload`;

    // Forward the raw FormData body to the backend
    const formData = await request.formData();

    // Build headers — forward cookies for auth, but let fetch set Content-Type
    const headers: Record<string, string> = {};
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;

    const backendRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData,
      // @ts-expect-error — Node18 fetch supports duplex
      duplex: 'half',
    });

    const data = await backendRes.json().catch(() => ({}));

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: unknown) {
    console.error('[upload proxy] error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Upload gagal' },
      { status: 500 },
    );
  }
}
