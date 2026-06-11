'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { FiEdit2, FiPlus, FiTrash2, FiFilter, FiArrowLeft } from 'react-icons/fi';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import GuruHeader from '../../component/guru/GuruHeader';
import { useGuruModules } from '../hooks/useGuruModules';
import { guruModulApi, guruTopikApi, guruMateriApi, guruProgressApi, adminModulApi } from '../../lib/api';
import { useRoleGuard } from '../../lib/hooks/useRoleGuard';
import { usePopup } from '../../component/ui/PopupProvider';

function ManajemenModulContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const searchParams = useSearchParams();
  const modulId = searchParams.get('modulId');
  const { toast, confirm } = usePopup();

  // Mode 1: Detailed Module Management (modulId is present)
  const [moduleDetail, setModuleDetail] = useState<any>(null);
  const [topicCount, setTopicCount] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [errorStudents, setErrorStudents] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'penguatan' | 'remedial' | 'pengayaan' | null>(null);
  const [studentPage, setStudentPage] = useState(1);

  // Mode 2: Modules List Fallback (modulId is NOT present)
  const [searchModuleQuery, setSearchModuleQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const {
    modules,
    currentPageNumber,
    hasPrev,
    hasNext,
    isLoading: isLoadingModules,
    loadModules,
    nextPage,
    prevPage,
  } = useGuruModules(10);

  // Load modules list if in Mode 2
  useEffect(() => {
    if (!modulId && isAuthorized) {
      loadModules();
    }
  }, [modulId, isAuthorized, loadModules]);

  const filteredModules = useMemo(
    () => modules.filter((m) =>
      m.moduleName.toLowerCase().includes(searchModuleQuery.toLowerCase()),
    ),
    [modules, searchModuleQuery],
  );

  const handleDeleteModule = async (id: string) => {
    if (deletingId) return;
    const ok = await confirm({ message: 'Apakah Anda yakin ingin menghapus modul ini?', variant: 'danger', confirmText: 'Hapus' });
    if (!ok) return;
    setDeletingId(id);
    try {
      await guruModulApi.delete(id);
      loadModules();
    } catch (err) {
      console.error('Delete module error:', err);
      toast('Gagal menghapus modul.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Load details and students if in Mode 1
  const loadModuleDetails = useCallback(async () => {
    if (!modulId) return;
    setIsLoadingDetails(true);
    setErrorDetails('');
    try {
      const detail = await guruModulApi.detail(modulId);
      setModuleDetail(detail);
      
      const topics = await guruTopikApi.getByModul(modulId);
      setTopicCount(topics.length);

      const materials = await guruMateriApi.getByModul(modulId);
      setMaterialCount(materials.length);
    } catch (err) {
      console.error("Load module detail error:", err);
      setErrorDetails('Gagal memuat detail modul.');
    } finally {
      setIsLoadingDetails(false);
    }
  }, [modulId]);

  const loadEnrolledStudents = useCallback(async () => {
    if (!modulId) return;
    setIsLoadingStudents(true);
    setErrorStudents('');
    try {
      let moduleProgressArray: any[] = [];
      let isUsingAdminApi = false;

      // Coba gunakan endpoint khusus untuk mendapatkan siswa di modul ini (adminModulApi).
      // Terkadang backend membolehkan tutor mengaksesnya untuk modul mereka sendiri.
      try {
        const adminRes = await adminModulApi.getStudents(modulId, { limit: 100 });
        if (adminRes && adminRes.items) {
           moduleProgressArray = adminRes.items;
           isUsingAdminApi = true;
        }
      } catch (err) {
        console.warn("Tutor does not have access to admin module students endpoint, falling back to guruProgressApi", err);
      }

      if (!isUsingAdminApi) {
        // Fallback: Ambil progress dari semua siswa menggunakan endpoint progress guru
        let allStudents: any[] = [];
        let cursor: string | null = null;
        let hasMore = true;

        while (hasMore) {
          const res = await guruProgressApi.getAll(100, cursor, modulId);
          allStudents = [...allStudents, ...(res.items || [])];
          if (res.next_cursor) {
             cursor = res.next_cursor;
          } else {
             hasMore = false;
          }
        }

        // Karena user tutor ingin semua siswa terdaftarnya muncul, kita masukkan semuanya.
        // Jika tidak ada data progres untuk modul ini, set progres ke 0.
        allStudents.forEach(student => {
          const progressList = student.progress || student.progresses || [];
          const prog = progressList.find((p: any) => 
            p.modulId === modulId || 
            p.moduleId === modulId || 
            p.id_modul === modulId ||
            p.modul_id === modulId ||
            p.module?.id === modulId ||
            p.modul?.id === modulId ||
            p.id === modulId
          ) || (progressList.length > 0 ? progressList[0] : null);
          
          const activeProg = prog || { 
            progressPercentage: student.progressPercentage ?? 0, 
            completionRate: student.completionRate ?? 0,
            pretestScore: student.pretestScore ?? null,
            posttestScore: student.posttestScore ?? null,
            finalScore: student.finalScore ?? null
          };

          moduleProgressArray.push({
             ...activeProg,
             siswa: {
               nama_lengkap: student.siswaName || student.name || 'Siswa',
               email: student.email || '-',
             },
             siswaId: student.siswaId || student.id
          });
        });
      }

      if (moduleProgressArray.length === 0) {
        setEnrolledStudents([]);
        return;
      }

      // Map progress data langsung dari response detail modul
      const enrolled = moduleProgressArray.map((progressData: any) => {
        let rec: 'pengayaan' | 'remedial' | 'penguatan' = 'penguatan';
        let reason = '';

        if (progressData.posttestScore != null) {
          if (progressData.posttestScore >= 80) {
            rec = 'pengayaan';
            reason = `Nilai Post-Test sangat baik (${progressData.posttestScore}), siap untuk materi lanjutan.`;
          } else if (progressData.posttestScore < 60) {
            rec = 'remedial';
            reason = `Nilai Post-Test (${progressData.posttestScore}) di bawah standar kelulusan (60), perlu bimbingan ulang.`;
          } else {
            rec = 'penguatan';
            reason = `Nilai Post-Test cukup (${progressData.posttestScore}), perlu pemantapan materi.`;
          }
        } else {
          if (progressData.pretestScore != null && progressData.pretestScore < 50) {
            rec = 'remedial';
            reason = `Nilai Pre-Test rendah (${progressData.pretestScore}) dan belum menyelesaikan Post-Test.`;
          } else if (progressData.progressPercentage >= 80) {
            rec = 'pengayaan';
            reason = `Progres belajar sangat baik (${progressData.progressPercentage}%), hampir menyelesaikan modul.`;
          } else {
            rec = 'penguatan';
            reason = `Progres belajar sedang berjalan (${Math.round(progressData.progressPercentage || 0)}%), perlu pengerjaan materi berkelanjutan.`;
          }
        }

        // Mengecek object siswa yang mungkin di-populate oleh backend
        const studentName = progressData.siswa?.nama_lengkap || progressData.siswa?.name || progressData.siswaId || 'Siswa';
        const studentEmail = progressData.siswa?.email || '-';

        return {
          id: progressData.siswaId,
          name: studentName,
          email: studentEmail,
          progress: Math.round(Number(progressData.progressPercentage) || Number(progressData.completionRate) || Number(progressData.progress) || 0),
          preTest: progressData.pretestScore ?? '-',
          postTest: progressData.posttestScore ?? '-',
          rataKuis: progressData.finalScore ?? '-',
          rekomendasi: rec,
          reason: reason,
        };
      });

      setEnrolledStudents(enrolled);
    } catch (err) {
      console.error("Load enrolled students error:", err);
      setErrorStudents('Gagal memuat data progres siswa.');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [modulId]);

  useEffect(() => {
    if (modulId && isAuthorized) {
      loadModuleDetails();
      loadEnrolledStudents();
    }
  }, [modulId, isAuthorized, loadModuleDetails, loadEnrolledStudents]);

  // Handle student filtering and pagination
  const filteredStudents = useMemo(() => {
    return enrolledStudents
      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((s) => !activeFilter || s.rekomendasi === activeFilter);
  }, [enrolledStudents, searchQuery, activeFilter]);

  const STUDENTS_PER_PAGE = 10;
  const totalStudentPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * STUDENTS_PER_PAGE;
    return filteredStudents.slice(start, start + STUDENTS_PER_PAGE);
  }, [filteredStudents, studentPage]);

  const rekomendasiConfig = {
    penguatan: { label: 'Perlu Penguatan', bg: 'bg-[#e8f4fc]', text: 'text-[#2a7fbf]', icon: '📘' },
    remedial: { label: 'Perlu Remedial', bg: 'bg-[#fdeaea]', text: 'text-[#d63c3c]', icon: '🔴' },
    pengayaan: { label: 'Siap Pengayaan', bg: 'bg-[#e6f9ed]', text: 'text-[#2a9d5c]', icon: '💚' },
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7557ea] border-t-transparent mb-4"></div>
            <p className="text-sm text-[#8a8d98]">Memeriksa otorisasi...</p>
          </div>
        </main>
      </div>
    );
  }

  // --- MODE 1: DETAIL MANAGEMENT VIEW ---
  if (modulId) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />

        <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
          <Link href="/modul-guru" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]">
            <FiArrowLeft size={16} />
            Kembali ke Halaman Modul
          </Link>

          {isLoadingDetails ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
            </div>
          ) : errorDetails ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errorDetails}
            </div>
          ) : moduleDetail ? (
            <>
              {/* Module Header Card */}
              <div className="mt-4 flex flex-col items-start gap-4 sm:mt-6 sm:flex-row sm:gap-6">
                <div className="hidden h-[100px] w-[130px] shrink-0 overflow-hidden rounded-2xl bg-[#d4f0f7] sm:block sm:h-[140px] sm:w-[180px] relative border border-[#e5e3ee]">
                  <Image
                    src={moduleDetail.moduleImgUrl || "/assets/images/beranda-siswa/matapelajaran.png"}
                    alt={moduleDetail.moduleName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-[18px] font-bold text-[#232530] sm:text-[22px]">{moduleDetail.moduleName}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5a5d6a] sm:gap-x-4 sm:text-[12px]">
                    <span className="flex items-center gap-1">📘 {topicCount} Topik</span>
                    <span className="flex items-center gap-1">📋 {materialCount} Materi</span>
                    <span className="flex items-center gap-1">⏱ {moduleDetail.targetTime || 0} Jam</span>
                    <span className="flex items-center gap-1">📅 Materi dalam 6 Bulan</span>
                    <span className="flex items-center gap-1">📄 Sertifikat</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#7a7e8a]">
                    Jenjang {moduleDetail.level || 'SMA'} | Kelas {moduleDetail.class || '-'}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-[#7054dc]">
                    Siswa Terdaftar: {enrolledStudents.length}
                  </p>
                </div>
              </div>

              {/* Controls bar */}
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                <p className="max-w-[320px] text-[12px] leading-[1.6] text-[#7a7e8a]">
                  Klik nama siswa untuk melihat rincian nilai kuis per topik dan progres belajar secara mendalam.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-[40px] w-full items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 sm:w-auto shadow-sm">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setStudentPage(1); }}
                      placeholder="Cari nama siswa ..."
                      className="min-w-0 flex-1 bg-transparent text-[12px] text-[#232530] outline-none placeholder:text-[#9aa0ad] sm:w-[200px] sm:flex-none"
                    />
                    <FaSearch size={14} className="text-[#9aa0ad]" />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFilterOpen((p) => !p)}
                      className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] shadow-sm transition-colors"
                    >
                      <FiFilter size={14} />
                      Filter
                    </button>
                    {filterOpen && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-[200px] rounded-xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                        {activeFilter && (
                          <button
                            type="button"
                            onClick={() => { setActiveFilter(null); setStudentPage(1); setFilterOpen(false); }}
                            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#d63c3c] hover:bg-[#fef2f2]"
                          >
                            Reset Filter <span className="text-[14px]">×</span>
                          </button>
                        )}
                        {(['penguatan', 'remedial', 'pengayaan'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => { setActiveFilter(activeFilter === type ? null : type); setStudentPage(1); setFilterOpen(false); }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                              activeFilter === type ? 'bg-[#f0ecff] text-[#7054dc]' : 'text-[#232530] hover:bg-[#f7f6ff]'
                            }`}
                          >
                            {rekomendasiConfig[type].label}
                            {activeFilter === type && <span className="text-[#7054dc]">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table / List */}
              <div className="mt-4 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white shadow-sm">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.7fr_0.9fr_1fr] gap-4 bg-[#f0eff5] px-5 py-3 text-[12px] font-semibold text-[#232530]">
                    <span>Siswa</span>
                    <span>Progres</span>
                    <span className="text-center">Pre-Test</span>
                    <span className="text-center">Post-Test</span>
                    <span className="text-center">Rata-rata Kuis</span>
                    <span className="text-center">Rekomendasi</span>
                  </div>

                  {isLoadingStudents ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
                    </div>
                  ) : errorStudents ? (
                    <div className="px-5 py-8 text-center text-sm text-red-500">
                      {errorStudents}
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Image
                        src="/assets/images/beranda-siswa/belum-ada.png"
                        alt="Belum ada siswa"
                        width={160}
                        height={130}
                        className="h-auto w-[160px]"
                      />
                      <p className="mt-4 text-[13px] text-[#9aa0ad]">Belum ada siswa yang terdaftar</p>
                    </div>
                  ) : (
                    paginatedStudents.map((siswa) => {
                      const cfg = rekomendasiConfig[siswa.rekomendasi as 'penguatan' | 'remedial' | 'pengayaan'];
                      return (
                        <div key={siswa.id} className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.7fr_0.9fr_1fr] items-center gap-4 border-t border-[#f0eff5] px-5 py-3.5 text-[12px] text-[#232530] hover:bg-[#fcfcff] transition-colors">
                          <div>
                            <Link href={`/modul-guru/manajemen/siswa?studentId=${siswa.id}&modulId=${modulId}`} className="font-semibold text-[#232530] hover:text-[#7054dc] transition-colors">
                              {siswa.name}
                            </Link>
                            <p className="text-[10px] text-[#7a7e8a]">{siswa.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-[#e7e2f6]">
                              <div className="h-full rounded-full bg-[#7054dc] transition-all" style={{ width: `${siswa.progress}%` }} />
                            </div>
                            <span className="w-[34px] text-right text-[11px] font-semibold text-[#7a7e8a]">{siswa.progress}%</span>
                          </div>
                          <span className="text-center font-medium">{siswa.preTest}</span>
                          <span className="text-center font-medium">{siswa.postTest}</span>
                          <span className="text-center font-medium">{siswa.rataKuis}</span>
                          <div className="flex justify-center relative group">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text} cursor-help transition-all shadow-sm`}>
                              {cfg.icon} {cfg.label}
                            </span>
                            {/* Premium short reason tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-[240px] -translate-x-1/2 rounded-lg bg-[#232530] p-2 text-center text-[10px] text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-30">
                              {siswa.reason}
                              <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-[#232530]"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Student list pagination */}
              {!isLoadingStudents && totalStudentPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#818694]">
                  <button
                    type="button"
                    disabled={studentPage === 1}
                    onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                    className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      studentPage > 1
                        ? 'border-[#7557ea] text-[#7557ea] hover:bg-[#f0ebff]'
                        : 'border-[#d4d7e2] text-[#c6c8d0] cursor-not-allowed'
                    }`}
                  >
                    <MdKeyboardArrowLeft size={14} />
                    Sebelumnya
                  </button>
                  <span className="mx-3 text-xs font-semibold text-[#4d5260]">
                    Halaman {studentPage} dari {totalStudentPages}
                  </span>
                  <button
                    type="button"
                    disabled={studentPage === totalStudentPages}
                    onClick={() => setStudentPage((p) => Math.min(totalStudentPages, p + 1))}
                    className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      studentPage < totalStudentPages
                        ? 'border-[#7557ea] text-[#7557ea] hover:bg-[#f0ebff]'
                        : 'border-[#d4d7e2] text-[#c6c8d0] cursor-not-allowed'
                    }`}
                  >
                    Selanjutnya
                    <MdKeyboardArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Modul tidak ditemukan.
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- MODE 2: ALL MODULES LIST VIEW (FALLBACK) ---
  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#232530]">Manajemen Modul</h1>
            <p className="mt-1 text-[13px] text-[#7c808f]">Kelola modul Anda dan lihat progres belajar siswa</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-[44px] w-full items-center gap-3 rounded-full border border-[#e3e1ea] bg-white px-4 text-[#8a8d98] shadow-sm md:w-auto">
              <input
                type="text"
                value={searchModuleQuery}
                onChange={(e) => setSearchModuleQuery(e.target.value)}
                placeholder="Cari modul..."
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

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white shadow-sm">
          <table className="w-full min-w-[700px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#f0eff5] text-[13px] font-semibold text-[#232530]">
                <th className="px-5 py-3.5 text-left font-semibold">Judul Modul</th>
                <th className="px-5 py-3.5 text-left font-semibold">Tingkat</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingModules && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[13px] text-[#8a8d98]">
                    Memuat data...
                  </td>
                </tr>
              )}

              {!isLoadingModules && filteredModules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[13px] text-[#8a8d98]">
                    Tidak ada modul ditemukan.
                  </td>
                </tr>
              )}

              {!isLoadingModules &&
                filteredModules.map((modul) => (
                  <tr
                    key={modul.id}
                    className="border-t border-[#f0eff5] text-[13px] text-[#232530] transition-colors hover:bg-[#faf9ff]"
                  >
                    <td className="px-5 py-4 font-medium">{modul.moduleName}</td>
                    <td className="px-5 py-4 text-[#7c808f]">
                      {[modul.level, modul.class].filter(Boolean).join(' | Kelas ') || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                          modul.isDraft
                            ? 'bg-[#fef3e2] text-[#f39b39]'
                            : 'bg-[#e6f7e6] text-[#2e9b4e]'
                        }`}
                      >
                        {modul.isDraft ? 'Draft' : 'Terbit'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {!modul.isDraft && (
                          <Link
                            href={`/modul-guru/manajemen?modulId=${modul.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e6] border border-[#f39b39]"
                          >
                            Kelola
                          </Link>
                        )}
                        <Link
                          href={`/modul-guru/tambah/profil?modulId=${modul.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#7557ea] transition-colors hover:bg-[#f0ebff]"
                        >
                          <FiEdit2 size={13} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(modul.id)}
                          disabled={deletingId === modul.id}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#ff6b5d] transition-colors hover:bg-[#fff1ef] disabled:opacity-50"
                        >
                          <FiTrash2 size={13} />
                          {deletingId === modul.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoadingModules && modules.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#818694]">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={prevPage}
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                hasPrev
                  ? 'border-[#7557ea] text-[#7557ea] hover:bg-[#f0ebff]'
                  : 'border-[#d4d7e2] text-[#c6c8d0] cursor-not-allowed'
              }`}
            >
              <MdKeyboardArrowLeft size={14} />
              Sebelumnya
            </button>
            <span className="mx-3 text-xs font-semibold text-[#4d5260]">
              Halaman {currentPageNumber}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={nextPage}
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                hasNext
                  ? 'border-[#7557ea] text-[#7557ea] hover:bg-[#f0ebff]'
                  : 'border-[#d4d7e2] text-[#c6c8d0] cursor-not-allowed'
              }`}
            >
              Selanjutnya
              <MdKeyboardArrowRight size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ManajemenModulPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7557ea] border-t-transparent mb-4"></div>
            <p className="text-sm text-[#8a8d98]">Memuat data...</p>
          </div>
        </main>
      </div>
    }>
      <ManajemenModulContent />
    </Suspense>
  );
}
