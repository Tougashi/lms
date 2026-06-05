'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiBookOpen, FiEdit2 } from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { AdminToastContainer, useAdminToast } from '../../components/AdminToast';
import { adminModulApi, adminTutorApi, uploadApi } from '../../../lib/api';
import type { AdminTutorItem } from '../../../lib/types/admin';

/* ─── shared class names (same as tambah-modul) ─── */
const inputCls =
  'mt-2 h-[40px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors';
const textareaCls =
  'mt-2 w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] resize-none transition-colors';

function normalizeStoredImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return `/api-backend/storage/${url.replace(/^\/+/, '')}`;
}

/* ─── inner component ─── */
function EditModulContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const { toasts, showToast, dismissToast } = useAdminToast();

  /* loading/error state */
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* cover */
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverObjectUrlRef = useRef<string | null>(null);

  /* tutor list */
  const [tutorList, setTutorList] = useState<AdminTutorItem[]>([]);

  /* form fields */
  const [moduleName, setModuleName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [accessType, setAccessType] = useState<'siswa' | 'umum'>('siswa');
  const [isDraft, setIsDraft] = useState(true);
  const [level, setLevel] = useState('');
  const [kelas, setKelas] = useState('');
  const [difficulty, setDifficulty] = useState('Menengah');
  const [targetTime, setTargetTime] = useState(1);
  const [targetTimeUnit, setTargetTimeUnit] = useState<'bulan' | 'minggu'>('bulan');
  const [isPaid, setIsPaid] = useState(false);
  const [modulPrice, setModulPrice] = useState('');
  const [pretestPostTestEnabled, setPretestPostTestEnabled] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [hasStudyGroup, setHasStudyGroup] = useState(false);

  /* derived kelas options */
  const kelasOptions = useMemo(() => {
    switch (level) {
      case 'SD': return ['1', '2', '3', '4', '5', '6'];
      case 'SMP': return ['7', '8', '9'];
      case 'SMA': return ['10', '11', '12'];
      default: return [];
    }
  }, [level]);

  const prevLevelRef = useRef(level);
  useEffect(() => {
    if (prevLevelRef.current !== level) {
      prevLevelRef.current = level;
      if (kelas && !kelasOptions.includes(kelas)) setKelas('');
    }
  }, [level, kelasOptions, kelas]);

  /* computed target time in minutes */
  const computedTargetTime = useMemo(
    () => (targetTimeUnit === 'bulan' ? targetTime * 60 : targetTime * 7),
    [targetTime, targetTimeUnit],
  );

  /* load existing module data */
  const fetchData = useCallback(async () => {
    if (!id) { setNotFound(true); setIsLoading(false); return; }
    try {
      const [modulResult, tutorResult] = await Promise.allSettled([
        adminModulApi.getById(id),
        adminTutorApi.getAll(),
      ]);

      if (tutorResult.status === 'fulfilled') setTutorList(tutorResult.value);

      if (modulResult.status === 'fulfilled') {
        const m = modulResult.value;
        setModuleName(m.moduleName ?? '');
        setSubtitle(m.subtitle ?? '');
        setDescription(m.description ?? '');
        setTutorId(m.tutorId ?? '');
        setAccessType((m.modulType ?? m.type ?? 'SISWA') === 'UMUM' ? 'umum' : 'siswa');
        setIsDraft(m.isDraft ?? true);
        setLevel(m.level ?? '');
        setKelas(m.class ?? '');
        setDifficulty(m.difficulty ?? 'Menengah');
        setIsPaid(Boolean(m.isPaid));
        setModulPrice(m.modulPrice != null ? String(m.modulPrice) : '');
        setPretestPostTestEnabled(m.pretestPostTestEnabled ?? true);
        setHasCertificate(m.hasCertificate ?? false);
        setHasStudyGroup(m.hasStudyGroup ?? false);
        setCoverPreview(normalizeStoredImageUrl(m.moduleImgUrl) || null);

        /* parse existing targetTime back to unit */
        if (m.targetTime) {
          if (m.targetTime >= 60) {
            setTargetTime(Math.round(m.targetTime / 60));
            setTargetTimeUnit('bulan');
          } else {
            setTargetTime(m.targetTime);
            setTargetTimeUnit('minggu');
          }
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* cleanup object URL */
  useEffect(() => {
    return () => {
      if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
    };
  }, []);

  /* cover change */
  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (coverObjectUrlRef.current) { URL.revokeObjectURL(coverObjectUrlRef.current); coverObjectUrlRef.current = null; }
    if (!file) { setCoverPreview(null); return; }
    const url = URL.createObjectURL(file);
    coverObjectUrlRef.current = url;
    setCoverPreview(url);
  };

  /* save */
  const handleSave = async () => {
    if (!moduleName.trim()) { setError('Judul modul wajib diisi.'); return; }
    if (!subtitle.trim()) { setError('Subtitle modul wajib diisi.'); return; }
    if (!tutorId.trim()) { setError('Guru modul wajib dipilih.'); return; }

    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      let moduleImgUrl: string | null = coverPreview;
      if (coverFile) {
        const res = await uploadApi.upload(coverFile);
        moduleImgUrl = normalizeStoredImageUrl(res.url);
      }

      await adminModulApi.update(id, {
        moduleName: moduleName.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        targetTime: computedTargetTime,
        difficulty,
        isPaid,
        modulPrice: isPaid ? Number(modulPrice || 0) : 0,
        level: level || null,
        class: kelas || null,
        modulType: accessType === 'siswa' ? 'SISWA' : 'UMUM',
        isDraft,
        tutorId,
        moduleImgUrl,
        pretestPostTestEnabled,
        hasStudyGroup,
        hasCertificate,
      });

      setSuccessMsg('Modul berhasil diperbarui!');
      showToast('success', 'Modul berhasil diperbarui.');
      setTimeout(() => router.push('/admin/manajemen-modul'), 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui modul.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── not found / loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6fb]">
        <AdminHeader />
        <div className="flex min-h-[calc(100vh-74px)] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
            <p className="text-[13px] text-[#8a8d98]">Memuat data modul...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f7f6fb]">
        <AdminHeader />
        <div className="flex min-h-[calc(100vh-74px)] flex-col items-center justify-center gap-4">
          <p className="text-[14px] text-[#f36e65]">Modul tidak ditemukan.</p>
          <Link
            href="/admin/manajemen-modul"
            className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#5f46cc] transition-colors"
          >
            <FiArrowLeft size={14} />
            Kembali ke Manajemen Modul
          </Link>
        </div>
      </div>
    );
  }

  /* ─── main ─── */
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="flex w-full">
        <AdminModuleSidebar
          basePath="/admin/manajemen-modul/edit"
          modulId={id}
          title="Edit Modul"
        />

        <section className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:pr-8">
          {/* Banners */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
              {successMsg}
            </div>
          )}

          {/* Cover */}
          <div className="flex flex-col items-center">
            <div className="rounded-[26px] border border-[#f0eff6] bg-white p-3 shadow-[0_10px_24px_rgba(20,20,30,0.06)]">
              <div className="relative h-[180px] w-[300px] overflow-hidden rounded-[20px] border border-[#e5e3ee] bg-[#f4f3ff]">
                {coverPreview ? (
                  <Image src={coverPreview} alt="Preview cover modul" fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiBookOpen size={34} className="text-[#7054dc]" />
                  </div>
                )}
                <label
                  htmlFor="admin-edit-cover-upload"
                  className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#d9d7df] bg-white text-[#7054dc] shadow-sm hover:bg-[#f5f2ff] transition-colors"
                  aria-label="Edit cover"
                >
                  <FiEdit2 size={12} />
                </label>
                <input
                  id="admin-edit-cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>

          {/* Basic fields */}
          <div className="mt-6">
            <label className="text-[12px] font-semibold text-[#232530]">Judul Modul</label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="Masukkan judul modul"
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-[#7e8290]">
              Judul sebaiknya menarik perhatian, informatif, dan dioptimalkan untuk penelusuran
            </p>

            <label className="mt-4 block text-[12px] font-semibold text-[#232530]">Subtitle Modul</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Masukkan subtitle modul"
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-[#7e8290]">
              Gunakan 1 atau 2 kata kunci terkait, sebutkan area terpenting yang dibahas.
            </p>
          </div>

          <div className="mt-6">
            <label className="text-[12px] font-semibold text-[#232530]">Deskripsi Modul</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi modul ..."
              className={textareaCls}
              maxLength={500}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
              <span>Deskripsikan modul anda secara singkat</span>
              <span>{description.length}/500</span>
            </div>
          </div>

          {/* Guru */}
          <div className="mt-6">
            <label className="text-[12px] font-semibold text-[#232530]">Guru Modul</label>
            <select
              className={inputCls}
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
            >
              <option value="">Pilih Guru</option>
              {tutorList.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#7e8290]">Pilih Guru yang bertanggung jawab atas modul ini.</p>
          </div>

          {/* Access type */}
          <div className="mt-6">
            <p className="text-[12px] font-semibold text-[#232530]">Tipe Akses</p>
            <div className="mt-3 flex items-center gap-6 text-[12px] text-[#6e7280]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="aksesEdit"
                  checked={accessType === 'siswa'}
                  onChange={() => setAccessType('siswa')}
                  className="h-4 w-4 accent-[#7054dc]"
                />
                Siswa
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="aksesEdit"
                  checked={accessType === 'umum'}
                  onChange={() => setAccessType('umum')}
                  className="h-4 w-4 accent-[#7054dc]"
                />
                Umum
              </label>
            </div>
          </div>

          {/* Extended fields — always shown on edit */}
          <div className="mt-6 space-y-6">

            {/* Jenjang + Kelas */}
            {accessType === 'siswa' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Jenjang Sekolah</label>
                  <select
                    className={inputCls}
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="" disabled>Pilih Jenjang</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">Sebutkan kurikulum modul anda</p>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Kelas</label>
                  <select
                    className={inputCls}
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    disabled={!level}
                  >
                    <option value="" disabled>
                      {level ? 'Pilih Tingkatan Kelas' : 'Pilih jenjang terlebih dahulu'}
                    </option>
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">Tingkatan kelas sesuai jenjang</p>
                </div>
              </div>
            )}

            {/* Difficulty + Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[12px] font-semibold text-[#232530]">Level Kesulitan</label>
                <select
                  className={inputCls}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Sulit">Sulit</option>
                </select>
                <p className="mt-1 text-[11px] text-[#7e8290]">Level kesulitan yang sesuai isi modul</p>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#232530]">Durasi Pembelajaran</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    value={targetTime}
                    onChange={(e) => setTargetTime(Number(e.target.value) || 1)}
                    min={1}
                    className="h-[40px] w-[90px] rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors"
                  />
                  <select
                    className="h-[40px] w-[120px] rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors"
                    value={targetTimeUnit}
                    onChange={(e) => setTargetTimeUnit(e.target.value as 'bulan' | 'minggu')}
                  >
                    <option value="bulan">Bulan</option>
                    <option value="minggu">Minggu</option>
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-[#7e8290]">Estimasi waktu belajar siswa</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[12px] font-semibold text-[#232530]">Status Modul</p>
              <div className="mt-3 flex items-center gap-6 text-[12px] text-[#6e7280]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="statusEdit"
                    checked={!isDraft}
                    onChange={() => setIsDraft(false)}
                    className="h-4 w-4 accent-[#7054dc]"
                  />
                  Aktif
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="statusEdit"
                    checked={isDraft}
                    onChange={() => setIsDraft(true)}
                    className="h-4 w-4 accent-[#7054dc]"
                  />
                  Draft
                </label>
              </div>
            </div>

            {/* Harga */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[12px] font-semibold text-[#232530]">Harga Modul (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={modulPrice}
                  onChange={(e) => setModulPrice(e.target.value)}
                  placeholder="0"
                  disabled={!isPaid}
                  className={`${inputCls} disabled:bg-[#f5f5f5] disabled:text-[#adadad]`}
                />
                <p className="mt-1 text-[11px] text-[#7e8290]">Aktifkan opsi berbayar di bawah jika perlu harga.</p>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Berbayar', checked: isPaid, setter: setIsPaid },
                { label: 'Pre / Post Test', checked: pretestPostTestEnabled, setter: setPretestPostTestEnabled },
                { label: 'Sertifikat', checked: hasCertificate, setter: setHasCertificate },
              ].map(({ label, checked, setter }) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3 text-[12px] text-[#232530] hover:border-[#7054dc] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setter(e.target.checked)}
                    className="h-4 w-4 accent-[#7054dc]"
                  />
                  {label}
                </label>
              ))}
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3 text-[12px] text-[#232530] hover:border-[#7054dc] transition-colors">
              <input
                type="checkbox"
                checked={hasStudyGroup}
                onChange={(e) => setHasStudyGroup(e.target.checked)}
                className="h-4 w-4 accent-[#7054dc]"
              />
              Grup Belajar
            </label>

            {/* Submit */}
            <div className="pb-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc] disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function EditModulPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <EditModulContent />
    </Suspense>
  );
}
