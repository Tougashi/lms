"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaCheck, FaDownload, FaPrint, FaArrowLeft } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";
import SiswaHeader from "../../../component/siswa/SiswaHeader";
import { siswaCertificateApi } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import type { StudyRoomCertificate } from "../../../lib/types/siswa";

interface SertifikatClientProps {
  modulId: string;
}

function formatTanggalIndonesia(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export default function SertifikatClient({ modulId }: SertifikatClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const [certificate, setCertificate] = useState<StudyRoomCertificate | null>(null);
  const [moduleName, setModuleName] = useState<string>("");
  const [tutorName, setTutorName] = useState<string>("Tim Pengajar");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const studentName = user?.nama_lengkap ?? user?.fullName ?? "Siswa";

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const cert = await siswaCertificateApi.getByModul(modulId);
        setCertificate(cert);
        if (cert.moduleName) setModuleName(cert.moduleName);
        if (cert.tutorName) setTutorName(cert.tutorName);
      } catch {
        setError("Sertifikat belum tersedia atau belum diklaim.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [modulId]);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isDownloading) return;
    try {
      setIsDownloading(true);
      try {
        if (typeof document !== "undefined" && "fonts" in document && (document as any).fonts?.ready) {
          await (document as any).fonts.ready;
        }
      } catch { /* ignore */ }

      const imgs = Array.from(certificateRef.current.querySelectorAll("img"));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
        )
      );

      const rect = certificateRef.current.getBoundingClientRect();
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      if (finalHeight > pageHeight) {
        finalHeight = pageHeight;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`sertifikat-${certificate?.kode_sertif ?? modulId}.pdf`);
    } catch {
      alert("Gagal mengunduh sertifikat sebagai PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f6f8]">
        <SiswaHeader />
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
            <p className="text-sm text-[#8a8a96]">Memuat sertifikat...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──
  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-[#f6f6f8]">
        <SiswaHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <PiMedalFill size={80} className="text-[#d1d4db]" />
          <h1 className="mt-4 text-2xl font-bold text-[#202126]">Sertifikat Tidak Ditemukan</h1>
          <p className="mt-2 text-sm text-[#8a8a96]">
            {error || "Kamu belum mengklaim sertifikat untuk modul ini."}
          </p>
          <button
            type="button"
            onClick={() => router.push(`/modul/${modulId}/materi`)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#e0dfe6] px-5 py-2.5 text-sm font-medium text-[#202126] hover:bg-[#f7f6ff]"
          >
            <FaArrowLeft size={12} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const issuedDate = formatTanggalIndonesia(certificate.issued_at);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Homemade+Apple&family=Inter:wght@400;500;600;700&display=swap');

        @media print {
          body * { visibility: hidden !important; }
          #certificate-print-area,
          #certificate-print-area * { visibility: visible !important; }
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
            z-index: 9999 !important;
          }
          .no-print { display: none !important; }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#f6f6f8]" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header — hide on print */}
        <div className="no-print">
          <SiswaHeader />
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Back button + action buttons */}
          <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push(`/modul/${modulId}/materi`)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e0dfe6] px-4 py-2 text-sm font-medium text-[#202126] hover:bg-[#f7f6ff] transition-colors"
            >
              <FaArrowLeft size={12} />
              Kembali ke Kelas
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-[#7054dc] px-5 py-2.5 text-sm font-semibold text-[#7054dc] hover:bg-[#efe9ff] transition-colors"
              >
                <FaPrint size={13} />
                Cetak Sertifikat
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {isDownloading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <FaDownload size={13} />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Certificate number badge */}
          <div className="no-print mb-6 flex items-center gap-3 rounded-xl border border-[#d4edda] bg-[#f0fff4] px-5 py-4">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#37b66a]">
              <FaCheck size={14} className="text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1a7f3c]">Sertifikat Resmi Terverifikasi</p>
              <p className="text-xs text-[#2d9e54]">
                Nomor Sertifikat: <span className="font-mono font-semibold">{certificate.kode_sertif}</span>
              </p>
            </div>
          </div>

          {/* Print area wrapper */}
          <div id="certificate-print-area">
            {/* The certificate canvas */}
            <div
              ref={certificateRef}
              className="relative mx-auto h-[520px] w-full max-w-[840px] overflow-hidden border-2 border-[#7054dc] bg-white shadow-2xl"
            >
              {/* Left stripe */}
              <div className="absolute left-0 top-0 h-full w-[40px] bg-[#7054dc]" />

              {/* Right decorative design */}
              <div className="absolute right-0 top-0 h-full w-[520px]">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage: `url(/assets/images/sertifikat/right-design.png)`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right bottom",
                    backgroundSize: "contain",
                  }}
                />
              </div>

              {/* Certificate text content */}
              <div className="relative z-10 px-[90px] pt-[50px]">
                <h1 className="mt-1 text-[50px] font-semibold leading-none text-black">
                  SERTIFIKAT
                </h1>
                <p className="mt-1 text-xl font-semibold text-black">KELULUSAN MODUL</p>

                <div className="mt-8 space-y-2">
                  <p className="mb-4 text-lg text-black">Diberikan kepada</p>
                  <p className="mb-6 max-w-[370px] text-3xl font-semibold text-black break-words">
                    {studentName}
                  </p>
                  <p className="max-w-[370px] text-base leading-relaxed text-black">
                    Atas keberhasilannya dalam menyelesaikan seluruh rangkaian
                    materi dan kuis pada modul{" "}
                    <span className="font-bold">{moduleName || "modul ini"}</span>{" "}
                    dengan hasil yang memuaskan.
                  </p>
                </div>

                <div className="mt-6">
                  <p className="font-semibold text-black">
                    Diterbitkan pada {issuedDate}
                  </p>
                  <p className="mt-1 text-sm text-[#555]">
                    No. Sertifikat:{" "}
                    <span
                      className="font-semibold text-[#7054dc]"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      {certificate.kode_sertif}
                    </span>
                  </p>
                </div>
              </div>

              {/* Medal */}
              <div className="absolute right-[170px] top-[120px] z-10">
                <img
                  src="/assets/images/sertifikat/medal.png"
                  alt="Medal sertifikat"
                  className="h-[140px] w-auto object-contain"
                />
              </div>

              {/* Signature */}
              <div className="absolute right-[140px] top-[295px] z-10 text-center">
                {certificate.tutorSignatureUrl ? (
                  <img
                    src={certificate.tutorSignatureUrl}
                    alt="Tanda tangan tutor"
                    className="mx-auto h-[50px] w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <p
                    className="text-[34px] leading-none text-[#202126]"
                    style={{ fontFamily: '"Homemade Apple", cursive' }}
                  >
                    {tutorName}
                  </p>
                )}
                <hr className="mt-1 border-[#202126]" />
                <p className="mt-4 text-sm font-semibold text-black">{tutorName}</p>
                <p className="mt-1 text-sm text-black">Tutor</p>
              </div>
            </div>
          </div>

          {/* Info card below certificate */}
          <div className="no-print mt-8 rounded-2xl border border-[#e6e4ed] bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-[#202126]">Informasi Sertifikat</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a96]">Nama Penerima</p>
                <p className="mt-1 text-sm font-semibold text-[#202126]">{studentName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a96]">Modul</p>
                <p className="mt-1 text-sm font-semibold text-[#202126]">{moduleName || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a96]">Nomor Sertifikat</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#7054dc]">{certificate.kode_sertif}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a96]">Tanggal Terbit</p>
                <p className="mt-1 text-sm font-semibold text-[#202126]">{issuedDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a96]">Tutor</p>
                <p className="mt-1 text-sm font-semibold text-[#202126]">{tutorName}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
