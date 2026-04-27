import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import SiswaHeader from "../../component/siswa/SiswaHeader";
import { getModuleBySlug } from "../../modul/dummy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const paymentSteps = [
  "Klik Tombol Konfirmasi Pembayaran. Kamu akan diarahkan ke WhatsApp Admin kami.",
  "Sistem akan menyiapkan format pesan secara otomatis.",
  "Admin akan memberikan instruksi pembayaran.",
  "Jika pembayaran berhasil dilakukan, modul sudah dapat diakses.",
];

export default async function PembayaranPage({ params }: PageProps) {
  const { slug } = await params;
  const moduleData = getModuleBySlug(slug);

  if (!moduleData) {
    notFound();
  }

  if (!moduleData.priceLabel) {
    redirect(`/modul/${moduleData.slug}`);
  }

  return (
    <div className="min-h-screen bg-[#f7f7fa] text-[#202126]">
      <SiswaHeader />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Link
          href={`/modul/${moduleData.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3441] transition-colors hover:text-[#7054dc]"
        >
          <FaArrowLeft size={12} />
          Kembali ke Profil Modul
        </Link>

        <section className="mx-auto mt-16 w-full max-w-[680px] rounded-2xl border border-[#dedde5] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-[#e5e4ec] pb-6">
            <h1 className="text-2xl font-bold text-[#202126]">Total Pembayaran</h1>
            <p className="text-4xl font-bold text-[#7054dc]">{moduleData.priceLabel}</p>
          </div>

          <div className="pt-6">
            <h2 className="text-2xl font-bold text-[#202126]">Petunjuk Pembayaran</h2>
            <div className="mt-6 space-y-6">
              {paymentSteps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 text-sm text-[#404453]">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ece7ff] text-xs font-semibold text-[#7054dc]">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <a
            href=""
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#7054dc] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Konfirmasi Pembayaran
          </a>
        </section>
      </main>
    </div>
  );
}
