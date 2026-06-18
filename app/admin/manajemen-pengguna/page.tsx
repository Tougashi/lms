'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  FaCheckSquare,
  FaFilter,
  FaRegSquare,
  FaSearch,
  FaTrash,
  FaEdit,
  FaUsers,
  FaChartBar,
} from 'react-icons/fa';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdMoreVert,
  MdPersonAddAlt1,
} from 'react-icons/md';
import AdminHeader from '../../component/admin/AdminHeader';
import {
  AdminConfirmDialog,
  AdminToastContainer,
  useAdminToast,
} from '../components/AdminToast';
import {
  adminTutorApi,
  adminSiswaApi,
  adminDashboardApi,
  adminUserApi,
} from '../../lib/api';
import type { AdminTutorItem, AdminSiswaItem, AdminUserItem } from '../../lib/types/admin';

type UserTab = 'guru' | 'siswa' | 'admin';

// Per-tab filter / sort options
const filterOptionsByTab: Record<
  UserTab,
  { id: string; label: string; sortKey: string; dir: 'asc' | 'desc' }[]
> = {
  guru: [
    { id: 'nama-az', label: 'Nama Lengkap A → Z', sortKey: 'nama', dir: 'asc' },
    { id: 'nama-za', label: 'Nama Lengkap Z → A', sortKey: 'nama', dir: 'desc' },
    { id: 'email-az', label: 'Email A → Z', sortKey: 'email', dir: 'asc' },
    { id: 'nowa-az', label: 'No WA A → Z', sortKey: 'nowa', dir: 'asc' },
    { id: 'aktif', label: 'Tampilkan Aktif Dulu', sortKey: 'status', dir: 'desc' },
    { id: 'nonaktif', label: 'Tampilkan Nonaktif Dulu', sortKey: 'status', dir: 'asc' },
  ],
  siswa: [
    { id: 'nama-az', label: 'Nama Lengkap A → Z', sortKey: 'nama', dir: 'asc' },
    { id: 'nama-za', label: 'Nama Lengkap Z → A', sortKey: 'nama', dir: 'desc' },
    { id: 'email-az', label: 'Email A → Z', sortKey: 'email', dir: 'asc' },
    { id: 'aktif', label: 'Tampilkan Aktif Dulu', sortKey: 'status', dir: 'desc' },
    { id: 'nonaktif', label: 'Tampilkan Nonaktif Dulu', sortKey: 'status', dir: 'asc' },
    { id: 'jenjang-az', label: 'Tingkat A → Z', sortKey: 'jenjang', dir: 'asc' },
  ],
  admin: [
    { id: 'nama-az', label: 'Nama Lengkap A → Z', sortKey: 'nama', dir: 'asc' },
    { id: 'nama-za', label: 'Nama Lengkap Z → A', sortKey: 'nama', dir: 'desc' },
    { id: 'email-az', label: 'Email A → Z', sortKey: 'email', dir: 'asc' },
    { id: 'username-az', label: 'Username A → Z', sortKey: 'username', dir: 'asc' },
    { id: 'aktif', label: 'Tampilkan Aktif Dulu', sortKey: 'status', dir: 'desc' },
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
    <div className={`relative min-h-[118px] overflow-hidden rounded-[22px] p-4 shadow-sm ${isPurple ? 'bg-[#e9e2ff]' : 'bg-[#f9eddc]'}`}>
      <div className="relative z-10 flex h-full flex-col">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border bg-white ${isPurple ? 'border-[#7054dc] text-[#7054dc]' : 'border-[#f39b39] text-[#f39b39]'}`}>
          <FaUsers size={14} />
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

// Helpers to get sortable values per row
function getGuruSortValue(r: AdminTutorItem, sortKey: string): string {
  switch (sortKey) {
    case 'nama': return r.fullName?.toLowerCase() ?? '';
    case 'email': return r.email?.toLowerCase() ?? '';
    case 'nowa': return r.whatsappNumber?.toLowerCase() ?? '';
    case 'status': return r.isActive !== false ? 'z' : 'a'; // z = aktif sorts last in asc
    default: return '';
  }
}
function getSiswaSortValue(r: AdminSiswaItem, sortKey: string): string {
  switch (sortKey) {
    case 'nama': return r.nama_lengkap?.toLowerCase() ?? '';
    case 'email': return r.email?.toLowerCase() ?? '';
    case 'status': return r.isActive !== false ? 'z' : 'a';
    case 'jenjang': return r.jenjang?.toLowerCase() ?? '';
    default: return '';
  }
}
function getAdminSortValue(r: AdminUserItem, sortKey: string): string {
  switch (sortKey) {
    case 'nama': return r.fullName?.toLowerCase() ?? '';
    case 'email': return r.email?.toLowerCase() ?? '';
    case 'username': return r.username?.toLowerCase() ?? '';
    case 'status': return r.isActive !== false ? 'z' : 'a';
    default: return '';
  }
}

export default function ManajemenPenggunaPage() {
  const [activeTab, setActiveTab] = useState<UserTab>('guru');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSortId, setActiveSortId] = useState<string>('nama-az');

  // Toast & confirm
  const { toasts, showToast, dismissToast } = useAdminToast();
  const [confirmState, setConfirmState] = useState<{ id: string; action: 'delete' | 'deactivate' | 'activate'; bulkIds?: string[] } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // API state
  const [guruList, setGuruList] = useState<AdminTutorItem[]>([]);
  const [siswaList, setSiswaList] = useState<AdminSiswaItem[]>([]);
  const [adminList, setAdminList] = useState<AdminUserItem[]>([]);
  const [tutorCount, setTutorCount] = useState(0);
  const [siswaCount, setSiswaCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, tutorRes, siswaRes, adminRes] = await Promise.allSettled([
        adminDashboardApi.get(),
        adminTutorApi.getAll(),
        adminSiswaApi.getAll({ limit: 1000 }),
        adminUserApi.getAll(),
      ]);
      if (dashRes.status === 'fulfilled') {
        setTutorCount(dashRes.value.activeTutors);
        setSiswaCount(dashRes.value.activeStudents);
      }
      if (tutorRes.status === 'fulfilled') setGuruList(tutorRes.value);
      if (siswaRes.status === 'fulfilled') setSiswaList(siswaRes.value.items ?? []);
      if (adminRes.status === 'fulfilled') {
        setAdminList(adminRes.value);
        setAdminCount(adminRes.value.length);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Search via API (debounced) when query >= 2 chars
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      const t = setTimeout(async () => {
        try {
          if (activeTab === 'guru') {
            const res = await adminTutorApi.search(trimmed);
            setGuruList(res);
          } else if (activeTab === 'siswa') {
            const res = await adminSiswaApi.search(trimmed);
            setSiswaList(res);
          }
        } catch { /* ignore */ }
      }, 400);
      return () => clearTimeout(t);
    } else if (trimmed.length === 0) {
      fetchData();
    }
  }, [searchQuery, activeTab, fetchData]);

  // Current filter options per tab
  const filterOptions = filterOptionsByTab[activeTab] ?? [];

  const currentRawRows = activeTab === 'guru' ? guruList : activeTab === 'siswa' ? siswaList : adminList;

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Text search
    let rows: typeof currentRawRows;
    if (!q) {
      rows = currentRawRows;
    } else if (activeTab === 'guru') {
      rows = (currentRawRows as AdminTutorItem[]).filter((r) =>
        r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) ||
        (r.whatsappNumber ?? '').toLowerCase().includes(q)
      ) as typeof currentRawRows;
    } else if (activeTab === 'siswa') {
      rows = (currentRawRows as AdminSiswaItem[]).filter((r) =>
        r.nama_lengkap.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      ) as typeof currentRawRows;
    } else {
      rows = (currentRawRows as AdminUserItem[]).filter((r) =>
        r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) ||
        (r.username ?? '').toLowerCase().includes(q)
      ) as typeof currentRawRows;
    }

    // 2. Sort based on active sort option
    const sortOpt = filterOptions.find((o) => o.id === activeSortId);
    if (!sortOpt) return rows;

    const { sortKey, dir } = sortOpt;
    return [...rows].sort((a, b) => {
      let av = '';
      let bv = '';
      if (activeTab === 'guru') {
        av = getGuruSortValue(a as AdminTutorItem, sortKey);
        bv = getGuruSortValue(b as AdminTutorItem, sortKey);
      } else if (activeTab === 'siswa') {
        av = getSiswaSortValue(a as AdminSiswaItem, sortKey);
        bv = getSiswaSortValue(b as AdminSiswaItem, sortKey);
      } else {
        av = getAdminSortValue(a as AdminUserItem, sortKey);
        bv = getAdminSortValue(b as AdminUserItem, sortKey);
      }
      const cmp = av.localeCompare(bv);
      return dir === 'asc' ? cmp : -cmp;
    }) as typeof currentRawRows;
  }, [currentRawRows, searchQuery, activeTab, activeSortId, filterOptions]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when tab or search changes
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // Reset sort when tab changes
  useEffect(() => { setActiveSortId('nama-az'); }, [activeTab]);

  const allRowsSelected =
    filteredRows.length > 0 && filteredRows.every((row) => selectedRowIds[row.id]);

  const toggleSelectAll = () => {
    setSelectedRowIds((prev) => {
      const next = { ...prev };
      if (allRowsSelected) {
        filteredRows.forEach((row) => { delete next[row.id]; });
      } else {
        filteredRows.forEach((row) => { next[row.id] = true; });
      }
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeactivate = (id: string) => {
    setOpenActionMenuId(null);
    setConfirmState({ id, action: 'deactivate' });
  };

  const handleActivate = (id: string) => {
    setOpenActionMenuId(null);
    setConfirmState({ id, action: 'activate' });
  };

  const handleDelete = (id: string) => {
    setOpenActionMenuId(null);
    setConfirmState({ id, action: 'delete' });
  };

  const executeConfirm = async () => {
    if (!confirmState) return;
    const { id, action, bulkIds } = confirmState;
    setConfirmState(null);
    const idsToProcess = bulkIds ?? [id];
    try {
      if (action === 'delete') {
        for (const targetId of idsToProcess) {
          if (activeTab === 'guru') await adminTutorApi.delete(targetId);
          else if (activeTab === 'siswa') await adminSiswaApi.delete(targetId);
          else await adminUserApi.delete(targetId);
        }
        setSelectedRowIds({});
        showToast('success', `${idsToProcess.length > 1 ? `${idsToProcess.length} data` : 'Data'} berhasil dihapus.`);
      } else if (action === 'deactivate') {
        if (activeTab === 'guru') await adminTutorApi.deactivate(id);
        else if (activeTab === 'siswa') await adminSiswaApi.deactivate(id);
        else await adminUserApi.deactivate(id);
        showToast('success', 'Akun berhasil dinonaktifkan.');
      } else if (action === 'activate') {
        if (activeTab === 'guru') await adminTutorApi.activate(id);
        else if (activeTab === 'siswa') await adminSiswaApi.activate(id);
        else await adminUserApi.activate(id);
        showToast('success', 'Akun berhasil diaktifkan.');
      }
      fetchData();
    } catch {
      showToast('error', action === 'delete' ? 'Gagal menghapus data.' : `Gagal ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} akun.`);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedRowIds).filter((id) => selectedRowIds[id]);
    if (ids.length === 0) return;
    setConfirmState({ id: '__bulk__', action: 'delete', bulkIds: ids });
  };

  const tableColumns =
    activeTab === 'guru'
      ? ['Nama Lengkap', 'Tingkat Pengajar', 'Bidang Pengajar', 'No Wa', 'Email', 'Status']
      : activeTab === 'siswa'
      ? ['Nama Lengkap', 'Tingkat Siswa', 'Kelas', 'Email', 'Status']
      : ['Nama Lengkap', 'Username', 'Email', 'No Wa', 'Status'];

  function getGuruCols(r: AdminTutorItem) {
    return [r.fullName, r.pekerjaan || '-', r.prodi || '-', r.whatsappNumber ?? '-', r.email, r.isActive !== false ? 'Aktif' : 'Nonaktif'];
  }

  function getSiswaCols(r: AdminSiswaItem) {
    if (r.role === 'umum' || r.studentType === 'UMUM') {
      return [r.nama_lengkap, 'Umum', 'Umum', r.email, r.isActive !== false ? 'Aktif' : 'Nonaktif'];
    }
    return [r.nama_lengkap, r.jenjang ?? '-', r.kelas_sekolah ?? '-', r.email, r.isActive !== false ? 'Aktif' : 'Nonaktif'];
  }

  function getAdminCols(r: AdminUserItem) {
    return [r.fullName, r.username, r.email, r.whatsappNumber ?? '-', r.isActive !== false ? 'Aktif' : 'Nonaktif'];
  }

  return (
    <div className="min-h-screen bg-[#f3f3f6]">
      {/* Custom confirm dialog */}
      {confirmState && (
        <AdminConfirmDialog
          message={
            confirmState.action === 'delete'
              ? confirmState.bulkIds
                ? `Yakin ingin menghapus ${confirmState.bulkIds.length} data yang dipilih? Tindakan ini tidak dapat dibatalkan.`
                : 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'
              : confirmState.action === 'activate'
              ? 'Yakin ingin mengaktifkan akun ini?'
              : 'Yakin ingin menonaktifkan akun ini?'
          }
          danger={confirmState.action === 'delete'}
          confirmLabel={
            confirmState.action === 'delete'
              ? 'Ya, Hapus'
              : confirmState.action === 'activate'
              ? 'Ya, Aktifkan'
              : 'Ya, Nonaktifkan'
          }
          onConfirm={executeConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
      {/* Toast notifications */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

          <div className="mt-3 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="px-2">
              <h1 className="mb-4 text-4xl font-bold text-[#7054dc]">Manajemen Pengguna</h1>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('guru'); setSearchQuery(''); }}
                  className={`rounded-full px-14 py-3.5 text-lg font-semibold transition-colors ${activeTab === 'guru' ? 'bg-[#7054dc] text-white shadow-md' : 'bg-[#ece7ff] text-[#7054dc] hover:bg-[#e2d8ff]'}`}
                >
                  Guru
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('siswa'); setSearchQuery(''); }}
                  className={`rounded-full px-14 py-3.5 text-lg font-semibold transition-colors ${activeTab === 'siswa' ? 'bg-[#7054dc] text-white shadow-md' : 'bg-[#ece7ff] text-[#7054dc] hover:bg-[#e2d8ff]'}`}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('admin'); setSearchQuery(''); }}
                  className={`rounded-full px-14 py-3.5 text-lg font-semibold transition-colors ${activeTab === 'admin' ? 'bg-[#7054dc] text-white shadow-md' : 'bg-[#ece7ff] text-[#7054dc] hover:bg-[#e2d8ff]'}`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="grid w-full max-w-[540px] shrink-0 gap-3 sm:grid-cols-3 xl:ml-auto">
              <StatCard label="Guru" value={tutorCount} accent="purple" />
              <StatCard label="Siswa" value={siswaCount} accent="orange" />
              <StatCard label="Admin" value={adminCount} accent="purple" />
            </div>
          </div>

          <div className="rounded-[22px] border border-[#e1dff0] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mt-6">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={activeTab === 'guru' ? '/admin/manajemen-pengguna/tambah-guru' : activeTab === 'siswa' ? '/admin/manajemen-pengguna/tambah-siswa' : '/admin/manajemen-pengguna/tambah-admin'}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f39b39] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  <MdPersonAddAlt1 size={14} />
                  {activeTab === 'guru' ? 'Tambah Guru' : activeTab === 'siswa' ? 'Tambah Siswa' : 'Tambah Admin'}
                </Link>
                <label className="flex h-8 w-full max-w-[340px] items-center gap-2 rounded-full border border-[#c8c9d0] bg-white px-3 text-sm text-[#8a8a96] sm:w-[320px]">
                  <FaSearch size={12} className="text-[#a0a3b0]" />
                  <input
                    type="text"
                    placeholder="Pencarian"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                      {tableColumns.map((column) => (
                        <th key={column} className="px-4 py-3 text-left font-medium">{column}</th>
                      ))}
                      <th className="w-[48px] px-4 py-3 text-left font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={tableColumns.length + 2} className="py-32 text-center text-sm text-[#9396a3]">
                          Memuat data...
                        </td>
                      </tr>
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={tableColumns.length + 2} className="py-32 text-center text-sm text-[#9396a3]">
                          Tidak ada data.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedRows.map((row) => {
                          const cols = activeTab === 'guru'
                            ? getGuruCols(row as AdminTutorItem)
                            : activeTab === 'siswa'
                            ? getSiswaCols(row as AdminSiswaItem)
                            : getAdminCols(row as AdminUserItem);
                          return (
                            <tr key={row.id} className="border-t border-[#eef0f5] text-sm text-[#4d5260]">
                              <td className="px-4 py-4 align-middle">
                                <button
                                  type="button"
                                  onClick={() => toggleRow(row.id)}
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${selectedRowIds[row.id] ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'}`}
                                >
                                  <FaCheckSquare size={12} />
                                </button>
                              </td>
                              <td className="px-4 py-4 align-middle font-medium text-[#5a5f6a]">
                                {activeTab === 'siswa' ? (
                                  <Link href={`/admin/nilai-siswa?studentId=${row.id}`} className="hover:text-[#7054dc] hover:underline transition-colors">
                                    {cols[0]}
                                  </Link>
                                ) : cols[0]}
                              </td>
                              {cols.slice(1).map((colText, idx) => (
                                <td key={idx} className="px-4 py-4 align-middle">
                                  {colText === 'Aktif' || colText === 'Nonaktif' ? (
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colText === 'Aktif' ? 'bg-[#e4f8ec] text-[#16a34a]' : 'bg-[#fee2e2] text-[#ef4444]'}`}>
                                      {colText}
                                    </span>
                                  ) : (
                                    colText
                                  )}
                                </td>
                              ))}
                              <td className="px-4 py-4 align-middle text-right">
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
                                        href={activeTab === 'guru' ? `/admin/manajemen-pengguna/edit-guru?id=${row.id}` : activeTab === 'siswa' ? `/admin/manajemen-pengguna/edit-siswa?id=${row.id}` : `/admin/manajemen-pengguna/edit-admin?id=${row.id}`}
                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#7054dc] hover:bg-[#f7f6ff]"
                                      >
                                        <FaEdit size={13} />
                                        Edit
                                      </Link>
                                      {activeTab === 'siswa' && (
                                        <Link
                                          href={`/admin/nilai-siswa?studentId=${row.id}`}
                                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f39b39] hover:bg-[#fff8ef]"
                                        >
                                          <FaChartBar size={13} />
                                          Lihat Nilai
                                        </Link>
                                      )}
                                      {(row as any).isActive !== false ? (
                                        <button
                                          onClick={() => handleDeactivate(row.id)}
                                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#60636d] hover:bg-[#f7f6ff]"
                                        >
                                          <FaUsers size={13} />
                                          Nonaktifkan
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleActivate(row.id)}
                                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#16a34a] hover:bg-[#e4f8ec]"
                                        >
                                          <FaCheckSquare size={13} />
                                          Aktifkan
                                        </button>
                                      )}
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
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#f0eff6] px-4 py-3">
                <p className="text-xs text-[#9396a3]">
                  {filteredRows.length} data · Hal {safePage}/{totalPages}
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
                    .reduce<(number | '...') []>((acc, page, idx, arr) => {
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
