'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2';
import { IoPersonCircle } from 'react-icons/io5';
import { FaHandsClapping } from 'react-icons/fa6';

import GuruHeader from '../../../component/guru/GuruHeader';
import CursorPagination from '../../../component/ui/CursorPagination';
import { guruProgressApi } from '../../../lib/api';
import type { CTAnalysisResponse } from '../../../lib/types/guru';

/* ─── Types ─── */

type CTKey = 'decomposition' | 'patternRecognition' | 'abstraction' | 'algorithm';
type ViewMode = 'ct-analysis' | 'ct-comparison' | 'ct-topik-summary' | 'quiz-table';

/* ─── Helpers ─── */

const PILLAR_META: Record<CTKey, { label: string; subLabel: string; color: string }> = {
  decomposition:    { label: 'Pemecahan Masalah',  subLabel: 'Decomposition',      color: '#5bb3f0' },
  patternRecognition: { label: 'Pengenalan Pola',  subLabel: 'Pattern Recognition', color: '#c565d4' },
  abstraction:      { label: 'Menyaring Informasi', subLabel: 'Abstraction',        color: '#4b7bf5' },
  algorithm:        { label: 'Menyusun Langkah',   subLabel: 'Algorithm',           color: '#f5a623' },
};

const STATUS_COLORS: Record<string, string> = {
  'Sangat Baik':       '#22c55e',
  'Baik':              '#22c55e',
  'Perlu Penguatan':   '#e8963a',
  'Butuh Intervensi':  '#d63c3c',
};

function getLabel(score: number): { grade: string; gradeColor: string } {
  if (score >= 85) return { grade: 'Sangat Baik',      gradeColor: '#22c55e' };
  if (score >= 70) return { grade: 'Baik',             gradeColor: '#22c55e' };
  if (score >= 50) return { grade: 'Perlu Penguatan',  gradeColor: '#e8963a' };
  return              { grade: 'Butuh Intervensi',     gradeColor: '#d63c3c' };
}

function getRecStyle(rec: string) {
  if (rec === 'Siap Pengayaan') return { bg: 'bg-[#e6f9ed]', text: 'text-[#2a9d5c]', icon: <FaHandsClapping size={18} className="text-[#2a9d5c]" /> };
  if (rec === 'Perlu Remedial') return { bg: 'bg-[#fdeaea]', text: 'text-[#d63c3c]', icon: <FaHandsClapping size={18} className="text-[#d63c3c]" /> };
  return { bg: 'bg-[#e8f4fc]', text: 'text-[#2a7fbf]', icon: <FaHandsClapping size={18} className="text-[#2a7fbf]" /> };
}

function getRecDesc(rec: string): string {
  if (rec === 'Siap Pengayaan') return 'Siswa menunjukkan pemahaman yang sangat baik pada semua topik.';
  if (rec === 'Perlu Remedial')  return 'Siswa perlu mengulang beberapa topik untuk memperkuat pemahaman.';
  return 'Siswa menunjukkan pemahaman yang baik pada sebagian besar topik, namun perlu mengulas kembali topik tertentu karena skor kuis di bawah ambang batas.';
}

/* ─── Pie Chart ─── */

function PieChart({ data, size = 240 }: { data: CTAnalysisResponse['computationalThinking'] | null; size?: number }) {
  if (!data) return <div className="flex items-center justify-center rounded-full border-4 border-dashed border-[#e5e3ee]" style={{ width: size, height: size }}><p className="text-[12px] text-[#8a8d98]">Belum ada data</p></div>;

  const entries = Object.entries(data) as [CTKey, { score: number }][];
  const sum = entries.reduce((a, [, v]) => a + v.score, 0);

  if (sum === 0) return <div className="flex items-center justify-center rounded-full border-4 border-dashed border-[#e5e3ee]" style={{ width: size, height: size }}><p className="text-[12px] text-[#8a8d98]">Belum ada data CT</p></div>;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  let cumulative = 0;

  const slices = entries.map(([key, val]) => {
    const startAngle = (cumulative / sum) * 360;
    cumulative += val.score;
    const endAngle = (cumulative / sum) * 360;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
    const labelR = radius * 0.6;
    return (
      <g key={key}>
        <path d={`M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`} fill={PILLAR_META[key].color} stroke="white" strokeWidth="3" />
        <text x={cx + Math.cos(midAngle) * labelR} y={cy + Math.sin(midAngle) * labelR} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={size * 0.058} fontWeight="700">{val.score}%</text>
      </g>
    );
  });

  return <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }} className="shrink-0">{slices}</svg>;
}

/* ─── Comparison Bar ─── */

function ComparisonBar({ label, subLabel, preTest, postTest, color, isHighest }: {
  label: string; subLabel: string; preTest: number; postTest: number; color: string; isHighest: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#eceaf4] bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold text-[#232530]">{label}</span>
          <span className="text-[12px] text-[#8a8d98]">{subLabel}</span>
        </div>
        {isHighest && <span className="text-[12px] font-semibold text-[#22c55e]">↗ Tertinggi</span>}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="w-[60px] text-[11px] text-[#8a8d98]">Pre-Test</span>
        <div className="flex-1"><div className="h-2.5 w-full rounded-full bg-[#eceaf4]"><div className="h-full rounded-full" style={{ width: `${preTest}%`, backgroundColor: '#c5bfe0' }} /></div></div>
        <span className="w-[36px] text-right text-[12px] font-semibold text-[#555968]">{preTest}%</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="w-[60px] text-[11px] text-[#d63c3c]">Post-Test</span>
        <div className="flex-1"><div className="h-2.5 w-full rounded-full bg-[#eceaf4]"><div className="h-full rounded-full" style={{ width: `${postTest}%`, backgroundColor: color }} /></div></div>
        <span className="w-[36px] text-right text-[12px] font-semibold text-[#555968]">{postTest}%</span>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

function SiswaDetailPageContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const modulId = searchParams.get('modulId');

  const [data, setData] = useState<CTAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<ViewMode>('ct-analysis');

  useEffect(() => {
    if (!studentId) { setError('Student ID tidak ditemukan'); setIsLoading(false); return; }
    guruProgressApi.analyze(studentId, modulId ?? undefined)
      .then(d => {
        setData(d);
        if (!d.topikCTAnalysis?.length) {
          setActiveView('quiz-table');
        }
      })
      .catch(() => setError('Gagal memuat data analisis siswa'))
      .finally(() => setIsLoading(false));
  }, [studentId, modulId]);

  const student = data?.studentInfo;
  const mod = data?.moduleProgress;
  const ct = data?.computationalThinking ?? null;
  const quizRecs = data?.quizRecords ?? [];
  const topikCT = data?.topikCTAnalysis ?? [];
  const rec = data?.recommendation ?? '';
  const isCT = topikCT.length > 0;

  // Quiz table pagination
  const QUIZ_PER_PAGE = 5;
  const [quizPage, setQuizPage] = useState(1);
  const totalQuizPages = Math.ceil(quizRecs.length / QUIZ_PER_PAGE);
  const paginatedQuiz = useMemo(() => quizRecs.slice((quizPage - 1) * QUIZ_PER_PAGE, quizPage * QUIZ_PER_PAGE), [quizPage, quizRecs]);

  // Highest CT improvement
  const improvements = ct
    ? (Object.entries(ct) as [CTKey, { preTest: number; postTest: number }][]).map(([key, val]) => ({ key, improvement: val.postTest - val.preTest }))
    : [{ key: 'algorithm' as CTKey, improvement: 0 }];
  const highestImprovement = improvements.reduce((max, curr) => curr.improvement > max.improvement ? curr : max, improvements[0]);

  const recStyle = getRecStyle(rec);
  const recDesc = getRecDesc(rec);

  if (isLoading) return (
    <div className="min-h-screen bg-[#f7f6fb]">
      <GuruHeader />
      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-6 sm:px-6">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-[#e8e6f0]" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_250px]">
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-[#e8e6f0]" />
            <div className="flex gap-3"><div className="h-16 w-36 animate-pulse rounded-2xl bg-[#e8e6f0]" /><div className="h-16 w-36 animate-pulse rounded-2xl bg-[#e8e6f0]" /><div className="h-16 flex-1 animate-pulse rounded-2xl bg-[#e8e6f0]" /></div>
            <div className="h-64 animate-pulse rounded-2xl bg-[#e8e6f0]" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-[#e8e6f0]" />
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f7f6fb]">
      <GuruHeader />
      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 pt-20 text-center">
          <HiExclamationCircle size={48} className="text-[#f36e65]" />
          <p className="text-[14px] text-red-500">{error}</p>
          <Link href={modulId ? `/modul-guru/manajemen?modulId=${modulId}` : '/modul-guru/manajemen'} className="mt-2 inline-flex h-[36px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[13px] font-semibold text-white">Kembali</Link>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        {/* Back link */}
        <Link
          href={modulId ? `/modul-guru/manajemen?modulId=${modulId}` : '/modul-guru/manajemen'}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]"
        >
          <FiArrowLeft size={15} />
          Kembali ke Daftar Siswa
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_250px]">
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Module info */}
            <div className="flex items-center gap-4">
              <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-xl border border-[#e5e3ee] bg-[#f3f4f8]">
                {mod?.moduleImgUrl ? (
                  <Image src={mod.moduleImgUrl} alt={mod.moduleName ?? ''} width={50} height={50} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📚</div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[17px] font-bold text-[#232530]">{mod?.moduleName ?? '—'}</h1>
                <p className="text-[12px] text-[#7a7e8a]">
                  {mod?.level ? `Jenjang ${mod.level}` : ''}{mod?.class ? ` | ${mod.class}` : ''}
                </p>
              </div>
            </div>

            {/* Score cards */}
            <div className="mt-5 flex flex-wrap items-stretch gap-3 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e6d3] bg-gradient-to-r from-[#fff4e6] to-[#fffaf2] px-5 py-3.5">
                <span className="text-[32px] font-bold leading-none text-[#f39b39]">{mod?.pretestScore ?? '—'}</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Nilai Pre-Test</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#d8d3f0] bg-gradient-to-r from-[#f0ecff] to-[#f5f2ff] px-5 py-3.5">
                <span className="text-[32px] font-bold leading-none text-[#7054dc]">{mod?.posttestScore ?? '—'}</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Nilai Post-Test</span>
              </div>
              <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eceaf4]">
                      <div className="h-full rounded-full bg-[#7054dc] transition-all" style={{ width: `${mod?.progressPercentage ?? 0}%` }} />
                    </div>
                    <span className="text-[13px] font-semibold text-[#232530]">{Math.round(mod?.progressPercentage ?? 0)}%</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#7a7e8a]">{mod?.completedMateri ?? 0} dari {mod?.totalMateri ?? 0} Materi Selesai</p>
                </div>
              </div>
            </div>

            {/* View switcher */}
            <div className="mt-6 flex flex-wrap gap-2">
              {isCT && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveView('ct-analysis')}
                    className={`rounded-xl px-5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${activeView === 'ct-analysis' ? 'bg-[#7054dc] text-white shadow-[0_2px_10px_rgba(112,84,220,0.3)]' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}
                  >
                    Analisis CT
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('ct-comparison')}
                    className={`rounded-xl px-5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${activeView === 'ct-comparison' ? 'bg-[#7054dc] text-white shadow-[0_2px_10px_rgba(112,84,220,0.3)]' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}
                  >
                    Perbandingan CT
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveView('ct-topik-summary')}
                className={`rounded-xl px-5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${activeView === 'ct-topik-summary' ? 'bg-[#7054dc] text-white shadow-[0_2px_10px_rgba(112,84,220,0.3)]' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}
              >
                Ringkasan per Topik
              </button>
              <button
                type="button"
                onClick={() => setActiveView('quiz-table')}
                className={`rounded-xl px-5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${activeView === 'quiz-table' ? 'bg-[#7054dc] text-white shadow-[0_2px_10px_rgba(112,84,220,0.3)]' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}
              >
                Rincian Nilai Kuis
              </button>
            </div>

            {/* ── VIEW: CT Analysis ── */}
            {activeView === 'ct-analysis' && isCT && (
              <div className="mt-6">
                <h2 className="text-[16px] font-bold text-[#232530]">Analisis Computational Thinking</h2>
                <div className="mt-4 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                  <PieChart data={ct} />
                  <div className="flex-1 space-y-5 pt-1">
                    {ct && (Object.entries(ct) as [CTKey, { score: number; label: string }][]).map(([key, val]) => {
                      const meta = PILLAR_META[key];
                      const color = STATUS_COLORS[val.label] || meta.color;
                      return (
                        <div key={key} className="flex items-start gap-3">
                          <span className="mt-[7px] h-[10px] w-[10px] shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                          <div>
                            <p className="text-[13px] font-medium text-[#555968]">{meta.label} ({meta.subLabel})</p>
                            <p className="mt-0.5 text-[20px] font-bold leading-tight text-[#232530]">{val.score}/100</p>
                            <p className="mt-0.5 text-[12px] font-semibold italic" style={{ color }}>{val.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── VIEW: CT Comparison ── */}
            {activeView === 'ct-comparison' && isCT && (
              <div className="mt-6">
                <h2 className="text-[16px] font-bold text-[#232530]">Analisis Perbandingan CT</h2>
                <p className="mt-1 text-[12px] text-[#7a7e8a]">Perbandingan persentase Pre-Test dan Post-Test per pilar</p>
                <div className="mt-4 space-y-3">
                  {ct && (Object.entries(ct) as [CTKey, { preTest: number; postTest: number }][]).map(([key, val]) => (
                    <ComparisonBar
                      key={key}
                      label={PILLAR_META[key].label}
                      subLabel={PILLAR_META[key].subLabel}
                      preTest={val.preTest}
                      postTest={val.postTest}
                      color={PILLAR_META[key].color}
                      isHighest={key === highestImprovement.key}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#f5e6d0] bg-gradient-to-r from-[#fff8f0] to-[#fff4e6] px-5 py-4">
                  <span className="mt-0.5 text-[18px]">😊</span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#f39b39]">Ringkasan</p>
                    <p className="mt-1 text-[12px] leading-[1.7] text-[#555968]">
                      Peningkatan tertinggi pada pilar{' '}
                      <span className="font-bold text-[#22c55e]">{PILLAR_META[highestImprovement.key].label} ({PILLAR_META[highestImprovement.key].subLabel})</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── VIEW: Ringkasan per Topik ── */}
            {activeView === 'ct-topik-summary' && (
              <div className="mt-6">
                <h2 className="text-[16px] font-bold text-[#232530]">Ringkasan CT per Topik</h2>
                <p className="mt-1 text-[12px] text-[#7a7e8a]">Skor Computational Thinking pada setiap topik</p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e6f0] bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-[#fafafe]">
                          <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#232530]">Topik</th>
                          {(Object.entries(PILLAR_META) as [CTKey, typeof PILLAR_META[CTKey]][]).map(([key, meta]) => (
                            <th key={key} className="px-4 py-3.5 text-center text-[12px] font-semibold" style={{ color: meta.color }}>
                              {meta.subLabel}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {topikCT.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[#8a8d98]">Belum ada data CT.</td>
                          </tr>
                        ) : (
                          topikCT.map((t) => (
                            <tr key={t.topikId} className="border-t border-[#f0eef6] text-[13px] text-[#232530]">
                              <td className="px-5 py-4 font-medium">{t.topikName}</td>
                              {(Object.keys(PILLAR_META) as CTKey[]).map((key) => {
                                const pillar = t.computationalThinking[key];
                                const sc = pillar.score;
                                const gradeColor = sc >= 85 ? '#22c55e' : sc >= 70 ? '#22c55e' : sc >= 50 ? '#e8963a' : '#d63c3c';
                                return (
                                  <td key={key} className="px-4 py-4 text-center">
                                    <span className="text-[15px] font-bold" style={{ color: gradeColor }}>{sc}</span>
                                    <span className="ml-1.5 text-[11px] font-medium text-[#8a8d98]">{pillar.label}</span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── VIEW: Rincian Nilai Kuis ── */}
            {activeView === 'quiz-table' && (
              <div className="mt-6">
                <h2 className="text-[16px] font-bold text-[#232530]">Rincian Nilai Kuis</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e6f0] bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[550px] border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-[#fafafe]">
                          <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#232530]">Topik</th>
                          <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#232530]">Kategori</th>
                          <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#232530]">Aktivitas</th>
                          <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#232530]">Nilai</th>
                          <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#232530]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizRecs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[#8a8d98]">Belum ada data kuis.</td>
                          </tr>
                        ) : (
                          paginatedQuiz.map((row, i) => (
                            <tr key={i} className="border-t border-[#f0eef6] text-[13px] text-[#232530]">
                              <td className="px-5 py-4">{row.topik}</td>
                              <td className="px-5 py-4">
                                {row.quizType === 'COMPUTATIONAL_THINKING' ? (
                                  <span className="text-[13px] font-medium text-[#7054dc]">Mode CT</span>
                                ) : (
                                  <span className="text-[#8a8d98]">Reguler</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-[#555968]">Kuis</td>
                              <td className="px-5 py-4 font-semibold">{row.score}</td>
                              <td className="px-5 py-4">
                                {row.status === 'tuntas' ? (
                                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#22c55e]">
                                    <HiCheckCircle size={16} /> Tuntas
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#f36e65]">
                                    <HiExclamationCircle size={16} /> Di bawah nilai minimal
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
                {totalQuizPages > 1 && (
                  <CursorPagination
                    currentPage={quizPage}
                    totalPages={totalQuizPages}
                    hasNext={quizPage < totalQuizPages}
                    hasPrev={quizPage > 1}
                    onNext={() => setQuizPage(p => Math.min(totalQuizPages, p + 1))}
                    onPrev={() => setQuizPage(p => Math.max(1, p - 1))}
                    onPageClick={page => setQuizPage(page)}
                  />
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Student profile ── */}
          <aside className="hidden lg:block">
            <div className="flex flex-col items-center">
              <div className="relative h-[140px] w-[140px]">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#d8b4fe]" />
                <div className="absolute inset-[6px] overflow-hidden rounded-full bg-[#f3f4f8]">
                  {student?.avatarUrl ? (
                    <Image src={student.avatarUrl} alt={student.fullName} width={128} height={128} className="h-full w-full object-cover" />
                  ) : (
                    <IoPersonCircle className="h-[140px] w-[140px] text-[#d8d3f0] -ml-[6px] -mt-[6px]" />
                  )}
                </div>
              </div>
              <h3 className="mt-5 text-[18px] font-semibold text-[#232530]">{student?.fullName ?? '—'}</h3>
              <p className="mt-1 text-[13px] text-[#8a8d98]">{student?.email ?? '—'}</p>

              {isCT && ct && (
                <div className="mt-5 w-full">
                  <p className="mb-2 text-center text-[12px] font-semibold text-[#555968]">Skor CT Keseluruhan</p>
                  <div className="flex justify-center">
                    <PieChart data={ct} size={160} />
                  </div>
                </div>
              )}

              {/* Context card */}
              <div className={`mt-6 w-full rounded-2xl border border-[#e8e6f0] px-5 py-5 text-center ${activeView === 'quiz-table' ? recStyle.bg : 'bg-[#fafafe]'}`}>
                {activeView === 'quiz-table' ? (
                  <>
                    <div className="mb-3 flex items-center justify-center gap-2">
                      {recStyle.icon}
                      <span className={`text-[14px] font-semibold ${recStyle.text}`}>{rec}</span>
                    </div>
                    <p className="text-[13px] leading-[1.7] text-[#555968]">{recDesc}</p>
                  </>
                ) : activeView === 'ct-analysis' ? (
                  <p className="text-[13px] leading-[1.7] text-[#555968]">
                    Analisis Computational Thinking pada Modul {mod?.moduleName ?? ''}
                  </p>
                ) : activeView === 'ct-topik-summary' ? (
                  <p className="text-[13px] leading-[1.7] text-[#555968]">
                    Rincian skor CT per topik untuk melihat pilar mana yang perlu dikuatkan pada setiap topik
                  </p>
                ) : (
                  <p className="text-[13px] leading-[1.7] text-[#555968]">
                    Perbandingan skor Pre-Test dan Post-Test untuk setiap pilar CT
                  </p>
                )}
              </div>
            </div>

            {/* View switcher (sidebar) */}
            <div className="mt-8 flex flex-col gap-2">
              {isCT && (
                <>
                  <button type="button" onClick={() => setActiveView('ct-analysis')} className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${activeView === 'ct-analysis' ? 'bg-[#7054dc] text-white' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}>
                    Analisis CT
                  </button>
                  <button type="button" onClick={() => setActiveView('ct-comparison')} className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${activeView === 'ct-comparison' ? 'bg-[#7054dc] text-white' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}>
                    Perbandingan CT
                  </button>
                  <button type="button" onClick={() => setActiveView('ct-topik-summary')} className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${activeView === 'ct-topik-summary' ? 'bg-[#7054dc] text-white' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}>
                    Ringkasan per Topik
                  </button>
                </>
              )}
              <button type="button" onClick={() => setActiveView('quiz-table')} className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${activeView === 'quiz-table' ? 'bg-[#7054dc] text-white' : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'}`}>
                Rincian Nilai Kuis
              </button>
            </div>
          </aside>
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
