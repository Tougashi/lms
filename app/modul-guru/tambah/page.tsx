'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import GuruHeader from '../../component/guru/GuruHeader';
import { useAuth } from '../../context/AuthContext';
import { guruModulApi } from '../../lib/api';

export default function TambahModulIntroPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    if (!user?.id) {
      setError('Anda harus login terlebih dahulu.');
      return;
    }

    setIsCreating(true);
    setError('');
    try {
      const newModul = await guruModulApi.create({
        moduleName: title.trim(),
        subtitle: title.trim(),
        description: '',
        targetTime: 60,
        difficulty: 'Beginner',
        tutorId: user.id,
      });
      // Navigate to profil page with the new module ID
      router.push(`/modul-guru/tambah/profil?modulId=${newModul.id}`);
    } catch (err: unknown) {
      console.error('Create module error:', err);
      setError(err instanceof Error ? err.message : 'Gagal membuat modul. Silakan coba lagi.');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#232530]">
      <GuruHeader />

      <main className="mx-auto flex min-h-[calc(100vh-74px)] w-full max-w-[960px] flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-[20px] font-semibold text-[#232530] sm:text-[22px]">
          Bagaimana dengan judul modul sementara?
        </h1>
        <p className="mt-2 max-w-[520px] text-[13px] leading-[1.6] text-[#7f8290]">
          Tidak masalah jika Anda belum dapat memikirkan judul yang bagus. Anda dapat
          mengubahnya nanti.
        </p>

        <div className="mt-8 w-full max-w-[420px]">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Judul sementara"
            className="h-[44px] w-full rounded-xl border border-[#d9d7df] bg-white px-4 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />

          <button
            type="button"
            onClick={handleCreate}
            disabled={!title.trim() || isCreating}
            className="mt-6 inline-flex h-[44px] w-full items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(112,84,220,0.35)] transition-colors hover:bg-[#5f46cc] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Membuat modul...
              </span>
            ) : (
              'Buat modul'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
