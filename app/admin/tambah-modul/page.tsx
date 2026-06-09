"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiImage,
  FiX,
} from "react-icons/fi";
import AdminHeader from "../../component/admin/AdminHeader";
import { AdminToastContainer, useAdminToast } from "../components/AdminToast";
import { adminModulApi, adminTutorApi, uploadApi } from "../../lib/api";
import type { AdminTutorItem } from "../../lib/types/admin";

/* ─── style constants ─── */
const inputCls =
  "mt-1.5 h-[44px] w-full rounded-xl border border-[#e2e0ea] bg-[#fafafa] px-4 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] focus:bg-white transition-colors placeholder:text-[#c0bfca]";
const labelCls = "block text-[12px] font-semibold text-[#3d3a4a]";
const errorCls = "mt-1 text-[11px] text-[#e8473f]";
const hintCls = "mt-1 text-[11px] text-[#a0a3af]";

/* ─── SectionTitle ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.13em] text-[#9b97ad]">
        {children}
      </span>
      <div className="h-px flex-1 bg-[#eeecf6]" />
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
  disabled?: boolean;
  error?: boolean;
}
function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "— Pilih —",
  disabled = false,
  error,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const handleBlur = () => setTimeout(() => setOpen(false), 150);

  return (
    <div ref={ref} className="relative mt-1.5" onBlur={handleBlur}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          "flex h-[44px] w-full items-center justify-between rounded-xl border px-4 text-[13px] transition-colors outline-none",
          disabled
            ? "cursor-not-allowed border-[#e2e0ea] bg-[#f3f2f8] text-[#c0bfca]"
            : open
              ? "border-[#7054dc] bg-white"
              : error
                ? "border-[#e8473f] bg-[#fafafa]"
                : "border-[#e2e0ea] bg-[#fafafa] hover:border-[#c8c4db]",
          !disabled && value ? "text-[#232530]" : "",
        ].join(" ")}
      >
        <span className={!value ? "text-[#c0bfca]" : ""}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          size={15}
          className={`text-[#9b97ad] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-[#e2e0ea] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
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
const difficultyOptions: SelectOption[] = [
  { label: "Mudah", value: "Mudah" },
  { label: "Menengah", value: "Menengah" },
  { label: "Sulit", value: "Sulit" },
];
const durationUnitOptions: SelectOption[] = [
  { label: "Bulan", value: "bulan" },
  { label: "Minggu", value: "minggu" },
];
const jenjangOptions: SelectOption[] = [
  { label: "SD", value: "SD" },
  { label: "SMP", value: "SMP" },
  { label: "SMA", value: "SMA" },
];

/* ─── Spinner SVG ─── */
function Spinner({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      style={{ width: size, height: size }}
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
  );
}

/* ─── main page ─── */
export default function TambahModulAdminPage() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useAdminToast();

  /* ui state */
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* cover */
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverObjectUrlRef = useRef<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  /* form fields */
  const [moduleName, setModuleName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [tutorList, setTutorList] = useState<AdminTutorItem[]>([]);
  const [accessType, setAccessType] = useState<"siswa" | "umum">("siswa");
  const [isDraft, setIsDraft] = useState(true);
  const [level, setLevel] = useState("");
  const [kelas, setKelas] = useState("");
  const [difficulty, setDifficulty] = useState("Menengah");
  const [targetTime, setTargetTime] = useState(1);
  const [targetTimeUnit, setTargetTimeUnit] = useState<"bulan" | "minggu">(
    "bulan",
  );
  const [isPaid, setIsPaid] = useState(false);
  const [modulPrice, setModulPrice] = useState("");
  const [pretestPostTestEnabled, setPretestPostTestEnabled] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [hasStudyGroup, setHasStudyGroup] = useState(false);

  /* derived */
  const kelasOptions = useMemo((): SelectOption[] => {
    const map: Record<string, string[]> = {
      SD: ["1", "2", "3", "4", "5", "6"],
      SMP: ["7", "8", "9"],
      SMA: ["10", "11", "12"],
    };
    return (map[level] ?? []).map((k) => ({ label: `Kelas ${k}`, value: k }));
  }, [level]);

  const prevLevelRef = useRef(level);
  useEffect(() => {
    if (prevLevelRef.current !== level) {
      prevLevelRef.current = level;
      if (kelas && !kelasOptions.some((o) => o.value === kelas)) setKelas("");
    }
  }, [level, kelasOptions, kelas]);

  const computedTargetTime = useMemo(
    () => (targetTimeUnit === "bulan" ? targetTime * 60 : targetTime * 7),
    [targetTime, targetTimeUnit],
  );

  const tutorOptions = useMemo<SelectOption[]>(
    () => tutorList.map((t) => ({ label: t.fullName, value: t.id })),
    [tutorList],
  );

  /* load tutors */
  const fetchTutors = useCallback(async () => {
    try {
      const data = await adminTutorApi.getAll();
      setTutorList(data);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  /* cleanup object URL on unmount */
  useEffect(() => {
    return () => {
      if (coverObjectUrlRef.current)
        URL.revokeObjectURL(coverObjectUrlRef.current);
    };
  }, []);

  /* cover change — upload immediately on file select */
  const handleCoverChange = async (file: File | null) => {
    setCoverFile(file);
    setCoverUrl(null);
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }
    if (!file) {
      setCoverPreview(null);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    coverObjectUrlRef.current = localUrl;
    setCoverPreview(localUrl);

    setCoverUploading(true);
    try {
      const res = await uploadApi.upload(file, "MODULE_IMAGE");
      setCoverUrl(res.url);
      setCoverPreview(res.url);
      URL.revokeObjectURL(localUrl);
      coverObjectUrlRef.current = null;
    } catch {
      showToast(
        "error",
        "Gagal mengupload gambar cover. Preview lokal tetap digunakan.",
      );
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = () => {
    handleCoverChange(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  /* save */
  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!moduleName.trim()) newErrors.moduleName = "Judul modul wajib diisi.";
    if (!subtitle.trim()) newErrors.subtitle = "Subtitle modul wajib diisi.";
    if (!tutorId.trim()) newErrors.tutorId = "Guru modul wajib dipilih.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSaving(true);

    try {
      let moduleImgUrl = coverUrl;
      if (!moduleImgUrl && coverFile) {
        const res = await uploadApi.upload(coverFile, "MODULE_IMAGE");
        moduleImgUrl = res.url ?? null;
      }

      await adminModulApi.create({
        moduleName: moduleName.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        targetTime: computedTargetTime,
        difficulty,
        isPaid,
        modulPrice: isPaid ? Number(modulPrice || 0) : 0,
        level: level || null,
        class: kelas || null,
        type: accessType === "siswa" ? "SISWA" : "UMUM",
        modulType: accessType === "siswa" ? "SISWA" : "UMUM",
        isDraft,
        tutorId,
        moduleImgUrl,
        pretestPostTestEnabled,
        hasStudyGroup,
        hasCertificate,
      });

      showToast("success", "Modul berhasil disimpan.");
      router.push("/admin/manajemen-modul");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan modul.";
      showToast("error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── feature toggle cards ─── */
  const featureCards = [
    { id: "isPaid", label: "Berbayar", checked: isPaid, setter: setIsPaid },
    {
      id: "prepost",
      label: "Pre / Post Test",
      checked: pretestPostTestEnabled,
      setter: setPretestPostTestEnabled,
    },
    {
      id: "cert",
      label: "Sertifikat",
      checked: hasCertificate,
      setter: setHasCertificate,
    },
    {
      id: "group",
      label: "Grup Belajar",
      checked: hasStudyGroup,
      setter: setHasStudyGroup,
    },
  ];

  /* ─── pill toggle helper ─── */
  function pillBtn(active: boolean) {
    return [
      "px-5 py-1.5 text-[13px] font-semibold transition-colors",
      active
        ? "bg-[#7054dc] text-white"
        : "bg-white text-[#6b6880] hover:bg-[#f5f2ff]",
    ].join(" ");
  }

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/admin/manajemen-modul"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7054dc] hover:text-[#5f46cc] transition-colors"
        >
          <FiArrowLeft size={15} />
          Kembali ke Manajemen Modul
        </Link>

        {/* Heading */}
        <h1 className="text-[22px] font-bold text-[#1a1830]">
          Tambah Modul Baru
        </h1>
        <p className="mt-1 text-[13px] text-[#9b97ad]">
          Field <span className="text-[#e8473f]">*</span> wajib diisi
        </p>

        <div className="mt-6 space-y-5">
          {/* ── Card 1: Cover Modul ── */}
          <div className="rounded-2xl border border-[#edeaf6] bg-white p-6 shadow-[0_2px_12px_rgba(112,84,220,0.06)]">
            <SectionTitle>Cover Modul</SectionTitle>

            {/* 16:9 upload area */}
            <div
              className="relative w-full cursor-pointer overflow-hidden rounded-xl"
              style={{ aspectRatio: "16/9" }}
              onClick={() => !coverUploading && coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Preview cover modul"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-[#d0cce8] bg-[#f7f6fb] rounded-xl">
                  <FiImage size={40} className="text-[#c0bdd8]" />
                  <p className="text-[13px] text-[#a0a3af]">
                    Klik untuk upload cover modul
                  </p>
                  <p className="text-[11px] text-[#c0bfca]">
                    Rekomendasi: 1280 × 720 px (16:9)
                  </p>
                </div>
              )}

              {/* Upload spinner overlay */}
              {coverUploading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40">
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[#7054dc] shadow-lg">
                    <Spinner size={14} />
                    Mengunggah...
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={coverInputRef}
              id="admin-cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
            />

            {/* Action buttons below cover */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#7054dc] px-4 py-2 text-[12px] font-semibold text-[#7054dc] hover:bg-[#f5f2ff] transition-colors disabled:opacity-50"
              >
                <FiImage size={13} />
                Pilih Gambar
              </button>
              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  disabled={coverUploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8473f] px-4 py-2 text-[12px] font-semibold text-[#e8473f] hover:bg-[#fff5f5] transition-colors disabled:opacity-50"
                >
                  <FiX size={13} />
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* ── Card 2: Informasi Dasar ── */}
          <div className="rounded-2xl border border-[#edeaf6] bg-white p-6 shadow-[0_2px_12px_rgba(112,84,220,0.06)]">
            <SectionTitle>Informasi Dasar</SectionTitle>

            {/* Judul Modul */}
            <div>
              <label className={labelCls}>
                Judul Modul <span className="text-[#e8473f]">*</span>
              </label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => {
                  setModuleName(e.target.value);
                  setErrors((p) => ({ ...p, moduleName: "" }));
                }}
                placeholder="Masukkan judul modul"
                className={`${inputCls} ${errors.moduleName ? "border-[#e8473f]" : ""}`}
              />
              {errors.moduleName ? (
                <p className={errorCls}>{errors.moduleName}</p>
              ) : (
                <p className={hintCls}>
                  Judul sebaiknya menarik perhatian, informatif, dan
                  dioptimalkan untuk penelusuran
                </p>
              )}
            </div>

            {/* Subtitle */}
            <div className="mt-4">
              <label className={labelCls}>
                Subtitle <span className="text-[#e8473f]">*</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => {
                  setSubtitle(e.target.value);
                  setErrors((p) => ({ ...p, subtitle: "" }));
                }}
                placeholder="Masukkan subtitle modul"
                className={`${inputCls} ${errors.subtitle ? "border-[#e8473f]" : ""}`}
              />
              {errors.subtitle ? (
                <p className={errorCls}>{errors.subtitle}</p>
              ) : (
                <p className={hintCls}>
                  Gunakan 1 atau 2 kata kunci terkait, sebutkan area terpenting
                  yang dibahas.
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="mt-4">
              <label className={labelCls}>Deskripsi</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsikan modul anda secara singkat ..."
                maxLength={500}
                className="mt-1.5 w-full resize-none rounded-xl border border-[#e2e0ea] bg-[#fafafa] px-4 py-3 text-[13px] text-[#232530] outline-none transition-colors focus:border-[#7054dc] focus:bg-white placeholder:text-[#c0bfca]"
              />
              <div className="mt-1 flex items-center justify-between">
                <p className={hintCls}>
                  Deskripsikan modul anda secara singkat
                </p>
                <p className={hintCls}>{description.length}/500</p>
              </div>
            </div>

            {/* Guru Modul */}
            <div className="mt-4">
              <label className={labelCls}>
                Guru Modul <span className="text-[#e8473f]">*</span>
              </label>
              <CustomSelect
                value={tutorId}
                onChange={(v) => {
                  setTutorId(v);
                  setErrors((p) => ({ ...p, tutorId: "" }));
                }}
                options={tutorOptions}
                placeholder="Pilih Guru"
                error={!!errors.tutorId}
              />
              {errors.tutorId ? (
                <p className={errorCls}>{errors.tutorId}</p>
              ) : (
                <p className={hintCls}>
                  Pilih guru yang bertanggung jawab atas modul ini.
                </p>
              )}
            </div>
          </div>

          {/* ── Card 3: Pengaturan Modul ── */}
          <div className="rounded-2xl border border-[#edeaf6] bg-white p-6 shadow-[0_2px_12px_rgba(112,84,220,0.06)]">
            <SectionTitle>Pengaturan Modul</SectionTitle>

            {/* Tipe Akses pill toggle */}
            <div>
              <label className={labelCls}>Tipe Akses</label>
              <div className="mt-1.5 inline-flex overflow-hidden rounded-xl border border-[#e2e0ea]">
                <button
                  type="button"
                  className={pillBtn(accessType === "siswa")}
                  onClick={() => setAccessType("siswa")}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  className={pillBtn(accessType === "umum")}
                  onClick={() => setAccessType("umum")}
                >
                  Umum
                </button>
              </div>
              <p className={hintCls}>
                Tentukan siapa yang dapat mengakses modul ini.
              </p>
            </div>

            {/* Jenjang + Kelas — only for siswa */}
            {accessType === "siswa" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Jenjang Sekolah</label>
                  <CustomSelect
                    value={level}
                    onChange={setLevel}
                    options={jenjangOptions}
                    placeholder="Pilih Jenjang"
                  />
                  <p className={hintCls}>Sebutkan kurikulum modul anda.</p>
                </div>
                <div>
                  <label className={labelCls}>Kelas</label>
                  <CustomSelect
                    value={kelas}
                    onChange={setKelas}
                    options={kelasOptions}
                    placeholder={
                      level ? "Pilih Tingkatan Kelas" : "Pilih jenjang dulu"
                    }
                    disabled={!level}
                  />
                  <p className={hintCls}>Tingkatan kelas sesuai jenjang.</p>
                </div>
              </div>
            )}

            {/* Level Kesulitan + Durasi */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Level Kesulitan</label>
                <CustomSelect
                  value={difficulty}
                  onChange={setDifficulty}
                  options={difficultyOptions}
                  placeholder="Pilih Level"
                />
                <p className={hintCls}>
                  Level kesulitan yang sesuai isi modul.
                </p>
              </div>
              <div>
                <label className={labelCls}>Durasi Pembelajaran</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="number"
                    value={targetTime}
                    onChange={(e) => setTargetTime(Number(e.target.value) || 1)}
                    min={1}
                    className="h-[44px] w-[90px] rounded-xl border border-[#e2e0ea] bg-[#fafafa] px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] focus:bg-white transition-colors"
                  />
                  <div className="flex-1">
                    <CustomSelect
                      value={targetTimeUnit}
                      onChange={(v) =>
                        setTargetTimeUnit(v as "bulan" | "minggu")
                      }
                      options={durationUnitOptions}
                      placeholder="Satuan"
                    />
                  </div>
                </div>
                <p className={hintCls}>Estimasi waktu belajar siswa.</p>
              </div>
            </div>

            {/* Status Modul pill toggle */}
            <div className="mt-4">
              <label className={labelCls}>Status Modul</label>
              <div className="mt-1.5 inline-flex overflow-hidden rounded-xl border border-[#e2e0ea]">
                <button
                  type="button"
                  className={pillBtn(!isDraft)}
                  onClick={() => setIsDraft(false)}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  className={pillBtn(isDraft)}
                  onClick={() => setIsDraft(true)}
                >
                  Draft
                </button>
              </div>
              <p className={hintCls}>
                Draft tidak akan tampil di halaman publik.
              </p>
            </div>
          </div>

          {/* ── Card 4: Fitur Modul ── */}
          <div className="rounded-2xl border border-[#edeaf6] bg-white p-6 shadow-[0_2px_12px_rgba(112,84,220,0.06)]">
            <SectionTitle>Fitur Modul</SectionTitle>

            {/* Feature toggle cards — 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {featureCards.map(({ id, label, checked, setter }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setter(!checked)}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    checked
                      ? "border-[#7054dc] bg-[#f5f2ff]"
                      : "border-[#e2e0ea] bg-white hover:border-[#c8c4db]",
                  ].join(" ")}
                >
                  {/* Checkbox icon */}
                  <span
                    className={[
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                      checked
                        ? "border-[#7054dc] bg-[#7054dc]"
                        : "border-[#c8c4db] bg-white",
                    ].join(" ")}
                  >
                    {checked && (
                      <FiCheck
                        size={11}
                        className="text-white"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span
                    className={[
                      "text-[13px] font-semibold",
                      checked ? "text-[#7054dc]" : "text-[#3d3a4a]",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* Harga — visible only when isPaid */}
            {isPaid && (
              <div className="mt-4">
                <label className={labelCls}>Harga Modul (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={modulPrice}
                  onChange={(e) => setModulPrice(e.target.value)}
                  placeholder="Masukkan harga modul"
                  className={inputCls}
                />
                <p className={hintCls}>
                  Masukkan harga dalam Rupiah (tanpa titik/koma).
                </p>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <Link
              href="/admin/manajemen-modul"
              className="inline-flex h-[44px] items-center rounded-xl border border-[#e2e0ea] px-6 text-[13px] font-semibold text-[#6b6880] hover:border-[#c8c4db] hover:bg-[#f7f6fb] transition-colors"
            >
              Batal
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-[44px] items-center gap-2 rounded-xl bg-[#7054dc] px-7 text-[13px] font-semibold text-white shadow-[0_6px_18px_rgba(112,84,220,0.28)] hover:bg-[#5f46cc] transition-colors disabled:opacity-60"
            >
              {isSaving && <Spinner size={14} className="text-white" />}
              {isSaving ? "Menyimpan..." : "Simpan Modul"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
