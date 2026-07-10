'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccess(res.message || 'Link reset password telah dikirim ke email Anda.');
      setEmail('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengirim email. Silakan coba lagi.';
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
              Lupa Password
            </h1>
            <p className="text-sm text-[#8a8a96] mt-2">
              Masukkan email Anda dan kami akan kirim link reset password.
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
              </div>
            )}

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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7054dc] hover:bg-[#5d42b0] disabled:bg-[#9b88d6] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <p className="text-center text-[#8a8a96] text-sm mt-6">
            <Link href="/login" className="text-[#7054dc] hover:text-[#5d42b0] font-medium transition-colors">
              Kembali ke Login
            </Link>
          </p>
        </div>

        <p className="text-center text-[#8a8a96] text-xs mt-6">
          &copy; 2026 LMS Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
