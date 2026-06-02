'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaBook,
  FaBookOpen,
  FaCalendarAlt,
  FaChartLine,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClipboardCheck,
  FaFileAlt,
  FaListAlt,
  FaRegDotCircle,
  FaStar,
  FaUsers,
} from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';
import SiswaHeader from '../../component/siswa/SiswaHeader';
import {
  siswaModulApi,
  siswaTopikApi,
  siswaProgressApi,
  type ModuleItem,
  type TopikItem,
  type ProgressDetail,
  ApiError,
} from '../../lib/api';

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}

function getModuleName(item: ModuleItem): string {
  return item.nama_modul || item.moduleName || 'Modul';
}

function getTutorName(item: ModuleItem): string {
  return item.tutor?.fullName || item.tutor?.nama_lengkap || 'Pengajar';
}

function getThumbnail(item: ModuleItem): string {
  return item.thumbnailUrl || item.thumbnail || '/assets/images/beranda-siswa/matapelajaran.png';
}

function getJenjangKelas(item: ModuleItem): string {
  const jenjang = item.jenjang ? `Jenjang ${item.jenjang.toUpperCase()}` : '';
  const kelas = item.kelas_sekolah ? `Kelas ${item.kelas_sekolah}` : '';
  if (jenjang && kelas) return `${jenjang} | ${kelas}`;
  return jenjang || kelas || '';
}

function getDifficulty(item: ModuleItem): string {
  return item.tingkat_kesulitan || item.difficulty || 'Menengah';
}

function getDescription(item: ModuleItem): string {
  return item.deskripsi || item.description || '';
}

function getUpdatedAt(item: ModuleItem): string {
  if (!item.updatedAt) return '-';
  return new Date(item.updatedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getTargetWaktu(item: ModuleItem): string {
  const t = item.target_waktu || item.targetTime;
  if (!t) return '-';
  const months = Math.floor(t / 30);
  const days = t % 30;
  if (months > 0 && days > 0) return `${months} Bulan ${days} Hari`;
  if (months > 0) return `${months} Bulan`;
  return `${days} Hari`;
}

function getPrice(item: ModuleItem): string | null {
  if (!item.isPaid || !item.modulPrice) return null;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.modulPrice);
}

export default function ModulDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [moduleData, setModuleData] = useState<ModuleItem | null>(null);
  const [topikData, setTopikData] = useState<TopikItem[]>([]);
  const [progress, setProgress] = useState<ProgressDetail | null>(null);
  const [openSection, setOpenSection] = useState<string>('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    // API may return array directly OR { data: [...] } or other wrapper
    function extractArray<T>(res: unknown): T[] {
      if (Array.isArray(res)) return res as T[];
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if ('data' in obj && Array.isArray(obj.data)) return obj.data as T[];
        if ('items' in obj && Array.isArray(obj.items)) return obj.items as T[];
      }
      return [];
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [modul, topikRaw] = await Promise.all([
          siswaModulApi.getById(id),
          siswaTopikApi.getByModul(id),
        ]);
        setModuleData(modul);
        const topik = extractArray<TopikItem>(topikRaw);
        setTopikData(topik);
        if (topik.length > 0) setOpenSection(topik[0].id);

        // Coba ambil progress (mungkin belum terdaftar)
        try {
          const prog = await siswaProgressApi.getByModul(id);
          setProgress(prog);
        } catch (_e) {
          // Belum terdaftar, tidak apa-apa
        }
      } catch (err: unknown) {
        console.error('Modul detail fetch error:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat detail modul');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setEnrollError('');
    try {
      await siswaModulApi.enroll(id);
      // Setelah enroll berhasil, langsung ke halaman materi
      window.location.href = `/modul/${id}/materi`;
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Sudah terdaftar — langsung ke materi
        window.location.href = `/modul/${id}/materi`;
      } else {
        setEnrollError(err instanceof Error ? err.message : 'Gagal mendaftar modul');
        setIsEnrolling(false);
      }
    }
  };

  const isEnrolled = progress !== null;
  const priceLabel = moduleData ? getPrice(moduleData) : null;

  const descriptionParagraphs = moduleData
    ? getDescription(moduleData).split('\n').filter(Boolean)
    : [];

  const visibleParagraphs = isDescriptionExpanded
    ? descriptionParagraphs
    : descriptionParagraphs.slice(0, 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#202126]">
        <SiswaHeader />
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
            <p className="text-sm text-[#8a8a96]">Memuat detail modul...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#202126]">
        <SiswaHeader />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-red-500">{error || 'Modul tidak ditemukan'}</p>
            <Link href="/eksplor-modul" className="mt-4 inline-block text-sm text-[#7054dc] hover:underline">
              ← Kembali ke Eksplor Modul
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#202126]">
      <SiswaHeader />

      <main className="pb-12">
        <section className="rounded-b-[40px] bg-[#E7E1FE]">
          <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28">
            <div className="flex flex-col gap-6 rounded-3xl bg-transparent lg:flex-row lg:items-start">
              <div className="mx-auto w-full max-w-[280px] shrink-0 rounded-2xl bg-white p-2 sm:p-3 lg:mx-0">
                <div className="overflow-hidden rounded-xl bg-white">
                  <div className="relative aspect-[16/10] w-full bg-white">
                    <Image
                      src={getThumbnail(moduleData)}
                      alt={`Ilustrasi ${getModuleName(moduleData)}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 280px"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="mb-8 mt-4 text-3xl font-bold text-[#202126]">{getModuleName(moduleData)}</h1>

                {moduleData.rating != null && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#202126]">
                    <span className="inline-flex items-center gap-1 text-[#f2b445]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar key={s} size={16} className={s <= Math.round(moduleData.rating ?? 0) ? 'text-[#f2b445]' : 'text-[#ddd]'} />
                      ))}
                    </span>
                    <span className="font-medium text-[#202126]">{Number(moduleData.rating).toFixed(1)}</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#202126]">
                  {topikData.length > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <FaBookOpen size={16} className="text-[#7054dc]" />
                      {topikData.length} Topik
                    </span>
                  )}
                  {topikData.length > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <FaListAlt size={16} className="text-[#7054dc]" />
                      {topikData.reduce((acc, t) => acc + (t.materi?.length ?? 0), 0)} Materi
                    </span>
                  )}
                  {moduleData.target_waktu || moduleData.targetTime ? (
                    <span className="inline-flex items-center gap-2">
                      <MdTimer size={16} className="text-[#7054dc]" />
                      {getTargetWaktu(moduleData)}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2">
                    <FaClipboardCheck size={16} className="text-[#7054dc]" />
                    Pre & Post Test
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaFileAlt size={16} className="text-[#7054dc]" />
                    Sertifikat
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-[#202126]">{getJenjangKelas(moduleData)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 sm:-mt-16">
          <div className="rounded-2xl border border-[#b6a8f0] bg-white p-4 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
              <div>
                <h2 className="text-sm font-semibold text-[#202126]">Deskripsi</h2>
                <div className="mt-3 space-y-3">
                  {visibleParagraphs.length > 0 ? (
                    visibleParagraphs.map((paragraph, index) => (
                      <p key={index} className="text-xs leading-relaxed text-[#4f5261] sm:text-sm">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-[#8a8a96] sm:text-sm">Deskripsi belum tersedia.</p>
                  )}
                </div>
                {descriptionParagraphs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                    className="mt-4 text-xs font-medium text-[#7054dc] hover:underline"
                  >
                    {isDescriptionExpanded ? 'Sembunyikan' : 'Selengkapnya'}{' '}
                    {isDescriptionExpanded ? (
                      <FaChevronUp className="ml-1 inline" size={10} />
                    ) : (
                      <FaChevronDown className="ml-1 inline" size={10} />
                    )}
                  </button>
                )}
              </div>

              <aside className="space-y-2.5 rounded-xl border border-[#efedf7] bg-[#fcfbff] p-3 sm:p-4">
                {enrollError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{enrollError}</p>
                )}
                {priceLabel ? (
                  <p className="w-full text-center text-4xl font-bold text-[#7054dc]">{priceLabel}</p>
                ) : (
                  <p className="text-xs text-[#72758a]">
                    {isEnrolled ? 'Kelas aktif kamu' : 'Gratis mengakses kelas ini'}
                  </p>
                )}

                {isEnrolled ? (
                  <Link
                    href={`/modul/${id}/materi`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Lanjutkan Belajar
                  </Link>
                ) : priceLabel ? (
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isEnrolling ? 'Memproses...' : 'Daftar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isEnrolling ? 'Memproses...' : 'Daftar Gratis'}
                  </button>
                )}

                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#7054dc] px-3 py-2.5 text-sm font-medium text-[#7054dc] transition-colors hover:bg-[#f6f2ff]"
                >
                  <FaUsers size={12} />
                  Kelompok Belajar
                </button>

                {isEnrolled && progress && (
                  <div className="mt-2 rounded-lg bg-[#f5f2ff] p-3">
                    <p className="text-xs font-semibold text-[#7054dc]">Progress Kamu</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e2ec]">
                        <div
                          className="h-full rounded-full bg-[#7054dc]"
                          style={{ width: `${progress.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#7054dc]">{Math.round(progress.progressPercentage || 0)}%</span>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:mt-10 sm:px-6 lg:grid-cols-[1fr_290px]">
          <div>
            {topikData.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-[#202126]">Materi yang Dipelajari</h3>
                <div className="mt-4 space-y-3">
                  {topikData.map((topik: TopikItem) => {
                    const isOpen = openSection === topik.id;
                    return (
                      <article key={topik.id} className="overflow-hidden rounded-xl border border-[#dcdae6] bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenSection(isOpen ? '' : topik.id)}
                          className={`flex w-full items-center justify-between px-4 py-6 text-left text-sm font-semibold ${
                            isOpen ? 'bg-[#efebff] text-[#7054dc]' : 'text-[#202126]'
                          }`}
                        >
                          {topik.nama_topik}
                          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>

                        {isOpen && topik.materi && topik.materi.length > 0 && (
                          <div className="space-y-3 border-t border-[#e7e4f2] px-4 py-3">
                            {topik.materi.map((m) => (
                              <p key={m.id} className="flex items-center gap-2 text-sm text-[#3f4454]">
                                <FaRegDotCircle size={10} className="text-[#4f5364]" />
                                {m.nama_materi}
                              </p>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-[#202126]">Pengajar</h4>
              <div className="mt-3 flex items-start gap-3 text-sm text-[#3f4454]">
                <img
                  src={getAvatarUrl(getTutorName(moduleData))}
                  alt="Foto profil pengajar"
                  className="h-10 w-10 rounded-full border border-[#e7e4f2] bg-[#f3f1ff] object-cover"
                />
                <p>
                  {getTutorName(moduleData)}
                  <br />
                  <span className="font-bold">Pengajar</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#202126]">Terakhir Update</h4>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                <FaCalendarAlt className="text-[#f39b39]" />
                {getUpdatedAt(moduleData)}
              </p>
            </div>

            {(moduleData.target_waktu || moduleData.targetTime) && (
              <div>
                <h4 className="text-lg font-bold text-[#202126]">Durasi Pembelajaran</h4>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                  <FaBook className="text-[#f39b39]" />
                  {getTargetWaktu(moduleData)}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-[#202126]">Tingkat Kesulitan</h4>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                <FaChartLine className="text-[#f39b39]" />
                {getDifficulty(moduleData)}
              </p>
            </div>

            {isEnrolled && progress && (
              <div>
                <h4 className="text-lg font-bold text-[#202126]">Status Belajar</h4>
                <div className="mt-3 space-y-1 text-sm text-[#3f4454]">
                  {progress.pretestScore != null && (
                    <p className="inline-flex items-center gap-2">
                      <FaCheck className="text-[#37b66a]" size={12} />
                      Pre-Test: {progress.pretestScore}/100
                    </p>
                  )}
                  {progress.posttestScore != null && (
                    <p className="inline-flex items-center gap-2">
                      <FaCheck className="text-[#37b66a]" size={12} />
                      Post-Test: {progress.posttestScore}/100
                    </p>
                  )}
                  {progress.isGraduated && (
                    <p className="inline-flex items-center gap-2 font-semibold text-[#f39b39]">
                      <FaCheck className="text-[#f39b39]" size={12} />
                      Lulus
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
