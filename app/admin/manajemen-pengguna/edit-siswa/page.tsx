"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";
import AdminHeader from "../../../component/admin/AdminHeader";
import { adminSiswaApi, uploadApi } from "../../../lib/api";
import {
  AdminToastContainer,
  useAdminToast,
} from "../../components/AdminToast";

/* ─── style constants ─── */
const inputCls =
  "mt-1.5 h-[44px] w-full rounded-xl border border-[#e2e0ea] bg-[#fafafa] px-4 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] focus:bg-white transition-colors placeholder:text-[#c0bfca]";
const labelCls = "block text-[12px] font-semibold text-[#3d3a4a]";
const errorCls = "mt-1 text-[11px] text-[#e8473f]";
const hintCls = "mt-1 text-[11px] text-[#a0a3af]";

/* ─── SectionTitle ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#9b97ad] whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#eeecf6]" />
    </div>
  );
}

/* ─── CustomSelect ─── */
interface SelectOption {
  label: string;
  value: string;
}
interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}
function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "— Pilih —",
  error,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  /* close on outside click */
  const handleBlur = () => setTimeout(() => setOpen(false), 150);

  return (
    <div ref={ref} className="relative mt-1.5" onBlur={handleBlur}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex h-[44px] w-full items-center justify-between rounded-xl border px-4 text-[13px] transition-colors outline-none",
          open
            ? "border-[#7054dc] bg-white"
            : error
              ? "border-[#e8473f] bg-[#fafafa]"
              : "border-[#e2e0ea] bg-[#fafafa] hover:border-[#c8c4db]",
          value ? "text-[#232530]" : "text-[#c0bfca]",
        ].join(" ")}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <FiChevronDown
          size={15}
          className={`text-[#9b97ad] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-[#e2e0ea] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* clear option */}
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[#c0bfca] hover:bg-[#f7f5ff] transition-colors"
            >
              {placeholder}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors",
                  value === opt.value
                    ? "bg-[#f0edfb] text-[#7054dc] font-semibold"
                    : "text-[#232530] hover:bg-[#f7f5ff]",
                ].join(" ")}
              >
                {opt.label}
                {value === opt.value && (
                  <FiCheck size={13} className="text-[#7054dc]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── option lists ─── */
const jenjangOptions: SelectOption[] = [
  { label: "SD", value: "SD" },
  { label: "SMP", value: "SMP" },
  { label: "SMA", value: "SMA" },
];

const kelasOptions: Record<string, SelectOption[]> = {
  SD: [
    { label: "Kelas 4", value: "4" },
    { label: "Kelas 5", value: "5" },
    { label: "Kelas 6", value: "6" },
  ],
  SMP: [
    { label: "Kelas 7", value: "7" },
    { label: "Kelas 8", value: "8" },
    { label: "Kelas 9", value: "9" },
  ],
  SMA: [
    { label: "Kelas 10", value: "10" },
    { label: "Kelas 11", value: "11" },
    { label: "Kelas 12", value: "12" },
  ],
  "": [
    { label: "Kelas 4", value: "4" },
    { label: "Kelas 5", value: "5" },
    { label: "Kelas 6", value: "6" },
    { label: "Kelas 7", value: "7" },
    { label: "Kelas 8", value: "8" },
    { label: "Kelas 9", value: "9" },
    { label: "Kelas 10", value: "10" },
    { label: "Kelas 11", value: "11" },
    { label: "Kelas 12", value: "12" },
  ],
};

/* ══════════════════════════════════════════════════════════════ */
function EditSiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { toasts, showToast, dismissToast } = useAdminToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* siswa data */
  const [email, setEmail] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [kelasSekolah, setKelasSekolah] = useState("");
  const [studentType, setStudentType] = useState<"SISWA" | "GURU">("SISWA");

  /* foto profil */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoObjUrlRef = useRef<string | null>(null);

  /* page state */
  const [isLoading, setIsLoading] = useState(!!id);
  const [notFound, setNotFound] = useState(!id);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── load data ── */
  useEffect(() => {
    if (!id) return;
    adminSiswaApi
      .getAll()
      .then((res) => {
        const siswa = res.items.find((s) => s.id === id);
        if (!siswa) {
          setNotFound(true);
        } else {
          setEmail(siswa.email ?? "");
          setNamaLengkap(siswa.nama_lengkap);
          setJenjang(siswa.jenjang ?? "");
          setKelasSekolah(siswa.kelas_sekolah ?? "");
          setStudentType(siswa.studentType === "GURU" ? "GURU" : "SISWA");
          if (siswa.profileImage) {
            setPhotoPreview(siswa.profileImage);
            setPhotoUrl(siswa.profileImage);
          }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  /* ── upload handler ── */
  const handlePhotoChange = async (file: File | null) => {
    setPhotoFile(file);
    setPhotoUrl(null);
    if (photoObjUrlRef.current) {
      URL.revokeObjectURL(photoObjUrlRef.current);
      photoObjUrlRef.current = null;
    }
    if (!file) {
      setPhotoPreview(null);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    photoObjUrlRef.current = localUrl;
    setPhotoPreview(localUrl);
    setPhotoUploading(true);
    try {
      const res = await uploadApi.upload(file, "PROFILE_IMAGE");
      setPhotoUrl(res.url);
      setPhotoPreview(res.url);
      URL.revokeObjectURL(localUrl);
      photoObjUrlRef.current = null;
    } catch {
      showToast(
        "error",
        "Gagal mengunggah foto. Preview lokal tetap ditampilkan.",
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  /* ── validasi ── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!namaLengkap.trim()) e.namaLengkap = "Nama lengkap wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!validate() || !id) return;
    setIsSaving(true);
    try {
      let finalPhotoUrl = photoUrl;
      if (!finalPhotoUrl && photoFile) {
        const res = await uploadApi.upload(photoFile, "PROFILE_IMAGE");
        finalPhotoUrl = res.url ?? null;
      }
      await adminSiswaApi.update(id, {
        nama_lengkap: namaLengkap.trim(),
        jenjang: jenjang || undefined,
        kelas_sekolah: kelasSekolah || undefined,
        studentType,
        profileImage: finalPhotoUrl ?? undefined,
      });
      showToast("success", "Data siswa berhasil diperbarui.");
      setTimeout(() => router.push("/admin/manajemen-pengguna"), 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui data siswa.";
      showToast("error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-[#f4f3f8]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* back */}
        <Link
          href="/admin/manajemen-pengguna"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6b6880] transition-colors hover:text-[#7054dc]"
        >
          <FiArrowLeft size={14} />
          Kembali ke Manajemen Pengguna
        </Link>

        {/* heading */}
        <div className="mt-5 mb-7">
          <h1 className="text-2xl font-bold text-[#232530] sm:text-[28px]">
            Edit Data Siswa
          </h1>
          <p className="mt-1 text-[13px] text-[#8e8ba0]">
            Field bertanda <span className="text-[#e8473f]">*</span> wajib
            diisi. Email tidak dapat diubah.
          </p>
        </div>

        <div className="space-y-5">
          {isLoading ? (
            /* ── Loading state ── */
            <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
                <svg
                  className="animate-spin h-7 w-7 text-[#b0a8e0]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-[13px] text-[#9396a3]">
                  Memuat data siswa...
                </p>
              </div>
            </div>
          ) : notFound ? (
            /* ── Not-found state ── */
            <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
                <p className="text-[13px] text-[#e8473f]">
                  Data siswa tidak ditemukan.
                </p>
                <Link
                  href="/admin/manajemen-pengguna"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#5f46cc]"
                >
                  <FiArrowLeft size={14} />
                  Kembali
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ══ CARD: Foto Profil ══ */}
              <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
                <SectionTitle>Foto Profil</SectionTitle>

                <div className="flex items-center gap-6">
                  {/* avatar circle */}
                  <div
                    className="relative shrink-0 h-[88px] w-[88px] cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-[#d0cce8] bg-[#f0eefb] transition-all hover:border-[#7054dc] hover:bg-[#ece8fb]"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {photoUploading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 rounded-full">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      </div>
                    )}
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1">
                        <FiUser size={26} className="text-[#b8b0dc]" />
                        <FiCamera size={12} className="text-[#c5bfe8]" />
                      </div>
                    )}
                  </div>

                  {/* right side */}
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#3d3a4a]">
                      {photoPreview ? "Foto dipilih" : "Belum ada foto"}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#a0a3af]">
                      Format JPG, PNG, atau WebP. Maks. 10 MB.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="rounded-lg border border-[#d0cce8] px-4 py-1.5 text-[12px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
                      >
                        {photoPreview ? "Ganti Foto" : "Pilih Foto"}
                      </button>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                            setPhotoUrl(null);
                            if (photoInputRef.current)
                              photoInputRef.current.value = "";
                          }}
                          className="rounded-lg border border-[#fad4d4] px-4 py-1.5 text-[12px] font-semibold text-[#e8473f] transition-colors hover:bg-[#fff5f5]"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handlePhotoChange(e.target.files?.[0] ?? null)
                  }
                />
              </div>

              {/* ══ CARD: Informasi Akun ══ */}
              <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
                <SectionTitle>Informasi Akun</SectionTitle>

                {/* Nama Lengkap */}
                <div className="mb-4">
                  <label className={labelCls}>
                    Nama Lengkap <span className="text-[#e8473f]">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap siswa"
                    className={`${inputCls} ${errors.namaLengkap ? "border-[#e8473f]" : ""}`}
                  />
                  {errors.namaLengkap ? (
                    <p className={errorCls}>{errors.namaLengkap}</p>
                  ) : (
                    <p className={hintCls}>
                      Gunakan nama lengkap sesuai identitas resmi
                    </p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="mb-4">
                  <label className={labelCls}>
                    Email{" "}
                    <span className="ml-1 text-[10px] font-normal text-[#a0a3af]">
                      (tidak dapat diubah)
                    </span>
                  </label>
                  <div className="mt-1.5 h-[44px] flex items-center rounded-xl border border-[#e2e0ea] bg-[#f3f2f8] px-4 text-[13px] text-[#9396a3]">
                    {email}
                  </div>
                </div>

                {/* Jenjang + Kelas */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Jenjang Sekolah</label>
                    <CustomSelect
                      value={jenjang}
                      onChange={(v) => {
                        setJenjang(v);
                        setKelasSekolah("");
                      }}
                      options={jenjangOptions}
                      placeholder="— Pilih Jenjang —"
                    />
                    <p className={hintCls}>
                      Sesuaikan dengan jenjang pendidikan siswa
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>Kelas</label>
                    <CustomSelect
                      value={kelasSekolah}
                      onChange={setKelasSekolah}
                      options={kelasOptions[jenjang] ?? kelasOptions[""]}
                      placeholder="— Pilih Kelas —"
                    />
                  </div>
                </div>
              </div>

              {/* ══ CARD: Tipe Akses ══ */}
              <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
                <SectionTitle>Tipe Akses</SectionTitle>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStudentType("SISWA")}
                    className={[
                      "flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[13px] font-semibold transition-all",
                      studentType === "SISWA"
                        ? "border-[#7054dc] bg-[#f0edfb] text-[#7054dc] shadow-sm"
                        : "border-[#e2e0ea] bg-[#fafafa] text-[#9b97ad] hover:border-[#c8c4db]",
                    ].join(" ")}
                  >
                    {studentType === "SISWA" && (
                      <FiCheck size={13} className="text-[#7054dc]" />
                    )}
                    Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentType("GURU")}
                    className={[
                      "flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[13px] font-semibold transition-all",
                      studentType === "GURU"
                        ? "border-[#7054dc] bg-[#f0edfb] text-[#7054dc] shadow-sm"
                        : "border-[#e2e0ea] bg-[#fafafa] text-[#9b97ad] hover:border-[#c8c4db]",
                    ].join(" ")}
                  >
                    {studentType === "GURU" && (
                      <FiCheck size={13} className="text-[#7054dc]" />
                    )}
                    Umum
                  </button>
                </div>
                <p className={`${hintCls} mt-3`}>
                  Siswa mendapatkan akses ke modul yang di-assign. Umum memiliki
                  akses terbatas.
                </p>
              </div>

              {/* ══ CARD: Info ID ══ */}
              <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
                <SectionTitle>Informasi Akun</SectionTitle>
                <div className="rounded-xl bg-[#f7f6fb] px-4 py-3 text-[12px] text-[#9396a3]">
                  ID Siswa:{" "}
                  <span className="font-mono text-[#7054dc]">{id}</span>
                </div>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex items-center justify-end gap-3 pb-6 pt-1">
                <Link
                  href="/admin/manajemen-pengguna"
                  className="rounded-xl border border-[#d8d3f0] px-6 py-2.5 text-[13px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
                >
                  Batal
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving || photoUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-7 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_20px_rgba(112,84,220,0.3)] transition-all hover:bg-[#5f46cc] disabled:opacity-60"
                >
                  {isSaving && (
                    <svg
                      className="animate-spin h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function EditSiswaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f3f8]" />}>
      <EditSiswaContent />
    </Suspense>
  );
}
