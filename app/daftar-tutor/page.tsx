'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import {
  MdKeyboardArrowDown,
  MdOutlineAttachFile,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from 'react-icons/md';

export default function DaftarTutorPage() {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tingkatPendidikan, setTingkatPendidikan] = useState('');
  const [namaUniversitas, setNamaUniversitas] = useState('');
  const [programStudi, setProgramStudi] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [cvFileName, setCvFileName] = useState('');
  const [isPendidikanOpen, setIsPendidikanOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pendidikanDropdownRef = useRef<HTMLDivElement>(null);

  const pendidikanOptions = [
    { value: 'd3', label: 'D3' },
    { value: 's1', label: 'S1' },
    { value: 's2', label: 'S2' },
    { value: 's3', label: 'S3' },
  ];

  const selectedPendidikanLabel =
    pendidikanOptions.find((item) => item.value === tingkatPendidikan)?.label || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (pendidikanDropdownRef.current && !pendidikanDropdownRef.current.contains(target)) {
        setIsPendidikanOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError('Ukuran file CV maksimal 10MB');
      return;
    }

    setError('');
    setCvFileName(file.name);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (
        !namaLengkap ||
        !jenisKelamin ||
        !tanggalLahir ||
        !pekerjaan ||
        !email ||
        !whatsapp ||
        !tingkatPendidikan ||
        !namaUniversitas ||
        !programStudi ||
        !password ||
        !konfirmasiPassword
      ) {
        setError('Semua field wajib diisi kecuali CV');
      } else if (password !== konfirmasiPassword) {
        setError('Konfirmasi password tidak sama');
      } else {
        console.log('Daftar tutor:', {
          namaLengkap,
          jenisKelamin,
          tanggalLahir,
          pekerjaan,
          email,
          whatsapp,
          tingkatPendidikan,
          namaUniversitas,
          programStudi,
          cvFileName,
        });
      }

      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#f7f6ff] to-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[560px]">
        <h1 className="mb-6 text-center text-3xl font-bold text-[#21212b]">Daftar Tutor</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-[#eceaf4] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-[#21212b]">Data Diri</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="nama-lengkap">
                  Nama Lengkap
                </label>
                <input
                  id="nama-lengkap"
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
                <p className="mt-1 text-[10px] text-[#8a8a96]">
                  Tulis nama lengkap sesuai dokumen Kartu Tanda Penduduk (KTP)
                </p>
              </div>

              <div>
                <p className="mb-1.5 block text-xs font-medium text-[#21212b]">Jenis Kelamin</p>
                <div className="flex items-center gap-6">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#21212b]">
                    <input
                      type="radio"
                      name="jenis-kelamin"
                      value="laki-laki"
                      checked={jenisKelamin === 'laki-laki'}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      className="h-4 w-4 border-[#d6d3e3] text-[#7054dc] focus:ring-[#7054dc]"
                    />
                    Laki-laki
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#21212b]">
                    <input
                      type="radio"
                      name="jenis-kelamin"
                      value="perempuan"
                      checked={jenisKelamin === 'perempuan'}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      className="h-4 w-4 border-[#d6d3e3] text-[#7054dc] focus:ring-[#7054dc]"
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="tanggal-lahir">
                  Tanggal Lahir
                </label>
                <input
                  id="tanggal-lahir"
                  type="text"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full max-w-[180px] rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="pekerjaan">
                  Pekerjaan
                </label>
                <input
                  id="pekerjaan"
                  type="text"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  placeholder="Masukkan pekerjaan Anda saat ini"
                  className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eceaf4] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-[#21212b]">Kontak</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="olivia@untitledui.com"
                  className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="whatsapp">
                  Nomor WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+62   812345678"
                  className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
                <p className="mt-1 text-[10px] text-[#8a8a96]">Pastikan nomor terdaftar di WhatsApp</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eceaf4] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-[#21212b]">Pendidikan Terakhir</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="tingkat-pendidikan">
                  Tingkat Pendidikan
                </label>
                <div className="relative" ref={pendidikanDropdownRef}>
                  <button
                    type="button"
                    id="tingkat-pendidikan"
                    onClick={() => setIsPendidikanOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#e0dfe6] bg-white px-3 py-2 text-left text-sm focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/15 transition-colors"
                  >
                    <span className={selectedPendidikanLabel ? 'text-[#21212b]' : 'text-[#8a8a96]'}>
                      {selectedPendidikanLabel || 'Pilih Tingkat Pendidikan'}
                    </span>
                    <MdKeyboardArrowDown
                      size={20}
                      className={`text-[#8a8a96] transition-transform ${isPendidikanOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isPendidikanOpen && (
                    <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#e0dfe6] bg-white shadow-[0_14px_34px_rgba(33,33,43,0.12)]">
                      {pendidikanOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setTingkatPendidikan(item.value);
                            setIsPendidikanOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors ${tingkatPendidikan === item.value ? 'bg-[#f1ecff] text-[#7054dc] font-medium' : 'text-[#21212b] hover:bg-[#f7f6ff]'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="universitas">
                  Nama Universitas
                </label>
                <input
                  id="universitas"
                  type="text"
                  value={namaUniversitas}
                  onChange={(e) => setNamaUniversitas(e.target.value)}
                  placeholder="Masukkan Nama Universitas"
                  className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="program-studi">
                  Program Studi
                </label>
                <input
                  id="program-studi"
                  type="text"
                  value={programStudi}
                  onChange={(e) => setProgramStudi(e.target.value)}
                  placeholder="Masukkan Program Studi"
                  className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eceaf4] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-[#21212b]">Password</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 pr-10 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a96]"
                  >
                    {showPassword ? <MdOutlineVisibilityOff size={18} /> : <MdOutlineVisibility size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="konfirmasi-password">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    id="konfirmasi-password"
                    type={showKonfirmasiPassword ? 'text' : 'password'}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#e0dfe6] px-3 py-2 pr-10 text-sm text-[#21212b] placeholder:text-[#8a8a96] focus:outline-none focus:ring-2 focus:ring-[#7054dc]/15 focus:border-[#7054dc]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKonfirmasiPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a96]"
                  >
                    {showKonfirmasiPassword ? (
                      <MdOutlineVisibilityOff size={18} />
                    ) : (
                      <MdOutlineVisibility size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eceaf4] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-[#21212b]">Unggah CV (Opsional)</h2>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#21212b]" htmlFor="unggah-cv">
                Curriculum Vitae
              </label>
              <div className="relative">
                <input
                  id="unggah-cv"
                  type="file"
                  accept=".pdf"
                  onChange={handleCvChange}
                  className="hidden"
                />
                <label
                  htmlFor="unggah-cv"
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#e0dfe6] px-3 py-2 text-sm text-[#8a8a96] transition-colors hover:border-[#7054dc]/50"
                >
                  <span>{cvFileName || 'Unggah dalam format .pdf. Maksimum 10MB'}</span>
                  <MdOutlineAttachFile size={18} />
                </label>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full rounded-lg bg-[#7054dc] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5d42b0] disabled:bg-[#9b88d6]"
          >
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
}
