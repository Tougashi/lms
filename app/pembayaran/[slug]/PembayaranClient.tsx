'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import SiswaHeader from "../../component/siswa/SiswaHeader";
import { siswaModulApi } from "../../lib/api";
import type { ModuleItem } from "../../lib/types/modul";

export default function PembayaranClient({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [moduleData, setModuleData] = useState<ModuleItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await siswaModulApi.getById(slug);
        // Handle potential response wrapper
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod: ModuleItem = (data as any)?.data ?? data;
        
        if (!mod || !mod.isPaid || !mod.modulPrice) {
          router.replace(`/modul/${slug}`);
          return;
        }
        setModuleData(mod);
      } catch (err) {
        console.error("Failed to load module", err);
        router.replace('/eksplor-modul');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7fa] text-[#202126]">
        <SiswaHeader />
        <main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
        </main>
      </div>
    );
  }

  if (!moduleData) return null;

  const priceFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(moduleData.modulPrice!);

  const adminPhone = "6281234567890";
  const moduleName = moduleData.moduleName || moduleData.nama_modul || 'Modul';
  const message = `Halo Admin, saya ingin mengkonfirmasi pembayaran untuk modul *${moduleName}* seharga *${priceFormatted}*.`;
  const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-[#f7f7fa] text-[#202126] font-sans">
      <SiswaHeader />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Link
          href={`/modul/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f3441] transition-colors hover:text-[#7054dc]"
        >
          <FaArrowLeft size={14} />
          Kembali ke Profil Modul
        </Link>

        <section className="mx-auto mt-12 w-full max-w-[720px] rounded-2xl border border-[#dedde5] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e5e4ec] pb-6 sm:flex-row sm:items-center">
            <h1 className="text-xl font-bold text-[#202126]">Total Pembayaran</h1>
            <p className="text-3xl font-bold text-[#7054dc]">{priceFormatted}</p>
          </div>

          <div className="pt-8">
            <h2 className="text-lg font-bold text-[#202126]">Petunjuk Pembayaran</h2>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4 text-sm text-[#404453]">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ece7ff] text-xs font-bold text-[#7054dc]">
                  1
                </span>
                <p className="leading-relaxed">
                  <span className="font-bold text-[#202126]">Klik Tombol Konfirmasi Pembayaran.</span> Kamu akan diarahkan ke WhatsApp Admin kami.
                </p>
              </div>
              <div className="flex items-start gap-4 text-sm text-[#404453]">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ece7ff] text-xs font-bold text-[#7054dc]">
                  2
                </span>
                <p className="leading-relaxed">Sistem akan menyiapkan format pesan secara otomatis.</p>
              </div>
              <div className="flex items-start gap-4 text-sm text-[#404453]">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ece7ff] text-xs font-bold text-[#7054dc]">
                  3
                </span>
                <p className="leading-relaxed">Admin akan memberikan instruksi pembayaran.</p>
              </div>
              <div className="flex items-start gap-4 text-sm text-[#404453]">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ece7ff] text-xs font-bold text-[#7054dc]">
                  4
                </span>
                <p className="leading-relaxed">Jika pembayaran berhasil dilakukan, modul sudah dapat diakses.</p>
              </div>
            </div>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[#7054dc] px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Konfirmasi Pembayaran
          </a>
        </section>
      </main>
    </div>
  );
}
