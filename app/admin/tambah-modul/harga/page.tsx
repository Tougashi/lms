'use client';

import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { FiDollarSign } from 'react-icons/fi';

export default function TambahModulHargaPage() {
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />
      <main className="flex w-full">
        <AdminModuleSidebar basePath="/admin/tambah-modul" title="Tambah Modul" />
        <section className="flex-1 px-4 pb-10 pt-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[760px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece7ff] text-[#7054dc]">
                <FiDollarSign size={18} />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-[#232530]">Penetapan Harga Modul</h1>
                <p className="text-[12px] text-[#7a7e8a]">Atur harga dan opsi pembayaran modul</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#e5e3ee] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-semibold text-[#232530]">Tipe Harga</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 border-[#e5e3ee] p-4 transition-colors hover:border-[#7054dc]">
                  <input type="radio" name="priceType" value="gratis" defaultChecked className="h-4 w-4 accent-[#7054dc]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#232530]">Gratis</p>
                    <p className="text-[11px] text-[#7a7e8a]">Modul dapat diakses tanpa biaya</p>
                  </div>
                </label>
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 border-[#e5e3ee] p-4 transition-colors hover:border-[#7054dc]">
                  <input type="radio" name="priceType" value="berbayar" className="h-4 w-4 accent-[#7054dc]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#232530]">Berbayar</p>
                    <p className="text-[11px] text-[#7a7e8a]">Atur harga untuk mengakses modul</p>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <label className="text-[13px] font-bold text-[#232530]">Harga (Rp)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 50000"
                  className="mt-2 h-[42px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]"
                />
                <p className="mt-1 text-[11px] text-[#7e8290]">Masukkan harga dalam Rupiah. Kosongkan jika gratis.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="h-[44px] w-[200px] rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc]">
                Simpan
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
