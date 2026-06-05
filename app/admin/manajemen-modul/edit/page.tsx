'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { AdminToastContainer, useAdminToast } from '../../components/AdminToast';
import { adminModulApi, adminTutorApi, uploadApi } from '../../../lib/api';
import type { AdminTutorItem } from '../../../lib/types/admin';

const inputCls =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors';
const selectCls =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] appearance-none transition-colors';
const textareaCls =
  'mt-2 w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] resize-none transition-colors';
const labelCls = 'text-[13px] font-bold text-[#232530]';
const hintCls = 'mt-1 text-[11px] text-[#7e8290]';

type ModuleFormState = {
  moduleName: string;
  subtitle: string;
  description: string;
  targetTime: string;
  difficulty: string;
  isPaid: boolean;
  modulPrice: string;
  level: string;
  moduleClass: string;
  accessType: 'siswa' | 'umum';
  isDraft: boolean;
  tutorId: string;
  pretestPostTestEnabled: boolean;
  hasStudyGroup: boolean;
  hasCertificate: boolean;
};

const initialFormState: ModuleFormState = {
  moduleName: '',
  subtitle: '',
  description: '',
  targetTime: '',
  difficulty: '',
  isPaid: false,
  modulPrice: '',
  level: '',
  moduleClass: '',
  accessType: 'siswa',
  isDraft: true,
  tutorId: '',
  pretestPostTestEnabled: true,
  hasStudyGroup: false,
  hasCertificate: false,
};

function normalizeStoredImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return `/api-backend/storage/${url.replace(/^\/+/, '')}`;
}

export default function EditModulPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <EditModulContent />
    </Suspense>
  );
}

function EditModulContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const { toasts, showToast, dismissToast } = useAdminToast();

  const [form, setForm] = useState<ModuleFormState>(initialFormState);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tutorList, setTutorList] = useState<AdminTutorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const coverObjectUrlRef = useRef<string | null>(null);

  const setField = <K extends keyof ModuleFormState>(key: K, value: ModuleFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchData = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    try {
      const [modulData, tutorData] = await Promise.allSettled([
        adminModulApi.getById(id),
        adminTutorApi.getAll(),
      ]);

      if (tutorData.status === 'fulfilled') {
        setTutorList(tutorData.value);
      }

      if (modulData.status === 'fulfilled') {
        const modul = modulData.value;
        setForm({
          moduleName: modul.moduleName ?? '',
          subtitle: modul.subtitle ?? '',
          description: modul.description ?? '',
          targetTime: modul.targetTime ? String(modul.targetTime) : '',
          difficulty: modul.difficulty ?? '',
          isPaid: Boolean(modul.isPaid),
          modulPrice: modul.modulPrice !== undefined && modul.modulPrice !== null ? String(modul.modulPrice) : '',
          level: modul.level ?? '',
          moduleClass: modul.class ?? '',
          accessType: (modul.modulType ?? modul.type ?? 'SISWA') === 'UMUM' ? 'umum' : 'siswa',
          isDraft: modul.isDraft ?? true,
          tutorId: modul.tutorId ?? '',
          pretestPostTestEnabled: modul.pretestPostTestEnabled ?? true,
          hasStudyGroup: modul.hasStudyGroup ?? false,
          hasCertificate: modul.hasCertificate ?? false,
        });
        setCoverPreview(normalizeStoredImageUrl(modul.moduleImgUrl));
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    };
  }, []);

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = null;
    }
    if (!file) {
      setCoverPreview('');
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    coverObjectUrlRef.current = nextUrl;
    setCoverPreview(nextUrl);
  };

  const handleToggleDraft = () => {
    setField('isDraft', !form.isDraft);
  };

  const handleSimpan = async () => {
    if (!form.moduleName.trim()) {
      setSaveError('Judul modul wajib diisi.');
      return;
    }
    if (!form.subtitle.trim()) {
      setSaveError('Subtitle modul wajib diisi.');
      return;
    }
    if (!form.description.trim()) {
      setSaveError('Deskripsi modul wajib diisi.');
      return;
    }
    if (!form.targetTime.trim() || !Number.isFinite(Number(form.targetTime))) {
      setSaveError('Durasi pembelajaran wajib diisi dengan angka.');
      return;
    }
    if (!form.difficulty.trim()) {
      setSaveError('Level kesulitan wajib dipilih.');
      return;
    }
    if (!form.tutorId.trim()) {
      setSaveError('Guru modul wajib dipilih.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      let moduleImgUrl = coverPreview;
      if (coverFile) {
        const uploadResult = await uploadApi.upload(coverFile);
        moduleImgUrl = normalizeStoredImageUrl(uploadResult.url);
      }

      await adminModulApi.update(id, {
        moduleName: form.moduleName.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        targetTime: Number(form.targetTime),
        difficulty: form.difficulty,
        isPaid: form.isPaid,
        modulPrice: form.isPaid ? Number(form.modulPrice || 0) : 0,
        level: form.level || null,
        class: form.moduleClass || null,
        modulType: form.accessType === 'siswa' ? 'SISWA' : 'UMUM',
        isDraft: form.isDraft,
        tutorId: form.tutorId,
        moduleImgUrl: moduleImgUrl || null,
        pretestPostTestEnabled: form.pretestPostTestEnabled,
        hasStudyGroup: form.hasStudyGroup,
        hasCertificate: form.hasCertificate,
      });

      showToast('success', 'Modul berhasil diperbarui.');
      setTimeout(() => router.push('/admin/manajemen-modul'), 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui modul.';
      setSaveError(msg);
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const primaryLabel = isSaving ? 'Menyimpan...' : 'Simpan Perubahan';

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="w-full">
        <div className="grid w-full lg:grid-cols-[240px_1fr]">
          <AdminModuleSidebar
            title="Edit Modul"
            backHref="/admin/manajemen-modul"
            backLabel="Manajemen Modul"
            primaryLabel={primaryLabel}
            onPrimaryAction={handleSimpan}
            secondaryLabel={form.isDraft ? 'Aktifkan Modul' : 'Arsipkan Modul'}
            onSecondaryAction={handleToggleDraft}
          />

          <section className="px-4 pb-10 pt-6 sm:px-8 lg:px-10">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center text-sm text-[#9396a3]">
                Memuat data modul...
              </div>
            ) : notFound ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <p className="text-sm text-[#f36e65]">Modul tidak ditemukan.</p>
                <Link
                  href="/admin/manajemen-modul"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#5f46cc]"
                >
                  <FiArrowLeft size={14} />
                  Kembali
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <div className="rounded-[22px] border border-[#f0eff6] bg-white p-3 shadow-[0_8px_20px_rgba(20,20,30,0.06)]">
                    <div className="relative h-[160px] w-[280px] overflow-hidden rounded-[18px] border border-[#e5e3ee] bg-[#f4f3ff] sm:h-[180px] sm:w-[320px]">
                      {coverPreview ? (
                        <Image src={coverPreview} alt="Preview cover modul" fill unoptimized className="object-cover" />
                      ) : (
                        <Image src="/assets/images/beranda-siswa/matapelajaran.png" alt="Cover modul" fill unoptimized className="object-cover" />
                      )}
                      <label
                        htmlFor="admin-edit-cover-upload"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#d9d7df] bg-white text-[#7054dc] shadow-sm transition-colors hover:bg-[#f5f2ff]"
                        aria-label="Edit cover"
                      >
                        <FiEdit2 size={13} />
                      </label>
                      <input
                        id="admin-edit-cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-8 max-w-[760px]">
                  {saveError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                      {saveError}
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Judul Modul</label>
                    <input
                      type="text"
                      value={form.moduleName}
                      onChange={(e) => setField('moduleName', e.target.value)}
                      placeholder="Masukkan judul modul"
                      className={inputCls}
                    />
                    <p className={hintCls}>Judul sebaiknya menarik perhatian, informatif, dan dioptimalkan untuk penelusuran</p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Subtitle Modul</label>
                      <input
                        type="text"
                        value={form.subtitle}
                        onChange={(e) => setField('subtitle', e.target.value)}
                        placeholder="Masukkan subtitle"
                        className={inputCls}
                      />
                      <p className={hintCls}>Gunakan kata kunci singkat yang mewakili isi modul.</p>
                    </div>
                    <div>
                      <label className={labelCls}>Guru Modul</label>
                      <select
                        className={selectCls}
                        value={form.tutorId}
                        onChange={(e) => setField('tutorId', e.target.value)}
                      >
                        <option value="">Pilih Guru</option>
                        {tutorList.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName}
                          </option>
                        ))}
                      </select>
                      <p className={hintCls}>Pilih Guru untuk Modul ini</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className={labelCls}>Deskripsi Modul</label>
                    <textarea
                      rows={5}
                      value={form.description}
                      placeholder="Masukkan deskripsi modul ..."
                      className={textareaCls}
                      maxLength={500}
                      onChange={(e) => setField('description', e.target.value)}
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
                      <span>Deskripsikan modul anda secara singkat</span>
                      <span>{form.description.length}/500</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Tipe Akses</label>
                      <div className="mt-3 flex items-center gap-6 text-[13px] text-[#6e7280]">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="aksesEdit"
                            checked={form.accessType === 'siswa'}
                            onChange={() => setField('accessType', 'siswa')}
                            className="h-4 w-4 accent-[#7054dc]"
                          />
                          Siswa
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="aksesEdit"
                            checked={form.accessType === 'umum'}
                            onChange={() => setField('accessType', 'umum')}
                            className="h-4 w-4 accent-[#7054dc]"
                          />
                          Umum
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Status Modul</label>
                      <div className="mt-3 flex items-center gap-6 text-[13px] text-[#6e7280]">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="statusEdit"
                            checked={!form.isDraft}
                            onChange={() => setField('isDraft', false)}
                            className="h-4 w-4 accent-[#7054dc]"
                          />
                          Aktif
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="statusEdit"
                            checked={form.isDraft}
                            onChange={() => setField('isDraft', true)}
                            className="h-4 w-4 accent-[#7054dc]"
                          />
                          Draft
                        </label>
                      </div>
                    </div>
                  </div>

                  {form.accessType === 'siswa' && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Jenjang Sekolah</label>
                        <select
                          className={selectCls}
                          value={form.level}
                          onChange={(e) => setField('level', e.target.value)}
                        >
                          <option value="">Pilih Jenjang</option>
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                        </select>
                        <p className={hintCls}>Sebutkan kurikulum modul anda</p>
                      </div>
                      <div>
                        <label className={labelCls}>Kelas</label>
                        <select
                          className={selectCls}
                          value={form.moduleClass}
                          onChange={(e) => setField('moduleClass', e.target.value)}
                        >
                          <option value="">Pilih Tingkatan Kelas</option>
                          <option value="Kelas 4">Kelas 4</option>
                          <option value="Kelas 5">Kelas 5</option>
                          <option value="Kelas 6">Kelas 6</option>
                          <option value="Kelas 10">Kelas 10</option>
                          <option value="Kelas 11">Kelas 11</option>
                          <option value="Kelas 12">Kelas 12</option>
                        </select>
                        <p className={hintCls}>Sesuaikan dengan target siswa</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Level Kesulitan</label>
                      <select
                        className={selectCls}
                        value={form.difficulty}
                        onChange={(e) => setField('difficulty', e.target.value)}
                      >
                        <option value="">Pilih level kesulitan</option>
                        <option value="Mudah">Mudah</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Sulit">Sulit</option>
                      </select>
                      <p className={hintCls}>Level kesulitan yang sesuai dengan isi modul</p>
                    </div>
                    <div>
                      <label className={labelCls}>Durasi Pembelajaran</label>
                      <input
                        type="number"
                        min="1"
                        value={form.targetTime}
                        onChange={(e) => setField('targetTime', e.target.value)}
                        placeholder="Masukkan durasi pembelajaran"
                        className={inputCls}
                      />
                      <p className={hintCls}>Durasi pembelajaran dalam menit.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Harga Modul</label>
                      <input
                        type="number"
                        min="0"
                        value={form.modulPrice}
                        onChange={(e) => setField('modulPrice', e.target.value)}
                        placeholder="Masukkan harga modul"
                        className={inputCls}
                        disabled={!form.isPaid}
                      />
                      <p className={hintCls}>Aktifkan jika modul ini berbayar.</p>
                    </div>
                    <div>
                      <label className={labelCls}>Tipe Modul</label>
                      <select
                        className={selectCls}
                        value={form.accessType}
                        onChange={(e) => setField('accessType', e.target.value as 'siswa' | 'umum')}
                      >
                        <option value="siswa">Siswa</option>
                        <option value="umum">Umum</option>
                      </select>
                      <p className={hintCls}>Pilih target akses modul.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3 text-[13px] text-[#232530]">
                      <input
                        type="checkbox"
                        checked={form.isPaid}
                        onChange={(e) => setField('isPaid', e.target.checked)}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Berbayar
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3 text-[13px] text-[#232530]">
                      <input
                        type="checkbox"
                        checked={form.pretestPostTestEnabled}
                        onChange={(e) => setField('pretestPostTestEnabled', e.target.checked)}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Pre/Post Test
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3 text-[13px] text-[#232530]">
                      <input
                        type="checkbox"
                        checked={form.hasCertificate}
                        onChange={(e) => setField('hasCertificate', e.target.checked)}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Sertifikat
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3 text-[13px] text-[#232530]">
                      <input
                        type="checkbox"
                        checked={form.hasStudyGroup}
                        onChange={(e) => setField('hasStudyGroup', e.target.checked)}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Grup Belajar
                    </label>
                  </div>

                  <div className="mt-8 flex items-center justify-end gap-3">
                    <Link
                      href="/admin/manajemen-modul"
                      className="rounded-xl border border-[#d8d3f0] px-6 py-2.5 text-[13px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
                    >
                      Batal
                    </Link>
                    <button
                      type="button"
                      onClick={handleSimpan}
                      disabled={isSaving}
                      className="h-[44px] w-[200px] rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc] disabled:opacity-60"
                    >
                      {primaryLabel}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
