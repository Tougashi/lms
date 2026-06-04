'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import GuruHeader from '../../component/guru/GuruHeader';
import { useGuruModules } from '../hooks/useGuruModules';
import { guruModulApi } from '../../lib/api';
import { useRoleGuard } from '../../lib/hooks/useRoleGuard';
import { usePopup } from '../../component/ui/PopupProvider';

export default function ManajemenModulPage() {
  const { isAuthorized } = useRoleGuard(['tutor']);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast, confirm } = usePopup();

  const {
    modules,
    currentPageNumber,
    hasPrev,
    hasNext,
    isLoading,
    loadModules,
    nextPage,
    prevPage,
  } = useGuruModules(10);

  useEffect(() => {
    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredModules = useMemo(
    () => modules.filter((m) =>
      m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    [modules, searchQuery],
  );

  const handleDelete = async (modulId: string) => {
    if (deletingId) return;
    const ok = await confirm({ message: 'Apakah Anda yakin ingin menghapus modul ini?', variant: 'danger', confirmText: 'Hapus' });
    if (!ok) return;
    setDeletingId(modulId);
    try {
      await guruModulApi.delete(modulId);
      loadModules();
    } catch (err) {
      console.error('Delete module error:', err);
      toast('Gagal menghapus modul.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
        <GuruHeader />
        <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7557ea] border-t-transparent mb-4"></div>
            <p className="text-sm text-[#8a8d98]">Memeriksa otorisasi...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#232530]">Manajemen Modul</h1>
            <p className="mt-1 text-[13px] text-[#7c808f]">Kelola semua modul yang Anda buat</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-[44px] w-full items-center gap-3 rounded-full border border-[#e3e1ea] bg-white px-4 text-[#8a8d98] shadow-sm md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari modul..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#2d2d3a] outline-none placeholder:text-[#9ca0ad] md:w-[220px] md:flex-none"
              />
              <FaSearch size={14} className="shrink-0 text-[#8a8d98]" />
            </div>

            <Link
              href="/modul-guru/tambah"
              className="inline-flex h-[44px] items-center gap-2 rounded-full bg-[#7557ea] px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(117,87,234,0.25)] transition-colors hover:bg-[#6648df]"
            >
              <FiPlus size={16} />
              Tambah Modul
            </Link>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white">
          <table className="w-full min-w-[700px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#f0eff5] text-[13px] font-semibold text-[#232530]">
                <th className="px-5 py-3.5 text-left font-semibold">Judul Modul</th>
                <th className="px-5 py-3.5 text-left font-semibold">Tingkat</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[13px] text-[#8a8d98]">
                    Memuat data...
                  </td>
                </tr>
              )}

              {!isLoading && filteredModules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[13px] text-[#8a8d98]">
                    Tidak ada modul ditemukan.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredModules.map((modul) => (
                  <tr
                    key={modul.id}
                    className="border-t border-[#f0eff5] text-[13px] text-[#232530] transition-colors hover:bg-[#faf9ff]"
                  >
                    <td className="px-5 py-4 font-medium">{modul.moduleName}</td>
                    <td className="px-5 py-4 text-[#7c808f]">
                      {[modul.level, modul.class].filter(Boolean).join(' | Kelas ') || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                          modul.isDraft
                            ? 'bg-[#fef3e2] text-[#f39b39]'
                            : 'bg-[#e6f7e6] text-[#2e9b4e]'
                        }`}
                      >
                        {modul.isDraft ? 'Draft' : 'Terbit'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/modul-guru/tambah/profil?modulId=${modul.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#7557ea] transition-colors hover:bg-[#f0ebff]"
                        >
                          <FiEdit2 size={13} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(modul.id)}
                          disabled={deletingId === modul.id}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#ff6b5d] transition-colors hover:bg-[#fff1ef] disabled:opacity-50"
                        >
                          <FiTrash2 size={13} />
                          {deletingId === modul.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && modules.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#818694]">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={prevPage}
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                hasPrev
                  ? 'border-[#7557ea] text-[#7557ea] hover:bg-[#f0ebff]'
                  : 'border-[#d4d7e2] text-[#c6c8d0] cursor-not-allowed'
              }`}
            >
              <MdKeyboardArrowLeft size={14} />
              Sebelumnya
            </button>
            <span className="mx-3 text-xs font-semibold text-[#4d5260]">
              Halaman {currentPageNumber}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={nextPage}
              className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                hasNext
                  ? 'border-[#7557ea] text-[#7557ea] hover:bg-[#f0ebff]'
                  : 'border-[#d4d7e2] text-[#c6c8d0] cursor-not-allowed'
              }`}
            >
              Selanjutnya
              <MdKeyboardArrowRight size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
