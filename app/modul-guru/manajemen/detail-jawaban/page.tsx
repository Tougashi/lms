'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { HiExclamationCircle } from 'react-icons/hi2';

import GuruHeader from '../../../component/guru/GuruHeader';
import { guruProgressApi } from '../../../lib/api';
import type { CTAnalysisResponse } from '../../../lib/types/guru';

/* ─── Components ─── */

function CTMatrixTable({ title, matrix, studentName }: { title: string, matrix?: { headers: any[], answers: Record<string, 1|0> }, studentName: string }) {
  if (!matrix || !matrix.headers || matrix.headers.length === 0) return null;
  const { headers, answers } = matrix;
  
  const sums = { D: 0, P: 0, A: 0, AL: 0 };
  let total = 0;
  headers.forEach(h => {
    const isCorrect = answers[h.id] === 1;
    if (isCorrect) {
      if (h.pillar === 'decomposition') sums.D++;
      else if (h.pillar === 'patternRecognition') sums.P++;
      else if (h.pillar === 'abstraction') sums.A++;
      else if (h.pillar === 'algorithm') sums.AL++;
      total++;
    }
  });
  
  const finalScore = Math.round((total / headers.length) * 100);

  return (
    <div className="mt-8">
      <h3 className="text-[16px] font-bold text-[#232530] mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-[#e8e6f0] bg-white">
        <table className="w-full min-w-max border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr className="bg-[#fafafe]">
              <th className="border-b border-r border-[#e8e6f0] px-4 py-3 font-semibold text-left sticky left-0 bg-[#fafafe] z-10">Siswa</th>
              {headers.map(h => (
                <th key={h.id} className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap">{h.label}</th>
              ))}
              <th className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap text-[#5bb3f0]">D Benar</th>
              <th className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap text-[#c565d4]">P Benar</th>
              <th className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap text-[#4b7bf5]">A Benar</th>
              <th className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap text-[#f5a623]">AL Benar</th>
              <th className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap">Total Benar</th>
              <th className="border-b border-[#e8e6f0] px-4 py-3 font-semibold text-center">Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-[#e8e6f0] px-4 py-3 font-medium text-left sticky left-0 bg-white z-10">{studentName}</td>
              {headers.map(h => (
                <td key={h.id} className="border-r border-[#e8e6f0] px-3 py-3 text-center">{answers[h.id] ?? 0}</td>
              ))}
              <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#5bb3f0]">{sums.D}</td>
              <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#c565d4]">{sums.P}</td>
              <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#4b7bf5]">{sums.A}</td>
              <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#f5a623]">{sums.AL}</td>
              <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold">{total}</td>
              <td className="px-4 py-3 text-center font-bold text-[#7054dc]">{finalScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

function DetailJawabanContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const modulId = searchParams.get('modulId');

  const [data, setData] = useState<CTAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) { setError('Student ID tidak ditemukan'); setIsLoading(false); return; }
    guruProgressApi.analyze(studentId, modulId ?? undefined)
      .then(d => {
        setData(d);
      })
      .catch(() => setError('Gagal memuat detail jawaban siswa'))
      .finally(() => setIsLoading(false));
  }, [studentId, modulId]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#f7f6fb]">
      <GuruHeader />
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-6 sm:px-6">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-[#e8e6f0]" />
        <div className="mt-6 space-y-4">
          <div className="h-[200px] animate-pulse rounded-2xl bg-[#e8e6f0]" />
          <div className="h-[200px] animate-pulse rounded-2xl bg-[#e8e6f0]" />
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f7f6fb]">
      <GuruHeader />
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 pt-20 text-center">
          <HiExclamationCircle size={48} className="text-[#f36e65]" />
          <p className="text-[14px] text-red-500">{error}</p>
          <Link href={modulId ? `/modul-guru/manajemen?modulId=${modulId}` : '/modul-guru/manajemen'} className="mt-2 inline-flex h-[36px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[13px] font-semibold text-white">Kembali</Link>
        </div>
      </main>
    </div>
  );

  const studentName = data?.studentInfo?.fullName ?? 'Siswa';

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link
          href={modulId ? `/modul-guru/manajemen?modulId=${modulId}` : '/modul-guru/manajemen'}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]"
        >
          <FiArrowLeft size={15} />
          Kembali ke Manajemen Modul
        </Link>

        <div className="mt-6">
          <h1 className="text-[20px] font-bold text-[#232530]">Detail Jawaban Siswa</h1>
          <p className="mt-1 text-[13px] text-[#7a7e8a]">Matriks rekap jawaban benar (1) dan salah (0) atas nama <strong className="text-[#232530]">{studentName}</strong></p>
        </div>

        {data?.matrixData ? (
          <div className="mt-4">
            <CTMatrixTable title="Pre-Test" matrix={data.matrixData.pretest} studentName={studentName} />
            <CTMatrixTable title="Post-Test" matrix={data.matrixData.posttest} studentName={studentName} />
            <CTMatrixTable title="Kuis" matrix={data.matrixData.quizzes} studentName={studentName} />
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#e8e6f0] bg-white p-8 text-center text-[13px] text-[#8a8d98]">
            Belum ada data detail jawaban untuk siswa ini.
          </div>
        )}
      </main>
    </div>
  );
}

export default function DetailJawabanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <DetailJawabanContent />
    </Suspense>
  );
}
