'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function EditSiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const { toasts, showToast, dismissToast } = useAdminToast();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [kelasSekolah, setKelasSekolah] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    adminSiswaApi
      .getAll()
      .then((list) => {
        const siswa = list.items.find((s) => s.id === id);
        if (!siswa) {
          setNotFound(true);
        } else {
          setNamaLengkap(siswa.nama_lengkap);
          setJenjang(siswa.jenjang ?? '');
          setKelasSekolah(siswa.kelas_sekolah ?? '');
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!namaLengkap.trim()) e.namaLengkap = 'Nama lengkap wajib diisi.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !id) return;
    setIsSaving(true);
    try {
      await adminSiswaApi.update(id, {
        nama_lengkap: namaLengkap.trim(),
        jenjang: jenjang || undefined,
        kelas_sekolah: kelasSekolah || undefined,
      });
      showToast('success', 'Data siswa berhasil diperbarui.');
      setTimeout(() => router.push('/admin/manajemen-pengguna'), 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memperbarui data siswa.';
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
            Edit Data Siswa
          </h1>
        </div>

        {/* Form card */}
        <div className="mt-5 rounded-[22px] border border-[#e1dff0] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-[#9396a3]">
              Memuat data siswa...
            </div>
          ) : notFound ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
              <p className="text-sm text-[#f36e65]">
                Data siswa tidak ditemukan.
              </p>
              <Link
                href="/admin/manajemen-pengguna"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#5f46cc]"
              >
                <FiArrowLeft size={14} />
                Kembali
              </Link>
            </div>
          ) : (
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

              {/* ID info */}
              <div className="rounded-lg bg-[#f7f7fa] px-4 py-3 text-[12px] text-[#9396a3]">
                ID Siswa:{' '}
                <span className="font-mono text-[#7054dc]">{id}</span>
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
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function EditSiswaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f3f6]" />}>
      <EditSiswaContent />
    </Suspense>
  );
}
