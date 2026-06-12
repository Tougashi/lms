"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { StudyRoomCertificate } from "../../../lib/types/siswa";

interface CertificateViewProps {
  certificate: StudyRoomCertificate;
  moduleName: string;
  studentName: string;
  tutorName?: string;
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

export default function CertificateView({
  certificate,
  moduleName,
  studentName,
  tutorName = "Tim Pengajar",
}: CertificateViewProps) {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isDownloading) return;
    try {
      setIsDownloading(true);

      // Wait for fonts & images to fully load
      try {
        if (typeof document !== "undefined" && "fonts" in document && (document as any).fonts?.ready) {
          await (document as any).fonts.ready;
        }
      } catch {
        // ignore
      }

      const imgs = Array.from(certificateRef.current.querySelectorAll("img"));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              const onDone = () => resolve();
              img.addEventListener("load", onDone, { once: true });
              img.addEventListener("error", onDone, { once: true });
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
      pdf.save(`sertifikat-${certificate.kode_sertif}.pdf`);
    } catch {
      alert("Gagal mengunduh sertifikat sebagai PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const issuedDate = formatTanggalIndonesia(certificate.issued_at);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Homemade+Apple&display=swap');
      `}</style>

      {/* Certificate Canvas */}
      <div
        ref={certificateRef}
        className="relative mx-auto h-[520px] w-full max-w-[840px] overflow-hidden border-2 border-[#7054dc] bg-white"
        style={{ minWidth: 0 }}
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
          <h2 className="mt-1 text-[50px] font-semibold leading-none text-black">
            SERTIFIKAT
          </h2>
          <p className="mt-1 text-xl font-semibold text-black">KELULUSAN MODUL</p>

          <div className="mt-8 space-y-2">
            <p className="mb-4 text-lg text-black">Diberikan kepada</p>
            <p className="mb-6 max-w-[350px] text-3xl font-semibold text-black">
              {studentName}
            </p>
            <p className="max-w-[350px] text-base leading-relaxed text-black">
              Atas keberhasilannya dalam menyelesaikan seluruh rangkaian materi
              dan kuis pada modul{" "}
              <span className="font-bold">{moduleName}</span> dengan hasil yang
              memuaskan.
            </p>
          </div>

          <div className="mt-6">
            <p className="font-semibold text-black">
              Diterbitkan pada {issuedDate}
            </p>
            <p className="mt-1 text-sm text-[#666]">
              No. Sertifikat:{" "}
              <span className="font-mono font-semibold text-[#7054dc]">
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
        <div className="absolute right-[140px] top-[310px] z-10 text-center">
          <p
            className="text-[34px] leading-none text-[#202126]"
            style={{ fontFamily: '"Homemade Apple", cursive' }}
          >
            Signature
          </p>
          <hr className="mt-1 border-[#202126]" />
          <p className="mt-4 text-sm font-semibold text-black">{tutorName}</p>
          <p className="mt-1 text-sm text-black">Tutor</p>
        </div>
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isDownloading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDownloading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Mengunduh...
          </>
        ) : (
          "⬇ Download Sertifikat (PDF)"
        )}
      </button>
    </div>
  );
}
