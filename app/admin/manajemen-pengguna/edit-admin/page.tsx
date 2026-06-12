"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiUser,
} from "react-icons/fi";
import AdminHeader from "../../../component/admin/AdminHeader";
import { adminUserApi } from "../../../lib/api";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative mt-1.5">
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
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-[#e2e0ea] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(""); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[#c0bfca] hover:bg-[#f7f5ff] transition-colors"
            >
              {placeholder}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(opt.value); setOpen(false); }}
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

const genderOptions: SelectOption[] = [
  { label: "Laki-laki", value: "L" },
  { label: "Perempuan", value: "P" },
];

function EditAdminForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { toasts, showToast, dismissToast } = useAdminToast();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    whatsappNumber: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.replace("/admin/manajemen-pengguna");
      return;
    }
    const fetchData = async () => {
      try {
        const admins = await adminUserApi.getAll();
        const admin = admins.find((a) => a.id === id);
        if (!admin) throw new Error("Admin tidak ditemukan");
        setForm({
          fullName: admin.fullName || "",
          username: admin.username || "",
          email: admin.email || "",
          password: "",
          whatsappNumber: admin.whatsappNumber || "",
          gender: admin.gender || "",
        });
      } catch (err) {
        showToast("error", "Gagal mengambil data admin.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Nama lengkap wajib diisi";
    if (!form.username.trim()) errs.username = "Username wajib diisi";
    if (!form.email.trim()) {
      errs.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Format email tidak valid";
    }
    if (form.password && form.password.length < 6)
      errs.password = "Password minimal 6 karakter";
    if (!form.whatsappNumber.trim())
      errs.whatsappNumber = "Nomor WhatsApp wajib diisi";
    if (!form.gender) errs.gender = "Pilih jenis kelamin";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("error", "Periksa kembali isian formulir Anda.");
      return;
    }

    if (!id) return;

    setIsSubmitting(true);
    try {
      await adminUserApi.update(id, {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password || undefined,
        whatsappNumber: form.whatsappNumber,
        gender: form.gender,
      });

      showToast("success", "Admin berhasil diperbarui!");
      setTimeout(() => {
        router.push("/admin/manajemen-pengguna");
      }, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-[#9396a3]">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#e1dff0] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Profil Section */}
        <div>
          <SectionTitle>Profil Admin</SectionTitle>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                Nama Lengkap <span className="text-[#e8473f]">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="Masukkan nama lengkap..."
                className={`${inputCls} ${errors.fullName ? "border-[#e8473f]" : ""}`}
              />
              {errors.fullName && (
                <p className={errorCls}>{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Username <span className="text-[#e8473f]">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Contoh: admin_budi"
                className={`${inputCls} ${errors.username ? "border-[#e8473f]" : ""}`}
              />
              {errors.username && (
                <p className={errorCls}>{errors.username}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Jenis Kelamin <span className="text-[#e8473f]">*</span>
              </label>
              <CustomSelect
                value={form.gender}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, gender: v }))
                }
                options={genderOptions}
                placeholder="Pilih gender"
                error={!!errors.gender}
              />
              {errors.gender && <p className={errorCls}>{errors.gender}</p>}
            </div>
          </div>
        </div>

        {/* Akun & Kontak Section */}
        <div>
          <SectionTitle>Akun & Kontak</SectionTitle>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                Email <span className="text-[#e8473f]">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="admin@example.com"
                className={`${inputCls} ${errors.email ? "border-[#e8473f]" : ""}`}
              />
              {errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>

            <div>
              <label className={labelCls}>
                Nomor WhatsApp <span className="text-[#e8473f]">*</span>
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm((prev) => ({ ...prev, whatsappNumber: val }));
                }}
                placeholder="0812xxxx"
                className={`${inputCls} ${errors.whatsappNumber ? "border-[#e8473f]" : ""}`}
              />
              {errors.whatsappNumber && (
                <p className={errorCls}>{errors.whatsappNumber}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Isi jika ingin mengubah password (min 6 char)"
                  className={`${inputCls} pr-10 ${errors.password ? "border-[#e8473f]" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-[#9b97ad] hover:text-[#7054dc] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <p className={hintCls}>Biarkan kosong jika tidak ingin mengubah password.</p>
              {errors.password && (
                <p className={errorCls}>{errors.password}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-[#eeecf6]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#7054dc] px-8 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(112,84,220,0.2)] transition-all hover:bg-[#5b42ba] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditAdminPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f6]">
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin/manajemen-pengguna"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7054dc] shadow-sm transition-transform hover:scale-105"
          >
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#232530]">Edit Admin</h1>
        </div>
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-sm text-[#9396a3]">Memuat data...</div>}>
          <EditAdminForm />
        </Suspense>
      </main>
    </div>
  );
}
