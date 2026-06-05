'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiHome5Fill } from 'react-icons/ri';
import { FiArrowLeft } from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import { adminTutorApi } from '../../../lib/api';
import {
  AdminToastContainer,
  useAdminToast,
} from '../../components/AdminToast';

const inputCls =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors';
const selectCls =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] appearance-none transition-colors';
const labelCls = 'text-[13px] font-bold text-[#232530]';
const errorCls = 'mt-1 text-[11px] text-[#f36e65]';
const hintCls = 'mt-1 text-[11px] text-[#7e8290]';

export default function TambahGuruPage() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useAdminToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Nama lengkap wajib diisi.';
    if (!email.trim()) e.email = 'Email wajib diisi.';
    if (!email.includes('@')) e.email = 'Format email tidak valid.';
    if (!password || password.length < 6)
      e.password = 'Password minimal 6 karakter.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await adminTutorApi.create({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        gender: gender || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
      });
      showToast('success', 'Guru berhasil ditambahkan.');
      setTimeout(() => router.push('/admin/manajemen-pengguna'), 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal menambahkan guru.';
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f6]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Breadcrumb */}
        <div className="mt-2">
          <Link
            href="/admin/manajemen-pengguna"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]"
          >
            <FiArrowLeft size={15} />
            Kembali ke Manajemen Pengguna
          </Link>
        </div>

        {/* Page heading */}
        <div className="mt-5">

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#7054dc] sm:text-4xl lg:text-5xl">
            Tambah Guru
          </h1>
        </div>

        {/* Form card */}
        <div className="mt-5 rounded-[22px] border border-[#e1dff0] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mx-auto max-w-[720px] space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label className={labelCls}>
                Nama Lengkap <span className="text-[#f36e65]">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap guru"
                className={inputCls}
              />
              {errors.fullName && (
                <p className={errorCls}>{errors.fullName}</p>
              )}
              <p className={hintCls}>Gunakan nama lengkap sesuai identitas resmi</p>
            </div>

            {/* Email + No WA */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Email <span className="text-[#f36e65]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guru@email.com"
                  className={inputCls}
                />
                {errors.email && <p className={errorCls}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>No. WhatsApp</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={inputCls}
                />
                <p className={hintCls}>Opsional, untuk keperluan komunikasi</p>
              </div>
            </div>

            {/* Password + Gender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Password <span className="text-[#f36e65]">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={inputCls}
                />
                {errors.password && (
                  <p className={errorCls}>{errors.password}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as 'MALE' | 'FEMALE' | '')
                  }
                  className={selectCls}
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-[#f0eff6] pt-5">
              <Link
                href="/admin/manajemen-pengguna"
                className="rounded-xl border border-[#d8d3f0] px-6 py-2.5 text-[13px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
              >
                Batal
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="rounded-xl bg-[#7054dc] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc] disabled:opacity-60"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Guru'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
