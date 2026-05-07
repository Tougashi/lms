'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';

import GuruHeader from '../component/guru/GuruHeader';

type ModuleCard = {
  id: number;
  title: string;
  level: string;
  image: string;
};

const publishedModules: ModuleCard[] = [
  {
    id: 1,
    title: 'Biologi',
    level: 'Jenjang SMA | Kelas 11',
    image: '/assets/images/beranda-siswa/matapelajaran.png',
  },
  {
    id: 2,
    title: 'Kimia',
    level: 'Jenjang SMA | Kelas 11',
    image: '/assets/images/beranda-siswa/kimia.png',
  },
  {
    id: 3,
    title: 'Sejarah',
    level: 'Jenjang SMA | Kelas 11',
    image: '/assets/images/beranda-siswa/sosiologi.png',
  },
  {
    id: 4,
    title: 'Sosiologi',
    level: 'Jenjang SMA | Kelas 11',
    image: '/assets/images/beranda-siswa/sosiologi.png',
  },
];

const draftModules: ModuleCard[] = [
  {
    id: 5,
    title: 'Biologi',
    level: 'Jenjang SMA | Kelas 11',
    image: '/assets/images/beranda-siswa/matapelajaran.png',
  },
  {
    id: 6,
    title: 'Kimia',
    level: 'Jenjang SMA | Kelas 11',
    image: '/assets/images/beranda-siswa/kimia.png',
  },
];

export default function ModulGuruPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const stateParam = searchParams.get('state');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDraftTab = tabParam === 'draft';

  const hasPublished = useMemo(() => !['empty', 'all-empty'].includes(stateParam ?? ''), [stateParam]);
  const hasDraft = useMemo(() => !['draft-empty', 'all-empty'].includes(stateParam ?? ''), [stateParam]);

  const publishedList = hasPublished ? publishedModules : [];
  const draftList = hasDraft ? draftModules : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModules = isDraftTab ? draftList : publishedList;

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#232530]">Modul Saya</h1>
            <div className="mt-3 flex items-center gap-6 text-[13px] font-medium text-[#808391]">
              <Link
                href="/modul-guru?tab=published"
                className={`pb-2 transition-colors ${!isDraftTab ? 'border-b-2 border-[#7557ea] text-[#232530]' : ''}`}
              >
                Modul Terbit
              </Link>
              <Link
                href="/modul-guru?tab=draft"
                className={`pb-2 transition-colors ${isDraftTab ? 'border-b-2 border-[#7557ea] text-[#232530]' : ''}`}
              >
                Draft Modul
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="flex h-[44px] w-full items-center gap-3 rounded-full border border-[#e3e1ea] bg-white px-4 text-[#8a8d98] shadow-sm md:w-auto">
              <input
                type="text"
                placeholder="Cari modul belajarmu di sini"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#2d2d3a] outline-none placeholder:text-[#9ca0ad] md:w-[220px] md:flex-none"
              />
              <FaSearch size={14} className="shrink-0 text-[#8a8d98]" />
            </div>

            <Link
              href="/modul-guru/tambah"
              className="inline-flex h-[44px] items-center gap-2 rounded-full bg-[#7557ea] px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(117,87,234,0.25)] transition-colors hover:bg-[#6648df]"
            >
              <FiPlus size={16} />
              Tambah Modul
            </Link>
          </div>
        </div>

        {currentModules.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <Image
              src="/assets/images/beranda-siswa/belum-ada.png"
              alt="Belum ada modul"
              width={180}
              height={150}
              className="h-auto w-[180px]"
            />
            <p className="mt-5 max-w-[340px] text-[14px] leading-[1.6] text-[#8a8d98]">
              {isDraftTab
                ? 'Tidak ada draft modul. Klik Tambah Modul untuk membuat modul Anda.'
                : 'Tidak ada modul yang terbit. Klik Tambah Modul untuk membuat modul Anda.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-2">
            {currentModules.map((module) => (
              <div
                key={module.id}
                className="relative flex items-center justify-between gap-3 rounded-2xl border border-[#eceaf4] bg-white p-4 shadow-[0_10px_22px_rgba(12,12,18,0.06)] sm:gap-4 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden h-[72px] w-[72px] overflow-hidden rounded-2xl bg-[#f3f4f8] sm:block sm:w-[92px]">
                    <Image
                      src={module.image}
                      alt={module.title}
                      width={92}
                      height={72}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#232530]">{module.title}</h2>
                    <p className="mt-1 text-[12px] text-[#7c808f]">{module.level}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-[#bdaef4] px-4 py-1.5 text-[12px] font-semibold text-[#7557ea] transition-colors hover:bg-[#f5f2ff]"
                      >
                        Lihat Kelas
                      </button>
                      {!isDraftTab && (
                        <Link
                          href="/modul-guru/manajemen"
                          className="rounded-full border border-[#f4b46f] px-4 py-1.5 text-[12px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e6]"
                        >
                          Manajemen Modul
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-start" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId((prev) => (prev === module.id ? null : module.id))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#8a8d98] transition-colors hover:bg-[#f3f2f8]"
                    aria-label="Buka menu"
                  >
                    <FiMoreVertical size={18} />
                  </button>

                  {openMenuId === module.id && (
                    <div className="absolute right-4 top-[56px] w-[170px] overflow-hidden rounded-xl border border-[#eceaf4] bg-white shadow-[0_12px_26px_rgba(14,14,20,0.18)]">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#4b4f5c] hover:bg-[#f6f6fb]"
                      >
                        <FiEdit2 size={16} />
                        Sunting Modul
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#ff6b5d] hover:bg-[#fff1ef]"
                      >
                        <FiTrash2 size={16} />
                        Hapus Modul
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
