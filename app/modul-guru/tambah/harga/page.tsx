'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiBookOpen, FiCheckSquare, FiDollarSign, FiFileText, FiLayers } from 'react-icons/fi';

import GuruHeader from '../../../component/guru/GuruHeader';

function TambahModulHargaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const priceParam = searchParams.get('price');
  const isPaidDefault = useMemo(() => priceParam === 'paid', [priceParam]);
  const [isPaid, setIsPaid] = useState(isPaidDefault);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="w-full px-0 py-0">
        <div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden border border-[#e5e3ee] bg-white px-5 py-6 lg:block lg:min-h-[calc(100vh-74px)]">
            <div className="flex h-full flex-col">
              <p className="text-[13px] font-semibold text-[#232530]">Rencanakan Modul anda</p>
              <nav className="mt-4 space-y-3 text-[13px]">
                <div className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiFileText size={12} />
                  Profil Modul Anda
                </div>
                <div className="flex items-center gap-2 text-[#7054dc]">
                  <FiDollarSign size={12} />
                  <span className="font-semibold">Penetapan Harga Modul</span>
                </div>
              </nav>

              <p className="mt-8 text-[13px] font-semibold text-[#232530]">Konten Modul Anda</p>
              <nav className="mt-4 space-y-3 text-[13px] text-[#7a7e8a]">
                <div className="flex items-center gap-2">
                  <FiLayers size={12} />
                  Konten Modul
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckSquare size={12} />
                  Pree - Post Test Modul
                </div>
                <div className="flex items-center gap-2">
                  <FiBookOpen size={12} />
                  Capaian Sertifikat
                </div>
              </nav>

              <button
                type="button"
                className="mt-16 w-full cursor-pointer rounded-full bg-[#bfc1c8] px-4 py-2.5 text-[12px] font-semibold text-white"
              >
                Terbitkan Modul
              </button>
            </div>
          </aside>

          <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
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
                <input
                  type="text"
                  defaultValue="250.000"
                  className="mt-2 h-[40px] w-full max-w-[320px] rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]"
                />
                <p className="mt-1 text-[11px] text-[#7e8290]">Pilih Gratis jika modul anda Gratis</p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={() => router.push('/modul-guru/tambah/konten')}
                className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white"
              >
                Simpan Harga
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
