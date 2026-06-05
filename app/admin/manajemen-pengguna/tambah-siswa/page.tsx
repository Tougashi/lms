'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiHome5Fill } from 'react-icons/ri';
import { FiArrowLeft } from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import { adminSiswaApi } from '../../../lib/api';
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

export default function TambahSiswaPage() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useAdminToast();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [kelasSekolah, setKelasSekolah] = useState('');
  const [studentType, setStudentType] = useState<'SISWA' | 'GURU'>('SISWA');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!namaLengkap.trim()) e.namaLengkap = 'Nama lengkap wajib diisi.';
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
      await adminSiswaApi.create({
        nama_lengkap: namaLengkap.trim(),
        email: email.trim(),
        password,
        jenjang: jenjang || undefined,
        kelas_sekolah: kelasSekolah || undefined,
        studentType,
      });
      showToast('success', 'Siswa berhasil ditambahkan.');
      setTimeout(() => router.push('/admin/manajemen-pengguna'), 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal menambahkan siswa.';
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
            Tambah Siswa
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
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Masukkan nama lengkap siswa"
                className={inputCls}
              />
              {errors.namaLengkap && (
                <p className={errorCls}>{errors.namaLengkap}</p>
              )}
              <p className={hintCls}>Gunakan nama lengkap sesuai identitas resmi</p>
            </div>

            {/* Email + Password */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Email <span className="text-[#f36e65]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siswa@email.com"
                  className={inputCls}
                />
                {errors.email && <p className={errorCls}>{errors.email}</p>}
              </div>
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
            </div>

            {/* Jenjang + Kelas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Jenjang Sekolah</label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
                <p className={hintCls}>Sesuaikan dengan jenjang pendidikan siswa</p>
              </div>
              <div>
                <label className={labelCls}>Kelas</label>
                <select
                  value={kelasSekolah}
                  onChange={(e) => setKelasSekolah(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Pilih Kelas</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                  <option value="10">Kelas 10</option>
                  <option value="11">Kelas 11</option>
                  <option value="12">Kelas 12</option>
                </select>
              </div>
            </div>

            {/* Tipe Siswa */}
            <div>
              <label className={labelCls}>Tipe Akses</label>
              <div className="mt-2 flex items-center gap-6 text-[13px] text-[#6e7280]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="studentType"
                    checked={studentType === 'SISWA'}
                    onChange={() => setStudentType('SISWA')}
                    className="h-4 w-4 accent-[#7054dc]"
                  />
                  Siswa (terdaftar di sekolah)
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="studentType"
                    checked={studentType === 'GURU'}
                    onChange={() => setStudentType('GURU')}
                    className="h-4 w-4 accent-[#7054dc]"
                  />
                  Umum
                </label>
              </div>
              <p className={hintCls}>
                Siswa mendapatkan akses ke modul yang di-assign. Umum memiliki akses
                terbatas.
              </p>
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
                {isSaving ? 'Menyimpan...' : 'Simpan Siswa'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
