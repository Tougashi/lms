'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { authApi } from '../lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f6ff] to-white flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#21212b] mb-4">
              Link Tidak Valid
            </h1>
            <p className="text-sm text-[#8a8a96] mb-6">
              Token reset password tidak ditemukan. Silakan minta link reset baru.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block bg-[#7054dc] hover:bg-[#5d42b0] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Minta Link Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Password baru wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword(token, password);
      setSuccess(res.message || 'Password berhasil direset. Silakan login.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal mereset password. Token mungkin kadaluarsa.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f6ff] to-white flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#21212b] mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-[#8a8a96] mt-2">
              Masukkan password baru Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
                <div className="mt-3">
                  <Link
                    href="/login"
                    className="text-green-700 font-medium underline hover:text-green-800"
                  >
                    Login sekarang
                  </Link>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#21212b] mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
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
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
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

            {!success && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#7054dc] hover:bg-[#5d42b0] disabled:bg-[#9b88d6] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Memproses...' : 'Reset Password'}
              </button>
            )}
          </form>

          {!success && (
            <p className="text-center text-[#8a8a96] text-sm mt-6">
              <Link href="/login" className="text-[#7054dc] hover:text-[#5d42b0] font-medium transition-colors">
                Kembali ke Login
              </Link>
            </p>
          )}
        </div>

        <p className="text-center text-[#8a8a96] text-xs mt-6">
          &copy; 2026 LMS Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f7f6ff] to-white flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#7054dc] border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
