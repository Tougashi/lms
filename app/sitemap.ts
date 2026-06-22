import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lms-woad-ten.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ─── Publik / Umum ────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/daftar`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/daftar-tutor`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tentang-kami`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/eksplor-modul`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },

    // ─── Modul (Publik / Siswa) ───────────────────────────────────────────────
    {
      url: `${BASE_URL}/modul`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // /modul/[slug] — representasi pola dinamis
    {
      url: `${BASE_URL}/modul/[slug]`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // /modul/[slug]/materi — ruang belajar / study room
    {
      url: `${BASE_URL}/modul/[slug]/materi`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // /modul/[slug]/sertifikat
    {
      url: `${BASE_URL}/modul/[slug]/sertifikat`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // ─── Pembayaran ───────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/pembayaran/[slug]`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // ─── Beranda (Authenticated) ──────────────────────────────────────────────
    {
      url: `${BASE_URL}/beranda-siswa`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/beranda-guru`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },

    // ─── Profil ───────────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/profil`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ─── Tutor / Guru — Manajemen Modul ──────────────────────────────────────
    {
      url: `${BASE_URL}/modul-guru`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/modul-guru/tambah`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/modul-guru/tambah/konten`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/modul-guru/tambah/harga`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/modul-guru/tambah/pre-post-test`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/modul-guru/tambah/profil`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/modul-guru/manajemen`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/modul-guru/manajemen/siswa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/modul-guru/ulasan`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },

    // ─── Admin — Dashboard ────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/admin`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/admin/dashboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },

    // ─── Admin — Manajemen Modul ──────────────────────────────────────────────
    {
      url: `${BASE_URL}/admin/manajemen-modul`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/admin/manajemen-modul/edit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/admin/manajemen-modul/edit/konten`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/admin/manajemen-modul/edit/prepost`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/admin/manajemen-modul/edit/siswa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/admin/manajemen-modul/siswa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },

    // ─── Admin — Tambah Modul ─────────────────────────────────────────────────
    {
      url: `${BASE_URL}/admin/tambah-modul`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/admin/tambah-modul/konten`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/tambah-modul/harga`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/tambah-modul/prepost`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/tambah-modul/siswa`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },

    // ─── Admin — Manajemen Pengguna ───────────────────────────────────────────
    {
      url: `${BASE_URL}/admin/manajemen-pengguna`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/admin/manajemen-pengguna/tambah-siswa`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/manajemen-pengguna/tambah-guru`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/manajemen-pengguna/tambah-admin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/manajemen-pengguna/edit-siswa`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/manajemen-pengguna/edit-guru`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/admin/manajemen-pengguna/edit-admin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },

    // ─── Admin — Nilai & Pengaturan ───────────────────────────────────────────
    {
      url: `${BASE_URL}/admin/nilai-siswa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/admin/setting`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
