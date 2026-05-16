'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { RiCustomerService2Line, RiHome5Fill } from 'react-icons/ri';
import { IoPersonCircle } from 'react-icons/io5';
import {
  MdOutlineKeyboardArrowDown,
  MdMoreVert,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdPersonAddAlt1,
} from 'react-icons/md';
import {
  FiFileText,
  FiDollarSign,
  FiLayers,
  FiCheckSquare,
  FiUsers,
} from 'react-icons/fi';
import { FaFilter, FaTrash, FaCheckSquare as FaCheckSq, FaRegSquare, FaSearch } from 'react-icons/fa';

/* ───────────────── types ───────────────── */

type SiswaRow = {
  id: string;
  name: string;
  kelas: string;
  phone: string;
  email: string;
};

/* ───────────────── static data ───────────────── */

const siswaRows: SiswaRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: `siswa-${i + 1}`,
  name: 'Yosida',
  kelas: 'XI',
  phone: '0823 1234 1234',
  email: 'Yosida@gmail.com',
}));

type TambahSiswaRow = {
  id: string;
  name: string;
  kelas: string;
  email: string;
  added: boolean;
};

const tambahSiswaData: TambahSiswaRow[] = [
  { id: 't1', name: 'Yosida', kelas: 'XI', email: 'Yosida@gmail.com', added: false },
  { id: 't2', name: 'Alif Rosida', kelas: 'XI', email: 'Rosida@gmail.com', added: false },
  { id: 't3', name: 'Asep Bahrul', kelas: 'XII', email: 'Asep@gmail.com', added: true },
  { id: 't4', name: 'Yosida', kelas: 'XI', email: 'Yosida@gmail.com', added: false },
  { id: 't5', name: 'Alif Rosida', kelas: 'XI', email: 'Rosida@gmail.com', added: false },
  { id: 't6', name: 'Asep Bahrul', kelas: 'XII', email: 'Asep@gmail.com', added: true },
];

const filterOptions = [
  'Urutkan A - Z',
  'Urutkan Z - A',
  'Urutkan dengan Nama Lengkap',
  'Urutkan dengan Jenjang Sekolah',
  'Urutkan dengan Tingkat Kelas',
  'Urutkan dengan Sudah Dimasukan',
  'Urutkan dengan Belum Dimasukan',
];

/* ───────────────── sidebar nav items ───────────────── */

type SidebarSection = {
  title: string;
  items: { label: string; icon: React.ReactNode; active?: boolean }[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: 'Rencanakan Modul anda',
    items: [
      { label: 'Profil Modul Anda', icon: <FiFileText size={13} /> },
      { label: 'Penetapan Harga Modul', icon: <FiDollarSign size={13} /> },
    ],
  },
  {
    title: 'Konten Modul Anda',
    items: [
      { label: 'Konten Modul', icon: <FiLayers size={13} /> },
      { label: 'Pre - Post Test Modul', icon: <FiCheckSquare size={13} /> },
    ],
  },
  {
    title: 'Management Penguna',
    items: [
      { label: 'Management Siswa', icon: <FiUsers size={13} />, active: true },
    ],
  },
];

/* ───────────────── header ───────────────── */

function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-[#21212b]">
          NAMA WEB
        </Link>

        <nav className="hidden gap-10 sm:flex">
          <Link href="/beranda-siswa" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Beranda
          </Link>
          <Link href="/eksplor-modul" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Modul Saya
          </Link>
          <Link href="/admin/manajemen-pengguna" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Siswa
          </Link>
          <Link href="/tentang-kami" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Komunikasi
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full p-2 hover:bg-[#f7f6ff]" aria-label="Notifikasi">
            <FaBell size={20} className="text-[#21212b]" />
          </button>
          <button type="button" className="hidden rounded-full p-2 hover:bg-[#f7f6ff] sm:inline-flex" aria-label="Bantuan">
            <RiCustomerService2Line size={22} className="text-[#21212b]" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1 shadow-sm transition-colors hover:bg-[#f7f6ff]"
            aria-label="Buka menu profil"
          >
            <IoPersonCircle size={28} className="text-[#7054dc]" />
            <MdOutlineKeyboardArrowDown size={18} className="text-[#8a8a96]" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────────────── action menu ───────────────── */

function ActionMenu({ onKeluarkan }: { onKeluarkan: () => void }) {
  return (
    <div className="absolute right-0 top-7 z-30 w-[140px] rounded-2xl border border-[#e6e8ef] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <button onClick={onKeluarkan} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-[#7054dc] hover:bg-[#f7f6ff]">
        <FiUsers size={12} />
        Keluarkan
      </button>
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-[#60636d] hover:bg-[#f7f6ff]">
        <FiCheckSquare size={12} />
        Nonaktifkan
      </button>
    </div>
  );
}

/* ───────────────── main page ───────────────── */

export default function ManagementSiswaModulPage() {
  const [hasData, setHasData] = useState(false);
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

  const totalSiswa = hasData ? 45 : 0;
  const totalPages = 5;

  const rows = hasData ? siswaRows : [];

  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allRowsSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedRowIds[r.id]);

  function toggleSelectAll() {
    if (allRowsSelected) {
      setSelectedRowIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredRows.forEach((r) => {
        next[r.id] = true;
      });
      setSelectedRowIds(next);
    }
  }

  function toggleRow(id: string) {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />

      <main className="w-full">
        <div className="grid w-full lg:grid-cols-[240px_1fr]">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden border-r border-[#e5e3ee] bg-white px-5 py-6 lg:flex lg:min-h-[calc(100vh-74px)] lg:flex-col">
            {/* Dashboard Admin badge */}
            <Link
              href="/admin/dashboard"
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-xl border-2 border-[#f39b39] bg-[#fff8ef] px-3 py-1.5 text-[12px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e0]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#f39b39] text-white"><RiHome5Fill size={12} /></span>
              Dashboard Admin
            </Link>

            {/* Nav sections */}
            {sidebarSections.map((section, sIdx) => (
              <div key={sIdx} className={sIdx > 0 ? 'mt-7' : ''}>
                <p className="text-[13px] font-bold text-[#232530]">{section.title}</p>
                <nav className="mt-3 space-y-3 text-[13px]">
                  {section.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={`flex w-full items-center gap-2 text-left transition-colors ${
                        item.active
                          ? 'font-semibold text-[#7054dc]'
                          : 'text-[#7a7e8a] hover:text-[#7054dc]'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}

            {/* Bottom action buttons */}
            <div className="mt-auto space-y-2.5 pt-8">
              <button
                type="button"
                className="w-full rounded-full bg-[#7054dc] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc]"
              >
                Simpan
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-[#d8d3f0] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
              >
                Arsipkan Modul
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-[#f5c2be] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#f36e65] transition-colors hover:bg-[#fff3f2]"
              >
                Hapus Modul
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <section className="px-4 pb-10 pt-6 sm:px-8 lg:px-10">
            {/* Title + Counter row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-[520px]">
                <h1 className="text-[20px] font-bold text-[#232530]">Management Siswa di Modul</h1>
                <p className="mt-2 text-[13px] leading-[1.65] text-[#7a7e8a]">
                  Atur Siswa di Modul guru untuk memastikan siswa bisa meng akses modul yang terkunci, atau menambahkan siswa ke modul secara manual oleh administrator.
                </p>
              </div>
              {/* Jumlah Siswa stat card */}
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#f0e6d3] bg-[#fffaf2] px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f39b39] text-white">
                  <FiUsers size={18} />
                </div>
                <div className="text-right">
                  <p className="text-[28px] font-bold leading-none text-[#f39b39]">{totalSiswa}</p>
                  <p className="mt-0.5 text-[11px] text-[#7a7e8a]">Jumlah Siswa di Modul</p>
                </div>
              </div>
            </div>

            {/* Section heading */}
            <h2 className="mt-6 text-[15px] font-bold text-[#232530]">Siswa Terdaftar di Modul ini</h2>

            {/* Toggle demo button (for dev) */}
            <button
              type="button"
              onClick={() => setHasData(!hasData)}
              className="mt-2 text-[11px] text-[#7054dc] underline"
            >
              {hasData ? 'Tampilkan state kosong' : 'Tampilkan state data'}
            </button>

            {/* Toolbar */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTambahModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#5f46cc]"
              >
                <MdPersonAddAlt1 size={14} />
                Tambahkan Siswa
              </button>

              <div className="relative flex items-center">
                <FaSearch size={12} className="absolute left-3 text-[#b0b3be]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pencarian"
                  className="h-[36px] w-[180px] rounded-full border border-[#d9d7df] bg-white pl-8 pr-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#7054dc] px-4 py-2 text-[12px] font-semibold text-white shadow-sm"
                >
                  <FaFilter size={10} />
                  Filter
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeluarkanModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f36e65] px-4 py-2 text-[12px] font-semibold text-white shadow-sm"
                >
                  <FaTrash size={10} />
                  Keluarkan
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e9e8f0] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#ebebec] text-[12px] font-medium text-[#9a9ca7]">
                      <th className="w-[44px] px-3 py-3 text-left font-medium">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${
                            allRowsSelected
                              ? 'border-[#7054dc] bg-[#7054dc] text-white'
                              : 'border-[#cfd3de] text-[#9aa0ab]'
                          }`}
                        >
                          {allRowsSelected ? <FaCheckSq size={10} /> : <FaRegSquare size={10} />}
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left font-medium">Nama Lengkap</th>
                      <th className="px-3 py-3 text-left font-medium">Kelas</th>
                      <th className="px-3 py-3 text-left font-medium">No Wa</th>
                      <th className="px-3 py-3 text-left font-medium">Email</th>
                      <th className="w-[40px] px-3 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length > 0 ? (
                      filteredRows.map((row) => (
                        <tr key={row.id} className="border-t border-[#f0eef5] text-[12px] text-[#4d5260]">
                          <td className="px-3 py-3 align-middle">
                            <button
                              type="button"
                              onClick={() => toggleRow(row.id)}
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${
                                selectedRowIds[row.id]
                                  ? 'border-[#7054dc] bg-[#7054dc] text-white'
                                  : 'border-[#cfd3de] text-[#9aa0ab]'
                              }`}
                            >
                              {selectedRowIds[row.id] ? <FaCheckSq size={10} /> : <FaRegSquare size={10} />}
                            </button>
                          </td>
                          <td className="px-3 py-3 align-middle font-medium text-[#5a5f6a]">
                            <Link href="/admin/nilai-siswa" className="hover:text-[#7054dc] hover:underline transition-colors">
                              {row.name}
                            </Link>
                          </td>
                          <td className="px-3 py-3 align-middle">{row.kelas}</td>
                          <td className="px-3 py-3 align-middle">{row.phone}</td>
                          <td className="px-3 py-3 align-middle">{row.email}</td>
                          <td className="px-3 py-3 align-middle text-right">
                            <div className="relative inline-flex">
                              <button
                                type="button"
                                onClick={() => setOpenActionMenuId((prev) => (prev === row.id ? null : row.id))}
                                className="text-[#8d909c] hover:text-[#7054dc]"
                              >
                                <MdMoreVert size={16} />
                              </button>
                              {openActionMenuId === row.id && <ActionMenu onKeluarkan={() => { setOpenActionMenuId(null); setShowKeluarkanModal(true); }} />}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* Empty state */
                      <tr>
                        <td colSpan={6} className="px-6 py-10">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Image
                              src="/assets/images/beranda-siswa/belum-ada.png"
                              alt="Belum ada siswa"
                              width={200}
                              height={180}
                              className="opacity-90"
                            />
                            <p className="mt-4 max-w-[380px] text-[13px] leading-[1.6] text-[#7a7e8a]">
                              Belum ada Siswa terdaftar di Modul ini. Klik Tambahkan siswa untuk menambahkan Siswa ke Modul!
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-5 flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8a8d98] hover:bg-[#f0eff5]"
              >
                <MdKeyboardArrowLeft size={20} />
              </button>
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-colors ${
                    currentPage === p
                      ? 'bg-[#7054dc] text-white'
                      : 'text-[#8a8d98] hover:bg-[#f0eff5]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8a8d98] hover:bg-[#f0eff5]"
              >
                <MdKeyboardArrowRight size={20} />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* ═══ MODAL: Tambahkan Siswa ke Modul ═══ */}
      {showTambahModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowTambahModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[720px] rounded-[22px] border-2 border-[#7054dc] bg-white p-6 shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#232530]">Tambahkan Siswa ke Modul</h3>
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7054dc] text-white"><MdPersonAddAlt1 size={16} /></button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7054dc] text-white"><FaFilter size={12} /></button>
                <div className="relative flex items-center">
                  <FaSearch size={10} className="absolute left-2.5 text-[#b0b3be]" />
                  <input type="text" value={tambahSearch} onChange={(e) => setTambahSearch(e.target.value)} placeholder="Pencarian" className="h-[32px] w-[140px] rounded-full border border-[#d9d7df] bg-white pl-7 pr-3 text-[11px] outline-none focus:border-[#7054dc]" />
                </div>
              </div>
            </div>
            {/* Table */}
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
                  {tambahSiswaData.filter(r => r.name.toLowerCase().includes(tambahSearch.toLowerCase())).map((row) => (
                    <tr key={row.id} className="border-t border-[#f0eef5] text-[12px] text-[#4d5260]">
                      <td className="px-3 py-2.5"><FaCheckSq size={10} className="text-[#7054dc]" /></td>
                      <td className="px-3 py-2.5 font-medium text-[#5a5f6a]">{row.name}</td>
                      <td className="px-3 py-2.5">{row.kelas}</td>
                      <td className="px-3 py-2.5">{row.email}</td>
                      <td className="px-3 py-2.5">
                        {row.added ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7054dc]"><FaCheckSq size={10} /> Ditambahkan</span>
                        ) : (
                          <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7054dc] hover:underline"><MdPersonAddAlt1 size={12} /> Tambah Siswa</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-center gap-1">
              <button className="h-7 w-7 rounded-full text-[#8a8d98] hover:bg-[#f0eff5]"><MdKeyboardArrowLeft size={18} /></button>
              {[1,2,3,4,5].map(p => (<button key={p} onClick={() => setTambahPage(p)} className={`h-7 w-7 rounded-full text-[11px] font-semibold ${tambahPage === p ? 'bg-[#7054dc] text-white' : 'text-[#8a8d98]'}`}>{p}</button>))}
              <button className="h-7 w-7 rounded-full text-[#8a8d98] hover:bg-[#f0eff5]"><MdKeyboardArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Filter Urutkan Tampilan ═══ */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowFilterModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[280px] rounded-[22px] border-2 border-[#7054dc] bg-white p-5 shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[14px] font-bold text-[#7054dc]">Filter Urutkan Tampilan</h3>
            <div className="mt-4 space-y-3">
              {filterOptions.map((opt, i) => (
                <label key={i} className="flex items-center gap-2.5 cursor-pointer text-[12px] text-[#232530]">
                  <button type="button" onClick={() => setFilterChecked(prev => ({ ...prev, [i]: !prev[i] }))} className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${filterChecked[i] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de]'}`}>
                    {filterChecked[i] && <FaCheckSq size={10} />}
                  </button>
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Keluarkan Siswa dari Modul ═══ */}
      {showKeluarkanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowKeluarkanModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[360px] rounded-[22px] border-2 border-[#7054dc] bg-white px-8 py-7 text-center shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[16px] font-bold italic text-[#7054dc]">Keluarkan Siswa dari Modul</h3>
            <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-[1.6] text-[#5a5d6a]">
              Apakah anda yakin ingin mengeluarkan siswa ini dari Modul?. Lanjutkan jika ingin melanjutkannya dan Batalkan jika ingin membatalkannya
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => setShowKeluarkanModal(false)} className="h-[42px] flex-1 rounded-xl bg-[#f07167] text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#e85f55]">Lanjutkan</button>
              <button type="button" onClick={() => setShowKeluarkanModal(false)} className="h-[42px] flex-1 rounded-xl border-2 border-[#d8d3f0] bg-white text-[13px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]">Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
