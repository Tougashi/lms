'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';

import GuruHeader from '../../component/guru/GuruHeader';

type Siswa = {
  id: number;
  name: string;
  progress: number;
  preTest: number;
  postTest: number;
  rataKuis: number;
  rekomendasi: 'penguatan' | 'remedial' | 'pengayaan';
};

const allSiswa: Siswa[] = [
  { id: 1, name: 'Olivia Rodrigo', progress: 80, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'penguatan' },
  { id: 2, name: 'Nica Jesslyn', progress: 70, preTest: 50, postTest: 60, rataKuis: 40.5, rekomendasi: 'remedial' },
  { id: 3, name: 'Jonathan Putra', progress: 80, preTest: 80, postTest: 100, rataKuis: 90, rekomendasi: 'pengayaan' },
  { id: 4, name: 'Cleona Kagumi', progress: 80, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'penguatan' },
  { id: 5, name: 'Sabine Lituhayu', progress: 70, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'penguatan' },
  { id: 6, name: 'Raden Putra Adams', progress: 30, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'remedial' },
  { id: 7, name: 'Marissa Jesslyn', progress: 100, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'pengayaan' },
  { id: 8, name: 'Jojo Jonathan', progress: 90, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'pengayaan' },
  { id: 9, name: 'Olivia Rodrigo', progress: 70, preTest: 70, postTest: 100, rataKuis: 82.5, rekomendasi: 'penguatan' },
  { id: 10, name: 'Raden', progress: 100, preTest: 100, postTest: 100, rataKuis: 100, rekomendasi: 'pengayaan' },
  { id: 11, name: 'Sari Dewi', progress: 60, preTest: 55, postTest: 70, rataKuis: 60, rekomendasi: 'remedial' },
  { id: 12, name: 'Budi Santoso', progress: 85, preTest: 80, postTest: 95, rataKuis: 88, rekomendasi: 'pengayaan' },
  { id: 13, name: 'Anisa Rahma', progress: 75, preTest: 65, postTest: 80, rataKuis: 72, rekomendasi: 'penguatan' },
  { id: 14, name: 'Dimas Arya', progress: 45, preTest: 40, postTest: 55, rataKuis: 48, rekomendasi: 'remedial' },
  { id: 15, name: 'Putri Ayu', progress: 90, preTest: 85, postTest: 100, rataKuis: 92, rekomendasi: 'pengayaan' },
  { id: 16, name: 'Rizki Fauzan', progress: 65, preTest: 60, postTest: 75, rataKuis: 68, rekomendasi: 'penguatan' },
  { id: 17, name: 'Maya Salsabila', progress: 55, preTest: 50, postTest: 65, rataKuis: 55, rekomendasi: 'remedial' },
  { id: 18, name: 'Fajar Nugroho', progress: 95, preTest: 90, postTest: 100, rataKuis: 95, rekomendasi: 'pengayaan' },
  { id: 19, name: 'Lina Kartika', progress: 70, preTest: 65, postTest: 80, rataKuis: 72, rekomendasi: 'penguatan' },
  { id: 20, name: 'Andi Pratama', progress: 40, preTest: 35, postTest: 50, rataKuis: 42, rekomendasi: 'remedial' },
];

const PER_PAGE = 10;

const rekomendasiConfig = {
  penguatan: { label: 'Perlu Penguatan', bg: 'bg-[#e8f4fc]', text: 'text-[#2a7fbf]', icon: '📘' },
  remedial: { label: 'Perlu Remedial', bg: 'bg-[#fdeaea]', text: 'text-[#d63c3c]', icon: '🔴' },
  pengayaan: { label: 'Siap Pengayaan', bg: 'bg-[#e6f9ed]', text: 'text-[#2a9d5c]', icon: '💚' },
};

export default function ManajemenModulPage() {
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'penguatan' | 'remedial' | 'pengayaan' | null>(null);
  const [page, setPage] = useState(1);
  const [showStudents] = useState(true);

  const filtered = allSiswa
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => !activeFilter || s.rekomendasi === activeFilter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link href="/modul-guru" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530]">
          <span>←</span> Kembali ke Halaman Modul
        </Link>

        <div className="mt-4 flex flex-col items-start gap-4 sm:mt-6 sm:flex-row sm:gap-6">
          <div className="hidden h-[100px] w-[130px] shrink-0 overflow-hidden rounded-2xl bg-[#d4f0f7] sm:block sm:h-[140px] sm:w-[180px]">
            <Image
              src="/assets/images/beranda-siswa/matapelajaran.png"
              alt="Biologi"
              width={180}
              height={140}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#232530] sm:text-[22px]">Biologi</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5a5d6a] sm:gap-x-4 sm:text-[12px]">
              <span className="flex items-center gap-1">📘 4 Topik</span>
              <span className="flex items-center gap-1">📋 15 Materi</span>
              <span className="flex items-center gap-1">⏱ 10 Jam 15 Menit</span>
              <span className="flex items-center gap-1">✅ 4 Kuis</span>
              <span className="flex items-center gap-1">📅 Materi dalam 6 Bulan</span>
              <span className="flex items-center gap-1">📄 Sertifikat</span>
            </div>
            <p className="mt-1 text-[12px] text-[#7a7e8a]">Jenjang SMA | Kelas 11</p>
            <p className="mt-2 text-[13px] font-semibold text-[#f39b39]">
              Siswa Terdaftar: {showStudents ? filtered.length : 0}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <p className="max-w-[320px] text-[12px] leading-[1.6] text-[#7a7e8a]">
            Klik nama siswa untuk melihat rincian nilai kuis per topik dan progres belajar secara mendalam.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-[40px] w-full items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 sm:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari nama siswa ..."
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#232530] outline-none placeholder:text-[#9aa0ad] sm:w-[200px] sm:flex-none"
              />
              <FaSearch size={14} className="text-[#9aa0ad]" />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((p) => !p)}
                className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]"
              >
                <FiFilter size={14} />
                Filter
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-10 mt-2 w-[200px] rounded-xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                  {activeFilter && (
                    <button
                      type="button"
                      onClick={() => { setActiveFilter(null); setPage(1); }}
                      className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#d63c3c] hover:bg-[#fef2f2]"
                    >
                      Reset Filter <span className="text-[14px]">×</span>
                    </button>
                  )}
                  {(['penguatan', 'remedial', 'pengayaan'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setActiveFilter(activeFilter === type ? null : type); setPage(1); setFilterOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                        activeFilter === type ? 'bg-[#f0ecff] text-[#7054dc]' : 'text-[#232530] hover:bg-[#f7f6ff]'
                      }`}
                    >
                      {rekomendasiConfig[type].label}
                      {activeFilter === type && <span className="text-[#7054dc]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white">
          <div className="min-w-[700px]">
          <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.7fr_0.9fr_1fr] gap-4 bg-[#f0eff5] px-5 py-3 text-[12px] font-semibold text-[#232530]">
            <span>Siswa</span>
            <span>Progres</span>
            <span className="text-center">Pre-Test</span>
            <span className="text-center">Post-Test</span>
            <span className="text-center">Rata-rata Kuis</span>
            <span className="text-center">Rekomendasi</span>
          </div>

          {!showStudents || filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Image
                src="/assets/images/beranda-siswa/belum-ada.png"
                alt="Belum ada siswa"
                width={160}
                height={130}
                className="h-auto w-[160px]"
              />
              <p className="mt-4 text-[13px] text-[#9aa0ad]">Belum ada siswa yang terdaftar</p>
            </div>
          ) : (
            paginated.map((siswa) => {
              const cfg = rekomendasiConfig[siswa.rekomendasi];
              return (
                <div key={siswa.id} className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.7fr_0.9fr_1fr] items-center gap-4 border-t border-[#f0eff5] px-5 py-3.5 text-[12px] text-[#232530]">
                  <Link href="/modul-guru/manajemen/siswa" className="font-medium text-[#232530] hover:text-[#7054dc]">{siswa.name}</Link>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-[#e7e2f6]">
                      <div className="h-full rounded-full bg-[#7054dc] transition-all" style={{ width: `${siswa.progress}%` }} />
                    </div>
                    <span className="w-[34px] text-right text-[11px] text-[#7a7e8a]">{siswa.progress}%</span>
                  </div>
                  <span className="text-center">{siswa.preTest}</span>
                  <span className="text-center">{siswa.postTest}</span>
                  <span className="text-center">{siswa.rataKuis}</span>
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {showStudents && totalPages > 1 && (
          <div className="mt-4 flex items-center gap-1">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[12px] text-[#7a7e8a] hover:bg-[#f0ecff] disabled:opacity-40">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => setPage(n)} className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition-colors ${page === n ? 'bg-[#7054dc] text-white' : 'text-[#7a7e8a] hover:bg-[#f0ecff]'}`}>{n}</button>
            ))}
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[12px] text-[#7a7e8a] hover:bg-[#f0ecff] disabled:opacity-40">›</button>
          </div>
        )}
      </main>
    </div>
  );
}
