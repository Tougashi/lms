'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MdKeyboardArrowDown, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

export default function DaftarPage() {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [akses, setAkses] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [tingkatKelas, setTingkatKelas] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isJenjangOpen, setIsJenjangOpen] = useState(false);
  const [isKelasOpen, setIsKelasOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const jenjangDropdownRef = useRef<HTMLDivElement>(null);
  const kelasDropdownRef = useRef<HTMLDivElement>(null);

  const jenjangOptions = [
    { value: 'sd', label: 'SD' },
    { value: 'smp', label: 'SMP' },
    { value: 'sma', label: 'SMA/SMK' },
  ];

  const kelasOptions = ['1', '2', '3'];

  const selectedJenjangLabel = jenjangOptions.find((item) => item.value === jenjang)?.label || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (jenjangDropdownRef.current && !jenjangDropdownRef.current.contains(target)) {
        setIsJenjangOpen(false);
      }

      if (kelasDropdownRef.current && !kelasDropdownRef.current.contains(target)) {
        setIsKelasOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate signup request
    setTimeout(() => {
      if (!namaLengkap || !email || !akses) {
        setError('Semua field harus diisi');
      } else if (akses === 'siswa' && (!jenjang || !tingkatKelas)) {
        setError('Jenjang dan tingkat kelas harus diisi');
      } else if ((akses === 'siswa' || akses === 'umum') && (!password || !confirmPassword)) {
        setError('Password dan konfirmasi password harus diisi');
      } else if ((akses === 'siswa' || akses === 'umum') && password !== confirmPassword) {
        setError('Konfirmasi password tidak sama');
      } else {
        // Here you would typically send data to your backend
        console.log('Signup attempt:', {
          namaLengkap,
          email,
          akses,
          jenjang,
          tingkatKelas,
          password,
          confirmPassword,
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#f7f6ff] to-white flex items-start sm:items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#21212b] mb-2">
              Daftar
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Nama Lengkap Field */}
            <div>
              <label htmlFor="namaLengkap" className="block text-sm font-medium text-[#21212b] mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="namaLengkap"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Masukkan Nama Lengkap"
                className="w-full px-4 py-3 border border-[#e0dfe6] rounded-lg focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10 transition-colors"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#21212b] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="olivia@untitledsui.com"
                className="w-full px-4 py-3 border border-[#e0dfe6] rounded-lg focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10 transition-colors"
              />
            </div>

            {/* Pilih Akses Field */}
            <div>
              <label className="block text-sm font-medium text-[#21212b] mb-3">
                Pilih Akses
              </label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="akses"
                    value="siswa"
                    checked={akses === 'siswa'}
                    onChange={(e) => {
                      setAkses(e.target.value);
                      setError('');
                    }}
                    className="w-5 h-5 text-[#7054dc] border-[#e0dfe6] focus:ring-[#7054dc]"
                  />
                  <span className="text-sm text-[#21212b]">Siswa</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="akses"
                    value="umum"
                    checked={akses === 'umum'}
                    onChange={(e) => {
                      setAkses(e.target.value);
                      setIsJenjangOpen(false);
                      setIsKelasOpen(false);
                      setError('');
                    }}
                    className="w-5 h-5 text-[#7054dc] border-[#e0dfe6] focus:ring-[#7054dc]"
                  />
                  <span className="text-sm text-[#21212b]">Umum</span>
                </label>
              </div>
            </div>

            {akses === 'siswa' && (
              <>
                <div>
                  <label htmlFor="jenjang" className="block text-sm font-medium text-[#21212b] mb-2">
                    Jenjang
                  </label>
                  <div className="relative" ref={jenjangDropdownRef}>
                    <button
                      type="button"
                      id="jenjang"
                      onClick={() => {
                        setIsJenjangOpen((prev) => !prev);
                        setIsKelasOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-[#e0dfe6] bg-white px-4 py-3 text-left text-sm focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10 transition-colors"
                    >
                      <span className={selectedJenjangLabel ? 'text-[#21212b]' : 'text-[#8a8a96]'}>
                        {selectedJenjangLabel || 'Pilih Jenjang'}
                      </span>
                      <MdKeyboardArrowDown
                        size={20}
                        className={`mr-0.5 text-[#8a8a96] transition-transform ${isJenjangOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isJenjangOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#e0dfe6] bg-white shadow-[0_14px_34px_rgba(33,33,43,0.12)]">
                        {jenjangOptions.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setJenjang(item.value);
                              setTingkatKelas('');
                              setIsJenjangOpen(false);
                            }}
                            className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${jenjang === item.value ? 'bg-[#f1ecff] text-[#7054dc] font-medium' : 'text-[#21212b] hover:bg-[#f7f6ff]'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="tingkatKelas" className="block text-sm font-medium text-[#21212b] mb-2">
                    Tingkat Kelas
                  </label>
                  <div className="relative" ref={kelasDropdownRef}>
                    <button
                      type="button"
                      id="tingkatKelas"
                      disabled={!jenjang}
                      onClick={() => {
                        if (!jenjang) return;
                        setIsKelasOpen((prev) => !prev);
                        setIsJenjangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10 transition-colors ${jenjang ? 'border-[#e0dfe6] bg-white' : 'border-[#eceaf4] bg-[#f8f7fc] cursor-not-allowed'}`}
                    >
                      <span className={tingkatKelas ? 'text-[#21212b]' : 'text-[#8a8a96]'}>
                        {tingkatKelas ? `Kelas ${tingkatKelas}` : 'Pilih Kelas'}
                      </span>
                      <MdKeyboardArrowDown
                        size={20}
                        className={`mr-0.5 text-[#8a8a96] transition-transform ${isKelasOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isKelasOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#e0dfe6] bg-white shadow-[0_14px_34px_rgba(33,33,43,0.12)]">
                        {kelasOptions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setTingkatKelas(item);
                              setIsKelasOpen(false);
                            }}
                            className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${tingkatKelas === item ? 'bg-[#f1ecff] text-[#7054dc] font-medium' : 'text-[#21212b] hover:bg-[#f7f6ff]'}`}
                          >
                            Kelas {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {(akses === 'siswa' || akses === 'umum') && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#21212b] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-[#e0dfe6] rounded-lg focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a96] hover:text-[#7054dc] transition-colors"
                    >
                      {showPassword ? (
                        <MdOutlineVisibilityOff size={20} />
                      ) : (
                        <MdOutlineVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#21212b] mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-[#e0dfe6] rounded-lg focus:outline-none focus:border-[#7054dc] focus:ring-2 focus:ring-[#7054dc]/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a96] hover:text-[#7054dc] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <MdOutlineVisibilityOff size={20} />
                      ) : (
                        <MdOutlineVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Daftar Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7054dc] hover:bg-[#5d42b0] disabled:bg-[#9b88d6] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-[#8a8a96] text-sm mt-6">
            Sudah mempunyai akun? <Link href="/login" className="text-[#7054dc] hover:text-[#5d42b0] font-medium transition-colors">Login</Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[#8a8a96] text-xs mt-6">
          © 2026 LMS Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
