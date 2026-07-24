'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FiExternalLink, FiPlus } from 'react-icons/fi';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import GuruHeader from '../component/guru/GuruHeader';
import { useAuth } from '../context/AuthContext';
import { useRoleGuard } from '../lib/hooks/useRoleGuard';
import { dashboardApi } from '../lib/api';
import { usePopup } from '../component/ui/PopupProvider';
import type { TutorDashboard } from '../lib/types/guru';
import type { ModuleItem } from '../lib/types/modul';
import type { RatingItem } from '../lib/types/umum';

function StatCard({ value, label, href }: { value: number; label: string; href?: string }) {
  const content = (
    <div className="flex h-[84px] items-center justify-between rounded-xl border border-[#e9e8f0] bg-white px-6 shadow-[0_2px_10px_rgba(24,24,37,0.05)]">
      <div className="flex items-center gap-3">
        <span className="text-[28px] font-semibold leading-[36px] tracking-[-0.04em] text-[#7557ea]">{value}</span>
        <span className="pt-0.5 text-[12px] leading-[16px] text-[#555866]">{label}</span>
      </div>
      <MdOutlineKeyboardArrowRight size={18} className="text-[#7d808c]" />
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
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
      <p className="mt-4 text-[14px] leading-[20px] tracking-[-0.01em] text-[#8a8d98]">{message}</p>
    </div>
  );
}

function getModuleName(item: ModuleItem): string {
  return item.moduleName || item.nama_modul || 'Modul';
}

function BerandaGuruPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { isAuthorized } = useRoleGuard(['tutor']);
  const [dashboard, setDashboard] = useState<TutorDashboard | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const { toast } = usePopup();

  useEffect(() => {
    if (authLoading || !user) return;

    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.tutor();
        if (isMounted) setDashboard(data);
      } catch (err: unknown) {
        console.error('Tutor dashboard fetch error:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchDashboard();
    return () => { isMounted = false; };
  }, [authLoading, user]);

  const stats = {
    published: dashboard?.countPublishedModules ?? 0,
    drafts: dashboard?.countDraftModules ?? 0,
    totalStudents: dashboard?.countRegisteredSiswa ?? 0,
    totalCompleted: dashboard?.countSiswaLulus ?? 0,
  };

  const topModules: ModuleItem[] = dashboard?.nominatedModules ?? [];
  const draftModules: ModuleItem[] = dashboard?.getDraftModules ?? [];
  const reviews: RatingItem[] = dashboard?.getRatingsFromSiswa ?? [];

  if (authLoading || isLoadingData || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1260px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7557ea] border-t-transparent"></div>
              <p className="text-sm text-[#8a8d98]">Memuat dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1260px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[12px] leading-[16px] text-[#676b79]">Beranda</p>
            <h1 className="mt-3 text-[24px] font-semibold leading-[32px] tracking-[-0.03em] text-[#232530]">
              Siap menginspirasi siswa hari ini?
            </h1>
          </div>

          <Link
            href="/modul-guru/tambah"
            className="inline-flex h-11 items-center gap-2 self-start rounded-[12px] bg-[#7557ea] px-5 text-[13px] font-semibold leading-[18px] text-white shadow-[0_8px_20px_rgba(117,87,234,0.35)] transition-colors hover:bg-[#6648df] sm:mt-4"
          >
            <FiPlus size={18} />
            Buat Modul Baru
          </Link>
        </div>

        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value={stats.published} label="Modul Terbit" href="/modul-guru?tab=published" />
          <StatCard value={stats.drafts} label="Draft Modul" href="/modul-guru?tab=draft" />
          <StatCard value={stats.totalStudents} label="Total Siswa Terdaftar" href="/modul-guru?tab=published" />
          <StatCard value={stats.totalCompleted} label="Total Siswa Lulus" href="/modul-guru?tab=published" />
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white shadow-[0_4px_14px_rgba(19,23,31,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f0f1f6] px-5 py-4">
              <h2 className="text-[18px] font-semibold leading-[28px] tracking-[-0.01em] text-[#252834]">Top Modul / Kelas</h2>
              <Link
                href="/modul-guru"
                className="rounded-full border border-[#d9dcf0] px-4 py-1 text-[13px] font-medium leading-[18px] text-[#7557ea]"
              >
                Lihat Semua
              </Link>
            </div>

            {topModules.length === 0 ? (
              <EmptyState message="Belum ada yang mengakses modul Anda." />
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr] px-5 py-3 text-[11px] font-semibold uppercase leading-[16px] tracking-[0.06em] text-[#8c8f9b]">
                  <p>Modul</p>
                  <p>Jenjang</p>
                  <p>Kesulitan</p>
                </div>

                {topModules.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr] items-center px-5 py-4 ${
                      index !== topModules.length - 1 ? 'border-t border-[#eef0f5]' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f2f4fb] flex items-center justify-center">
                        <FiExternalLink size={20} className="text-[#7557ea]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold leading-[20px] text-[#232530]">{getModuleName(item)}</p>
                        <p className="mt-0.5 truncate text-[12px] leading-[16px] text-[#7e8290]">
                          {item.subtitle || item.deskripsi || ''}
                        </p>
                      </div>
                    </div>

                    <p className="text-[13px] leading-[18px] text-[#555968]">
                      {item.level || item.jenjang || '-'}
                    </p>

                    <p className="text-[13px] leading-[18px] text-[#555968]">
                      {item.difficulty || item.tingkat_kesulitan || '-'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white shadow-[0_4px_14px_rgba(19,23,31,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f0f1f6] px-5 py-4">
              <h2 className="text-[18px] font-semibold leading-[28px] tracking-[-0.01em] text-[#252834]">Draft Modul</h2>
              <Link
                href="/modul-guru?tab=draft"
                className="rounded-full border border-[#d9dcf0] px-4 py-1 text-[13px] font-medium leading-[18px] text-[#7557ea]"
              >
                Lihat Semua
              </Link>
            </div>

            {draftModules.length === 0 ? (
              <EmptyState message="Tidak ada modul draft. Buat modul baru terlebih dahulu. Jika belum diterbitkan, akan masuk ke dalam draf." />
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[minmax(0,1.8fr)_0.7fr_0.8fr] px-5 py-3 text-[11px] font-semibold uppercase leading-[16px] tracking-[0.06em] text-[#8c8f9b]">
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
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f1f0fd] flex items-center justify-center">
                        <FiExternalLink size={20} className="text-[#7557ea]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold leading-[20px] text-[#232530]">{getModuleName(item)}</p>
                        <p className="text-[11px] font-semibold uppercase leading-[16px] tracking-[0.09em] text-[#8d90a0]">DRAF</p>
                      </div>
                    </div>

                    <p className="text-[13px] leading-[18px] text-[#555968]">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </p>

                    <Link
                      href={`/modul-guru/tambah/profil?modulId=${item.id}`}
                      className="justify-self-start text-[12px] font-medium leading-[16px] text-[#f39b39] transition-colors hover:text-[#de8524]"
                    >
                      Selesaikan Modul
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white shadow-[0_4px_14px_rgba(19,23,31,0.05)]">
          <div className="flex items-center justify-between border-b border-[#f0f1f6] px-5 py-4">
            <h2 className="text-[18px] font-semibold leading-[28px] tracking-[-0.01em] text-[#252834]">Penilaian dan Ulasan dari Siswa</h2>
            <Link
              href="/modul-guru/ulasan"
              className="rounded-full border border-[#d9dcf0] px-4 py-1 text-[13px] font-medium leading-[18px] text-[#7557ea] hover:bg-[#f0ebff] transition-colors"
            >
              Lihat Semua
            </Link>
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
              <p className="mt-4 text-[14px] leading-[20px] tracking-[-0.01em] text-[#8a8d98]">Belum ada penilaian dari siswa</p>
            </div>
          ) : (
            <div>
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2.4fr)_0.5fr] lg:items-center lg:gap-5 ${
                    index !== reviews.length - 1 ? 'border-b border-[#eef0f5]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-[#f3f4f8] flex items-center justify-center">
                      <span className="text-[16px] font-bold leading-[20px] text-[#7557ea]">
                        {(review.siswa?.nama_lengkap || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold leading-[20px] text-[#252834]">{review.siswa?.nama_lengkap || 'Siswa'}</p>
                      <p className="text-[12px] leading-[16px] text-[#767a89]">
                        {review.modul?.nama_modul ? `Modul: ${review.modul.nama_modul}` : ''}
                      </p>
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
                      <span className="ml-1 text-[13px] font-semibold leading-[18px] text-[#555968]">{review.rating}</span>
                    </div>
                    <p className="text-[13px] leading-[18px] text-[#444856]">{review.komentar || ''}</p>
                  </div>

                  <div className="text-left lg:justify-self-end lg:text-right">
                    <p className="mb-1 text-[12px] leading-[16px] text-[#7e8290]">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                    <span className="text-[#9ca0ad]">
                      <FiExternalLink size={18} />
                    </span>
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

export default function BerandaGuruPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f4f7]" />}>
      <BerandaGuruPageContent />
    </Suspense>
  );
}
