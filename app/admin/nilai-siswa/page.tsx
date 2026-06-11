'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { FaHandsClapping } from 'react-icons/fa6';
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi2';
import { adminProgressApi } from '../../lib/api';
import type { AdminCTAnalysisData } from '../../lib/types/admin';
import AdminHeader from '../../component/admin/AdminHeader';

/* ───────────────── helpers ───────────────── */

const PILLAR_META: Record<
  string,
  { fullLabel: string; color: string }
> = {
  decomposition: {
    fullLabel: 'Memecah Masalah (Decomposition)',
    color: '#5bb8e8',
  },
  patternRecognition: {
    fullLabel: 'Mengenali Pola (Pattern Recognition)',
    color: '#e85d9e',
  },
  abstraction: {
    fullLabel: 'Menyaring Informasi (Abstraction)',
    color: '#7c5cf7',
  },
  algorithm: {
    fullLabel: 'Menyusun Langkah (Algorithm)',
    color: '#f5a545',
  },
};

const STATUS_COLORS: Record<string, string> = {
  'Sangat Baik': '#22c55e',
  Baik: '#5bb8e8',
  'Perlu Penguatan': '#e85d9e',
  'Butuh Intervensi': '#f5a545',
};

/* ───────────────── loading skeleton ───────────────── */

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[#e8e6f0] ${className}`}
    />
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <AdminHeader />
      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6">
        <Skeleton className="mb-6 h-5 w-48" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-[60px] w-[60px] rounded-2xl" />
              <div>
                <Skeleton className="mb-2 h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              <Skeleton className="h-[68px] w-[160px] rounded-2xl" />
              <Skeleton className="h-[68px] w-[160px] rounded-2xl" />
              <Skeleton className="h-[68px] min-w-[240px] flex-1 rounded-2xl" />
            </div>
            <Skeleton className="mt-7 h-6 w-56" />
            <div className="mt-5 flex gap-10">
              <Skeleton className="h-[260px] w-[260px] shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
          <aside className="hidden lg:block">
            <Skeleton className="mb-4 h-[320px] w-full rounded-2xl" />
            <Skeleton className="mb-2 h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </aside>
        </div>
      </main>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <AdminHeader />
      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6">
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <HiExclamationCircle size={48} className="text-[#f36e65]" />
          <h2 className="text-[18px] font-bold">Gagal Memuat Data</h2>
          <p className="max-w-md text-[13px] text-[#7a7e8a]">{message}</p>
          <Link
            href="/admin/manajemen-pengguna"
            className="mt-2 inline-flex h-[36px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[13px] font-semibold text-white"
          >
            Kembali
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ───────────────── pie chart ───────────────── */

function PieChart({ pillars }: { pillars: AdminCTAnalysisData['computationalThinking'] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 105;

  const segments = [
    { value: pillars.decomposition.score, label: `${pillars.decomposition.score}%`, color: PILLAR_META.decomposition.color, key: 'decomposition' },
    { value: pillars.algorithm.score, label: `${pillars.algorithm.score}%`, color: PILLAR_META.algorithm.color, key: 'algorithm' },
    { value: pillars.patternRecognition.score, label: `${pillars.patternRecognition.score}%`, color: PILLAR_META.patternRecognition.color, key: 'patternRecognition' },
    { value: pillars.abstraction.score, label: `${pillars.abstraction.score}%`, color: PILLAR_META.abstraction.color, key: 'abstraction' },
  ];

  const total = segments.reduce((a, s) => a + s.value, 0) || 360;

  let cumulativeAngle = -90;

  const slices = segments.map((seg) => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = radius * 0.6;
    const labelX = cx + labelRadius * Math.cos(midRad);
    const labelY = cy + labelRadius * Math.sin(midRad);

    return (
      <g key={seg.key}>
        <path
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={seg.color}
          stroke="white"
          strokeWidth="3"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="15"
          fontWeight="700"
        >
          {seg.label}
        </text>
      </g>
    );
  });

  return (
    <div className="relative">
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -8,
          width: size * 0.85,
          height: 18,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
        }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
      </svg>
    </div>
  );
}

/* ───────────────── main page ───────────────── */

function NilaiSiswaContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const tabParam = searchParams.get('tab');
  const [activeView, setActiveView] = useState<'ct' | 'kuis'>(tabParam === 'kuis' ? 'kuis' : 'ct');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminCTAnalysisData | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setError('Tidak ada siswa yang dipilih.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    adminProgressApi
      .analyze(studentId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat data siswa.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || 'Data tidak ditemukan.'} />;

  const { studentInfo, moduleProgress, computationalThinking, quizRecords, recommendation } = data;
  const moduleName = moduleProgress?.moduleName || 'Modul';
  const level = moduleProgress?.level || '';
  const cls = moduleProgress?.class || '';

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <AdminHeader />

      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6">
        <div className="mt-2">
          <Link
            href="/admin/manajemen-pengguna"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]"
          >
            <FiArrowLeft size={15} />
            Kembali ke Daftar Siswa
          </Link>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Module info */}
            <div className="flex items-center gap-4">
              <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-2xl bg-[#f3f4f8]">
                <Image
                  src={moduleProgress?.moduleImgUrl || '/assets/images/beranda-siswa/matapelajaran.png'}
                  alt={moduleName}
                  width={60}
                  height={60}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-[17px] font-bold text-[#232530]">{moduleName}</h1>
                <p className="text-[13px] text-[#8a8d98]">
                  {level ? `Jenjang ${level}` : ''}{cls ? ` | ${cls}` : ''}
                </p>
              </div>
            </div>

            {/* Scores row */}
            <div className="mt-5 flex flex-wrap items-stretch gap-4">
              {/* Pre-Test */}
              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e6d3] bg-[#fffaf2] px-5 py-3.5">
                <span className="text-[34px] font-semibold leading-none text-[#f39b39]">
                  {moduleProgress?.pretestScore ?? '-'}
                </span>
                <span className="text-[13px] font-medium text-[#555968]">Nilai Pre-Test</span>
              </div>

              {/* Post-Test */}
              <div className="flex items-center gap-3 rounded-2xl border border-[#d8d3f0] bg-[#f5f2ff] px-5 py-3.5">
                <span className="text-[34px] font-semibold leading-none text-[#7054dc]">
                  {moduleProgress?.posttestScore ?? '-'}
                </span>
                <span className="text-[13px] font-medium text-[#555968]">Nilai Post-Test</span>
              </div>

              {/* Progress */}
              <div className="flex min-w-[240px] flex-1 items-center gap-4 rounded-2xl border border-[#e8e6f0] bg-white px-5 py-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eceaf4]">
                      <div
                        className="h-full rounded-full bg-[#7054dc] transition-all"
                        style={{ width: `${moduleProgress?.progressPercentage || 0}%` }}
                      />
                    </div>
                    <span className="text-[14px] font-semibold text-[#232530]">
                      {Math.round(moduleProgress?.progressPercentage || 0)}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-[#555968]">
                    {moduleProgress?.completedMateri || 0} dari {moduleProgress?.totalMateri || 0} Materi Selesai
                  </p>
                </div>
              </div>
            </div>

            {/* Section heading */}
            <h2 className="mt-7 text-[16px] font-bold text-[#232530]">
              {activeView === 'ct' ? 'Analisis Computational Thinking' : 'Rincian Nilai Kuis'}
            </h2>

            {/* CT Analysis View */}
            {activeView === 'ct' && (
              <div className="mt-5 flex flex-col items-center gap-10 md:flex-row md:items-start">
                <div className="shrink-0">
                  <PieChart pillars={computationalThinking} />
                </div>

                <div className="flex-1 space-y-5 pt-1">
                  {Object.entries(PILLAR_META).map(([key, meta]) => {
                    const pillar = computationalThinking[key as keyof typeof computationalThinking] as { score: number; label: string } | undefined;
                    const score = pillar?.score ?? 0;
                    const label = pillar?.label ?? 'Tidak Ada Data';
                    const color = STATUS_COLORS[label] || meta.color;
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <span
                          className="mt-[7px] h-[10px] w-[10px] shrink-0 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <div>
                          <p className="text-[13px] font-medium text-[#555968]">{meta.fullLabel}</p>
                          <p className="mt-0.5 text-[20px] font-bold leading-tight text-[#232530]">
                            {score}/100
                          </p>
                          <p className="mt-0.5 text-[13px] font-semibold italic" style={{ color }}>
                            {label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quiz Details View */}
            {activeView === 'kuis' && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e6f0] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-[#fafafe] text-left text-[13px] font-medium text-[#8a8d98]">
                        <th className="px-5 py-4 font-medium">Topik</th>
                        <th className="px-5 py-4 font-medium">Kategori</th>
                        <th className="px-5 py-4 font-medium">Aktivitas</th>
                        <th className="px-5 py-4 font-medium">Nilai</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[#8a8d98]">
                            Belum ada data kuis.
                          </td>
                        </tr>
                      ) : (
                        quizRecords.map((row, index) => (
                          <tr
                            key={index}
                            className="border-t border-[#f0eef6] text-[13px] text-[#232530]"
                          >
                            <td className="px-5 py-4">{row.topik}</td>
                            <td className="px-5 py-4">
                              {row.quizType === 'COMPUTATIONAL_THINKING' ? (
                                <span className="text-[13px] font-medium text-[#7054dc]">Mode CT</span>
                              ) : (
                                <span className="text-[#8a8d98]">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-[#555968]">Kuis</td>
                            <td className="px-5 py-4 font-semibold">{row.score}</td>
                            <td className="px-5 py-4">
                              {row.status === 'tuntas' ? (
                                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#22c55e]">
                                  <HiCheckCircle size={16} />
                                  Tuntas
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#f36e65]">
                                  <HiExclamationCircle size={16} />
                                  Di bawah nilai minimal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Student profile ── */}
          <aside className="hidden lg:block">
            <div className="flex flex-col items-center">
              <div className="relative h-[140px] w-[140px]">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#d8b4fe]" />
                <div className="absolute inset-[6px] overflow-hidden rounded-full bg-[#f3f4f8]">
                  {studentInfo.avatarUrl ? (
                    <Image
                      src={studentInfo.avatarUrl}
                      alt={studentInfo.fullName}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#7054dc] text-[40px] font-bold text-white">
                      {studentInfo.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="mt-5 text-[18px] font-semibold text-[#232530]">
                {studentInfo.fullName}
              </h3>
              <p className="mt-1 text-[13px] text-[#8a8d98]">{studentInfo.email}</p>

              <div className="mt-6 w-full rounded-2xl border border-[#e8e6f0] bg-[#fafafe] px-5 py-5 text-center">
                {activeView === 'ct' ? (
                  <p className="text-[13px] leading-[1.7] text-[#555968]">
                    Analisis Computational Thinking pada Kuis Topik{' '}
                    {moduleName}
                  </p>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <FaHandsClapping size={18} className="text-[#f39b39]" />
                      <span className="text-[14px] font-semibold text-[#f39b39]">{recommendation}</span>
                    </div>
                    <p className="text-[13px] leading-[1.7] text-[#555968]">
                      {recommendation === 'Siap Pengayaan'
                        ? 'Siswa menunjukkan pemahaman yang sangat baik pada semua topik.'
                        : recommendation === 'Perlu Remedial'
                          ? 'Siswa perlu mengulang beberapa topik untuk memperkuat pemahaman.'
                          : 'Siswa menunjukkan pemahaman yang baik pada sebagian besar topik, namun perlu mengulas kembali topik tertentu karena skor di bawah ambang batas.'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* View switcher buttons */}
            <div className="mt-8 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveView('ct')}
                className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  activeView === 'ct'
                    ? 'bg-[#7054dc] text-white'
                    : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'
                }`}
              >
                Analisis CT
              </button>
              <button
                type="button"
                onClick={() => setActiveView('kuis')}
                className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  activeView === 'kuis'
                    ? 'bg-[#7054dc] text-white'
                    : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'
                }`}
              >
                Rincian Nilai Kuis
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function NilaiSiswaPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NilaiSiswaContent />
    </Suspense>
  );
}
