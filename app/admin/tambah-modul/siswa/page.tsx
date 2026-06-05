'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MdMoreVert,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdPersonAddAlt1,
} from 'react-icons/md';
import AdminHeader from '../../../component/admin/AdminHeader';
import {
  FiFileText,
  FiDollarSign,
  FiLayers,
  FiCheckSquare,
  FiUsers,
} from 'react-icons/fi';
import { FaFilter, FaTrash, FaCheckSquare as FaCheckSq, FaRegSquare, FaSearch, FaSpinner } from 'react-icons/fa';
import { adminModulApi, adminSiswaApi } from '../../../lib/api';
import type { AdminModulSiswaItem, AdminSiswaItem } from '../../../lib/types/admin';

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
  const searchParams = useSearchParams();
  const modulId = searchParams.get('id') || '';

  /* ── enrolled siswa state ── */
  const [siswaList, setSiswaList] = useState<AdminModulSiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showKeluarkanModal, setShowKeluarkanModal] = useState(false);
  const [filterChecked, setFilterChecked] = useState<Record<number, boolean>>({ 1: true, 2: true });

  const enrolledSiswaIds = useMemo(() => new Set(siswaList.map((s) => s.siswaId)), [siswaList]);

  /* ── available siswa for Tambah modal ── */
  const [availableSiswa, setAvailableSiswa] = useState<AdminSiswaItem[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableNextCursor, setAvailableNextCursor] = useState<string | null>(null);
  const [tambahSearch, setTambahSearch] = useState('');
  const [addingSiswaIds, setAddingSiswaIds] = useState<Set<string>>(new Set());
  const [tambahFeedback, setTambahFeedback] = useState('');

  /* ── remove target state ── */
  const [removeTarget, setRemoveTarget] = useState<{ id: string; nama: string } | null>(null);
  const [removingLoading, setRemovingLoading] = useState(false);

  /* ── feedback ── */
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

  function showFeedback(msg: string, type: 'success' | 'error') {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 4000);
  }

  /* ── fetch enrolled students from module ── */
  const fetchStudents = useCallback(async (cursor?: string) => {
    if (!modulId) return;
    setLoading(true);
    setError('');
    try {
      const result = await adminModulApi.getStudents(modulId, { cursor, limit: 10 });
      setSiswaList(result.items);
      setNextCursor(result.next_cursor);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data siswa';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [modulId]);

  useEffect(() => {
    if (modulId) {
      setCursorHistory([]);
      setCurrentPage(0);
      fetchStudents();
    }
  }, [modulId, fetchStudents]);

  /* ── fetch available siswa for modal ── */
  const fetchAvailableSiswa = useCallback(async (cursor?: string) => {
    setAvailableLoading(true);
    try {
      const result = await adminSiswaApi.getAll({ cursor, limit: 10 });
      if (cursor) {
        setAvailableSiswa((prev) => [...prev, ...result.items]);
      } else {
        setAvailableSiswa(result.items);
      }
      setAvailableNextCursor(result.next_cursor);
    } catch {
      setAvailableSiswa([]);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  const searchAvailableSiswa = useCallback(async (q: string) => {
    setAvailableLoading(true);
    try {
      const result = await adminSiswaApi.search(q);
      setAvailableSiswa(result);
      setAvailableNextCursor(null);
    } catch {
      setAvailableSiswa([]);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  function handleTambahSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTambahSearch(val);
    if (val.length >= 2) {
      searchAvailableSiswa(val);
    } else if (val.length === 0) {
      setAvailableSiswa([]);
      setAvailableNextCursor(null);
      fetchAvailableSiswa();
    }
  }

  function handleModalOpen() {
    setShowTambahModal(true);
    setTambahSearch('');
    setTambahFeedback('');
    setAddingSiswaIds(new Set());
    setAvailableSiswa([]);
    setAvailableNextCursor(null);
    fetchAvailableSiswa();
  }

  async function handleAssignSiswa(siswaId: string) {
    setAddingSiswaIds((prev) => new Set(prev).add(siswaId));
    setTambahFeedback('');
    try {
      await adminModulApi.assign({ moduleId: modulId, studentId: siswaId });
      showFeedback('Siswa berhasil ditambahkan ke modul', 'success');
      setTambahFeedback('Berhasil ditambahkan');
      fetchStudents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan siswa';
      setTambahFeedback(msg);
    } finally {
      setAddingSiswaIds((prev) => {
        const next = new Set(prev);
        next.delete(siswaId);
        return next;
      });
    }
  }

  /* ── helpers ── */
  const totalSiswa = siswaList.length;

  const filteredRows = siswaList.filter(
    (row) =>
      row.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allRowsSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedRowIds[r.id]);

  function toggleSelectAll() {
    if (allRowsSelected) {
      setSelectedRowIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredRows.forEach((r) => { next[r.id] = true; });
      setSelectedRowIds(next);
    }
  }

  function toggleRow(id: string) {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNextPage() {
    if (!nextCursor) return;
    setCursorHistory((prev) => [...prev, nextCursor]);
    setCurrentPage((p) => p + 1);
    fetchStudents(nextCursor);
  }

  function handlePrevPage() {
    if (cursorHistory.length === 0) return;
    const prev = [...cursorHistory];
    const prevCursor = prev.pop()!;
    setCursorHistory(prev);
    setCurrentPage((p) => p - 1);
    fetchStudents(currentPage > 1 ? prev[prev.length - 1] || undefined : undefined);
  }

  const hasPrev = cursorHistory.length > 0;

  /* ── remove handlers ── */
  function handleRemoveFromActionMenu(progressId: string) {
    const row = siswaList.find((s) => s.id === progressId);
    if (row) {
      setRemoveTarget({ id: row.siswaId, nama: row.nama_lengkap });
      setOpenActionMenuId(null);
      setShowKeluarkanModal(true);
    }
  }

  function handleBulkRemove() {
    const selectedIds = Object.keys(selectedRowIds).filter((k) => selectedRowIds[k]);
    if (selectedIds.length === 0) {
      showFeedback('Pilih siswa terlebih dahulu', 'error');
      return;
    }
    setRemoveTarget(null);
    setShowKeluarkanModal(true);
  }

  async function handleConfirmRemove() {
    setRemovingLoading(true);
    try {
      if (removeTarget) {
        await adminModulApi.unassign({ moduleId: modulId, studentId: removeTarget.id });
        setSiswaList((prev) => prev.filter((s) => s.siswaId !== removeTarget.id));
        showFeedback(`"${removeTarget.nama}" berhasil dikeluarkan dari modul`, 'success');
      } else {
        const selectedProgressIds = Object.keys(selectedRowIds).filter((k) => selectedRowIds[k]);
        const targets = siswaList.filter((s) => selectedProgressIds.includes(s.id));
        for (const t of targets) {
          await adminModulApi.unassign({ moduleId: modulId, studentId: t.siswaId });
        }
        setSiswaList((prev) => prev.filter((s) => !selectedProgressIds.includes(s.id)));
        setSelectedRowIds({});
        showFeedback(`${targets.length} siswa berhasil dikeluarkan dari modul`, 'success');
      }
      setShowKeluarkanModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengeluarkan siswa';
      showFeedback(msg, 'error');
    } finally {
      setRemovingLoading(false);
    }
  }

  const selectedCount = Object.keys(selectedRowIds).filter((k) => selectedRowIds[k]).length;
  const bulkRemoveNames = siswaList
    .filter((s) => selectedRowIds[s.id])
    .slice(0, 3)
    .map((s) => s.nama_lengkap);

  /* ── filtered available siswa for modal display ── */
  const displayedAvailable = tambahSearch.length > 0
    ? availableSiswa
    : availableSiswa;

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />

      <main className="w-full">
        <div className="grid w-full lg:grid-cols-[240px_1fr]">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden border-r border-[#e5e3ee] bg-white px-5 py-6 lg:flex lg:min-h-[calc(100vh-74px)] lg:flex-col">
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

            <h2 className="mt-6 text-[15px] font-bold text-[#232530]">Siswa Terdaftar di Modul ini</h2>

            {/* Feedback */}
            {feedbackMsg && (
              <div className={`mt-3 rounded-lg px-4 py-2 text-[13px] font-medium ${
                feedbackType === 'success'
                  ? 'border border-green-200 bg-green-50 text-green-700'
                  : 'border border-red-200 bg-red-50 text-red-600'
              }`}>
                {feedbackMsg}
              </div>
            )}

            {/* Toolbar */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleModalOpen}
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
                  onClick={handleBulkRemove}
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
                      <th className="px-3 py-3 text-left font-medium">Email</th>
                      <th className="px-3 py-3 text-left font-medium">Progress</th>
                      <th className="w-[40px] px-3 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#7a7e8a]">
                          Memuat data...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : filteredRows.length > 0 ? (
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
                              {row.nama_lengkap}
                            </Link>
                          </td>
                          <td className="px-3 py-3 align-middle">{row.kelas_sekolah}</td>
                          <td className="px-3 py-3 align-middle">{row.email}</td>
                          <td className="px-3 py-3 align-middle">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-[#e8e6f0]">
                                <div
                                  className="h-full rounded-full bg-[#7054dc] transition-all"
                                  style={{ width: `${Math.round(row.progressPercentage)}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-[#7a7e8a]">{Math.round(row.progressPercentage)}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-middle text-right">
                            <div className="relative inline-flex">
                              <button
                                type="button"
                                onClick={() => setOpenActionMenuId((prev) => (prev === row.id ? null : row.id))}
                                className="text-[#8d909c] hover:text-[#7054dc]"
                              >
                                <MdMoreVert size={16} />
                              </button>
                              {openActionMenuId === row.id && (
                                <ActionMenu onKeluarkan={() => handleRemoveFromActionMenu(row.id)} />
                              )}
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
                onClick={handlePrevPage}
                disabled={!hasPrev || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8a8d98] hover:bg-[#f0eff5] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <MdKeyboardArrowLeft size={20} />
              </button>
              <span className="px-2 text-[12px] font-semibold text-[#8a8d98]">
                Halaman {currentPage + 1}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!nextCursor || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8a8d98] hover:bg-[#f0eff5] disabled:opacity-30 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#232530]">Tambahkan Siswa ke Modul</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <FaSearch size={10} className="absolute left-2.5 text-[#b0b3be]" />
                  <input
                    type="text"
                    value={tambahSearch}
                    onChange={handleTambahSearchChange}
                    placeholder="Pencarian"
                    className="h-[32px] w-[180px] rounded-full border border-[#d9d7df] bg-white pl-7 pr-3 text-[11px] outline-none focus:border-[#7054dc]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowTambahModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f36e65] text-white text-[14px] font-bold hover:bg-[#e85f55]"
                >
                  &times;
                </button>
              </div>
            </div>

            {tambahFeedback && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
                {tambahFeedback}
              </div>
            )}

            <div className="mt-4 overflow-x-auto max-h-[360px] overflow-y-auto">
              {availableLoading && availableSiswa.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-[13px] text-[#7a7e8a]">
                  <FaSpinner className="mr-2 animate-spin" size={14} />
                  Memuat data siswa...
                </div>
              ) : displayedAvailable.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[#7a7e8a]">
                  {tambahSearch ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'}
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#ebebec] text-[11px] font-medium text-[#9a9ca7] sticky top-0">
                      <th className="px-3 py-2.5 text-left font-medium">Pengguna</th>
                      <th className="px-3 py-2.5 text-left font-medium">Kelas</th>
                      <th className="px-3 py-2.5 text-left font-medium">Email</th>
                      <th className="px-3 py-2.5 text-left font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAvailable.map((siswa) => {
                      const isEnrolled = enrolledSiswaIds.has(siswa.id);
                      const isAdding = addingSiswaIds.has(siswa.id);
                      return (
                        <tr key={siswa.id} className="border-t border-[#f0eef5] text-[12px] text-[#4d5260]">
                          <td className="px-3 py-2.5 font-medium text-[#5a5f6a]">{siswa.nama_lengkap}</td>
                          <td className="px-3 py-2.5">{siswa.kelas_sekolah || '-'}</td>
                          <td className="px-3 py-2.5">{siswa.email}</td>
                          <td className="px-3 py-2.5">
                            {isEnrolled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7054dc]">
                                <FaCheckSq size={10} /> Sudah Ditambahkan
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAssignSiswa(siswa.id)}
                                disabled={isAdding}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7054dc] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAdding ? (
                                  <FaSpinner className="animate-spin" size={10} />
                                ) : (
                                  <MdPersonAddAlt1 size={12} />
                                )}
                                {isAdding ? 'Menambahkan...' : 'Tambah Siswa'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Load more */}
            {availableNextCursor && !tambahSearch && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => fetchAvailableSiswa(availableNextCursor)}
                  disabled={availableLoading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d3f0] bg-white px-4 py-1.5 text-[11px] font-semibold text-[#7054dc] hover:bg-[#f5f2ff] disabled:opacity-50"
                >
                  {availableLoading ? <FaSpinner className="animate-spin" size={10} /> : null}
                  Muat Lainnya
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ MODAL: Filter Urutkan Tampilan ═══ */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowFilterModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[280px] rounded-[22px] border-2 border-[#7054dc] bg-white p-5 shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[14px] font-bold text-[#7054dc]">Filter Urutkan Tampilan</h3>
            <div className="mt-4 space-y-3">
              {['Urutkan A - Z', 'Urutkan Z - A', 'Urutkan dengan Nama Lengkap', 'Urutkan dengan Jenjang Sekolah', 'Urutkan dengan Tingkat Kelas', 'Urutkan dengan Sudah Dimasukan', 'Urutkan dengan Belum Dimasukan'].map((opt, i) => (
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
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[400px] rounded-[22px] border-2 border-[#7054dc] bg-white px-8 py-7 text-center shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[16px] font-bold italic text-[#7054dc]">Keluarkan Siswa dari Modul</h3>
            <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-[1.6] text-[#5a5d6a]">
              {removeTarget ? (
                <>Apakah anda yakin ingin mengeluarkan <strong>{removeTarget.nama}</strong> dari Modul ini?</>
              ) : (
                <>Apakah anda yakin ingin mengeluarkan <strong>{selectedCount} siswa</strong> berikut dari Modul ini?
                  {bulkRemoveNames.length > 0 && (
                    <span className="block mt-1 text-[#7a7e8a]">
                      ({bulkRemoveNames.join(', ')}{selectedCount > 3 ? `, dan ${selectedCount - 3} lainnya` : ''})
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removingLoading}
                className="h-[42px] flex-1 rounded-xl bg-[#f07167] text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#e85f55] disabled:opacity-60"
              >
                {removingLoading ? 'Memproses...' : 'Lanjutkan'}
              </button>
              <button
                type="button"
                onClick={() => setShowKeluarkanModal(false)}
                disabled={removingLoading}
                className="h-[42px] flex-1 rounded-xl border-2 border-[#d8d3f0] bg-white text-[13px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff] disabled:opacity-60"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
