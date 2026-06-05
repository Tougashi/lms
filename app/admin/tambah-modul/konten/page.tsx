'use client';

import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { FiLayers, FiPlus } from 'react-icons/fi';

export default function TambahModulKontenPage() {
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />
      <main className="flex w-full">
        <AdminModuleSidebar basePath="/admin/tambah-modul" title="Tambah Modul" />
        <section className="flex-1 px-4 pb-10 pt-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[760px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece7ff] text-[#7054dc]">
                <FiLayers size={18} />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-[#232530]">Konten Modul</h1>
                <p className="text-[12px] text-[#7a7e8a]">Kelola materi dan sub-materi modul</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#e5e3ee] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f0eef5] px-5 py-4">
                <p className="text-[13px] font-bold text-[#232530]">Daftar Materi</p>
                <button className="inline-flex items-center gap-1.5 rounded-full bg-[#7054dc] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">
                  <FiPlus size={13} />
                  Tambah Materi
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f2ff] text-[#7054dc]">
                  <FiLayers size={24} />
                </div>
                <p className="mt-4 text-[13px] font-semibold text-[#232530]">Belum ada materi</p>
                <p className="mt-1 max-w-[300px] text-[12px] leading-relaxed text-[#7a7e8a]">
                  Klik tombol Tambah Materi untuk mulai menambahkan konten ke modul ini.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
