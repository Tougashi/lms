'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaLock, FaSearch } from 'react-icons/fa';
import SiswaHeader from '../component/siswa/SiswaHeader';
import { moduleDetails } from '../modul/dummy';

type RegisteredModule = (typeof moduleDetails)[number] & {
  preTestScoreLabel: string;
  progress: number;
  status: 'belum-mulai' | 'dalam-progress' | 'selesai';
};

const statusFilters = [
  { id: 'semua', label: 'Semua' },
  { id: 'dalam-progress', label: 'Dalam Progress' },
  { id: 'selesai', label: 'Selesai' },
] as const;

export default function EksplorModulPage() {
  const [activeTab, setActiveTab] = useState<'relevan' | 'terdaftar'>('terdaftar');
  const [activeStatus, setActiveStatus] = useState<(typeof statusFilters)[number]['id']>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const registeredModules = useMemo<RegisteredModule[]>(
    () => [
      {
        ...moduleDetails.find((item) => item.slug === 'biologi')!,
        preTestScoreLabel: 'Pre-Test: 60/100',
        progress: 30,
        status: 'dalam-progress',
        image: '/assets/images/beranda-siswa/matapelajaran.png',
      },
      {
        ...moduleDetails.find((item) => item.slug === 'kimia')!,
        preTestScoreLabel: 'Pre-Test: 90/100',
        progress: 100,
        status: 'selesai',
        image: '/assets/images/beranda-siswa/kimia.png',
      },
      {
        ...moduleDetails.find((item) => item.slug === 'matematika')!,
        preTestScoreLabel: 'Pre-Test: 0/100',
        progress: 0,
        status: 'belum-mulai',
        image: '/assets/images/beranda-siswa/matematika.png',
      },
      {
        ...moduleDetails.find((item) => item.slug === 'bahasa-inggris')!,
        preTestScoreLabel: 'Pre-Test: 100/100',
        progress: 80,
        status: 'dalam-progress',
        image: '/assets/images/beranda-siswa/modul.png',
      },
    ],
    []
  );

  const relevantModules = useMemo(
    () =>
      moduleDetails.filter(
        (item) => item.isRecommended && !registeredModules.some((registeredItem) => registeredItem.slug === item.slug)
      ),
    [registeredModules]
  );

  const filteredModules = useMemo(() => {
    const source = activeTab === 'terdaftar' ? registeredModules : relevantModules;

    return source.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (activeTab !== 'terdaftar' || activeStatus === 'semua' || !('status' in item)) {
        return true;
      }

      return item.status === activeStatus;
    });
  }, [activeStatus, activeTab, registeredModules, relevantModules, searchQuery]);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <SiswaHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#202126]">Eksplor Modul</h1>
            <div className="mt-3 flex items-center gap-5 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('relevan')}
                className={`border-b-2 pb-1 transition-colors ${
                  activeTab === 'relevan'
                    ? 'border-[#7054dc] text-[#202126]'
                    : 'border-transparent text-[#60636d] hover:text-[#202126]'
                }`}
              >
                Modul yang Relevan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terdaftar')}
                className={`border-b-2 pb-1 transition-colors ${
                  activeTab === 'terdaftar'
                    ? 'border-[#7054dc] text-[#202126]'
                    : 'border-transparent text-[#60636d] hover:text-[#202126]'
                }`}
              >
                Terdaftar
              </button>
            </div>

            {activeTab === 'terdaftar' && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveStatus(filter.id)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeStatus === filter.id
                        ? 'border-[#e0d5ff] bg-[#efe8ff] text-[#7054dc]'
                        : 'border-[#d8d9e0] bg-white text-[#8d909c] hover:border-[#d2caef] hover:text-[#202126]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full md:mt-2 md:max-w-sm">
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
            {filteredModules.map((item) => {
              const isRegistered = activeTab === 'terdaftar' && 'progress' in item;

              return (
                <article key={item.id} className="relative rounded-2xl border border-[#d8d9e0] bg-white p-4 sm:p-5">
                  {activeTab === 'relevan' && item.isLocked && (
                    <div className="absolute right-4 top-4 text-[#a4a8b2]">
                      <FaLock size={14} />
                    </div>
                  )}

                  <div className={`flex items-center gap-3 ${activeTab === 'relevan' ? 'pr-7 sm:gap-4' : ''}`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={88}
                      height={88}
                      className="h-[74px] w-[74px] shrink-0 rounded-xl object-cover sm:h-[88px] sm:w-[88px]"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-[#202126]">{item.title}</h3>
                      <p className="mt-1 text-xs text-[#60636d]">Jenjang SMA | Kelas 11</p>

                      {isRegistered ? (
                        <div className="mt-4 flex items-end gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-[#f39b39]">{item.preTestScoreLabel}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e2ec]">
                                <div className="h-full rounded-full bg-[#7d57df]" style={{ width: `${item.progress}%` }} />
                              </div>
                              <span className="text-[11px] text-[#4f5565]">{item.progress}% Progress</span>
                            </div>
                          </div>

                          <Link
                            href={`/modul/${item.slug}/materi`}
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#f39b39] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          >
                            Lanjut
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="truncate text-xs text-[#202126] sm:text-sm">{item.teacher}</p>
                          <Link
                            href={`/modul/${item.slug}`}
                            className={`inline-flex shrink-0 items-center justify-center text-xs font-semibold transition-opacity hover:opacity-90 ${
                              activeTab === 'relevan'
                                ? 'text-[#f39b39] sm:text-sm'
                                : 'bg-[#f39b39] text-white'
                            }`}
                          >
                            {activeTab === 'relevan' ? 'Lihat Lebih Lanjut' : 'Lanjut'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
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
