'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import GuruHeader from '../../component/guru/GuruHeader';
import { useRoleGuard } from '../../lib/hooks/useRoleGuard';
import { apiFetch } from '../../lib/api';
import type { RatingItem } from '../../lib/types/umum';

function UlasanPageContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);

  const [items, setItems] = useState<RatingItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUlasan = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (cursor) params.set('cursor', cursor);
      const res = await apiFetch<{ items: RatingItem[]; next_cursor: string | null }>(
        `/tutor/ulasan?${params}`,
      );
      if (cursor) {
        setItems((prev) => [...prev, ...res.items]);
      } else {
        setItems(res.items);
      }
      setNextCursor(res.next_cursor);
    } catch (err: unknown) {
      console.error('Fetch ulasan error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat ulasan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUlasan();
  }, [fetchUlasan]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f4f4f7]" />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-6 sm:px-6">
        <Link
          href="/beranda-guru"
          className="mb-5 inline-flex items-center gap-1 text-[13px] font-medium text-[#7054dc]"
        >
          <MdOutlineKeyboardArrowLeft size={18} />
          Kembali ke Beranda
        </Link>

        <h1 className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-[#232530]">
          Semua Ulasan dari Siswa
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e8e9ef] bg-white py-20">
            <Image
              src="/assets/images/landing/certification.png"
              alt="Belum ada ulasan"
              width={180}
              height={180}
              className="h-auto w-[180px]"
            />
            <p className="mt-4 text-[18px] tracking-[-0.01em] text-[#8a8d98]">
              Belum ada penilaian dari siswa
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e8e9ef] bg-white">
            <div className="hidden grid-cols-[1.2fr_2.4fr_0.5fr] gap-4 bg-[#f7f6fb] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8c8f9b] lg:grid">
              <p>Siswa</p>
              <p>Ulasan</p>
              <p className="text-right">Tanggal</p>
            </div>

            {items.map((review) => (
              <div
                key={review.id}
                className="grid gap-4 border-b border-[#eef0f5] px-5 py-4 last:border-b-0 lg:grid-cols-[1.2fr_2.4fr_0.5fr] lg:items-center lg:gap-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#f3f4f8]">
                    <span className="text-lg font-bold text-[#7557ea]">
                      {(review.siswa?.nama_lengkap || 'S').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-[#252834]">
                      {review.siswa?.nama_lengkap || 'Siswa'}
                    </p>
                    <p className="text-[13px] text-[#767a89]">
                      {review.modul?.nama_modul ? `Modul: ${review.modul.nama_modul}` : ''}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) =>
                      i < review.rating ? (
                        <FaStar key={`${review.id}-${i}`} size={14} className="text-[#f8b738]" />
                      ) : (
                        <FaRegStar key={`${review.id}-${i}`} size={14} className="text-[#f8b738]" />
                      ),
                    )}
                    <span className="ml-1 text-[14px] font-semibold text-[#555968]">{review.rating}</span>
                  </div>
                  <p className="text-[14px] leading-[1.45] text-[#444856]">{review.komentar || ''}</p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-[13px] text-[#7e8290]">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                </div>
              </div>
            ))}

            {nextCursor && (
              <div className="flex justify-center px-5 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    fetchUlasan(nextCursor);
                  }}
                  className="rounded-full border border-[#d9dcf0] px-6 py-2 text-[13px] font-medium text-[#7557ea] transition-colors hover:bg-[#f0ebff]"
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function UlasanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f4f7]" />}>
      <UlasanPageContent />
    </Suspense>
  );
}
