import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_URL ||
    "https://lms-express-api-o5uk.vercel.app/api/v1") + "/upload";

/**
 * Proxy upload ke backend Express tanpa melewati Next.js rewrites.
 * Next.js rewrites (next.config.js) meng-strip body multipart/form-data,
 * menyebabkan multer di backend tidak menerima file (file undefined → 400/500).
 * Route handler ini meneruskan FormData secara langsung ke backend.
 */
export async function POST(req: NextRequest) {
  try {
    // Ambil cookie dari request untuk dikirim ke backend (auth)
    const cookie = req.headers.get("cookie") ?? "";

    // Forward body as-is (FormData stream)
    const body = await req.blob();
    const contentType = req.headers.get("content-type") ?? "";

    const backendRes = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Cookie: cookie,
      },
      body,
    });

    const data = await backendRes.json().catch(() => ({}));

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[API/UPLOAD] Proxy error:", err);
    return NextResponse.json(
      { message: "Upload proxy gagal.", detail: String(err) },
      { status: 500 },
    );
  }
}
