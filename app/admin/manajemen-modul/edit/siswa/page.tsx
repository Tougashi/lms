'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MdMoreVert,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdPersonAddAlt1,
} from 'react-icons/md';
import { FiCheckSquare, FiUsers } from 'react-icons/fi';
import { FaFilter, FaTrash, FaCheckSquare as FaCheckSq, FaSearch, FaSpinner } from 'react-icons/fa';
import AdminHeader from '../../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../../components/AdminModuleSidebar';
import { adminModulApi, adminSiswaApi } from '../../../../lib/api';
import type { AdminModulSiswaItem, AdminSiswaItem } from '../../../../lib/types/admin';

/* ─── action menu ─── */
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

/* ─── filter options ─── */
const FILTER_OPTS = [
  'Urutkan A - Z', 'Urutkan Z - A', 'Urutkan dengan Nama Lengkap',
  'Urutkan dengan Jenjang Sekolah', 'Urutkan dengan Tingkat Kelas',
  'Urutkan dengan Sudah Dimasukan', 'Urutkan dengan Belum Dimasukan',
];

function EditModulSiswaContent() {
  const searchParams = useSearchParams();
  const modulId = searchParams.get('id') ?? '';

  /* enrolled siswa state */
  const [siswaList, setSiswaList] = useState<AdminModulSiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  /* ui state */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showKeluarkanModal, setShowKeluarkanModal] = useState(false);
  const [filterChecked, setFilterChecked] = useState<Record<number, boolean>>({ 0: true, 1: true });

  /* tambah modal state */
  const [availableSiswa, setAvailableSiswa] = useState<AdminSiswaItem[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableNextCursor, setAvailableNextCursor] = useState<string | null>(null);
  const [tambahSearch, setTambahSearch] = useState('');
  const [addingSiswaIds, setAddingSiswaIds] = useState<Set<string>>(new Set());
  const [tambahFeedback, setTambahFeedback] = useState('');

  /* remove state */
  const [removeTarget, setRemoveTarget] = useState<{ id: string; nama: string } | null>(null);
  const [removingLoading, setRemovingLoading] = useState(false);

  /* feedback banner */
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

  function showFeedback(msg: string, type: 'success' | 'error') {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 4000);
  }

  /* ─── enrolled students fetch ─── */
  const fetchStudents = useCallback(async (cursor?: string) => {
    if (!modulId) return;
    setLoading(true);
    setLoadError('');
    try {
      const result = await adminModulApi.getStudents(modulId, { cursor, limit: 10 });
      setSiswaList(result.items);
      setNextCursor(result.next_cursor ?? null);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  }, [modulId]);

  useEffect(() => {
    if (modulId) {
      setCursorHistory([]);
      setCurrentPage(0);
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [modulId, fetchStudents]);

  const enrolledSiswaIds = useMemo(() => new Set(siswaList.map((s) => s.siswaId)), [siswaList]);

  /* ─── available siswa fetch ─── */
  const fetchAvailableSiswa = useCallback(async (cursor?: string) => {
    setAvailableLoading(true);
    try {
      const result = await adminSiswaApi.getAll({ cursor, limit: 10 });
      if (cursor) {
        setAvailableSiswa((prev) => [...prev, ...(result.items ?? [])]);
      } else {
        setAvailableSiswa(result.items ?? []);
      }
      setAvailableNextCursor(result.next_cursor ?? null);
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
      setAvailableSiswa(result ?? []);
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
      setTambahFeedback('Siswa berhasil ditambahkan ke modul');
      showFeedback('Siswa berhasil ditambahkan ke modul', 'success');
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

  /* ─── pagination ─── */
  function handleNextPage() {
    if (!nextCursor) return;
    setCursorHistory((prev) => [...prev, nextCursor]);
    setCurrentPage((p) => p + 1);
    fetchStudents(nextCursor);
  }

  function handlePrevPage() {
    if (cursorHistory.length === 0) return;
    const prev = [...cursorHistory];
    prev.pop();
    setCursorHistory(prev);
    setCurrentPage((p) => p - 1);
    fetchStudents(prev.length > 0 ? prev[prev.length - 1] : undefined);
  }

  const hasPrev = cursorHistory.length > 0;

  /* ─── select helpers ─── */
  const filteredRows = useMemo(
    () => siswaList.filter(
      (row) =>
        row.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    [siswaList, searchQuery],
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

  /* ─── remove handlers ─── */
  function handleRemoveFromActionMenu(progressId: string) {
    const row = siswaList.find((s) => s.id === progressId);
    if (row) {
      setRemoveTarget({ id: row.siswaId, nama: row.nama_lengkap });
      setOpenActionMenuId(null);
      setShowKeluarkanModal(true);
    }
  }

  function handleBulkRemove() {
    if (selectedCount === 0) { showFeedback('Pilih siswa terlebih dahulu', 'error'); return; }
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
        const selectedIds = Object.keys(selectedRowIds).filter((k) => selectedRowIds[k]);
        const targets = siswaList.filter((s) => selectedIds.includes(s.id));
        for (const t of targets) {
          await adminModulApi.unassign({ moduleId: modulId, studentId: t.siswaId });
        }
        setSiswaList((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
        setSelectedRowIds({});
        showFeedback(`${targets.length} siswa berhasil dikeluarkan dari modul`, 'success');
      }
      setShowKeluarkanModal(false);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Gagal mengeluarkan siswa', 'error');
    } finally {
      setRemovingLoading(false);
    }
  }

  const bulkRemoveNames = siswaList
    .filter((s) => selectedRowIds[s.id])
    .slice(0, 3)
    .map((s) => s.nama_lengkap);

  /* ─── render ─── */
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />

      <main className="flex w-full">
        <AdminModuleSidebar
          basePath="/admin/manajemen-modul/edit"
          modulId={modulId}
          title="Edit Modul"
          showSiswaTab={true}
        />

        <section className="flex-1 px-4 pb-10 pt-6 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[520px]">
              <h1 className="text-[18px] font-bold text-[#232530]">Management Siswa di Modul</h1>
              <p className="mt-1.5 text-[13px] leading-[1.65] text-[#7a7e8a]">
                Kelola siswa dan pengguna umum yang terdaftar dalam modul ini.
                Tambah atau keluarkan peserta sesuai kebutuhan.
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-[#f0e6d3] bg-[#fffaf2] px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f39b39] text-white">
                  <FiUsers size={18} />
                </div>
                <div>
                  <p className="text-[22px] font-bold leading-none text-[#f39b39]">{siswaList.length}</p>
                  <p className="mt-0.5 text-[11px] text-[#7a7e8a]">Siswa Terdaftar</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-[15px] font-bold text-[#232530]">Siswa Terdaftar di Modul ini</h2>

          {/* No module ID warning */}
          {!modulId && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
              ID Modul tidak ditemukan. Kembali ke halaman Manajemen Modul dan buka kembali halaman Edit.
            </div>
          )}

          {/* Feedback banner */}
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
          <div className="mt-4 flex flex-wrap items-center gap-3 mb-3">
            <button
              type="button"
              onClick={handleModalOpen}
              className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#5f46cc]"
            >
              <MdPersonAddAlt1 size={14} /> Tambah Siswa
            </button>

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
              className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#5f46cc]"
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
              onClick={handleBulkRemove}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f36e65] px-4 py-2 text-[12px] font-semibold text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e85f55] transition-colors"
            >
              <FaTrash size={10} /> Hapus
            </button>
          </div>

          {/* Table */}
          <div className="rounded-[18px] border border-[#e9e8f0] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#ebebec] text-[11px] font-medium text-[#9a9ca7]">
                    <th className="w-[44px] px-3 py-3 text-left">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${allRowsSelected ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                      >
                        <FaCheckSq size={10} />
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
                        <FaSpinner className="mx-auto mb-2 animate-spin" size={16} />
                        Memuat data...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-red-500">
                        {loadError}
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-[13px] text-[#9396a3]">
                        {searchQuery ? 'Siswa tidak ditemukan.' : 'Belum ada siswa terdaftar di modul ini.'}
                      </td>
                    </tr>
                  ) : filteredRows.map((row) => (
                    <tr key={row.id} className="border-t border-[#f0eef5] text-[12px] text-[#4d5260]">
                      <td className="px-3 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleRow(row.id)}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-sm border ${selectedRowIds[row.id] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                        >
                          <FaCheckSq size={10} />
                        </button>
                      </td>
                      <td className="px-3 py-3 align-middle font-medium text-[#5a5f6a]">
                        <Link href={`/admin/nilai-siswa?studentId=${row.id}`} className="hover:text-[#7054dc] hover:underline transition-colors">
                          {row.nama_lengkap}
                        </Link>
                      </td>
                      <td className="px-3 py-3 align-middle">{row.kelas_sekolah ?? '-'}</td>
                      <td className="px-3 py-3 align-middle">{row.email}</td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-[#e8e6f0]">
                            <div
                              className="h-full rounded-full bg-[#7054dc] transition-all"
                              style={{ width: `${Math.round(row.progressPercentage ?? 0)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#7a7e8a]">{Math.round(row.progressPercentage ?? 0)}%</span>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#eef0f5] px-4 py-3">
              <p className="text-[11px] text-[#9396a3]">{siswaList.length} pengguna terdaftar</p>
              <div className="flex items-center gap-1">
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
            </div>
          </div>
        </section>
      </main>

      {/* ═══ MODAL: Tambah Siswa ═══ */}
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
                  ×
                </button>
              </div>
            </div>

            {tambahFeedback && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[12px] text-green-700">
                {tambahFeedback}
              </div>
            )}

            <div className="mt-4 max-h-[360px] overflow-y-auto overflow-x-auto">
              {availableLoading && availableSiswa.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-[13px] text-[#7a7e8a]">
                  <FaSpinner className="mr-2 animate-spin" size={14} />
                  Memuat data siswa...
                </div>
              ) : availableSiswa.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[#7a7e8a]">
                  {tambahSearch ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'}
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="sticky top-0 bg-[#ebebec] text-[11px] font-medium text-[#9a9ca7]">
                      <th className="px-3 py-2.5 text-left font-medium">Pengguna</th>
                      <th className="px-3 py-2.5 text-left font-medium">Kelas</th>
                      <th className="px-3 py-2.5 text-left font-medium">Email</th>
                      <th className="px-3 py-2.5 text-left font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableSiswa.map((siswa) => {
                      const isEnrolled = enrolledSiswaIds.has(siswa.id);
                      const isAdding = addingSiswaIds.has(siswa.id);
                      return (
                        <tr key={siswa.id} className="border-t border-[#f0eef5] text-[12px] text-[#4d5260]">
                          <td className="px-3 py-2.5 font-medium text-[#5a5f6a]">{siswa.nama_lengkap}</td>
                          <td className="px-3 py-2.5">{siswa.kelas_sekolah ?? '-'}</td>
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
                                {isAdding ? <FaSpinner className="animate-spin" size={10} /> : <MdPersonAddAlt1 size={12} />}
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

            {availableNextCursor && !tambahSearch && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => fetchAvailableSiswa(availableNextCursor)}
                  disabled={availableLoading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d3f0] bg-white px-4 py-1.5 text-[11px] font-semibold text-[#7054dc] hover:bg-[#f5f2ff] disabled:opacity-50"
                >
                  {availableLoading && <FaSpinner className="animate-spin" size={10} />}
                  Muat Lainnya
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ MODAL: Filter ═══ */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowFilterModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[280px] rounded-[22px] border-2 border-[#7054dc] bg-white p-5 shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[14px] font-bold text-[#7054dc]">Filter Urutkan Tampilan</h3>
            <div className="mt-4 space-y-3">
              {FILTER_OPTS.map((opt, i) => (
                <label key={i} className="flex cursor-pointer items-center gap-2.5 text-[12px] text-[#232530]">
                  <button
                    type="button"
                    onClick={() => setFilterChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${filterChecked[i] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de]'}`}
                  >
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => !removingLoading && setShowKeluarkanModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[400px] rounded-[22px] border-2 border-[#7054dc] bg-white px-8 py-7 text-center shadow-[0_20px_48px_rgba(112,84,220,0.18)]">
            <h3 className="text-[16px] font-bold italic text-[#7054dc]">Keluarkan Siswa dari Modul</h3>
            <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-[1.6] text-[#5a5d6a]">
              {removeTarget ? (
                <>Apakah anda yakin ingin mengeluarkan <strong>{removeTarget.nama}</strong> dari Modul ini?</>
              ) : (
                <>
                  Apakah anda yakin ingin mengeluarkan <strong>{selectedCount} siswa</strong> dari Modul ini?
                  {bulkRemoveNames.length > 0 && (
                    <span className="mt-1 block text-[#7a7e8a]">
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

export default function EditModulSiswaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <EditModulSiswaContent />
    </Suspense>
  );
}
