'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import GuruHeader from '../../../../component/guru/GuruHeader';
import { guruProgressApi } from '../../../../lib/api';
import { useRoleGuard } from '../../../../lib/hooks/useRoleGuard';

type CTDimension = {
  label: string;
  score: number;
  grade: string;
  color: string;
  gradeColor: string;
};

const defaultDimensions: CTDimension[] = [
  { label: 'Memecah Masalah (Decomposition)', score: 0, grade: '-', color: '#5bb3f0', gradeColor: '#7a7e8a' },
  { label: 'Mengenali Pola (Pattern Recognition)', score: 0, grade: '-', color: '#c565d4', gradeColor: '#7a7e8a' },
  { label: 'Menyaring Informasi (Abstraction)', score: 0, grade: '-', color: '#4b7bf5', gradeColor: '#7a7e8a' },
  { label: 'Menyusun Langkah (Algorithm)', score: 0, grade: '-', color: '#f5a623', gradeColor: '#7a7e8a' },
];

function getGrade(score: number): { grade: string; gradeColor: string } {
  if (score >= 80) return { grade: 'Sangat Baik', gradeColor: '#2a9d5c' };
  if (score >= 60) return { grade: 'Baik', gradeColor: '#2a9d5c' };
  if (score >= 40) return { grade: 'Perlu Penguatan', gradeColor: '#e8963a' };
  return { grade: 'Butuh Intervensi', gradeColor: '#d63c3c' };
}

function PieChart({ dimensions }: { dimensions: CTDimension[] }) {
  const values = dimensions.map((d) => d.score);
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    return (
      <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full border-4 border-dashed border-[#e5e3ee]">
        <p className="text-[12px] text-[#8a8d98]">Belum ada data</p>
      </div>
    );
  }
  let cumulative = 0;

  const slices = dimensions.map((d, i) => {
    const startAngle = (cumulative / sum) * 360;
    cumulative += d.score;
    const endAngle = (cumulative / sum) * 360;
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
    const labelR = 62;
    const labelX = 120 + Math.cos(midAngle) * labelR;
    const labelY = 120 + Math.sin(midAngle) * labelR;

    const r = 100;
    const cx = 120;
    const cy = 120;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return (
      <g key={i}>
        <path
          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
          fill={d.color}
        />
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="700">
          {d.score}%
        </text>
      </g>
    );
  });

  return (
    <svg viewBox="0 0 240 240" className="h-[220px] w-[220px] shrink-0">
      {slices}
    </svg>
  );
}

function CTDetailPageContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [dimensions, setDimensions] = useState<CTDimension[]>(defaultDimensions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('Siswa');

  const loadAnalysis = useCallback(async () => {
    if (!studentId) {
      setError('Student ID tidak ditemukan.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Load student info
      const studentData = await guruProgressApi.getByStudent(studentId);
      setStudentName(studentData.siswaName || 'Siswa');

      // Load CT analysis
      const analysis = await guruProgressApi.analyze(studentId);
      if (analysis && Array.isArray(analysis) && analysis.length > 0) {
        // Try to map analysis data to CT dimensions
        // The API might return objects with various formats
        const mapped = defaultDimensions.map((dim, index) => {
          const item = analysis[index] as Record<string, unknown> | undefined;
          if (item) {
            const score = typeof item.score === 'number' ? item.score : 
                          typeof item.nilai === 'number' ? item.nilai : 0;
            const { grade, gradeColor } = getGrade(score);
            return { ...dim, score, grade, gradeColor };
          }
          return dim;
        });
        setDimensions(mapped);
      }
    } catch (err: unknown) {
      console.error('Load CT analysis error:', err);
      // Don't show error for CT analysis failure as it might not exist yet
      if (err instanceof Error && err.message.includes('Student')) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const totalScore = dimensions.reduce((s, d) => s + d.score, 0);

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
              <p className="text-sm text-[#8a8d98]">Memuat analisis CT...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link
          href={studentId ? `/modul-guru/manajemen/siswa?studentId=${studentId}` : '/modul-guru/manajemen/siswa'}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530]"
        >
          <span>←</span> Kembali ke Nilai Siswa
        </Link>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-6 sm:mt-6 lg:flex-row lg:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0ebff]">
                <span className="text-xl font-bold text-[#7054dc]">
                  {studentName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-[#232530]">{studentName}</h1>
                <p className="text-[12px] text-[#7a7e8a]">Analisis Computational Thinking</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-[14px] font-semibold text-[#232530]">Analisis Computational Thinking</h2>
              <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
                <PieChart dimensions={dimensions} />
                <div className="flex-1 space-y-5 pt-2">
                  {dimensions.map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <div>
                        <p className="text-[12px] font-medium text-[#232530]">{d.label}</p>
                        <p className="text-[16px] font-bold text-[#232530]">{d.score}/100</p>
                        <p className="text-[11px] font-semibold" style={{ color: d.gradeColor }}>{d.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[220px]">
            <div className="flex flex-col items-center">
              <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-4 border-[#e5e3ee] bg-[#f0eff5]">
                <span className="text-4xl font-bold text-[#7054dc]">
                  {studentName.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#232530]">{studentName}</h3>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-5">
              <p className="text-center text-[12px] leading-[1.7] text-[#5a5d6a]">
                Total skor CT: <span className="font-bold text-[#7054dc]">{totalScore}/400</span>
              </p>
              <p className="mt-2 text-center text-[11px] text-[#7a7e8a]">
                Analisis berdasarkan jawaban kuis siswa
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CTDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <CTDetailPageContent />
    </Suspense>
  );
}
