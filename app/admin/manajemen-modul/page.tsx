'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useCallback, useMemo, useState } from 'react';
import {
  FaCheckSquare,
  FaFilter,
  FaRegSquare,
  FaSearch,
  FaTrash,
  FaEdit,
  FaBook,
} from 'react-icons/fa';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdMoreVert,
  MdPersonAddAlt1,
  MdSupervisorAccount,
} from 'react-icons/md';
import AdminHeader from '../../component/admin/AdminHeader';
import {
  AdminConfirmDialog,
  AdminToastContainer,
  useAdminToast,
} from '../components/AdminToast';
import { adminModulApi, adminKuisApi, adminDashboardApi } from '../../lib/api';
import type { AdminModulItem, AdminKuisItem } from '../../lib/types/admin';

type ActiveTab = 'modul' | 'kuis';

// Per-tab filter / sort options
const filterOptionsByTab: Record<
  ActiveTab,
  { id: string; label: string; sortFn: (a: AdminModulItem | AdminKuisItem, b: AdminModulItem | AdminKuisItem) => number }[]
> = {
  modul: [
    {
      id: 'nama-az',
      label: 'Judul Modul A → Z',
      sortFn: (a, b) => (a as AdminModulItem).moduleName.localeCompare((b as AdminModulItem).moduleName),
    },
    {
      id: 'nama-za',
      label: 'Judul Modul Z → A',
      sortFn: (a, b) => (b as AdminModulItem).moduleName.localeCompare((a as AdminModulItem).moduleName),
    },
    {
      id: 'guru-az',
      label: 'Nama Guru A → Z',
      sortFn: (a, b) => ((a as AdminModulItem).tutor?.fullName ?? '').localeCompare((b as AdminModulItem).tutor?.fullName ?? ''),
    },
    {
      id: 'siswa-banyak',
      label: 'Jml. Siswa Terbanyak',
      sortFn: (a, b) => ((b as AdminModulItem).totalSiswa ?? 0) - ((a as AdminModulItem).totalSiswa ?? 0),
    },
    {
      id: 'siswa-dikit',
      label: 'Jml. Siswa Tersedikit',
      sortFn: (a, b) => ((a as AdminModulItem).totalSiswa ?? 0) - ((b as AdminModulItem).totalSiswa ?? 0),
    },
  ],
  kuis: [
    {
      id: 'nama-az',
      label: 'Nama Kuis A → Z',
      sortFn: (a, b) => ((a as any).col1 || "").localeCompare((b as any).col1 || ""),
    },
    {
      id: 'nama-za',
      label: 'Nama Kuis Z → A',
      sortFn: (a, b) => ((b as any).col1 || "").localeCompare((a as any).col1 || ""),
    },
    {
      id: 'modul-az',
      label: 'Nama Modul A → Z',
      sortFn: (a, b) => ((a as any).moduleName || "").localeCompare((b as any).moduleName || ""),
    },
    {
      id: 'guru-az',
      label: 'Nama Guru A → Z',
      sortFn: (a, b) => (((a as any).tutor?.fullName) ?? '').localeCompare(((b as any).tutor?.fullName) ?? ''),
    },
  ],
};

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'purple' | 'orange';
}) {
  const isPurple = accent === 'purple';
  return (
    <div className={`relative min-h-[110px] overflow-hidden rounded-[22px] p-4 shadow-sm ${isPurple ? 'bg-[#e9e2ff]' : 'bg-[#f9eddc]'}`}>
      <div className="relative z-10 flex h-full flex-col">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border bg-white ${isPurple ? 'border-[#7054dc] text-[#7054dc]' : 'border-[#f39b39] text-[#f39b39]'}`}>
          <FaBook size={13} />
        </div>
        <div className={`ml-auto -mt-1 text-4xl font-semibold leading-none ${isPurple ? 'text-[#7054dc]' : 'text-[#f39b39]'}`}>
          {value}
        </div>
        <p className="mt-auto max-w-[120px] pb-1 text-sm font-semibold text-[#202126]">{label}</p>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-3 opacity-70">
        <Image
          src={isPurple ? '/assets/images/beranda-siswa/star-purple.png' : '/assets/images/beranda-siswa/star-orange.png'}
          alt="Decorative star"
          width={96}
          height={96}
        />
      </div>
    </div>
  );
}

export default function ManajemenModulPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('modul');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSortId, setActiveSortId] = useState<string>('nama-az');

  // Toast & confirm
  const { toasts, showToast, dismissToast } = useAdminToast();
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // API state
  const [modulList, setModulList] = useState<AdminModulItem[]>([]);
  const [kuisList, setKuisList] = useState<AdminKuisItem[]>([]);
  const [modulCount, setModulCount] = useState(0);
  const [kuisCount, setKuisCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [, modulRes, kuisRes] = await Promise.allSettled([
        adminDashboardApi.get(),
        adminModulApi.getAll({ limit: 200 }),
        adminKuisApi.getAll({ limit: 200 }),
      ]);
      if (modulRes.status === 'fulfilled') {
        const items = modulRes.value.items ?? [];
        setModulList(items);
        setModulCount(items.length);
      }
      if (kuisRes.status === 'fulfilled') {
        const items = kuisRes.value.items ?? [];
        setKuisList(items);
        const qCount = items.reduce((acc: number, m: any) => acc + (m.topiks?.reduce((a: number, t: any) => a + (t.quizzes?.length || 0), 0) || 0), 0);
        setKuisCount(qCount);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Current filter options per tab
  const filterOptions = filterOptionsByTab[activeTab] ?? [];

  // Filtered + sorted rows
  const processedRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // First, map the rows according to the active tab
    const baseRows = activeTab === 'modul' 
        ? modulList 
        : kuisList.flatMap((m) => {
            const quizzes: any[] = [];
            (m.topiks || []).forEach((t) => {
                (t.quizzes || []).forEach((quiz: any) => {
                    const rawQuestion = (quiz.question || "").replace(/<[^>]*>?/gm, "");
                    quizzes.push({
                        id: quiz.id,
                        moduleId: m.id,
                        moduleName: m.moduleName,
                        tutor: m.tutor,
                        col1: rawQuestion.length > 50 ? rawQuestion.substring(0, 50) + "..." : rawQuestion || "Soal Kuis",
                    });
                });
            });
            return quizzes;
        });

    // 1. Text search
    const searched = q
      ? baseRows.filter((r: any) => {
          if (activeTab === 'modul') {
            const m = r as AdminModulItem;
            return (
              (m.moduleName || "").toLowerCase().includes(q) ||
              (m.tutor?.fullName ?? '').toLowerCase().includes(q)
            );
          } else {
            return (
              (r.moduleName || "").toLowerCase().includes(q) ||
              (r.tutor?.fullName ?? '').toLowerCase().includes(q) ||
              (r.col1 || "").toLowerCase().includes(q)
            );
          }
        })
      : baseRows;

    // 2. Sort
    const sortFn = filterOptions.find((o) => o.id === activeSortId)?.sortFn;
    if (sortFn) {
      return [...searched].sort(sortFn as any);
    }
    return searched;
  }, [modulList, kuisList, activeTab, searchQuery, activeSortId, filterOptions]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = processedRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const currentRowIds = paginatedRows.map((r) => r.id);
  const allRowsSelected = currentRowIds.length > 0 && currentRowIds.every((id) => selectedRowIds[id]);

  // Reset page when tab or search changes
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // Reset sort when tab changes
  useEffect(() => { setActiveSortId('nama-az'); }, [activeTab]);

  const toggleSelectAll = () => {
    setSelectedRowIds((prev) => {
      const next = { ...prev };
      if (allRowsSelected) {
        currentRowIds.forEach((id) => { delete next[id]; });
      } else {
        currentRowIds.forEach((id) => { next[id] = true; });
      }
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = (id: string) => {
    setOpenActionMenuId(null);
    setDeleteTarget(id);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const ids = Array.isArray(deleteTarget) ? deleteTarget : [deleteTarget];
    setDeleteTarget(null);
    try {
      for (const id of ids) {
        if (activeTab === 'modul') await adminModulApi.delete(id);
        else await adminKuisApi.delete(id);
      }
      showToast('success', `${activeTab === 'modul' ? 'Modul' : 'Kuis'} berhasil dihapus.`);
      setSelectedRowIds({});
      fetchData();
    } catch {
      showToast('error', `Gagal menghapus ${activeTab === 'modul' ? 'modul' : 'kuis'}.`);
    }
  };

  const handleBulkDelete = () => {
    const ids = Object.keys(selectedRowIds).filter((id) => selectedRowIds[id]);
    if (ids.length === 0) return;
    setDeleteTarget(ids);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f6]">
      {deleteTarget && (
        <AdminConfirmDialog
          message={`Yakin ingin menghapus ${Array.isArray(deleteTarget) ? `${deleteTarget.length} ${activeTab}` : activeTab} ini? Tindakan tidak dapat dibatalkan.`}
          danger
          confirmLabel="Ya, Hapus"
          onConfirm={executeDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="px-2">
              <h1 className="mb-4 text-4xl font-bold text-[#7054dc]">Manajemen Modul</h1>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('modul'); setSearchQuery(''); }}
                  className={`rounded-full px-14 py-3.5 text-lg font-semibold transition-colors ${activeTab === 'modul' ? 'bg-[#7054dc] text-white shadow-md' : 'bg-[#ece7ff] text-[#7054dc] hover:bg-[#e2d8ff]'}`}
                >
                  Modul
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('kuis'); setSearchQuery(''); }}
                  className={`rounded-full px-14 py-3.5 text-lg font-semibold transition-colors ${activeTab === 'kuis' ? 'bg-[#7054dc] text-white shadow-md' : 'bg-[#ece7ff] text-[#7054dc] hover:bg-[#e2d8ff]'}`}
                >
                  Kuis
                </button>
              </div>
            </div>

            <div className="grid w-full max-w-[420px] shrink-0 gap-3 sm:grid-cols-2 xl:ml-auto">
              <StatCard label="Modul" value={modulCount} accent="purple" />
              <StatCard label="Kuis" value={kuisCount} accent="orange" />
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-[#e1dff0] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/admin/tambah-modul"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f39b39] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  <MdPersonAddAlt1 size={14} />
                  Tambah Modul
                </Link>
                <label className="flex h-8 w-full max-w-[340px] items-center gap-2 rounded-full border border-[#c8c9d0] bg-white px-3 text-sm text-[#8a8a96] sm:w-[320px]">
                  <FaSearch size={12} className="text-[#a0a3b0]" />
                  <input
                    type="text"
                    placeholder={activeTab === 'modul' ? 'Cari judul atau guru modul...' : 'Cari nama modul atau guru...'}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-transparent text-sm text-[#202126] placeholder:text-[#a0a3b0] outline-none"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  >
                    <FaFilter size={12} />
                    Filter
                    {activeSortId && (
                      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#7054dc]">
                        1
                      </span>
                    )}
                  </button>
                  {isFilterOpen && (
                    <div className="absolute right-0 top-11 z-30 w-[280px] rounded-2xl border border-[#7f67de] bg-white p-3 shadow-xl">
                      <p className="text-sm font-semibold text-[#7054dc]">Urutkan Tampilan</p>
                      <div className="mt-2 h-px w-full bg-[#c7b9ff]" />
                      <div className="mt-2 space-y-1">
                        {filterOptions.map((option) => {
                          const isSelected = activeSortId === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setActiveSortId(option.id);
                                setIsFilterOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#30323a] hover:bg-[#f5f1ff]"
                            >
                              <span className={isSelected ? 'text-[#7054dc]' : 'text-[#a8adb8]'}>
                                {isSelected ? <FaCheckSquare size={15} /> : <FaRegSquare size={15} />}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {Object.values(selectedRowIds).filter(Boolean).length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ece7ff] px-3 py-1 text-xs font-semibold text-[#7054dc]">
                    {Object.values(selectedRowIds).filter(Boolean).length} dipilih
                  </span>
                )}
                <button
                  onClick={handleBulkDelete}
                  disabled={Object.values(selectedRowIds).filter(Boolean).length === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f36e65] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaTrash size={12} />
                  Hapus
                </button>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e9e8f0] bg-white">
              <div className="min-h-[440px] overflow-x-auto">
                <table className="min-w-[980px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#ebebec] text-[13px] font-medium text-[#9a9ca7]">
                      <th className="w-[52px] px-4 py-3 text-left font-medium">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${allRowsSelected ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                        >
                          <FaCheckSquare size={12} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        {activeTab === 'modul' ? 'Judul Modul' : 'Nama Kuis'}
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        {activeTab === 'modul' ? 'Guru Modul' : 'Nama Modul'}
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        {activeTab === 'modul' ? 'Jumlah Siswa' : 'Nama Guru'}
                      </th>
                      <th className="w-[48px] px-4 py-3 text-left font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-32 text-center text-sm text-[#9396a3]">Memuat data...</td>
                      </tr>
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-32 text-center text-sm text-[#9396a3]">
                          {searchQuery ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada data.'}
                        </td>
                      </tr>
                    ) : activeTab === 'modul' ? (
                      (paginatedRows as AdminModulItem[]).map((row) => (
                        <tr key={row.id} className="border-t border-[#eef0f5] text-sm text-[#4d5260]">
                          <td className="px-4 py-3 align-middle">
                            <button
                              type="button"
                              onClick={() => toggleRow(row.id)}
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${selectedRowIds[row.id] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                            >
                              <FaCheckSquare size={12} />
                            </button>
                          </td>
                          <td className="px-4 py-3 align-middle font-medium text-[#5a5f6a]">{row.moduleName}</td>
                          <td className="px-4 py-3 align-middle">{row.tutor?.fullName ?? '-'}</td>
                          <td className="px-4 py-3 align-middle">{row.totalSiswa ?? 0} siswa</td>
                          <td className="px-4 py-3 align-middle text-right">
                            <div className="relative inline-flex">
                              <button
                                type="button"
                                onClick={() => setOpenActionMenuId((prev) => (prev === row.id ? null : row.id))}
                                className="text-[#8d909c] hover:text-[#7054dc]"
                              >
                                <MdMoreVert size={18} />
                              </button>
                              {openActionMenuId === row.id && (
                                <div className="absolute right-full mr-2 top-0 z-30 w-[168px] rounded-2xl border border-[#e6e8ef] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                                  <Link
                                    href={`/admin/manajemen-modul/edit?id=${row.id}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f39b39] hover:bg-[#fff8ef]"
                                  >
                                    <FaEdit size={13} />
                                    Edit
                                  </Link>
                                  <Link
                                    href={`/admin/manajemen-modul/edit/siswa?id=${row.id}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#7054dc] hover:bg-[#f7f6ff]"
                                  >
                                    <MdSupervisorAccount size={14} />
                                    Management Siswa
                                  </Link>

                                  <button
                                    onClick={() => handleDelete(row.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f36e65] hover:bg-[#fff3f2]"
                                  >
                                    <FaTrash size={13} />
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      (paginatedRows as any[]).map((row) => (
                        <tr key={row.id} className="border-t border-[#eef0f5] text-sm text-[#4d5260]">
                          <td className="px-4 py-3 align-middle">
                            <button
                              type="button"
                              onClick={() => toggleRow(row.id)}
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${selectedRowIds[row.id] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                            >
                              <FaCheckSquare size={12} />
                            </button>
                          </td>
                          <td className="px-4 py-3 align-middle font-medium text-[#5a5f6a] max-w-[260px] truncate">{row.col1}</td>
                          <td className="px-4 py-3 align-middle">{row.moduleName}</td>
                          <td className="px-4 py-3 align-middle">
                            {row.tutor?.fullName ?? '-'}
                          </td>
                          <td className="px-4 py-3 align-middle text-right">
                            <div className="relative inline-flex">
                              <button
                                type="button"
                                onClick={() => setOpenActionMenuId((prev) => (prev === row.id ? null : row.id))}
                                className="text-[#8d909c] hover:text-[#7054dc]"
                              >
                                <MdMoreVert size={18} />
                              </button>
                              {openActionMenuId === row.id && (
                                <div className="absolute right-full mr-2 top-0 z-30 w-[144px] rounded-2xl border border-[#e6e8ef] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                                  <Link
                                    href={`/admin/manajemen-modul/edit/konten?id=${row.moduleId}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f39b39] hover:bg-[#fff8ef]"
                                  >
                                    <FaEdit size={13} />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(row.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f36e65] hover:bg-[#fff3f2]"
                                  >
                                    <FaTrash size={13} />
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#f0eff6] px-4 py-3">
                <p className="text-xs text-[#9396a3]">
                  {processedRows.length} data · Hal {safePage}/{totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors text-[#7054dc] hover:bg-[#ede9fb] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MdKeyboardArrowLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safePage) <= 1
                    )
                    .reduce<(number | '...')[]>((acc, page, idx, arr) => {
                      if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#9396a3]">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item as number)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                            item === safePage
                              ? 'bg-[#7054dc] text-white shadow-sm'
                              : 'text-[#6b7080] hover:bg-[#ede9fb] hover:text-[#7054dc]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors text-[#7054dc] hover:bg-[#ede9fb] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MdKeyboardArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
