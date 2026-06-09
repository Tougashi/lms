"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiUser,
} from "react-icons/fi";
import AdminHeader from "../../../component/admin/AdminHeader";
import { adminTutorApi, uploadApi } from "../../../lib/api";
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
const genderOptions: SelectOption[] = [
  { label: "Laki-laki", value: "MALE" },
  { label: "Perempuan", value: "FEMALE" },
];
const educationOptions: SelectOption[] = [
  { label: "SMA / SMK", value: "SMA/SMK" },
  { label: "D3", value: "D3" },
  { label: "S1", value: "S1" },
  { label: "S2", value: "S2" },
  { label: "S3", value: "S3" },
];

/* ══════════════════════════════════════════════════════════════ */
export default function TambahGuruPage() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useAdminToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* akun */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  /* foto profil */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoObjUrlRef = useRef<string | null>(null);

  /* profesional */
  const [pekerjaan, setPekerjaan] = useState("");
  const [institution, setInstitution] = useState("");
  const [lastEducation, setLastEducation] = useState("");
  const [prodi, setProdi] = useState("");
  const [cvPathUrl, setCvPathUrl] = useState("");
  const [biografi, setBiografi] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!fullName.trim()) e.fullName = "Nama lengkap wajib diisi.";
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Format email tidak valid.";
    if (!password || password.length < 6)
      e.password = "Password minimal 6 karakter.";
    if (cvPathUrl && !/^https?:\/\/.+/.test(cvPathUrl))
      e.cvPathUrl = "URL CV harus dimulai dengan http:// atau https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      let finalPhotoUrl = photoUrl;
      if (!finalPhotoUrl && photoFile) {
        const res = await uploadApi.upload(photoFile, "PROFILE_IMAGE");
        finalPhotoUrl = res.url ?? null;
      }
      await adminTutorApi.create({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        gender: gender || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        pekerjaan: pekerjaan.trim() || undefined,
        lastEducation: lastEducation || undefined,
        institution: institution.trim() || undefined,
        prodi: prodi.trim() || undefined,
        cvPathUrl: cvPathUrl.trim() || undefined,
        biografi: biografi.trim() || undefined,
        profileImg: finalPhotoUrl ?? undefined,
      });
      showToast("success", "Guru berhasil ditambahkan.");
      setTimeout(() => router.push("/admin/manajemen-pengguna"), 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menambahkan guru.";
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
            Tambah Guru Baru
          </h1>
          <p className="mt-1 text-[13px] text-[#8e8ba0]">
            Field bertanda <span className="text-[#e8473f]">*</span> wajib
            diisi. Field lainnya dapat diisi belakangan.
          </p>
        </div>

        <div className="space-y-5">
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
              onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap guru"
                className={`${inputCls} ${errors.fullName ? "border-[#e8473f]" : ""}`}
              />
              {errors.fullName ? (
                <p className={errorCls}>{errors.fullName}</p>
              ) : (
                <p className={hintCls}>
                  Gunakan nama lengkap sesuai identitas resmi
                </p>
              )}
            </div>

            {/* Email + WA */}
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className={labelCls}>
                  Email <span className="text-[#e8473f]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guru@email.com"
                  className={`${inputCls} ${errors.email ? "border-[#e8473f]" : ""}`}
                />
                {errors.email ? (
                  <p className={errorCls}>{errors.email}</p>
                ) : (
                  <p className={hintCls}>Digunakan untuk login</p>
                )}
              </div>
              <div>
                <label className={labelCls}>No. WhatsApp</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={inputCls}
                />
                <p className={hintCls}>Opsional, untuk komunikasi</p>
              </div>
            </div>

            {/* Password + Gender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Password <span className="text-[#e8473f]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className={`${inputCls} pr-11 ${errors.password ? "border-[#e8473f]" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-[#b0b3bf] hover:text-[#7054dc] transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className={errorCls}>{errors.password}</p>
                ) : (
                  <p className={hintCls}>
                    Password sementara, guru bisa ubah nanti
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Jenis Kelamin</label>
                <CustomSelect
                  value={gender}
                  onChange={setGender}
                  options={genderOptions}
                  placeholder="— Pilih —"
                />
              </div>
            </div>
          </div>

          {/* ══ CARD: Informasi Profesional ══ */}
          <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
            <SectionTitle>Informasi Profesional</SectionTitle>

            {/* Pekerjaan + Institusi */}
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className={labelCls}>Pekerjaan</label>
                <input
                  type="text"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  placeholder="Guru, Dosen, Instruktur..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Institusi / Sekolah</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Nama institusi tempat bekerja"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Pendidikan + Prodi */}
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className={labelCls}>Pendidikan Terakhir</label>
                <CustomSelect
                  value={lastEducation}
                  onChange={setLastEducation}
                  options={educationOptions}
                  placeholder="— Pilih —"
                />
              </div>
              <div>
                <label className={labelCls}>Program Studi</label>
                <input
                  type="text"
                  value={prodi}
                  onChange={(e) => setProdi(e.target.value)}
                  placeholder="Ilmu Komputer, Pendidikan..."
                  className={inputCls}
                />
              </div>
            </div>

            {/* URL CV */}
            <div className="mb-4">
              <label className={labelCls}>URL CV / Portofolio</label>
              <input
                type="url"
                value={cvPathUrl}
                onChange={(e) => setCvPathUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className={`${inputCls} ${errors.cvPathUrl ? "border-[#e8473f]" : ""}`}
              />
              {errors.cvPathUrl ? (
                <p className={errorCls}>{errors.cvPathUrl}</p>
              ) : (
                <p className={hintCls}>
                  Opsional — link CV, LinkedIn, atau portofolio
                </p>
              )}
            </div>

            {/* Biografi */}
            <div>
              <label className={labelCls}>Biografi</label>
              <textarea
                value={biografi}
                onChange={(e) => setBiografi(e.target.value)}
                placeholder="Ceritakan latar belakang dan keahlian guru secara singkat..."
                rows={4}
                maxLength={600}
                className="mt-1.5 w-full rounded-xl border border-[#e2e0ea] bg-[#fafafa] px-4 py-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] focus:bg-white transition-colors resize-none placeholder:text-[#c0bfca]"
              />
              <div className="flex items-center justify-between">
                <p className={hintCls}>
                  Opsional — ditampilkan di halaman profil guru
                </p>
                <p className="mt-1 text-[11px] text-[#c8c5d8]">
                  {biografi.length}/600
                </p>
              </div>
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
              {isSaving ? "Menyimpan..." : "Simpan Guru"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
