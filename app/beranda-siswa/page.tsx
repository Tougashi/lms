'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  MdOutlineKeyboardArrowRight,
  MdHistory,
  MdSearch,
} from 'react-icons/md';
import { FaBookOpen } from 'react-icons/fa';
import { RiFileList3Fill } from 'react-icons/ri';
import SiswaHeader from '../component/siswa/SiswaHeader';

export default function BerandaSiswaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProgress, setShowProgress] = useState(true);

  const progressData = [
    {
      id: 1,
      name: 'Biologi',
      topik: 4,
      materi: 15,
      progress: 30,
      status: 'Sedang Berjalan',
      statusColor: 'bg-[#e5d3ff] text-[#7054dc]',
      image: '/assets/images/beranda-siswa/sosiologi.png',
    },
    {
      id: 2,
      name: 'Kimia',
      topik: 4,
      materi: 15,
      progress: 100,
      status: 'Sudah Selesai',
      statusColor: 'bg-[#fce5cc] text-[#f39b39]',
      image: '/assets/images/beranda-siswa/kimia.png',
    },
    {
      id: 3,
      name: 'Bahasa Inggris',
      topik: 4,
      materi: 15,
      progress: 80,
      status: 'Sedang Berjalan',
      statusColor: 'bg-[#e5d3ff] text-[#7054dc]',
      image: '/assets/images/beranda-siswa/informatika.png',
    },
    {
      id: 4,
      name: 'Matematika',
      topik: 4,
      materi: 15,
      progress: 10,
      status: 'Sedang Berjalan',
      statusColor: 'bg-[#e5d3ff] text-[#7054dc]',
      image: '/assets/images/beranda-siswa/matematika.png',
    },
  ];

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <SiswaHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Top Row */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#21212b]">Beranda</h2>

          <div className="relative w-full max-w-md pt-0.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full rounded-full border border-[#e0dfe6] bg-white px-4 py-2.5 pr-10 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a96]">
              <MdSearch size={20} />
            </button>
          </div>
        </div>

        {/* Top Section: Hero + Cards */}
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#26262A] to-[#2f3138] p-6 text-white lg:col-span-2">
            <div className="relative z-10">
              <p className="mb-3 text-sm">Halo, Olivia! 👋</p>
              <h3 className="mb-6 text-xl font-bold">Siap lanjut belajar hari ini? <br /> Cek modul kelas kamu hari ini</h3>
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold hover:bg-[#5d42b0] transition-colors">
                Lanjutkan Belajar
              </button>
            </div>
              {/* Illustration with Glow */}
              <div className="absolute right-4 top-[56%] -translate-y-1/2 h-60 w-60 sm:h-[20rem] sm:w-[20rem] z-5">
                {/* Purple Glow Background */}
                <div className="absolute inset-0 translate-x-10 translate-y-6 rounded-full bg-[#7054dc] opacity-50 blur-3xl sm:translate-x-14 sm:translate-y-8"></div>
              <Image
                src="/assets/images/beranda-siswa/modul.png"
                alt="Student learning"
                fill
                className="object-contain relative z-10 scale-[1.05] sm:scale-[1.1]"
              />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {/* Modul Terdaftar Card */}
            <div className="relative min-h-[200px] overflow-hidden rounded-[22px] bg-[#e9e2ff] p-4 shadow-sm">
              <div className="relative z-10 flex h-full flex-col">
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7054dc] bg-white">
                    <FaBookOpen size={16} className="text-[#7054dc]" />
                  </div>
                  <p className="text-3xl font-semibold leading-none text-[#7054dc]">4</p>
                </div>
                <div className="mt-auto max-w-[160px] pb-3 pt-6">
                  <p className="mb-2 text-[1.05rem] font-semibold text-[#202126]">Modul Terdaftar</p>
                  <p className="text-[0.96rem] leading-6 text-[#202126]">Jumlah modul yang dapat diakses kamu</p>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-4">
                <Image
                  src="/assets/images/beranda-siswa/star-purple.png"
                  alt="Decorative star"
                  width={110}
                  height={110}
                />
              </div>
            </div>

            {/* Sertifikat Card */}
            <div className="relative min-h-[200px] overflow-hidden rounded-[22px] bg-[#f9eddc] p-4 shadow-sm">
              <div className="relative z-10 flex h-full flex-col">
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f39b39] bg-white">
                    <RiFileList3Fill size={16} className="text-[#f39b39]" />
                  </div>
                  <p className="text-3xl font-semibold leading-none text-[#f39b39]">2</p>
                </div>
                <div className="mt-auto max-w-[165px] pb-3 pt-6">
                  <p className="mb-2 text-[1.05rem] font-semibold text-[#202126]">Sertifikat</p>
                  <p className="text-[0.96rem] leading-6 text-[#202126]">Sertifikat dari modul yang diselesaikan</p>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-4">
                <Image
                  src="/assets/images/beranda-siswa/star-orange.png"
                  alt="Decorative star"
                  width={110}
                  height={110}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Progress + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Progress Table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#21212b]">Progres Belajar Terbaru</h3>
              <button
                onClick={() => setShowProgress(!showProgress)}
                className="rounded-full border border-[#7054dc] px-4 py-2 text-sm font-medium text-[#7054dc] transition-colors hover:bg-[#f4efff]"
              >
                {showProgress ? 'Sembunyikan' : 'Lihat Semua'}
              </button>
            </div>

            <div className="overflow-hidden rounded-xl bg-white">
              {/* Header */}
              <div className="flex bg-[#e7e7e7] px-6 py-3">
                <div className="flex-1 text-left text-base font-semibold text-gray">Modul</div>
                <div className="flex-1 text-left text-base font-semibold text-gray">Progres</div>
                <div className="w-32 text-left text-base font-semibold text-gray">Status</div>
              </div>

              {/* Body */}
              {showProgress ? (
                progressData.map((item) => (
                  <div key={item.id} className="flex border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafafa] transition-colors py-4 px-6">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="rounded-md"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-[#21212b]">{item.name}</span>
                        <p className="text-sm text-[#8a8a96]">{item.topik} Topik | {item.materi} Materi</p>
                      </div>
                    </div>

                    <div className="flex-1 px-4 flex items-center gap-2">
                      <div className="flex-1 max-w-[220px] h-2 bg-[#e7e7e7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7054dc] transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#8a8a96] min-w-[40px]">{item.progress}%</span>
                    </div>

                    <div className="w-32 flex items-center">
                      <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center px-4 py-8">
                  <div className="flex flex-col items-center justify-center gap-3 mt-20">
                    <Image
                      src="/assets/images/beranda-siswa/belum-ada.png"
                      alt="No progress"
                      width={150}
                      height={150}
                    />
                    <p className="text-sm text-[#8a8a96]">Belum ada progres belajar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="rounded-2xl border border-[#f39b39] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f39b39]/15 text-[#f39b39]">
                    <MdHistory size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-[#21212b]">Aktivitas Belajar Terakhir</h4>
                </div>
                <span className="text-xs text-[#8a8a96]">4 jam lalu</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/10 text-black">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#21212b]">Jaringan pada Tumbuhan</span>
                </div>
                
                <p className="text-sm text-[#8a8a96]">Modul : Biologi</p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#f39b39] hover:text-[#e68a2a] transition-colors">
                  Lanjutkan
                  <MdOutlineKeyboardArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Statistics */}
            <div className="rounded-2xl bg-white p-4">
              <h4 className="mb-4 text-base font-bold text-[#21212b]">Statistik Keseluruhan Progres</h4>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative h-72 w-72">
                  <svg className="h-full w-full" viewBox="0 0 220 220" aria-label="Diagram progres keseluruhan">
                    <circle cx="110" cy="110" r="82" fill="none" stroke="#eef0f4" strokeWidth="42" />
                    <circle
                      cx="110"
                      cy="110"
                      r="82"
                      fill="none"
                      stroke="#f39b39"
                      strokeWidth="42"
                      strokeDasharray="128.8 515.2"
                      strokeDashoffset="0"
                      strokeLinecap="butt"
                      transform="rotate(-90 110 110)"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r="82"
                      fill="none"
                      stroke="#7054dc"
                      strokeWidth="42"
                      strokeDasharray="386.4 515.2"
                      strokeDashoffset="-128.8"
                      strokeLinecap="butt"
                      transform="rotate(-90 110 110)"
                    />
                  </svg>

                  <div className="absolute right-2 top-4 h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-white/35 blur-md" />
                    <div className="absolute inset-0 rounded-full bg-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#f39b39] shadow-[0_8px_18px_rgba(243,155,57,0.12)]">
                        25%
                      </div>
                    </div>
                  </div>
                  <div className="absolute -left-3 bottom-14 h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-white/35 blur-md" />
                    <div className="absolute inset-0 rounded-full bg-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#7054dc] shadow-[0_8px_18px_rgba(112,84,220,0.12)]">
                        75%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#7054dc]"></div>
                    <span className="text-[#21212b]">Sedang Berjalan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#f39b39]"></div>
                    <span className="text-[#21212b]">Selesai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
