'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FiExternalLink, FiPlus } from 'react-icons/fi';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import GuruHeader from '../component/guru/GuruHeader';

type ModuleItem = {
  id: number;
  title: string;
  topicInfo: string;
  durationInfo: string;
  students: string;
  rating: number;
  image: string;
};

type DraftItem = {
  id: number;
  title: string;
  updatedAt: string;
  image: string;
};

type ReviewItem = {
  id: number;
  name: string;
  module: string;
  comment: string;
  date: string;
  avatar: string;
  rating: number;
};

const topModulesData: ModuleItem[] = [
  {
    id: 1,
    title: 'Biologi',
    topicInfo: '4 Topik',
    durationInfo: '15 Materi | 6 Bulan',
    students: '35 Siswa',
    rating: 4.9,
    image: '/assets/images/beranda-siswa/sosiologi.png',
  },
  {
    id: 2,
    title: 'Kimia',
    topicInfo: '4 Topik',
    durationInfo: '15 Materi | 6 Bulan',
    students: '50 Siswa',
    rating: 4.9,
    image: '/assets/images/beranda-siswa/kimia.png',
  },
  {
    id: 3,
    title: 'Biologi Terapan',
    topicInfo: '4 Topik',
    durationInfo: '15 Materi | 6 Bulan',
    students: '35 Siswa',
    rating: 4.9,
    image: '/assets/images/beranda-siswa/informatika.png',
  },
];

const draftData: DraftItem[] = [
  {
    id: 1,
    title: 'Kalkulus Lanjut',
    updatedAt: '15 Mar 2026',
    image: '/assets/images/beranda-siswa/matematika.png',
  },
  {
    id: 2,
    title: 'Nama Modul',
    updatedAt: '6 Mar 2026',
    image: '/assets/images/landing/Microscope.png',
  },
  {
    id: 3,
    title: 'Nama Modul',
    updatedAt: '2 Mar 2026',
    image: '/assets/images/landing/certification.png',
  },
];

const reviewData: ReviewItem[] = [
  {
    id: 1,
    name: 'Olivia Rodrigo',
    module: 'Modul: Biologi',
    comment:
      'Suka banget sama alur modul ini! Materi yang tadinya aku pikir bakal susah, ternyata pas dipelajari di sini jadi kerasa lebih simpel dan jelasinya enak didengar',
    date: '15 Feb 2026',
    avatar: '/assets/images/beranda-siswa/modul.png',
    rating: 5,
  },
  {
    id: 2,
    name: 'Jonathan Putra',
    module: 'Modul: Biologi',
    comment:
      'Jujur, aku betah banget belajar di modul ini. Aku paling suka bagian kuisnya sih, seru banget dan bikin aku jadi tertantang buat dapat skor sempurna!',
    date: '15 Feb 2026',
    avatar: '/assets/images/beranda-siswa/kimia.png',
    rating: 5,
  },
  {
    id: 3,
    name: 'Erica Cantika',
    module: 'Modul: Biologi Terapan',
    comment:
      'Aku ngerasa progres belajarku jadi lebih teratur semenjak pakai modul ini. Dari yang awalnya aku bingung mau mulai dari mana, sekarang jadi paham urutannya',
    date: '15 Feb 2026',
    avatar: '/assets/images/beranda-siswa/informatika.png',
    rating: 5,
  },
];

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex h-[84px] items-center justify-between rounded-xl border border-[#e9e8f0] bg-white px-6 shadow-[0_2px_10px_rgba(24,24,37,0.05)]">
      <div className="flex items-center gap-3">
        <span className="text-[35px] font-semibold leading-none tracking-[-0.04em] text-[#7557ea]">{value}</span>
        <span className="pt-0.5 text-[13px] text-[#555866]">{label}</span>
      </div>
      <MdOutlineKeyboardArrowRight size={18} className="text-[#7d808c]" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[238px] flex-col items-center justify-center px-6 text-center">
      <Image
        src="/assets/images/beranda-siswa/belum-ada.png"
        alt="Belum ada data"
        width={156}
        height={126}
        className="h-auto w-[156px]"
      />
      <p className="mt-4 text-[16px] leading-[1.45] tracking-[-0.01em] text-[#8a8d98]">{message}</p>
    </div>
  );
}

export default function BerandaGuruPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('state');

  const hasData = useMemo(() => mode !== 'empty', [mode]);

  const topModules = hasData ? topModulesData : [];
  const draftModules = hasData ? draftData : [];
  const reviews = hasData ? reviewData : [];

  const stats = {
    published: hasData ? 4 : 0,
    drafts: hasData ? 3 : 0,
    totalStudents: hasData ? 50 : 0,
    totalCompleted: hasData ? 35 : 0,
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1260px] px-6 pb-8 pt-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[14px] text-[#676b79]">Beranda</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#232530] md:text-[44px]">
              Siap menginspirasi siswa hari ini?
            </h1>
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 self-start rounded-[14px] bg-[#7557ea] px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(117,87,234,0.35)] transition-colors hover:bg-[#6648df] sm:mt-4"
          >
            <FiPlus size={18} />
            Buat Modul Baru
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard value={stats.published} label="Modul Terbit" />
          <StatCard value={stats.drafts} label="Draft Modul" />
          <StatCard value={stats.totalStudents} label="Total Siswa Terdaftar" />
          <StatCard value={stats.totalCompleted} label="Total Siswa Lulus Modul" />
        </section>

        <section className="mt-7 grid gap-4 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white shadow-[0_4px_14px_rgba(19,23,31,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f0f1f6] px-5 py-4">
              <h2 className="text-lg font-semibold leading-none tracking-[-0.01em] text-[#252834] sm:text-2xl">Top Modul / Kelas</h2>
              <button
                type="button"
                className="rounded-full border border-[#d9dcf0] px-4 py-1 text-[13px] font-medium leading-none text-[#7557ea] sm:text-[16px]"
              >
                Lihat Semua
              </button>
            </div>

            {topModules.length === 0 ? (
              <EmptyState message="Belum ada yang mengakses modul Anda." />
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8c8f9b]">
                  <p>Modul</p>
                  <p>Rating</p>
                  <p>Total Enroll</p>
                </div>

                {topModules.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr] items-center px-5 py-4 ${
                      index !== topModules.length - 1 ? 'border-t border-[#eef0f5]' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f2f4fb]">
                        <Image src={item.image} alt={item.title} width={48} height={48} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold text-[#232530]">{item.title}</p>
                        <p className="mt-0.5 truncate text-[13px] text-[#7e8290]">
                          {item.topicInfo} | {item.durationInfo}
                        </p>
                      </div>
                    </div>

                    <p className="flex items-center gap-1 text-[14px] font-medium text-[#555968]">
                      <FaStar size={12} className="text-[#f9b837]" />
                      {item.rating}
                    </p>

                    <p className="text-[14px] text-[#555968]">{item.students}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white shadow-[0_4px_14px_rgba(19,23,31,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f0f1f6] px-5 py-4">
              <h2 className="text-lg font-semibold leading-none tracking-[-0.01em] text-[#252834] sm:text-2xl">Draft Modul</h2>
              <button
                type="button"
                className="rounded-full border border-[#d9dcf0] px-4 py-1 text-[13px] font-medium leading-none text-[#7557ea] sm:text-[16px]"
              >
                Lihat Semua
              </button>
            </div>

            {draftModules.length === 0 ? (
              <EmptyState message="Tidak ada modul draft. Buat modul baru terlebih dahulu. Jika belum diterbitkan, akan masuk ke dalam draf." />
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[minmax(0,1.8fr)_0.7fr_0.8fr] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8c8f9b]">
                  <p>Modul</p>
                  <p>Update</p>
                  <p>Aksi</p>
                </div>

                {draftModules.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(0,1.8fr)_0.7fr_0.8fr] items-center px-5 py-4 ${
                      index !== draftModules.length - 1 ? 'border-t border-[#eef0f5]' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f1f0fd]">
                        <Image src={item.image} alt={item.title} width={48} height={48} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold text-[#232530]">{item.title}</p>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-[#8d90a0]">DRAF</p>
                      </div>
                    </div>

                    <p className="text-[14px] text-[#555968]">{item.updatedAt}</p>

                    <button
                      type="button"
                      className="justify-self-start text-[13px] font-medium text-[#f39b39] transition-colors hover:text-[#de8524]"
                    >
                      Selesaikan Modul
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white shadow-[0_4px_14px_rgba(19,23,31,0.05)]">
          <div className="flex items-center justify-between border-b border-[#f0f1f6] px-5 py-4">
            <h2 className="text-lg font-semibold leading-none tracking-[-0.01em] text-[#252834] sm:text-2xl">Penilaian dan Ulasan dari Siswa</h2>
            <button
              type="button"
              className="rounded-full border border-[#d9dcf0] px-4 py-1 text-[13px] font-medium leading-none text-[#7557ea] sm:text-[16px]"
            >
              Lihat Semua
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center px-6 text-center">
              <Image
                src="/assets/images/landing/certification.png"
                alt="Belum ada ulasan"
                width={180}
                height={180}
                className="h-auto w-[180px]"
              />
              <p className="mt-4 text-[18px] tracking-[-0.01em] text-[#8a8d98]">Belum ada penilaian dari siswa</p>
            </div>
          ) : (
            <div>
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_2.4fr_0.5fr] lg:items-center lg:gap-5 ${
                    index !== reviews.length - 1 ? 'border-b border-[#eef0f5]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-[#f3f4f8]">
                      <Image src={review.avatar} alt={review.name} width={44} height={44} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold text-[#252834]">{review.name}</p>
                      <p className="text-[13px] text-[#767a89]">{review.module}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        i < review.rating ? (
                          <FaStar key={`${review.id}-${i}`} size={14} className="text-[#f8b738]" />
                        ) : (
                          <FaRegStar key={`${review.id}-${i}`} size={14} className="text-[#f8b738]" />
                        )
                      ))}
                      <span className="ml-1 text-[14px] font-semibold text-[#555968]">{review.rating}</span>
                    </div>
                    <p className="text-[14px] leading-[1.45] text-[#444856]">{review.comment}</p>
                  </div>

                  <div className="text-left lg:justify-self-end lg:text-right">
                    <p className="mb-1 text-[13px] text-[#7e8290]">{review.date}</p>
                    <button type="button" className="text-[#505461] transition-colors hover:text-[#252834]">
                      <FiExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
