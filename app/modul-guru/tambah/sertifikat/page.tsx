'use client';

import Link from 'next/link';
import { Suspense, useCallback, useRef, useState } from 'react';
import {
  FiBookOpen,
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiLayers,
} from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';

import GuruHeader from '../../../component/guru/GuruHeader';
import { guruModulApi, uploadApi } from '../../../lib/api';
import { useRoleGuard } from '../../../lib/hooks/useRoleGuard';

function SertifikatPageContent() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const searchParams = useSearchParams();
  const router = useRouter();
  const modulId = searchParams.get('modulId');
  const [judulSertifikat, setJudulSertifikat] = useState('');
  const [namaTutor, setNamaTutor] = useState('');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
            <p className="text-sm text-[#8a8d98]">Memeriksa otorisasi...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file melebihi 2MB');
      return;
    }
    setSignatureFile(file);
    setUploadedUrl('');
    const reader = new FileReader();
    reader.onload = (e) => setSignaturePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');

    if (!signatureFile && !uploadedUrl) {
      setError('Pilih file tanda tangan terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    try {
      let finalUrl = uploadedUrl;

      // Upload file if not yet uploaded
      if (signatureFile && !uploadedUrl) {
        const result = await uploadApi.upload(signatureFile, 'signature');
        finalUrl = result.url;
        setUploadedUrl(finalUrl);
      }

      setSuccessMsg('Tanda tangan berhasil diunggah! URL: ' + finalUrl);
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengunggah tanda tangan.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!modulId) return;
    if (!confirm('Apakah Anda yakin ingin menerbitkan modul ini?')) return;
    try {
      await guruModulApi.update(modulId, { isDraft: false });
      router.push('/modul-guru?tab=published');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menerbitkan modul.');
    }
  };

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
            {successMsg && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {successMsg}
              </div>
            )}

            <h1 className="text-[18px] font-semibold text-[#232530]">Konfigurasi Sertifikat Modul</h1>
            <p className="mt-2 max-w-[620px] text-[12px] leading-[1.6] text-[#7e8290]">
              Data yang Anda masukkan di bawah ini akan tercantum secara otomatis pada sertifikat yang diterbitkan untuk siswa. Pastikan
              penulisan nama dan judul sudah benar sesuai dengan standar akademik.
            </p>

            <div className="mt-6 max-w-[620px]">
              <div>
                <p className="text-[13px] font-semibold text-[#232530]">Judul Sertifikat</p>
                <input
                  type="text"
                  value={judulSertifikat}
                  onChange={(e) => setJudulSertifikat(e.target.value)}
                  placeholder="Sertifikat Kelulusan Modul Biologi"
                  className="mt-2 h-[40px] w-full rounded-xl border border-[#e5e3ee] bg-white px-4 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                />
                <p className="mt-1.5 text-[11px] text-[#7a7e8a]">
                  Tuliskan judul sertifikat yang akan muncul di bagian kepala dokumen.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[#232530]">Nama Lengkap Tutor</p>
                <input
                  type="text"
                  value={namaTutor}
                  onChange={(e) => setNamaTutor(e.target.value)}
                  placeholder="Budi Santoso, S.Pd., M.Si."
                  className="mt-2 h-[40px] w-full rounded-xl border border-[#e5e3ee] bg-white px-4 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                />
                <p className="mt-1.5 text-[11px] leading-[1.6] text-[#7a7e8a]">
                  Masukkan nama lengkap beserta gelar akademik yang sah. Nama akan tercantum sebagai pihak yang meresmikan dan menandatangani
                  sertifikat siswa.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-[13px] font-semibold text-[#232530]">Unggah Tanda Tangan</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border bg-[#fbfaff] px-4 py-8 transition-colors ${
                    isDragging ? 'border-[#7054dc] bg-[#f0ecff]' : 'border-[#e5e3ee]'
                  }`}
                >
                  {signaturePreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={signaturePreview} alt="Tanda tangan" className="max-h-[80px] object-contain" />
                      {uploadedUrl && (
                        <span className="text-[11px] font-semibold text-green-600">✓ Berhasil diunggah</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-[#7054dc]">
                        <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                        <path d="M16 30l6-8 4 5 4-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M30 14l4-4m0 0l4 4m-4-4v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-3 text-center text-[12px] text-[#9aa0ad]">
                        Klik untuk pilih file atau tarik gambar ke sini
                        <br />
                        (Maks. 2MB).
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-[1.6] text-[#7a7e8a]">
                  Unggah gambar tanda tangan dalam format .PNG (latar belakang transparan) untuk hasil terbaik. Pastikan goresan tanda tangan terlihat
                  jelas dan tidak terpotong.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isUploading || (!signatureFile && !uploadedUrl)}
                className="mt-8 inline-flex h-[40px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white hover:bg-[#5f46cc] sm:w-[340px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Mengunggah...' : 'Simpan'}
              </button>
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
