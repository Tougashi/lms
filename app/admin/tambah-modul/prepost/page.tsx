'use client';

import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { FiCheckSquare, FiPlus } from 'react-icons/fi';

export default function TambahModulPrepostPage() {
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />
      <main className="flex w-full">
        <AdminModuleSidebar basePath="/admin/tambah-modul" title="Tambah Modul" />
        <section className="flex-1 px-4 pb-10 pt-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[760px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece7ff] text-[#7054dc]">
                <FiCheckSquare size={18} />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-[#232530]">Pre - Post Test Modul</h1>
                <p className="text-[12px] text-[#7a7e8a]">Buat soal evaluasi awal dan akhir modul</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {/* Pre Test */}
              <div className="rounded-2xl border border-[#e5e3ee] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f0eef5] px-5 py-4">
                  <p className="text-[13px] font-bold text-[#232530]">Pre Test</p>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-[#7054dc] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#5f46cc]">
                    <FiPlus size={12} />
                    Tambah Soal
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f2ff] text-[#7054dc]">
                    <FiCheckSquare size={20} />
                  </div>
                  <p className="mt-3 text-[12px] font-semibold text-[#232530]">Belum ada soal pre test</p>
                  <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-[#7a7e8a]">
                    Tambahkan soal untuk evaluasi awal siswa
                  </p>
                </div>
              </div>

              {/* Post Test */}
              <div className="rounded-2xl border border-[#e5e3ee] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f0eef5] px-5 py-4">
                  <p className="text-[13px] font-bold text-[#232530]">Post Test</p>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-[#f39b39] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#e08a2e]">
                    <FiPlus size={12} />
                    Tambah Soal
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff8ef] text-[#f39b39]">
                    <FiCheckSquare size={20} />
                  </div>
                  <p className="mt-3 text-[12px] font-semibold text-[#232530]">Belum ada soal post test</p>
                  <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-[#7a7e8a]">
                    Tambahkan soal untuk evaluasi akhir siswa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
