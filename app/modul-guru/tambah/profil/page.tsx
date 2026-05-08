'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiBookOpen, FiCheckSquare, FiDollarSign, FiEdit2, FiFileText, FiLayers } from 'react-icons/fi';

import GuruHeader from '../../../component/guru/GuruHeader';

const inputClassName =
  'mt-2 h-[40px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]';

const textareaClassName =
  'mt-2 w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]';

function TambahModulProfilPageContent() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');
  const isFilled = useMemo(() => stateParam === 'filled', [stateParam]);
  const [isExpanded, setIsExpanded] = useState(isFilled);
  const [accessType, setAccessType] = useState<'siswa' | 'umum'>('siswa');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="w-full px-0 py-0">
        <div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden border border-[#e5e3ee] bg-white px-5 py-6 lg:block lg:min-h-[calc(100vh-74px)]">
            <div className="flex h-full flex-col">
              <p className="text-[13px] font-semibold text-[#232530]">Rencanakan Modul anda</p>
              <nav className="mt-4 space-y-3 text-[13px]">
                <div className="flex items-center gap-2 text-[#7054dc]">
                  <FiFileText size={12} />
                  <span className="font-semibold">Profil Modul Anda</span>
                </div>
                <div className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiDollarSign size={12} />
                  Penetapan Harga Modul
                </div>
              </nav>

              <p className="mt-8 text-[13px] font-semibold text-[#232530]">Konten Modul Anda</p>
              <nav className="mt-4 space-y-3 text-[13px] text-[#7a7e8a]">
                <div className="flex items-center gap-2">
                  <FiLayers size={12} />
                  Konten Modul
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckSquare size={12} />
                  Pree - Post Test Modul
                </div>
                <div className="flex items-center gap-2">
                  <FiBookOpen size={12} />
                  Capaian Sertifikat
                </div>
              </nav>

              <button
                type="button"
                className="mt-16 w-full cursor-pointer rounded-full bg-[#bfc1c8] px-4 py-2.5 text-[12px] font-semibold text-white"
              >
                Terbitkan Modul
              </button>
            </div>
          </aside>

          <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
            <div className="flex flex-col items-center">
              <div className="rounded-[26px] border border-[#f0eff6] bg-white p-3 shadow-[0_10px_24px_rgba(20,20,30,0.06)]">
                <div className="relative h-[180px] w-[300px] overflow-hidden rounded-[20px] border border-[#e5e3ee] bg-[#f4f3ff]">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Preview cover modul"
                    width={300}
                    height={180}
                    className="h-full w-full object-contain"
                  />
                ) : isFilled ? (
                  <Image
                    src="/assets/images/beranda-siswa/matapelajaran.png"
                    alt="Cover modul"
                    width={300}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiBookOpen size={34} className="text-[#7054dc]" />
                  </div>
                )}
                <label
                  htmlFor="cover-upload"
                  className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#d9d7df] bg-white text-[#7054dc]"
                  aria-label="Edit cover"
                >
                  <FiEdit2 size={12} />
                </label>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    const nextUrl = URL.createObjectURL(file);
                    setCoverPreview((prev) => {
                      if (prev) {
                        URL.revokeObjectURL(prev);
                      }
                      return nextUrl;
                    });
                  }}
                />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-[12px] font-semibold text-[#232530]">Judul Modul</label>
              <input
                type="text"
                defaultValue={isFilled ? 'Biologi' : ''}
                placeholder=""
                className={inputClassName}
              />
              <p className="mt-1 text-[11px] text-[#7e8290]">
                Judul sebaiknya menarik perhatian, informatif, dan dioptimalkan untuk penelusuran
              </p>

              <label className="mt-4 block text-[12px] font-semibold text-[#232530]">Subtitle kursus</label>
              <input
                type="text"
                defaultValue={isFilled ? 'Biologi, IPA, Tumbuhan, Zat' : ''}
                placeholder=""
                className={inputClassName}
              />
              <p className="mt-1 text-[11px] text-[#7e8290]">
                Gunakan 1 atau 2 kata kunci terkait, dan sebutkan 3-4 area terpenting yang telah Anda bahas sepanjang kursus Anda.
              </p>
            </div>

            <div className="mt-6">
              <label className="text-[12px] font-semibold text-[#232530]">Deskripsi kursus</label>
              <textarea
                rows={4}
                defaultValue={
                  isFilled
                    ? 'Selamat datang di perjalanan eksplorasi bioproses yang akan mengungkap rahasia kehidupan dari skala terkecil hingga sistem organ yang kompleks.'
                    : ''
                }
                placeholder="Masukkan deskripsi kursus ..."
                className={textareaClassName}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
                <span>Deskripsikan kursus anda secara singkat</span>
                <span>{isFilled ? '200/200' : '0/200'}</span>
              </div>
            </div>

            {!isExpanded && (
              <div className="mt-5">
                <p className="text-[12px] font-semibold text-[#232530]">Pilih Akses</p>
                <div className="mt-3 flex items-center gap-6 text-[12px] text-[#6e7280]">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="akses"
                      checked={accessType === 'siswa'}
                      onChange={() => setAccessType('siswa')}
                    />
                    Siswa
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="akses"
                      checked={accessType === 'umum'}
                      onChange={() => setAccessType('umum')}
                    />
                    Umum
                  </label>
                </div>
              </div>
            )}

            {isExpanded && (
              <div className="mt-6 space-y-4">
                {accessType === 'siswa' && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-[12px] font-semibold text-[#232530]">Jenjang Sekolah</label>
                        <select className={inputClassName} defaultValue="">
                          <option value="" disabled>
                            Pilih Jenjang
                          </option>
                          <option>SD</option>
                          <option>SMP</option>
                          <option>SMA</option>
                        </select>
                        <p className="mt-1 text-[11px] text-[#7e8290]">Sebutkan kurikulum modul anda</p>
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#232530]">Kelas</label>
                        <select className={inputClassName} defaultValue="">
                          <option value="" disabled>
                            Pilih Tingkatan Kelas
                          </option>
                          <option>Kelas 4</option>
                          <option>Kelas 5</option>
                          <option>Kelas 6</option>
                          <option>Kelas 10</option>
                          <option>Kelas 11</option>
                          <option>Kelas 12</option>
                        </select>
                        <p className="mt-1 text-[11px] text-[#7e8290]">Berapa lama pengerjaan modul ini bagi siswa</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#232530]">Pesan Yang Akan Dipelajari Siswa</label>
                      <textarea
                        rows={4}
                        placeholder="Masukkan teks ..."
                        className={textareaClassName}
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
                        <span>Point Point yang akan dipelajari siswa di modul anda</span>
                        <span>0/200</span>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Level Kesulitan</label>
                  <select className={inputClassName} defaultValue="Menengah">
                    <option>Menengah</option>
                    <option>Mudah</option>
                    <option>Sulit</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[#7e8290]">Level kesulitan yang sesuai dengan isi modul</p>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Durasi Pembelajaran</label>
                  <div className="mt-2 flex gap-2">
                    <input type="number" defaultValue={1} className={`${inputClassName} mt-0 w-[90px]`} />
                    <select className={`${inputClassName} mt-0 w-[120px]`}>
                      <option>Bulan</option>
                      <option>Minggu</option>
                    </select>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7e8290]">
                    Durasi pembelajaran modul yang diakses siswa merupakan materi selama beberapa waktu
                  </p>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Pre-Test dan Post-Test</label>
                  <div className="mt-2 flex items-center gap-6 text-[12px] text-[#6e7280]">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="prepost" defaultChecked />
                      Aktif
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="prepost" />
                      Tidak Aktif
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Capaian Sertifikat</label>
                  <div className="mt-2 flex items-center gap-6 text-[12px] text-[#6e7280]">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="sertifikat" defaultChecked />
                      Aktif
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="sertifikat" />
                      Tidak Aktif
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-[#232530]">Sertakan Link Grup Kelompok Belajar</label>
                  <div className="mt-2 flex items-center gap-6 text-[12px] text-[#6e7280]">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="grup" defaultChecked />
                      Ya
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="grup" />
                      Tidak
                    </label>
                  </div>
                  <input
                    type="text"
                    defaultValue="https://"
                    className={inputClassName}
                  />
                  <p className="mt-1 text-[11px] text-[#7e8290]">
                    Masukkan link grup kelompok belajar seperti WhatsApp, Telegram, atau yang lain.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pb-6">
              {isExpanded ? (
                <Link
                  href="/modul-guru/tambah/harga"
                  className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white"
                >
                  Selanjutnya
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white"
                >
                  Selanjutnya
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function TambahModulProfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <TambahModulProfilPageContent />
    </Suspense>
  );
}
