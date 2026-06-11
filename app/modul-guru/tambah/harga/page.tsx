'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiBookOpen, FiCheckSquare, FiDollarSign, FiFileText, FiLayers } from 'react-icons/fi';
import Link from 'next/link';

import GuruHeader from '../../../component/guru/GuruHeader';
import { guruModulApi } from '../../../lib/api';
import { useRoleGuard } from '../../../lib/hooks/useRoleGuard';
import { usePopup } from '../../../component/ui/PopupProvider';

function TambahModulHargaPageContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const searchParams = useSearchParams();
  const router = useRouter();
  const modulId = searchParams.get('modulId');

  const [isPaid, setIsPaid] = useState(false);
  const [modulPrice, setModulPrice] = useState('');
  const [isLoading, setIsLoading] = useState(!!modulId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { toast, confirm } = usePopup();
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending navigation timer on unmount
  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  // Load existing module data to pre-fill isPaid & modulPrice
  useEffect(() => {
    if (!modulId) return;
    let isMounted = true;
    const load = async () => {
      try {
        const data = await guruModulApi.detail(modulId);
        if (!isMounted) return;
        setIsPaid(data.isPaid ?? false);
        if (data.modulPrice != null && data.modulPrice > 0) {
          setModulPrice(String(data.modulPrice));
        }
      } catch (err) {
        console.error('Load module error:', err);
        if (isMounted) setError('Gagal memuat data modul.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [modulId]);

  const handleSave = useCallback(async () => {
    if (!modulId) {
      setError('Module ID tidak ditemukan.');
      return;
    }

    if (isPaid && (!modulPrice.trim() || Number(modulPrice.replace(/\./g, '')) <= 0)) {
      setError('Harga harus diisi untuk modul berbayar.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const priceValue = isPaid ? Number(modulPrice.replace(/\./g, '')) : null;
      await guruModulApi.update(modulId, {
        isPaid,
        modulPrice: priceValue,
      });
      setSuccessMsg('Harga modul berhasil disimpan!');
      navTimerRef.current = setTimeout(() => {
        router.push(`/modul-guru/tambah/konten?modulId=${modulId}`);
      }, 800);
    } catch (err: unknown) {
      console.error('Save price error:', err);
      setError(err instanceof Error ? err.message : 'Gagal menyimpan harga modul.');
    } finally {
      setIsSaving(false);
    }
  }, [modulId, isPaid, modulPrice, router]);

  const handlePublish = useCallback(async () => {
    if (!modulId) return;
    const ok = await confirm({ message: 'Apakah Anda yakin ingin menerbitkan modul ini?', confirmText: 'Terbitkan' });
    if (!ok) return;
    try {
      await guruModulApi.update(modulId, { isDraft: false });
      router.push('/modul-guru?tab=published');
    } catch (err: unknown) {
      console.error('Publish error:', err);
      toast(err instanceof Error ? err.message : 'Gagal menerbitkan modul.', 'error');
    }
  }, [modulId, router]);

  // Format price display with dots (e.g., 250.000)
  const handlePriceChange = (value: string) => {
    // Remove all non-numeric characters
    const numericOnly = value.replace(/\D/g, '');
    setModulPrice(numericOnly);
  };

  const formatPrice = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString('id-ID');
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
            <p className="text-sm text-[#8a8d98]">
              {isLoading ? 'Memuat data harga...' : 'Memeriksa otorisasi...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="flex items-center gap-2 text-[#7054dc]">
                  <FiDollarSign size={12} />
                  <span className="font-semibold">Penetapan Harga Modul</span>
                </div>
              </nav>

              <p className="mt-8 text-[13px] font-semibold text-[#232530]">Konten Modul Anda</p>
              <nav className="mt-4 space-y-3 text-[13px] text-[#7a7e8a]">
                <Link href={modulId ? `/modul-guru/tambah/konten?modulId=${modulId}` : '#'} className="flex items-center gap-2 hover:text-[#7054dc] transition-colors">
                  <FiLayers size={12} />
                  Konten Modul
                </Link>
                <Link href={modulId ? `/modul-guru/tambah/pre-post-test?modulId=${modulId}` : '#'} className="flex items-center gap-2 hover:text-[#7054dc] transition-colors">
                  <FiCheckSquare size={12} />
                  Pree - Post Test Modul
                </Link>
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
            {successMsg && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {successMsg}
              </div>
            )}

            <h1 className="text-[18px] font-semibold text-[#232530]">Tentukan Harga Modul anda</h1>
            <p className="mt-2 max-w-[560px] text-[12px] leading-[1.6] text-[#7e8290]">
              Pilih mata uang dan tingkat harga untuk kursus Anda. Jika ingin menawarkan kursus gratis,
              kursus harus memiliki total durasi video kurang dari 2 jam. Selain itu, kursus dengan ujian
              praktik tidak boleh digratiskan.
            </p>

            <div className="mt-5">
              <p className="text-[12px] font-semibold text-[#232530]">Pembayaran Akses</p>
              <div className="mt-3 flex items-center gap-6 text-[12px] text-[#6e7280]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="harga"
                    checked={!isPaid}
                    onChange={() => setIsPaid(false)}
                  />
                  Gratis
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="harga"
                    checked={isPaid}
                    onChange={() => setIsPaid(true)}
                  />
                  Berbayar
                </label>
              </div>
            </div>

            {isPaid && (
              <div className="mt-4">
                <label className="block text-[12px] font-semibold text-[#232530]">Tingkat Harga</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#7e8290]">Rp</span>
                  <input
                    type="text"
                    value={formatPrice(modulPrice)}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="250.000"
                    className="h-[40px] w-full max-w-[320px] rounded-lg border border-[#d9d7df] bg-white pl-9 pr-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#7e8290]">Masukkan harga dalam Rupiah</p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !modulId}
                className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white hover:bg-[#5f46cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Harga'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function TambahModulHargaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <TambahModulHargaPageContent />
    </Suspense>
  );
}
