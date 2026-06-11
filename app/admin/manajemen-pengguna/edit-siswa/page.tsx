'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import { adminSiswaApi } from '../../../lib/api';
import {
  AdminToastContainer,
  useAdminToast,
} from '../../components/AdminToast';

/* ─── style constants ─── */
const labelCls = 'block text-[12px] font-semibold text-[#3d3a4a]';
const errorCls = 'mt-1 text-[11px] text-[#e8473f]';
const hintCls = 'mt-1 text-[11px] text-[#a0a3af]';

const fieldCls =
  'mt-1.5 h-[44px] w-full rounded-xl border border-[#e2e0ea] bg-[#fafafa] px-4 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] focus:bg-white transition-colors placeholder:text-[#c0bfca]';

/* ─── native StyledSelect with chevron icon ─── */
interface SelectOption { label: string; value: string; }
interface StyledSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}
function StyledSelect({ value, onChange, options, placeholder = '— Pilih —', disabled, error }: StyledSelectProps) {
  return (
    <div className="relative mt-1.5">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'h-[44px] w-full appearance-none rounded-xl border bg-[#fafafa] pl-4 pr-10 text-[13px] outline-none transition-colors',
          'focus:border-[#7054dc] focus:bg-white',
          error ? 'border-[#e8473f]' : 'border-[#e2e0ea]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#c8c4db]',
          !value ? 'text-[#c0bfca]' : 'text-[#232530]',
        ].join(' ')}
      >
        <option value="" disabled={false}>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* custom chevron */}
      <FiChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9b97ad]"
      />
    </div>
  );
}

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

/* ─── option lists ─── */
const jenjangOptions: SelectOption[] = [
  { label: 'SD', value: 'SD' },
  { label: 'SMP', value: 'SMP' },
  { label: 'SMA', value: 'SMA' },
];

const allKelasOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
  label: `Kelas ${i + 1}`,
  value: String(i + 1),
}));

const kelasRangeByJenjang: Record<string, number[]> = {
  SD: [1, 2, 3, 4, 5, 6],
  SMP: [7, 8, 9],
  SMA: [10, 11, 12],
};

function getKelasOptions(jenjang: string): SelectOption[] {
  if (!jenjang) return allKelasOptions;
  const range = kelasRangeByJenjang[jenjang] ?? [];
  return allKelasOptions.filter((o) => range.includes(Number(o.value)));
}

/* ══════════════════════════════════════════════════════════════ */
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
    if (!id) { setNotFound(true); setIsLoading(false); return; }
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

  const handleJenjangChange = (v: string) => {
    setJenjang(v);
    // reset kelas jika tidak masuk range jenjang baru
    if (v && kelasSekolah) {
      const range = kelasRangeByJenjang[v] ?? [];
      if (!range.includes(Number(kelasSekolah))) setKelasSekolah('');
    }
    if (!v) setKelasSekolah('');
  };

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
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui data siswa.';
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3f8]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Back */}
        <Link
          href="/admin/manajemen-pengguna"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6b6880] transition-colors hover:text-[#7054dc]"
        >
          <FiArrowLeft size={15} />
          Kembali ke Manajemen Pengguna
        </Link>

        {/* Heading */}
        <div className="mt-6 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#9b97ad]">
            Admin · Manajemen Pengguna
          </p>
          <h1 className="mt-1 text-[28px] font-bold text-[#232530]">Edit Data Siswa</h1>
          <p className="mt-1 text-[13px] text-[#9396a3]">Perbarui informasi profil siswa.</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#e6e3f0] bg-white shadow-sm">
            <p className="text-sm text-[#9396a3]">Memuat data siswa...</p>
          </div>
        ) : notFound ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#e6e3f0] bg-white shadow-sm">
            <p className="text-sm text-[#f36e65]">Data siswa tidak ditemukan.</p>
            <Link
              href="/admin/manajemen-pengguna"
              className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#5f46cc]"
            >
              <FiArrowLeft size={14} /> Kembali
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── CARD ── */}
            <div className="rounded-2xl border border-[#e6e3f0] bg-white p-6 shadow-sm">
              <SectionTitle>Informasi Siswa</SectionTitle>

              {/* Nama */}
              <div className="mb-4">
                <label className={labelCls}>
                  Nama Lengkap <span className="text-[#e8473f]">*</span>
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Masukkan nama lengkap siswa"
                  className={`${fieldCls} ${errors.namaLengkap ? 'border-[#e8473f]' : ''}`}
                />
                {errors.namaLengkap
                  ? <p className={errorCls}>{errors.namaLengkap}</p>
                  : <p className={hintCls}>Gunakan nama lengkap sesuai identitas</p>
                }
              </div>

              {/* Jenjang + Kelas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Jenjang Sekolah</label>
                  <StyledSelect
                    value={jenjang}
                    onChange={handleJenjangChange}
                    options={jenjangOptions}
                    placeholder="— Pilih Jenjang —"
                  />
                  <p className={hintCls}>Opsional — SD, SMP, atau SMA</p>
                </div>
                <div>
                  <label className={labelCls}>Kelas</label>
                  <StyledSelect
                    value={kelasSekolah}
                    onChange={setKelasSekolah}
                    options={getKelasOptions(jenjang)}
                    placeholder="— Pilih Kelas —"
                    disabled={!jenjang}
                  />
                  <p className={hintCls}>
                    {jenjang ? 'Pilih kelas sesuai jenjang' : 'Pilih jenjang terlebih dahulu'}
                  </p>
                </div>
              </div>
            </div>

            {/* ID Badge */}
            <div className="rounded-xl bg-[#f7f6fb] px-4 py-3 text-[12px] text-[#9396a3]">
              ID Siswa:{' '}
              <span className="font-mono text-[#7054dc]">{id}</span>
            </div>

            {/* Actions */}
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
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-7 py-2.5 text-[13px] font-semibold text-white shadow-[0_6px_20px_rgba(112,84,220,0.3)] transition-all hover:bg-[#5f46cc] disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        )}
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
