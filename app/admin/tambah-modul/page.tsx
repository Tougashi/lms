'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2 } from 'react-icons/fi';
import AdminHeader from '../../component/admin/AdminHeader';
import AdminModuleSidebar from '../components/AdminModuleSidebar';
import { AdminToastContainer, useAdminToast } from '../components/AdminToast';
import { adminModulApi, adminTutorApi, uploadApi } from '../../lib/api';
import type { AdminTutorItem } from '../../lib/types/admin';

const inputClassName =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] transition-colors';

const selectClassName =
  'mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] appearance-none transition-colors';

const textareaClassName =
  'mt-2 w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc] resize-none transition-colors';

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

export default function TambahModulAdminPage() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useAdminToast();
  const [form, setForm] = useState<ModuleFormState>(initialFormState);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tutorList, setTutorList] = useState<AdminTutorItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const coverObjectUrlRef = useRef<string | null>(null);

  const setField = <K extends keyof ModuleFormState>(key: K, value: ModuleFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchTutors = useCallback(async () => {
    try {
      const data = await adminTutorApi.getAll();
      setTutorList(data);
    } catch {
      setTutorList([]);
    }
  }, []);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

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

      await adminModulApi.create({
        moduleName: form.moduleName.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        targetTime: Number(form.targetTime),
        difficulty: form.difficulty,
        isPaid: form.isPaid,
        modulPrice: form.isPaid ? Number(form.modulPrice || 0) : 0,
        level: form.level || null,
        class: form.moduleClass || null,
        type: form.accessType === 'siswa' ? 'SISWA' : 'UMUM',
        modulType: form.accessType === 'siswa' ? 'SISWA' : 'UMUM',
        isDraft: form.isDraft,
        tutorId: form.tutorId,
        moduleImgUrl: moduleImgUrl || null,
        pretestPostTestEnabled: form.pretestPostTestEnabled,
        hasStudyGroup: form.hasStudyGroup,
        hasCertificate: form.hasCertificate,
      });

      showToast('success', 'Modul berhasil disimpan.');
      router.push('/admin/manajemen-modul');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan modul.';
      setSaveError(msg);
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const primaryLabel = isSaving ? 'Menyimpan...' : form.isDraft ? 'Simpan Draft' : 'Simpan Modul';

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />

      <main className="w-full">
        <div className="grid w-full lg:grid-cols-[240px_1fr]">
          <AdminModuleSidebar
            title="Tambah Modul"
            activeSection="profil"
            primaryLabel={primaryLabel}
            onPrimaryAction={handleSimpan}
            isPrimaryLoading={isSaving}
            secondaryLabel={form.isDraft ? 'Aktifkan Modul' : 'Jadikan Draft'}
            onSecondaryAction={handleToggleDraft}
          />

          <section className="px-4 pb-10 pt-6 sm:px-8 lg:px-10">
            <div className="flex flex-col items-center">
              <div className="rounded-[22px] border border-[#f0eff6] bg-white p-3 shadow-[0_8px_20px_rgba(20,20,30,0.06)]">
                <div className="relative h-[160px] w-[280px] overflow-hidden rounded-[18px] border border-[#e5e3ee] bg-[#f4f3ff] sm:h-[180px] sm:w-[320px]">
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Preview cover modul" fill unoptimized className="object-cover" />
                  ) : (
                    <Image src="/assets/images/beranda-siswa/matapelajaran.png" alt="Cover modul" fill unoptimized className="object-cover" />
                  )}
                  <label
                    htmlFor="admin-cover-upload"
                    className="absolute right-2 top-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[#d9d7df] bg-white text-[#7054dc] shadow-sm transition-colors hover:bg-[#f5f2ff]"
                    aria-label="Edit cover"
                  >
                    <FiEdit2 size={13} />
                  </label>
                  <input
                    id="admin-cover-upload"
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
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {saveError}
                </div>
              )}

              <div>
                <label className="text-[13px] font-bold text-[#232530]">Judul Modul</label>
                <input
                  type="text"
                  value={form.moduleName}
                  onChange={(e) => setField('moduleName', e.target.value)}
                  placeholder="Masukkan judul modul"
                  className={inputClassName}
                />
                <p className="mt-1 text-[11px] text-[#7e8290]">Judul sebaiknya menarik perhatian, informatif, dan dioptimalkan untuk penelusuran</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Subtitle Modul</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setField('subtitle', e.target.value)}
                    placeholder="Masukkan subtitle"
                    className={inputClassName}
                  />
                  <p className="mt-1 text-[11px] text-[#7e8290]">Gunakan kata kunci singkat yang mewakili isi modul.</p>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Guru Modul</label>
                  <select
                    className={selectClassName}
                    value={form.tutorId}
                    onChange={(e) => setField('tutorId', e.target.value)}
                  >
                    <option value="">Pilih Guru</option>
                    {tutorList.map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">Pilih Guru untuk modul ini.</p>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-[13px] font-bold text-[#232530]">Deskripsi Modul</label>
                <textarea
                  rows={5}
                  value={form.description}
                  placeholder="Masukkan deskripsi modul ..."
                  className={textareaClassName}
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
                  <label className="text-[13px] font-bold text-[#232530]">Tipe Akses</label>
                  <div className="mt-3 flex items-center gap-6 text-[13px] text-[#6e7280]">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="accessType"
                        checked={form.accessType === 'siswa'}
                        onChange={() => setField('accessType', 'siswa')}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Siswa
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="accessType"
                        checked={form.accessType === 'umum'}
                        onChange={() => setField('accessType', 'umum')}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Umum
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Status Modul</label>
                  <div className="mt-3 flex items-center gap-6 text-[13px] text-[#6e7280]">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="draftStatus"
                        checked={!form.isDraft}
                        onChange={() => setField('isDraft', false)}
                        className="h-4 w-4 accent-[#7054dc]"
                      />
                      Aktif
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="draftStatus"
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
                    <label className="text-[13px] font-bold text-[#232530]">Jenjang Sekolah</label>
                    <select
                      className={selectClassName}
                      value={form.level}
                      onChange={(e) => setField('level', e.target.value)}
                    >
                      <option value="">Pilih Jenjang</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                    </select>
                    <p className="mt-1 text-[11px] text-[#7e8290]">Sebutkan kurikulum modul anda.</p>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-[#232530]">Kelas</label>
                    <select
                      className={selectClassName}
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
                    <p className="mt-1 text-[11px] text-[#7e8290]">Sesuaikan dengan target siswa.</p>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Level Kesulitan</label>
                  <select
                    className={selectClassName}
                    value={form.difficulty}
                    onChange={(e) => setField('difficulty', e.target.value)}
                  >
                    <option value="">Pilih level kesulitan</option>
                    <option value="Mudah">Mudah</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">Level kesulitan yang sesuai dengan isi modul.</p>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Durasi Pembelajaran</label>
                  <input
                    type="number"
                    min="1"
                    value={form.targetTime}
                    onChange={(e) => setField('targetTime', e.target.value)}
                    placeholder="Masukkan durasi pembelajaran"
                    className={inputClassName}
                  />
                  <p className="mt-1 text-[11px] text-[#7e8290]">Durasi pembelajaran dalam menit.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Harga Modul</label>
                  <input
                    type="number"
                    min="0"
                    value={form.modulPrice}
                    onChange={(e) => setField('modulPrice', e.target.value)}
                    placeholder="Masukkan harga modul"
                    className={inputClassName}
                    disabled={!form.isPaid}
                  />
                  <p className="mt-1 text-[11px] text-[#7e8290]">Aktifkan jika modul ini berbayar.</p>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#232530]">Tipe Modul</label>
                  <select
                    className={selectClassName}
                    value={form.accessType}
                    onChange={(e) => setField('accessType', e.target.value as 'siswa' | 'umum')}
                  >
                    <option value="siswa">Siswa</option>
                    <option value="umum">Umum</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">Pilih target akses modul.</p>
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
          </section>
        </div>
      </main>
    </div>
  );
}
