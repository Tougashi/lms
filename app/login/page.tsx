'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login request
    setTimeout(() => {
      if (!email || !password) {
        setError('Email dan password harus diisi');
      } else {
        // Here you would typically send credentials to your backend
        console.log('Login attempt:', { email, password });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f6ff] to-white flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#21212b] mb-2">
              Login
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

            {/* Password Field */}
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

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#e0dfe6] text-[#7054dc] focus:ring-[#7054dc]"
                />
                <span className="text-sm text-[#8a8a96]">Ingat Saya</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-red-600 hover:text-red-700 underline transition-colors font-medium"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7054dc] hover:bg-[#5d42b0] disabled:bg-[#9b88d6] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-[#8a8a96] text-sm mt-6">
            Belum mempunyai akun? <Link href="/daftar" className="text-[#7054dc] hover:text-[#5d42b0] font-medium transition-colors">Daftar</Link>
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
