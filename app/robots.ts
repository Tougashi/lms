import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lms-woad-ten.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/daftar',
          '/daftar-tutor',
          '/tentang-kami',
          '/eksplor-modul',
          '/modul',
        ],
        disallow: [
          '/admin/',
          '/beranda-siswa/',
          '/beranda-guru/',
          '/profil/',
          '/pembayaran/',
          '/api/',
          '/api-backend/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
