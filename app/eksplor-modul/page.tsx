'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaLock, FaSearch } from 'react-icons/fa';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import SiswaHeader from '../component/siswa/SiswaHeader';
import { moduleDetails } from '../modul/dummy';

export default function EksplorModulPage() {
  const [activeTab, setActiveTab] = useState<'rekomendasi' | 'terbaru'>('rekomendasi');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = useMemo(() => {
    const source =
      activeTab === 'rekomendasi'
        ? moduleDetails.filter((item) => item.isRecommended)
        : moduleDetails.filter((item) => !item.isRecommended);

    if (!searchQuery.trim()) {
      return source;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return source.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.teacher.toLowerCase().includes(normalizedQuery)
    );
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <SiswaHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#202126]">Eksplor Modul</h1>
            <div className="mt-3 flex items-center gap-5 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('rekomendasi')}
                className={`border-b-2 pb-1 transition-colors ${
                  activeTab === 'rekomendasi'
                    ? 'border-[#7054dc] text-[#202126]'
                    : 'border-transparent text-[#60636d] hover:text-[#202126]'
                }`}
              >
                Rekomendasi Modul
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terbaru')}
                className={`border-b-2 pb-1 transition-colors ${
                  activeTab === 'terbaru'
                    ? 'border-[#7054dc] text-[#202126]'
                    : 'border-transparent text-[#60636d] hover:text-[#202126]'
                }`}
              >
                Modul Terbaru
              </button>
            </div>
          </div>

          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul belajarmu di sini"
              className="w-full rounded-lg border border-[#d8d9e0] bg-white px-4 py-2.5 pr-10 text-sm text-[#202126] placeholder:text-[#8d909c] focus:border-[#7054dc] focus:outline-none"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d909c]" size={14} />
          </div>
        </div>

        {filteredModules.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredModules.map((item) => (
              <article
                key={item.id}
                className="relative rounded-2xl border border-[#d8d9e0] bg-white p-4 sm:p-5"
              >
                {item.isLocked && (
                  <div className="absolute right-4 top-4 text-[#a4a8b2]">
                    <FaLock size={14} />
                  </div>
                )}

                <div className="flex items-center gap-3 pr-7 sm:gap-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={84}
                    height={84}
                    className="h-[74px] w-[74px] shrink-0 rounded-xl object-cover sm:h-[84px] sm:w-[84px]"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-[#202126] sm:text-xl">{item.title}</h3>
                    <p className="mt-1 text-xs text-[#60636d] sm:text-sm">Jenjang SMA | Kelas 11</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-[#202126] sm:text-sm">{item.teacher}</p>
                      <Link
                        href={`/modul/${item.slug}`}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#f39b39] sm:text-sm"
                      >
                        Lihat Lebih Lanjut
                        <MdOutlineKeyboardArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d8d9e0] bg-white px-4 py-10 sm:px-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Image
                src="/assets/images/beranda-siswa/belum-ada.png"
                alt="Belum ada modul"
                width={150}
                height={150}
              />
              <p className="text-sm text-[#8a8a96]">Belum ada modul tersedia</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
