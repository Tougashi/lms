'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  FiBookOpen,
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiLayers,
} from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';

import GuruHeader from '../../../component/guru/GuruHeader';
import { guruModulApi, guruProfileApi } from '../../../lib/api';
import { useRoleGuard } from '../../../lib/hooks/useRoleGuard';
import { usePopup } from '../../../component/ui/PopupProvider';
import type { GuruModuleItem, TutorProfile } from '../../../lib/types/guru';

function SertifikatPageContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const searchParams = useSearchParams();
  const router = useRouter();
  const modulId = searchParams.get('modulId');

  const [isLoading, setIsLoading] = useState(true);
  const [modulDetail, setModulDetail] = useState<GuruModuleItem | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [error, setError] = useState('');
  const { toast, confirm } = usePopup();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const requests: [Promise<GuruModuleItem> | null, Promise<TutorProfile>] = [
          modulId ? guruModulApi.detail(modulId) : null,
          guruProfileApi.get(),
        ];
        const [modul, profile] = await Promise.all(requests);
        if (!isMounted) return;
        if (modul) setModulDetail(modul);
        setTutorProfile(profile);
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[Sertifikat] Load error:', err);
          setError(err instanceof Error ? err.message : 'Gagal memuat data.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [modulId]);

  const handlePublish = useCallback(async () => {
    if (!modulId) return;
    const ok = await confirm({ message: 'Apakah Anda yakin ingin menerbitkan modul ini?', confirmText: 'Terbitkan' });
    if (!ok) return;
    try {
      await guruModulApi.update(modulId, { isDraft: false });
      router.push('/modul-guru?tab=published');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Gagal menerbitkan modul.', 'error');
    }
  }, [modulId, router, confirm, toast]);

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
            <p className="text-sm text-[#8a8d98]">
              {isLoading ? 'Memuat data sertifikat...' : 'Memeriksa otorisasi...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const existingSignatureUrl = tutorProfile?.signatureUrl ?? '';

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="w-full px-0 py-0">
        <div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden border border-[#e5e3ee] bg-white px-5 py-6 lg:block lg:min-h-[calc(100vh-74px)]">
            <div className="flex h-full flex-col">
              <p className="text-[13px] font-semibold text-[#232530]">Rencanakan Modul anda</p>
              <nav className="mt-4 space-y-3 text-[13px]">
                <Link href={modulId ? `/modul-guru/tambah/profil?modulId=${modulId}` : '#'} className="flex items-center gap-2 text-[#7a7e8a] hover:text-[#7054dc] transition-colors">
                  <FiFileText size={12} />
                  Profil Modul Anda
                </Link>
                <Link href={modulId ? `/modul-guru/tambah/harga?modulId=${modulId}` : '#'} className="flex items-center gap-2 text-[#7a7e8a] hover:text-[#7054dc] transition-colors">
                  <FiDollarSign size={12} />
                  Penetapan Harga Modul
                </Link>
              </nav>

              <p className="mt-8 text-[13px] font-semibold text-[#232530]">Konten Modul Anda</p>
              <nav className="mt-4 space-y-3 text-[13px]">
                <Link href={modulId ? `/modul-guru/tambah/konten?modulId=${modulId}` : '#'} className="flex items-center gap-2 text-[#7a7e8a] hover:text-[#7054dc] transition-colors">
                  <FiLayers size={12} />
                  Konten Modul
                </Link>
                <Link href={modulId ? `/modul-guru/tambah/pre-post-test?modulId=${modulId}` : '#'} className="flex items-center gap-2 text-[#7a7e8a] hover:text-[#7054dc] transition-colors">
                  <FiCheckSquare size={12} />
                  Pree - Post Test Modul
                </Link>
                <div className="flex items-center gap-2 text-[#7054dc]">
                  <FiBookOpen size={12} />
                  <span className="font-semibold">Capaian Sertifikat</span>
                </div>
              </nav>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!modulId}
                className="mt-16 w-full cursor-pointer rounded-full bg-[#f39b39] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#e08a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Terbitkan Modul
              </button>
            </div>
          </aside>

          <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <h1 className="text-[18px] font-semibold text-[#232530]">Konfigurasi Sertifikat Modul</h1>
            <p className="mt-2 max-w-[620px] text-[12px] leading-[1.6] text-[#7e8290]">
              Data yang Anda masukkan di bawah ini akan tercantum secara otomatis pada sertifikat yang diterbitkan
              untuk siswa. Pastikan penulisan nama dan judul sudah benar sesuai dengan standar akademik.
            </p>

            <div className="mt-6 max-w-[620px]">
              {/* Judul Sertifikat */}
              <div>
                <p className="text-[13px] font-semibold text-[#232530]">Judul Sertifikat</p>
                <input
                  type="text"
                  value={modulDetail?.moduleName ?? ''}
                  readOnly
                  disabled
                  placeholder="Judul modul dimuat otomatis"
                  className="mt-2 h-[40px] w-full cursor-not-allowed rounded-xl border border-[#e5e3ee] bg-[#f4f3f8] px-4 text-[12px] text-[#6b6f7e] outline-none"
                />
                <p className="mt-1.5 text-[11px] text-[#7a7e8a]">
                  Judul diambil otomatis dari nama modul yang sudah disimpan.
                </p>
              </div>

              {/* Nama Lengkap Tutor */}
              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[#232530]">Nama Lengkap Tutor</p>
                <input
                  type="text"
                  value={tutorProfile?.fullName ?? ''}
                  readOnly
                  disabled
                  placeholder="Nama tutor dimuat otomatis"
                  className="mt-2 h-[40px] w-full cursor-not-allowed rounded-xl border border-[#e5e3ee] bg-[#f4f3f8] px-4 text-[12px] text-[#6b6f7e] outline-none"
                />
                <p className="mt-1.5 text-[11px] leading-[1.6] text-[#7a7e8a]">
                  Nama diambil dari profil akun Anda. Nama akan tercantum sebagai pihak yang meresmikan sertifikat.
                </p>
              </div>

              {/* Tanda Tangan — read-only preview */}
              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[#232530]">Pratinjau Tanda Tangan</p>
                <p className="mt-1 text-[11px] text-[#7a7e8a]">
                  Tanda tangan dikelola di halaman{' '}
                  <Link href="/profil" className="text-[#7054dc] underline">
                    Profil
                  </Link>
                  . Halaman ini hanya menampilkan pratinjau.
                </p>
                <div className="mt-2 flex min-h-[80px] cursor-not-allowed items-center justify-center rounded-xl border border-[#e5e3ee] bg-[#f4f3f8] px-4 py-4 opacity-75">
                  {existingSignatureUrl ? (
                    <img
                      src={existingSignatureUrl}
                      alt="Tanda tangan terdaftar"
                      className="max-h-[64px] object-contain"
                    />
                  ) : (
                    <p className="text-center text-[12px] text-[#9aa0ad]">
                      Belum ada tanda tangan terdaftar.
                      <br />
                      Unggah di halaman Profil.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function SertifikatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <SertifikatPageContent />
    </Suspense>
  );
}
