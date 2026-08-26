'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { HiExclamationCircle } from 'react-icons/hi2';

import GuruHeader from '../../../component/guru/GuruHeader';
import { guruProgressApi } from '../../../lib/api';
import type { ModuleExportDetail } from '../../../lib/types/guru';

/* ─── Components ─── */

function ctAbbr(aspect: string | null | undefined): string {
  if (!aspect) return '';
  const a = aspect.toLowerCase();
  if (a.includes('decomposition')) return 'D';
  if (a.includes('pattern') || a.includes('recognition')) return 'P';
  if (a.includes('abstraction')) return 'A';
  if (a.includes('algorithm')) return 'AL';
  return '';
}

function CTGlobalTable({ 
  title, 
  group, 
  students, 
  isPretest, 
  isPosttest 
}: { 
  title: string, 
  group: { label: string; questions: Array<{ id: string; ctAspect: string | null }> }, 
  students: ModuleExportDetail['students'],
  isPretest?: boolean,
  isPosttest?: boolean
}) {
  if (group.questions.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-[16px] font-bold text-[#232530] mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-[#e8e6f0] bg-white">
        <table className="w-full min-w-max border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr className="bg-[#fafafe]">
              <th className="border-b border-r border-[#e8e6f0] px-4 py-3 font-semibold text-center sticky left-0 bg-[#fafafe] z-20 w-[50px]">No</th>
              <th className="border-b border-r border-[#e8e6f0] px-4 py-3 font-semibold text-left sticky left-[50px] bg-[#fafafe] z-20 w-[200px]">Nama Siswa</th>
              {group.questions.map((q, idx) => (
                <th key={q.id} className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap">
                  S-{idx + 1} <span className="text-[#8a8d98] text-[10px] block font-normal">{ctAbbr(q.ctAspect)}</span>
                </th>
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
            {students.map((siswa, sIdx) => {
              const answersMap = isPretest ? siswa.pretestAnswers : isPosttest ? siswa.posttestAnswers : siswa.quizAnswers;
              const sums = { D: 0, P: 0, A: 0, AL: 0 };
              let totalBenar = 0;

              group.questions.forEach(q => {
                const isCorrect = answersMap[q.id] === true;
                if (isCorrect) {
                  totalBenar++;
                  const abbr = ctAbbr(q.ctAspect);
                  if (abbr === 'D') sums.D++;
                  else if (abbr === 'P') sums.P++;
                  else if (abbr === 'A') sums.A++;
                  else if (abbr === 'AL') sums.AL++;
                }
              });

              const score = isPretest ? siswa.pretestScore : isPosttest ? siswa.posttestScore : Math.round((totalBenar / group.questions.length) * 100);

              return (
                <tr key={siswa.siswaId} className="border-t border-[#f0eef6] hover:bg-[#fcfcff]">
                  <td className="border-r border-[#e8e6f0] px-4 py-3 font-medium text-center sticky left-0 bg-white z-20 w-[50px]">{sIdx + 1}</td>
                  <td className="border-r border-[#e8e6f0] px-4 py-3 font-medium text-left sticky left-[50px] bg-white z-20 truncate max-w-[200px]" title={siswa.siswaName}>{siswa.siswaName}</td>
                  {group.questions.map(q => (
                    <td key={q.id} className="border-r border-[#e8e6f0] px-3 py-3 text-center">{answersMap[q.id] ? 1 : 0}</td>
                  ))}
                  <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#5bb3f0]">{sums.D}</td>
                  <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#c565d4]">{sums.P}</td>
                  <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#4b7bf5]">{sums.A}</td>
                  <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold text-[#f5a623]">{sums.AL}</td>
                  <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold">{totalBenar}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#7054dc]">{score ?? 0}</td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={group.questions.length + 7} className="px-4 py-8 text-center text-[#8a8d98]">Belum ada siswa terdaftar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegulerGlobalTable({ 
  title, 
  group, 
  students 
}: { 
  title: string, 
  group: { label: string; questions: Array<{ id: string }> }, 
  students: ModuleExportDetail['students'] 
}) {
  if (group.questions.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-[16px] font-bold text-[#232530] mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-[#e8e6f0] bg-white">
        <table className="w-full min-w-max border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr className="bg-[#fafafe]">
              <th className="border-b border-r border-[#e8e6f0] px-4 py-3 font-semibold text-center sticky left-0 bg-[#fafafe] z-20 w-[50px]">No</th>
              <th className="border-b border-r border-[#e8e6f0] px-4 py-3 font-semibold text-left sticky left-[50px] bg-[#fafafe] z-20 w-[200px]">Nama Siswa</th>
              {group.questions.map((q, idx) => (
                <th key={q.id} className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap">
                  S-{idx + 1}
                </th>
              ))}
              <th className="border-b border-r border-[#e8e6f0] px-3 py-3 font-semibold text-center whitespace-nowrap">Total Benar</th>
              <th className="border-b border-[#e8e6f0] px-4 py-3 font-semibold text-center">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {students.map((siswa, sIdx) => {
              const answersMap = siswa.quizAnswers;
              let totalBenar = 0;

              group.questions.forEach(q => {
                if (answersMap[q.id] === true) totalBenar++;
              });

              return (
                <tr key={siswa.siswaId} className="border-t border-[#f0eef6] hover:bg-[#fcfcff]">
                  <td className="border-r border-[#e8e6f0] px-4 py-3 font-medium text-center sticky left-0 bg-white z-20 w-[50px]">{sIdx + 1}</td>
                  <td className="border-r border-[#e8e6f0] px-4 py-3 font-medium text-left sticky left-[50px] bg-white z-20 truncate max-w-[200px]" title={siswa.siswaName}>{siswa.siswaName}</td>
                  {group.questions.map(q => (
                    <td key={q.id} className="border-r border-[#e8e6f0] px-3 py-3 text-center">{answersMap[q.id] ? 1 : 0}</td>
                  ))}
                  <td className="border-r border-[#e8e6f0] px-3 py-3 text-center font-semibold">{totalBenar}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#7054dc]">{Math.round((totalBenar / group.questions.length) * 100)}</td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={group.questions.length + 2} className="px-4 py-8 text-center text-[#8a8d98]">Belum ada siswa terdaftar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

function RekapKelasContent() {
  const searchParams = useSearchParams();
  const modulId = searchParams.get('modulId');

  const [data, setData] = useState<ModuleExportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!modulId) { setError('Modul ID tidak ditemukan'); setIsLoading(false); return; }
    guruProgressApi.getExportDetail(modulId)
      .then(d => {
        setData(d);
      })
      .catch(() => setError('Gagal memuat rekap jawaban kelas'))
      .finally(() => setIsLoading(false));
  }, [modulId]);

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

  const handleExportXLSX = async () => {
    if (!data) return;
    const xlsxModule = await import("xlsx");
    const XLSX = xlsxModule.default || xlsxModule;

    const CT_ASPECTS = ["D", "P", "A", "AL"];
    const wb = XLSX.utils.book_new();

    const flatPretestQuestions = data.pretestGroups.flatMap(g => g.questions) ?? [];
    const flatPosttestQuestions = data.posttestGroups.flatMap(g => g.questions) ?? [];

    // Pre-Test
    if (flatPretestQuestions.length > 0) {
      const rows = data.students.map((s) => {
        const row: Record<string, string | number> = { "Siswa": s.siswaName };
        const aspectCounts: Record<string, number> = { D: 0, P: 0, A: 0, AL: 0 };
        let totalBenar = 0;
        let qIdx = 1;
        for (const q of flatPretestQuestions) {
          const abbr = ctAbbr(q.ctAspect);
          const colKey = `S-${qIdx} (${abbr})`;
          const correct = s.pretestAnswers[q.id] ? 1 : 0;
          row[colKey] = correct;
          if (CT_ASPECTS.includes(abbr)) aspectCounts[abbr] = (aspectCounts[abbr] ?? 0) + correct;
          totalBenar += correct;
          qIdx++;
        }
        for (const asp of CT_ASPECTS) row[`${asp} Benar`] = aspectCounts[asp] ?? 0;
        row["Total Benar"] = totalBenar;
        row["Nilai"] = s.pretestScore ?? 0;
        return row;
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Pre-Test");
    }

    // Post-Test
    if (flatPosttestQuestions.length > 0) {
      const rows = data.students.map((s) => {
        const row: Record<string, string | number> = { "Siswa": s.siswaName };
        const aspectCounts: Record<string, number> = { D: 0, P: 0, A: 0, AL: 0 };
        let totalBenar = 0;
        let qIdx = 1;
        for (const q of flatPosttestQuestions) {
          const abbr = ctAbbr(q.ctAspect);
          const colKey = `S-${qIdx} (${abbr})`;
          const correct = s.posttestAnswers[q.id] ? 1 : 0;
          row[colKey] = correct;
          if (CT_ASPECTS.includes(abbr)) aspectCounts[abbr] = (aspectCounts[abbr] ?? 0) + correct;
          totalBenar += correct;
          qIdx++;
        }
        for (const asp of CT_ASPECTS) row[`${asp} Benar`] = aspectCounts[asp] ?? 0;
        row["Total Benar"] = totalBenar;
        row["Nilai"] = s.posttestScore ?? 0;
        return row;
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Post-Test");
    }

    // Kuis CT
    for (const group of data.ctQuizGroups) {
      const rows = data.students.map((s) => {
        const row: Record<string, string | number> = { "Siswa": s.siswaName };
        const aspectCounts: Record<string, number> = { D: 0, P: 0, A: 0, AL: 0 };
        let totalBenar = 0;
        let qIdx = 1;
        for (const q of group.questions) {
          const abbr = ctAbbr(q.ctAspect);
          const colKey = `S-${qIdx} (${abbr})`;
          const correct = s.quizAnswers[q.id] ? 1 : 0;
          row[colKey] = correct;
          if (CT_ASPECTS.includes(abbr)) aspectCounts[abbr] = (aspectCounts[abbr] ?? 0) + correct;
          totalBenar += correct;
          qIdx++;
        }
        for (const asp of CT_ASPECTS) row[`${asp} Benar`] = aspectCounts[asp] ?? 0;
        row["Total Benar"] = totalBenar;
        row["Nilai"] = group.questions.length > 0 ? Math.round((totalBenar / group.questions.length) * 100) : 0;
        return row;
      });
      const sheetName = group.label.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
    }

    // Kuis Reguler
    for (const group of data.regulerQuizGroups) {
      const rows = data.students.map((s) => {
        const row: Record<string, string | number> = { "Siswa": s.siswaName };
        let totalBenar = 0;
        group.questions.forEach((q, idx) => {
          const colKey = `S-${idx + 1}`;
          const correct = s.quizAnswers[q.id] ? 1 : 0;
          row[colKey] = correct;
          totalBenar += correct;
        });
        row["Total Benar"] = totalBenar;
        row["Nilai"] = group.questions.length > 0 ? Math.round((totalBenar / group.questions.length) * 100) : 0;
        return row;
      });
      const sheetName = group.label.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    XLSX.writeFile(wb, `Rekap_Matriks_Modul_${modulId}_${timestamp}.xlsx`);
  };

  // For Pre/Post-test, flatten groups into one big group since it's just 1 test conceptually.
  const flatPretestQuestions = data?.pretestGroups.flatMap(g => g.questions) ?? [];
  const flatPosttestQuestions = data?.posttestGroups.flatMap(g => g.questions) ?? [];

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

        <div className="flex items-center justify-between mt-6">
          <div>
            <h1 className="text-[20px] font-bold text-[#232530]">Rekap Matriks Kelas</h1>
            <p className="mt-1 text-[13px] text-[#7a7e8a]">Matriks rekap jawaban benar (1) dan salah (0) untuk seluruh siswa di modul ini.</p>
          </div>
          <button
            type="button"
            onClick={handleExportXLSX}
            disabled={!data || data.students.length === 0}
            className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm transition-colors"
          >
            <FiDownload size={14} />
            Export XLSX
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-[#e8e6f0] bg-white px-5 py-3 text-[12px] text-[#7a7e8a] shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-[#232530]">Aspek CT:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span><strong className="text-[#5bb3f0]">D</strong> = Dekomposisi</span>
              <span><strong className="text-[#c565d4]">P</strong> = Pengenalan Pola</span>
              <span><strong className="text-[#4b7bf5]">A</strong> = Abstraksi</span>
              <span><strong className="text-[#f5a623]">AL</strong> = Algoritmik</span>
            </div>
          </div>
          <div className="h-4 w-px bg-[#e8e6f0] hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#232530]">Nilai Jawaban:</span>
            <span><strong>1</strong> = Benar</span>
            <span><strong>0</strong> = Salah</span>
          </div>
        </div>

        {data ? (
          <div className="mt-4 pb-10 space-y-10">
            {/* PRE-TEST */}
            {flatPretestQuestions.length > 0 && (
              <CTGlobalTable 
                title="Pre-Test" 
                group={{ label: 'Pre-Test', questions: flatPretestQuestions }} 
                students={data.students} 
                isPretest 
              />
            )}

            {/* POST-TEST */}
            {flatPosttestQuestions.length > 0 && (
              <CTGlobalTable 
                title="Post-Test" 
                group={{ label: 'Post-Test', questions: flatPosttestQuestions }} 
                students={data.students} 
                isPosttest 
              />
            )}

            {/* KUIS PER TOPIK */}
            {(() => {
              const topicNames = Array.from(new Set([
                ...data.ctQuizGroups.map(g => g.label.replace('Kuis CT - ', '')),
                ...data.regulerQuizGroups.map(g => g.label.replace('Kuis Reguler - ', ''))
              ]));

              return topicNames.map((topic, i) => {
                const ctGroup = data.ctQuizGroups.find(g => g.label === `Kuis CT - ${topic}`);
                const regGroup = data.regulerQuizGroups.find(g => g.label === `Kuis Reguler - ${topic}`);

                return (
                  <div key={i} className="space-y-10">
                    {ctGroup && (
                      <CTGlobalTable 
                        title={ctGroup.label} 
                        group={ctGroup} 
                        students={data.students} 
                      />
                    )}
                    {regGroup && (
                      <RegulerGlobalTable 
                        title={regGroup.label} 
                        group={regGroup} 
                        students={data.students} 
                      />
                    )}
                  </div>
                );
              });
            })()}
            
            {data.pretestGroups.length === 0 && data.ctQuizGroups.length === 0 && data.regulerQuizGroups.length === 0 && (
               <div className="mt-8 rounded-2xl border border-[#e8e6f0] bg-white p-8 text-center text-[13px] text-[#8a8d98]">
                 Belum ada data detail matriks (Pre-Test, Post-Test, atau Kuis) di modul ini.
               </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function RekapKelasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <RekapKelasContent />
    </Suspense>
  );
}
