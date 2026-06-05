'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MdMoreVert,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdPersonAddAlt1,
} from 'react-icons/md';
import { FiCheckSquare, FiUsers } from 'react-icons/fi';
import { FaFilter, FaTrash, FaCheckSquare as FaCheckSq, FaSearch } from 'react-icons/fa';
import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';

/* ─── types ─── */
type SiswaRow = { id: string; name: string; kelas: string; phone: string; email: string };
type TambahSiswaRow = { id: string; name: string; kelas: string; email: string; added: boolean };

/* ─── static placeholder data ─── */
const siswaRows: SiswaRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: `siswa-${i + 1}`,
  name: 'Yosida',
  kelas: 'XI',
  phone: '0823 1234 1234',
  email: 'Yosida@gmail.com',
}));

const tambahSiswaData: TambahSiswaRow[] = [
  { id: 't1', name: 'Yosida', kelas: 'XI', email: 'Yosida@gmail.com', added: false },
  { id: 't2', name: 'Alif Rosida', kelas: 'XI', email: 'Rosida@gmail.com', added: false },
  { id: 't3', name: 'Asep Bahrul', kelas: 'XII', email: 'Asep@gmail.com', added: true },
  { id: 't4', name: 'Yosida', kelas: 'XI', email: 'Yosida@gmail.com', added: false },
  { id: 't5', name: 'Alif Rosida', kelas: 'XI', email: 'Rosida@gmail.com', added: false },
  { id: 't6', name: 'Asep Bahrul', kelas: 'XII', email: 'Asep@gmail.com', added: true },
];

const filterOptions = [
  'Urutkan A - Z', 'Urutkan Z - A', 'Urutkan dengan Nama Lengkap',
  'Urutkan dengan Jenjang Sekolah', 'Urutkan dengan Tingkat Kelas',
  'Urutkan dengan Sudah Dimasukan', 'Urutkan dengan Belum Dimasukan',
];

function ActionMenu({ onKeluarkan }: { onKeluarkan: () => void }) {
  return (
    <div className="absolute right-0 top-7 z-30 w-[140px] rounded-2xl border border-[#e6e8ef] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <button onClick={onKeluarkan} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-[#7054dc] hover:bg-[#f7f6ff]">
        <FiUsers size={12} /> Keluarkan
      </button>
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-[#60636d] hover:bg-[#f7f6ff]">
        <FiCheckSquare size={12} /> Nonaktifkan
      </button>
    </div>
  );
}

/* ─── inner content (needs Suspense for useSearchParams) ─── */
function ManajemenSiswaModulContent() {
  const searchParams = useSearchParams();
  const modulId = searchParams.get('id') ?? '';

  const [hasData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showKeluarkanModal, setShowKeluarkanModal] = useState(false);
  const [filterChecked, setFilterChecked] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [tambahSearch, setTambahSearch] = useState('');
  const [tambahPage, setTambahPage] = useState(1);

  const totalPages = 5;
  const rows = hasData ? siswaRows : [];
  const filteredRows = rows.filter(
    (r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const allRowsSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedRowIds[r.id]);

  function toggleSelectAll() {
    if (allRowsSelected) { setSelectedRowIds({}); return; }
    const next: Record<string, boolean> = {};
    filteredRows.forEach((r) => { next[r.id] = true; });
    setSelectedRowIds(next);
  }
  function toggleRow(id: string) {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const selectedCount = Object.values(selectedRowIds).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />

      <main className="flex w-full">
        <AdminModuleSidebar
          basePath="/admin/manajemen-modul/edit"
          modulId={modulId}
          title="Edit Modul"
        />

        <section className="flex-1 px-4 pb-10 pt-6 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[520px]">
              <h1 className="text-[20px] font-bold text-[#232530]">Management Siswa di Modul</h1>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#7a7e8a]">
                Kelola siswa dan pengguna umum yang terdaftar dalam modul ini.
                Tambah atau keluarkan peserta sesuai kebutuhan.
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <button
                type="button"
                onClick={() => setShowTambahModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#5f46cc] transition-colors"
              >
                <MdPersonAddAlt1 size={14} /> Tambah Siswa
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-5 flex flex-wrap items-center gap-3 mb-3">
            <label className="flex h-8 w-full max-w-[280px] items-center gap-2 rounded-full border border-[#c8c9d0] bg-white px-3">
              <FaSearch size={11} className="text-[#a0a3b0]" />
              <input
                type="text"
                placeholder="Pencarian"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[12px] text-[#202126] placeholder:text-[#a0a3b0] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#5f46cc] transition-colors"
            >
              <FaFilter size={11} /> Filter
            </button>
            {selectedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ece7ff] px-3 py-1 text-[11px] font-semibold text-[#7054dc]">
                {selectedCount} dipilih
              </span>
            )}
            <button
              type="button"
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[#f36e65] px-4 py-2 text-[12px] font-semibold text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e85f55] transition-colors"
            >
              <FaTrash size={11} /> Hapus
            </button>
          </div>

          {/* Table */}
          <div className="rounded-[18px] border border-[#e9e8f0] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#ebebec] text-[11px] font-medium text-[#9a9ca7]">
                    <th className="w-[44px] px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${allRowsSelected ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                      >
                        <FaCheckSq size={10} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Pengguna</th>
                    <th className="px-4 py-3 text-left font-medium">Kelas</th>
                    <th className="px-4 py-3 text-left font-medium">Nomor Telepon</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="w-[40px] px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-[12px] text-[#9396a3]">
                        Belum ada siswa terdaftar di modul ini.
                      </td>
                    </tr>
                  ) : filteredRows.map((row) => (
                    <tr key={row.id} className="border-t border-[#eef0f5] text-[12px] text-[#4d5260]">
                      <td className="px-4 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleRow(row.id)}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${selectedRowIds[row.id] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                        >
                          <FaCheckSq size={10} />
                        </button>
                      </td>
                      <td className="px-4 py-3 align-middle font-medium text-[#5a5f6a]">{row.name}</td>
                      <td className="px-4 py-3 align-middle">{row.kelas}</td>
                      <td className="px-4 py-3 align-middle">{row.phone}</td>
                      <td className="px-4 py-3 align-middle">{row.email}</td>
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="relative inline-flex">
                          <button
                            type="button"
                            onClick={() => setOpenActionMenuId((prev) => (prev === row.id ? null : row.id))}
                            className="text-[#8d909c] hover:text-[#7054dc]"
                          >
                            <MdMoreVert size={16} />
                          </button>
                          {openActionMenuId === row.id && (
                            <ActionMenu onKeluarkan={() => { setOpenActionMenuId(null); setShowKeluarkanModal(true); }} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#eef0f5] px-4 py-3">
              <p className="text-[11px] text-[#9396a3]">{filteredRows.length} pengguna terdaftar</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8a8d98] hover:bg-[#f0eff5]">
                  <MdKeyboardArrowLeft size={18} />
                </button>
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${currentPage === p ? 'bg-[#7054dc] text-white' : 'text-[#8a8d98] hover:bg-[#f0eff5]'}`}
                  >{p}</button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8a8d98] hover:bg-[#f0eff5]">
                  <MdKeyboardArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ MODAL: Tambahkan Siswa ke Modul ═══ */}
      {showTambahModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowTambahModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[720px] rounded-[22px] border-2 border-[#7054dc] bg-white p-6 shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#232530]">Tambahkan Siswa / Umum ke Modul</h3>
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7054dc] text-white"><MdPersonAddAlt1 size={16} /></button>
                <button type="button" onClick={() => setShowFilterModal(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7054dc] text-white"><FaFilter size={12} /></button>
                <div className="relative flex items-center">
                  <FaSearch size={10} className="absolute left-2.5 text-[#b0b3be]" />
                  <input type="text" value={tambahSearch} onChange={(e) => setTambahSearch(e.target.value)} placeholder="Pencarian" className="h-[32px] w-[140px] rounded-full border border-[#d9d7df] bg-white pl-7 pr-3 text-[11px] outline-none focus:border-[#7054dc]" />
                </div>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#ebebec] text-[11px] font-medium text-[#9a9ca7]">
                    <th className="w-[36px] px-3 py-2.5 text-left font-medium"><FaCheckSq size={10} className="text-[#7054dc]" /></th>
                    <th className="px-3 py-2.5 text-left font-medium">Pengguna</th>
                    <th className="px-3 py-2.5 text-left font-medium">Kelas</th>
                    <th className="px-3 py-2.5 text-left font-medium">Email</th>
                    <th className="px-3 py-2.5 text-left font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {tambahSiswaData.filter((r) => r.name.toLowerCase().includes(tambahSearch.toLowerCase())).map((row) => (
                    <tr key={row.id} className="border-t border-[#f0eef5] text-[12px] text-[#4d5260]">
                      <td className="px-3 py-2.5"><FaCheckSq size={10} className="text-[#7054dc]" /></td>
                      <td className="px-3 py-2.5 font-medium text-[#5a5f6a]">{row.name}</td>
                      <td className="px-3 py-2.5">{row.kelas}</td>
                      <td className="px-3 py-2.5">{row.email}</td>
                      <td className="px-3 py-2.5">
                        {row.added ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7054dc]"><FaCheckSq size={10} /> Ditambahkan</span>
                        ) : (
                          <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7054dc] hover:underline"><MdPersonAddAlt1 size={12} /> Tambah</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-center gap-1">
              <button className="h-7 w-7 rounded-full text-[#8a8d98] hover:bg-[#f0eff5]"><MdKeyboardArrowLeft size={18} /></button>
              {[1,2,3,4,5].map((p) => (
                <button key={p} onClick={() => setTambahPage(p)} className={`h-7 w-7 rounded-full text-[11px] font-semibold ${tambahPage === p ? 'bg-[#7054dc] text-white' : 'text-[#8a8d98]'}`}>{p}</button>
              ))}
              <button className="h-7 w-7 rounded-full text-[#8a8d98] hover:bg-[#f0eff5]"><MdKeyboardArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Filter ═══ */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowFilterModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[280px] rounded-[22px] border-2 border-[#7054dc] bg-white p-5 shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[14px] font-bold text-[#7054dc]">Filter Urutkan Tampilan</h3>
            <div className="mt-4 space-y-3">
              {filterOptions.map((opt, i) => (
                <label key={i} className="flex cursor-pointer items-center gap-2.5 text-[12px] text-[#232530]">
                  <button type="button" onClick={() => setFilterChecked((prev) => ({ ...prev, [i]: !prev[i] }))} className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${filterChecked[i] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de]'}`}>
                    {filterChecked[i] && <FaCheckSq size={10} />}
                  </button>
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Keluarkan ═══ */}
      {showKeluarkanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowKeluarkanModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[360px] rounded-[22px] border-2 border-[#7054dc] bg-white px-8 py-7 text-center shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[16px] font-bold italic text-[#7054dc]">Keluarkan Siswa dari Modul</h3>
            <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-[1.6] text-[#5a5d6a]">
              Apakah anda yakin ingin mengeluarkan siswa ini dari Modul?
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => setShowKeluarkanModal(false)} className="h-[42px] flex-1 rounded-xl bg-[#f07167] text-[13px] font-semibold text-white hover:bg-[#e85f55] transition-colors">Lanjutkan</button>
              <button type="button" onClick={() => setShowKeluarkanModal(false)} className="h-[42px] flex-1 rounded-xl border-2 border-[#d8d3f0] bg-white text-[13px] font-semibold text-[#7054dc] hover:bg-[#f5f2ff] transition-colors">Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManajemenSiswaModulPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <ManajemenSiswaModulContent />
    </Suspense>
  );
}
