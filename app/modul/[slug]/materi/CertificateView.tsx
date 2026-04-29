"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ModuleDetail } from "../../dummy";

export default function CertificateView({ moduleData }: { moduleData: ModuleDetail }) {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isDownloading) return;
    try {
      setIsDownloading(true);

      // Pastikan font + gambar benar-benar sudah ter-render sebelum capture
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
      pdf.save("sertifikat.pdf");
    } catch {
      alert("Gagal mengunduh sertifikat sebagai PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center rounded-2xl bg-white p-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Homemade+Apple&display=swap');
      `}</style>
      <div
        ref={certificateRef}
        className="relative mx-auto h-[520px] w-full max-w-[840px] overflow-hidden border-2 border-[#7054dc] bg-white scale-[0.8] sm:scale-100"
      >
        {/* stripe kiri */}
        <div className="absolute left-0 top-0 h-full w-[40px] bg-[#7054dc]" />

        {/* desain kanan */}
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

        {/* teks */}
        <div className="relative z-10 px-[90px] pt-[50px]">
          <h2 className="mt-1 text-[50px] font-semibold leading-none text-black">SERTIFIKAT</h2>
          <p className="mt-1 text-xl font-semibold text-black">KELULUSAN MODUL</p>

          <div className="mt-8 space-y-2">
            <p className="text-lg text-black mb-4">Diberikan kepada</p>
            <p className="text-3xl font-semibold text-black mb-6 max-w-[350px]">Muhammad Ammar Luthfi Azzufar</p>
            <p className="text-base leading-relaxed max-w-[350px] text-black">
            Atas keberhasilannya dalam menyelesaikan seluruh rangkaian materi dan kuis pada modul <span className="font-bold">{moduleData.title}</span> dengan hasil yang memuaskan.
            </p>
          </div>
            <p className="mt-8 font-semibold text-black">Diterbitkan pada {moduleData.updatedAt}</p>
        </div>

        {/* medal */}
        <div className="absolute right-[170px] top-[120px] z-10">
          <img
            src="/assets/images/sertifikat/medal.png"
            alt="Medal sertifikat"
            className="h-[140px] w-auto object-contain"
          />
        </div>

        {/* signature garis nama guru role guru */}
        <div className="absolute right-[140px] top-[300px] z-10 text-center">
          <p
            className="text-[34px] leading-none text-[#202126]"
            style={{ fontFamily: '"Homemade Apple", cursive' }}
          >
            Signature
          </p>
          <hr className="mt-1 border-[#202126]" />
          <p className="mt-4 text-sm font-semibold text-black">
            {moduleData.teacher}
          </p>
          <p className="mt-1 text-sm text-black">
            {moduleData.teacherRole}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isDownloading}
        className="mt-6 rounded-xl bg-[#7054dc] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDownloading ? "Mengunduh..." : "Download Sertifikat (PDF)"}
      </button>
    </div>
  );
}

