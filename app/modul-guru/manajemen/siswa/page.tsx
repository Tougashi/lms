'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import GuruHeader from '../../../component/guru/GuruHeader';

const topikData = [
  { id: 1, topik: 'Set Unit Terkecil Kehidupan', kategori: 'Mode CT', nilai: 100, status: 'tuntas' },
  { id: 2, topik: 'Bioproses pada Tumbuhan', kategori: 'Mode CT', nilai: 65, status: 'dibawah' },
  { id: 3, topik: 'Sistem Pertukaran Zat', kategori: '-', nilai: 70, status: 'dibawah' },
  { id: 4, topik: 'Koordinasi dan Reproduksi', kategori: '-', nilai: 90, status: 'tuntas' },
];

export default function SiswaDetailPage() {
  const [hasData] = useState(true);

  const preTest = hasData ? 70 : 0;
  const postTest = hasData ? 100 : 0;
  const materiDone = hasData ? 10 : 0;
  const materiTotal = 10;
  const progressPct = Math.round((materiDone / materiTotal) * 100);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link href="/modul-guru/manajemen" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530]">
          <span>←</span> Kembali ke Daftar Siswa
        </Link>

        <div className="mt-4 flex flex-col gap-6 sm:mt-6 lg:flex-row lg:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-xl bg-[#d4f0f7]">
                <Image src="/assets/images/beranda-siswa/matapelajaran.png" alt="Biologi" width={50} height={50} className="h-full w-full object-cover" />
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-[#232530]">Biologi</h1>
                <p className="text-[12px] text-[#7a7e8a]">Jenjang SMA | Kelas 11</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-stretch gap-3 sm:mt-6 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f8e8f0] to-[#fdf4f8] px-5 py-4">
                <span className="text-[28px] font-bold text-[#e85d8a]">{preTest}</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Nilai Pre-Test</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                <span className="text-[28px] font-bold text-[#7054dc]">{postTest}</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Nilai Post-Test</span>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-[#e7e2f6]">
                    <div className="h-full rounded-full bg-[#7054dc] transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold text-[#232530]">{progressPct}%</span>
                </div>
                <p className="text-[11px] text-[#7a7e8a]">{materiDone} dari {materiTotal} Materi Selesai</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-[14px] font-semibold text-[#232530]">Rincian Nilai Kuis</h2>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white">
                <div className="min-w-[550px]">
                {hasData ? (
                  <>
                    <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.5fr_1fr] gap-4 bg-[#f0eff5] px-5 py-3 text-[12px] font-semibold text-[#232530]">
                      <span>Topik</span>
                      <span>Kategori</span>
                      <span>Aktivitas</span>
                      <span>Nilai</span>
                      <span>Status</span>
                    </div>
                    {topikData.map((row) => (
                      <div key={row.id} className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.5fr_1fr] items-center gap-4 border-t border-[#f0eff5] px-5 py-3.5 text-[12px]">
                        <span className="text-[#232530]">{row.topik}</span>
                        <span>
                          {row.kategori === 'Mode CT' ? (
                            <Link href={`/modul-guru/manajemen/siswa/ct?topik=${row.id}`} className="font-semibold text-[#7054dc]">Mode CT</Link>
                          ) : (
                            <span className="text-[#7a7e8a]">-</span>
                          )}
                        </span>
                        <span className="text-[#7a7e8a]">Kuis</span>
                        <span className="text-[#232530]">{row.nilai}</span>
                        <span>
                          {row.status === 'tuntas' ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2a9d5c]">✅ Tuntas</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#d63c3c]">🔴 Di bawah nilai minimal</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-[1.5fr_0.8fr_0.5fr_1fr] gap-4 bg-[#f0eff5] px-5 py-3 text-[12px] font-semibold text-[#232530]">
                      <span>Topik</span>
                      <span>Aktivitas</span>
                      <span>Nilai</span>
                      <span>Status</span>
                    </div>
                    {['Set Unit Terkecil Kehidupan', 'Bioproses pada Tumbuhan', 'Sistem Pertukaran Zat', 'Koordinasi dan Reproduksi'].map((topik, i) => (
                      <div key={i} className="grid grid-cols-[1.5fr_0.8fr_0.5fr_1fr] items-center gap-4 border-t border-[#f0eff5] px-5 py-3.5 text-[12px]">
                        <span className="text-[#232530]">{topik}</span>
                        <span className="text-[#7a7e8a]">Kuis</span>
                        <span className="text-[#7a7e8a]">-</span>
                        <span className="text-[#7a7e8a]">Kuis belum dikerjakan</span>
                      </div>
                    ))}
                  </>
                )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[220px]">
            <div className="flex flex-col items-center">
              <div className="h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-[#e5e3ee] bg-[#f0eff5]">
                <Image src="/assets/images/beranda-siswa/belum-ada.png" alt="Olivia Rodrigo" width={120} height={120} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#232530]">Olivia Rodrigo</h3>
              <p className="mt-1 text-[12px] text-[#7a7e8a]">oliviolivrgio@gmail.com</p>
            </div>

            {hasData && (
              <div className="mt-6 rounded-2xl border border-[#e5e3ee] bg-[#f0f4ff] px-4 py-5">
                <p className="text-center text-[13px] font-semibold text-[#2a7fbf]">📘 Perlu Penguatan</p>
                <p className="mt-3 text-[11px] leading-[1.7] text-[#5a5d6a]">
                  Siswa menunjukkan pemahaman yang baik pada sebagian besar topik, namun perlu mengulas kembali Topik 2 karena skor kuis di bawah ambang batas.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
