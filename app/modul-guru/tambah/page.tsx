'use client';

import Link from 'next/link';
import { useState } from 'react';

import GuruHeader from '../../component/guru/GuruHeader';

export default function TambahModulIntroPage() {
  const [title, setTitle] = useState('');

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
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Judul sementara"
            className="h-[44px] w-full rounded-xl border border-[#d9d7df] bg-white px-4 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]"
          />

          <Link
            href="/modul-guru/tambah/profil"
            className="mt-6 inline-flex h-[44px] w-full items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(112,84,220,0.35)] transition-colors hover:bg-[#5f46cc]"
          >
            Buat modul
          </Link>
        </div>
      </main>
    </div>
  );
}
