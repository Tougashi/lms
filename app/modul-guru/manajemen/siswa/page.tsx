'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import GuruHeader from '../../../component/guru/GuruHeader';
import { guruProgressApi } from '../../../lib/api';
import type { TutorProgressByStudent, TutorProgressItem } from '../../../lib/types/guru';
import { useRoleGuard } from '../../../lib/hooks/useRoleGuard';

function SiswaDetailPageContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [studentData, setStudentData] = useState<TutorProgressByStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudentData = useCallback(async () => {
    if (!studentId) {
      setError('Student ID tidak ditemukan.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await guruProgressApi.getByStudent(studentId);
      setStudentData(data);
    } catch (err: unknown) {
      console.error('Load student progress error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data progress siswa.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  // Aggregate scores from progress items
  const aggregateProgress = (items: TutorProgressItem[]) => {
    if (!items || items.length === 0) {
      return { preTest: 0, postTest: 0, progressPct: 0, totalModules: 0, completedModules: 0 };
    }
    const validPretest = items.filter(p => p.pretestScore != null);
    const validPosttest = items.filter(p => p.posttestScore != null);
    const preTest = validPretest.length > 0
      ? Math.round(validPretest.reduce((sum, p) => sum + (p.pretestScore ?? 0), 0) / validPretest.length)
      : 0;
    const postTest = validPosttest.length > 0
      ? Math.round(validPosttest.reduce((sum, p) => sum + (p.posttestScore ?? 0), 0) / validPosttest.length)
      : 0;
    const progressPct = Math.round(
      items.reduce((sum, p) => sum + (p.progressPercentage ?? 0), 0) / items.length
    );
    const completedModules = items.filter(p => p.isGraduated).length;
    return { preTest, postTest, progressPct, totalModules: items.length, completedModules };
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
              <p className="text-sm text-[#8a8d98]">
                {isLoading ? 'Memuat data siswa...' : 'Memeriksa otorisasi...'}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
          <Link href="/modul-guru/manajemen" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530]">
            <span>←</span> Kembali ke Manajemen Modul
          </Link>
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error || 'Data siswa tidak ditemukan.'}
          </div>
        </main>
      </div>
    );
  }

  const progressItems = studentData.progress || [];
  const { preTest, postTest, progressPct, totalModules, completedModules } = aggregateProgress(progressItems);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link href="/modul-guru/manajemen" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530]">
          <span>←</span> Kembali ke Manajemen Modul
        </Link>

        <div className="mt-4 flex flex-col gap-6 sm:mt-6 lg:flex-row lg:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0ebff]">
                <span className="text-xl font-bold text-[#7054dc]">
                  {(studentData.siswaName || 'S').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-[#232530]">{studentData.siswaName || 'Siswa'}</h1>
                <p className="text-[12px] text-[#7a7e8a]">{studentData.email || '-'}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-stretch gap-3 sm:mt-6 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f8e8f0] to-[#fdf4f8] px-5 py-4">
                <span className="text-[28px] font-bold text-[#e85d8a]">{preTest}</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Rata-rata Pre-Test</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                <span className="text-[28px] font-bold text-[#7054dc]">{postTest}</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Rata-rata Post-Test</span>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-[#e7e2f6]">
                    <div className="h-full rounded-full bg-[#7054dc] transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold text-[#232530]">{progressPct}%</span>
                </div>
                <p className="text-[11px] text-[#7a7e8a]">{completedModules} dari {totalModules} Modul Selesai</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-[14px] font-semibold text-[#232530]">Rincian Progress per Modul</h2>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white">
                <div className="min-w-[550px]">
                  {progressItems.length === 0 ? (
                    <div className="px-5 py-12 text-center text-[13px] text-[#8a8d98]">
                      Belum ada data progress untuk siswa ini.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.6fr_0.8fr] gap-4 bg-[#f0eff5] px-5 py-3 text-[12px] font-semibold text-[#232530]">
                        <span>Modul ID</span>
                        <span>Pre-Test</span>
                        <span>Post-Test</span>
                        <span>Progress</span>
                        <span>Nilai</span>
                        <span>Status</span>
                      </div>
                      {progressItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.6fr_0.8fr] items-center gap-4 border-t border-[#f0eff5] px-5 py-3.5 text-[12px]">
                          <span className="truncate text-[#232530]" title={item.modulId}>
                            {item.modulId.length > 12 ? `${item.modulId.slice(0, 12)}...` : item.modulId}
                          </span>
                          <span className="text-[#232530]">{item.pretestScore ?? '-'}</span>
                          <span className="text-[#232530]">{item.posttestScore ?? '-'}</span>
                          <span className="text-[#232530]">{Math.round(item.progressPercentage)}%</span>
                          <span className="text-[#232530]">{item.finalScore ?? '-'}</span>
                          <span>
                            {item.isGraduated ? (
                              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2a9d5c]">✅ Lulus</span>
                            ) : item.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#f39b39]">⏳ Selesai</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#7a7e8a]">📝 {item.status}</span>
                            )}
                          </span>
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
              <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-4 border-[#e5e3ee] bg-[#f0eff5]">
                <span className="text-4xl font-bold text-[#7054dc]">
                  {(studentData.siswaName || 'S').charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#232530]">{studentData.siswaName || 'Siswa'}</h3>
              <p className="mt-1 text-[12px] text-[#7a7e8a]">{studentData.email || '-'}</p>
            </div>

            {progressItems.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#e5e3ee] bg-[#f0f4ff] px-4 py-5">
                <p className="text-center text-[13px] font-semibold text-[#2a7fbf]">📘 Ringkasan</p>
                <p className="mt-3 text-[11px] leading-[1.7] text-[#5a5d6a]">
                  Siswa telah menyelesaikan {completedModules} dari {totalModules} modul
                  dengan rata-rata progress {progressPct}%.
                  {postTest > preTest && ` Nilai post-test (${postTest}) lebih tinggi dari pre-test (${preTest}), menunjukkan peningkatan pemahaman.`}
                  {postTest <= preTest && preTest > 0 && ` Perlu perhatian karena nilai post-test (${postTest}) tidak lebih tinggi dari pre-test (${preTest}).`}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SiswaDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <SiswaDetailPageContent />
    </Suspense>
  );
}
