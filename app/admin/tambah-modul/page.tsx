'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { RiCustomerService2Line, RiHome5Fill } from 'react-icons/ri';
import { IoPersonCircle } from 'react-icons/io5';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import {
  FiFileText,
  FiDollarSign,
  FiLayers,
  FiCheckSquare,
  FiEdit2,
  FiBookOpen,
  FiUsers,
} from 'react-icons/fi';

/* ───────────────── shared classnames ───────────────── */

const inputClassName =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors';

const selectClassName =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] appearance-none transition-colors';

const textareaClassName =
  'mt-2 w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] resize-none transition-colors';

/* ───────────────── header ───────────────── */

function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-[#21212b]">
          NAMA WEB
        </Link>

        <nav className="hidden gap-10 sm:flex">
          <Link href="/beranda-siswa" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Beranda
          </Link>
          <Link href="/eksplor-modul" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Modul Saya
          </Link>
          <Link href="/admin/manajemen-pengguna" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Siswa
          </Link>
          <Link href="/tentang-kami" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Komunikasi
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full p-2 hover:bg-[#f7f6ff]" aria-label="Notifikasi">
            <FaBell size={20} className="text-[#21212b]" />
          </button>
          <button type="button" className="hidden rounded-full p-2 hover:bg-[#f7f6ff] sm:inline-flex" aria-label="Bantuan">
            <RiCustomerService2Line size={22} className="text-[#21212b]" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1 shadow-sm transition-colors hover:bg-[#f7f6ff]"
            aria-label="Buka menu profil"
          >
            <IoPersonCircle size={28} className="text-[#7054dc]" />
            <MdOutlineKeyboardArrowDown size={18} className="text-[#8a8a96]" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────────────── sidebar nav items ───────────────── */

type SidebarItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  href?: string;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: 'Rencanakan Modul anda',
    items: [
      { label: 'Profil Modul Anda', icon: <FiFileText size={13} />, active: true },
      { label: 'Penetapan Harga Modul', icon: <FiDollarSign size={13} /> },
    ],
  },
  {
    title: 'Konten Modul Anda',
    items: [
      { label: 'Konten Modul', icon: <FiLayers size={13} /> },
      { label: 'Pre - Post Test Modul', icon: <FiCheckSquare size={13} /> },
    ],
  },
  {
    title: 'Management Penguna',
    items: [
      { label: 'Management Siswa', icon: <FiUsers size={13} />, href: '/admin/tambah-modul/siswa' },
    ],
  },
];

/* ───────────────── main page ───────────────── */

export default function TambahModulAdminPage() {
  const [accessType, setAccessType] = useState<'siswa' | 'umum'>('siswa');
  const [prePostTest, setPrePostTest] = useState<'aktif' | 'tidak'>('aktif');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [deskripsiLen, setDeskripsiLen] = useState(0);
  const [pesanLen, setPesanLen] = useState(0);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />

      <main className="w-full">
        <div className="grid w-full lg:grid-cols-[240px_1fr]">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden border-r border-[#e5e3ee] bg-white px-5 py-6 lg:flex lg:min-h-[calc(100vh-74px)] lg:flex-col">
            {/* Dashboard Admin badge */}
            <Link
              href="/admin/dashboard"
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-xl border-2 border-[#f39b39] bg-[#fff8ef] px-3 py-1.5 text-[12px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e0]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#f39b39] text-white"><RiHome5Fill size={12} /></span>
              Dashboard Admin
            </Link>

            {/* Nav sections */}
            {sidebarSections.map((section, sIdx) => (
              <div key={sIdx} className={sIdx > 0 ? 'mt-7' : ''}>
                <p className="text-[13px] font-bold text-[#232530]">{section.title}</p>
                <nav className="mt-3 space-y-3 text-[13px]">
                  {section.items.map((item) => {
                    const cls = `flex w-full items-center gap-2 text-left transition-colors ${
                      item.active
                        ? 'font-semibold text-[#7054dc]'
                        : 'text-[#7a7e8a] hover:text-[#7054dc]'
                    }`;
                    return item.href ? (
                      <Link key={item.label} href={item.href} className={cls}>
                        {item.icon}
                        {item.label}
                      </Link>
                    ) : (
                      <button key={item.label} type="button" className={cls}>
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}

            {/* Bottom action buttons */}
            <div className="mt-auto space-y-2.5 pt-8">
              <button
                type="button"
                className="w-full rounded-full bg-[#7054dc] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc]"
              >
                Simpan
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-[#d8d3f0] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
              >
                Arsipkan Modul
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-[#f5c2be] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#f36e65] transition-colors hover:bg-[#fff3f2]"
              >
                Hapus Modul
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <section className="px-4 pb-10 pt-6 sm:px-8 lg:px-10">
            {/* Cover image upload */}
            <div className="flex flex-col items-center">
              <div className="rounded-[22px] border border-[#f0eff6] bg-white p-3 shadow-[0_8px_20px_rgba(20,20,30,0.06)]">
                <div className="relative h-[160px] w-[280px] overflow-hidden rounded-[18px] border border-[#e5e3ee] bg-[#f4f3ff] sm:h-[180px] sm:w-[320px]">
                  {coverPreview ? (
                    <Image
                      src={coverPreview}
                      alt="Preview cover modul"
                      width={320}
                      height={180}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src="/assets/images/beranda-siswa/matapelajaran.png"
                      alt="Cover modul"
                      width={320}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <label
                    htmlFor="admin-cover-upload"
                    className="absolute right-2 top-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#d9d7df] bg-white text-[#7054dc] shadow-sm transition-colors hover:bg-[#f5f2ff]"
                    aria-label="Edit cover"
                  >
                    <FiEdit2 size={13} />
                  </label>
                  <input
                    id="admin-cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const nextUrl = URL.createObjectURL(file);
                      setCoverPreview((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return nextUrl;
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="mx-auto mt-8 max-w-[720px]">
              {/* Judul Modul */}
              <div>
                <label className="text-[13px] font-bold text-[#232530]">Judul Modul</label>
                <input
                  type="text"
                  defaultValue="Biologi"
                  placeholder="Masukkan judul modul"
                  className={inputClassName}
                />
                <p className="mt-1 text-[11px] text-[#7e8290]">
                  Judul sebaiknya menarik perhatian, informatif, dan dioptimalkan untuk penelusuran
                </p>
              </div>

              {/* Subtitle + Guru Modul row */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Subtitle Kursus</label>
                  <input
                    type="text"
                    defaultValue="Biologi, IPA, Tumbuhan, Zat"
                    placeholder="Masukkan subtitle"
                    className={inputClassName}
                  />
                  <p className="mt-1 text-[11px] text-[#7e8290]">
                    Gunakan 1 atau 2 kata kunci terkait, dan sebutkan 3-4 area terpenting yang telah Anda bahas sepanjang kursus Anda.
                  </p>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Guru Modul</label>
                  <select className={selectClassName} defaultValue="">
                    <option value="" disabled>Pilih Guru</option>
                    <option>Aryanti Yusi S.Pd</option>
                    <option>Yinar Susi S.Pd</option>
                    <option>Budi Santoso S.Pd</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">
                    Pilih Guru untuk Modul ini
                  </p>
                </div>
              </div>

              {/* Deskripsi Kursus */}
              <div className="mt-5">
                <label className="text-[13px] font-bold text-[#232530]">Deskripsi Kursus</label>
                <textarea
                  rows={5}
                  defaultValue="Selamat datang di perjalanan eksplorasi bioproses yang akan mengungkap rahasia kehidupan dari skala terkecil hingga sistem organ yang kompleks! Dalam materi Biologi Kelas 11 ini, kamu tidak hanya sekadar menghafal, tetapi akan diajak menelusuri mekanisme kerja sel sebagai unit fundamental kehidupan, memahami struktur ajaib jaringan tumbuhan, hingga mengupas tuntas cara kerja sistem tubuh manusia mulai dari sirkulasi darah hingga sistem pertahanan tubuh (imunitas)."
                  placeholder="Masukkan deskripsi kursus ..."
                  className={textareaClassName}
                  maxLength={200}
                  onChange={(e) => setDeskripsiLen(e.target.value.length)}
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
                  <span>Deskripsikan kursus anda secara singkat</span>
                  <span>{deskripsiLen}/200</span>
                </div>
              </div>

              {/* Pilih Akses */}
              <div className="mt-5">
                <p className="text-[13px] font-bold text-[#232530]">Pilih Akses</p>
                <div className="mt-2 flex items-center gap-6 text-[13px] text-[#6e7280]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="akses"
                      checked={accessType === 'siswa'}
                      onChange={() => setAccessType('siswa')}
                      className="h-4 w-4 accent-[#7054dc]"
                    />
                    Siswa
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="akses"
                      checked={accessType === 'umum'}
                      onChange={() => setAccessType('umum')}
                      className="h-4 w-4 accent-[#7054dc]"
                    />
                    Umum
                  </label>
                </div>
              </div>

              {/* Jenjang + Kelas (only for siswa) */}
              {accessType === 'siswa' && (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[13px] font-bold text-[#232530]">Jenjang Sekolah</label>
                      <select className={selectClassName} defaultValue="">
                        <option value="" disabled>Pilih Jenjang</option>
                        <option>SD</option>
                        <option>SMP</option>
                        <option>SMA</option>
                      </select>
                      <p className="mt-1 text-[11px] text-[#7e8290]">Sebutkan kurikulum modul anda</p>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-[#232530]">Kelas</label>
                      <select className={selectClassName} defaultValue="">
                        <option value="" disabled>Pilih Tingkatan Kelas</option>
                        <option>Kelas 4</option>
                        <option>Kelas 5</option>
                        <option>Kelas 6</option>
                        <option>Kelas 10</option>
                        <option>Kelas 11</option>
                        <option>Kelas 12</option>
                      </select>
                      <p className="mt-1 text-[11px] text-[#7e8290]">Berapa lama pengerjaan modul ini bagi siswa</p>
                    </div>
                  </div>

                  {/* Pesan yang akan dipelajari siswa */}
                  <div className="mt-5">
                    <label className="text-[13px] font-bold text-[#232530]">Pesan Yang Akan Dipelajari Siswa</label>
                    <textarea
                      rows={4}
                      placeholder="Masukkan teks ...."
                      className={textareaClassName}
                      maxLength={200}
                      onChange={(e) => setPesanLen(e.target.value.length)}
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
                      <span>Point Point yang akan dipelajari siswa di modul anda</span>
                      <span>{pesanLen}/200</span>
                    </div>
                  </div>
                </>
              )}

              {/* Level Kesulitan */}
              <div className="mt-5">
                <label className="text-[13px] font-bold text-[#232530]">Level Kesulitan</label>
                <select className={selectClassName} defaultValue="">
                  <option value="" disabled>Pilih level kesulitan</option>
                  <option>Mudah</option>
                  <option>Menengah</option>
                  <option>Sulit</option>
                </select>
                <p className="mt-1 text-[11px] text-[#7e8290]">
                  Level kesulitan yang sesuai dengan isi modul
                </p>
              </div>

              {/* Durasi Pembelajaran */}
              <div className="mt-5">
                <label className="text-[13px] font-bold text-[#232530]">Durasi Pembelajaran</label>
                <input
                  type="text"
                  placeholder="Masukkan durasi pembelajaran"
                  className={inputClassName}
                />
                <p className="mt-1 text-[11px] text-[#7e8290]">
                  Durasi pembelajaran modul yang diakses siswa merupakan materi selama beberapa waktu
                </p>
              </div>

              {/* Pre-Test dan Post-Test */}
              <div className="mt-5">
                <p className="text-[13px] font-bold text-[#232530]">Pre-Test dan Post-Test</p>
                <div className="mt-2 flex items-center gap-6 text-[13px] text-[#6e7280]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="prepost"
                      checked={prePostTest === 'aktif'}
                      onChange={() => setPrePostTest('aktif')}
                      className="h-4 w-4 accent-[#7054dc]"
                    />
                    Aktif
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="prepost"
                      checked={prePostTest === 'tidak'}
                      onChange={() => setPrePostTest('tidak')}
                      className="h-4 w-4 accent-[#7054dc]"
                    />
                    Tidak Aktif
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="h-[44px] w-[240px] rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc]"
                >
                  Simpan
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
