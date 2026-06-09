"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FaBookOpen,
    FaCheck,
    FaCheckSquare,
    FaRegSquare,
    FaDatabase,
    FaEllipsisV,
    FaRegEdit,
    FaFilter,
    FaHistory,
    FaPaperPlane,
    FaSearch,
    FaTrash,
    FaChartBar,
} from "react-icons/fa";
import {
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
    MdOutlineKeyboardArrowRight,
    MdPersonAddAlt1,
} from "react-icons/md";
import AdminHeader from "../../component/admin/AdminHeader";
import {
    AdminConfirmDialog,
    AdminToastContainer,
    useAdminToast,
} from "../components/AdminToast";
import {
    adminDashboardApi,
    adminTutorApi,
    adminSiswaApi,
    adminModulApi,
    adminKuisApi,
} from "../../lib/api";
import type {
    AdminDashboardStats,
    AdminTutorItem,
    AdminSiswaItem,
    AdminModulItem,
    AdminKuisItem,
} from "../../lib/types/admin";

type AdminTab = "guru" | "siswa" | "modul" | "kuis";

function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: number;
    accent: "purple" | "orange";
}) {
    const isPurple = accent === "purple";
    return (
        <div
            className={`relative min-h-[128px] overflow-hidden rounded-[22px] p-4 shadow-sm ${
                isPurple ? "bg-[#e9e2ff]" : "bg-[#f9eddc]"
            }`}
        >
            <div className="relative z-10 flex h-full flex-col">
                <div
                    className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border bg-white ${
                        isPurple ? "border-[#7054dc]" : "border-[#f39b39]"
                    }`}
                >
                    <FaBookOpen
                        size={16}
                        className={
                            isPurple ? "text-[#7054dc]" : "text-[#f39b39]"
                        }
                    />
                </div>
                <p
                    className={`ml-auto -mt-1 text-4xl font-semibold leading-none ${
                        isPurple ? "text-[#7054dc]" : "text-[#f39b39]"
                    }`}
                >
                    {value}
                </p>
                <p className="mt-auto max-w-[160px] pb-1 text-[1.02rem] font-semibold text-[#202126]">
                    {label}
                </p>
            </div>
            <div className="pointer-events-none absolute -bottom-5 -right-4">
                <Image
                    src={
                        isPurple
                            ? "/assets/images/beranda-siswa/star-purple.png"
                            : "/assets/images/beranda-siswa/star-orange.png"
                    }
                    alt="Decorative star"
                    width={110}
                    height={110}
                />
            </div>
        </div>
    );
}

export default function BerandaAdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AdminTab>("guru");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRowIds, setSelectedRowIds] = useState<
        Record<string, boolean>
    >({});
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(
        null,
    );
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([
        "z-a",
        "nama-lengkap",
    ]);
    const [searchQuery, setSearchQuery] = useState("");

    const PAGE_SIZE = 10;

    // API data
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [guruRows, setGuruRows] = useState<AdminTutorItem[]>([]);
    const [siswaRows, setSiswaRows] = useState<AdminSiswaItem[]>([]);
    const [modulRows, setModulRows] = useState<AdminModulItem[]>([]);
    const [kuisRows, setKuisRows] = useState<AdminKuisItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Toast & confirm dialog
    const { toasts, showToast, dismissToast } = useAdminToast();
    const [confirmAction, setConfirmAction] = useState<{
        id: string;
        type: "delete" | "deactivate";
        tab: AdminTab;
        bulkIds?: string[];
    } | null>(null);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [dashData, tutorData, siswaData, modulData, kuisData] =
                await Promise.allSettled([
                    adminDashboardApi.get(),
                    adminTutorApi.getAll(),
                    adminSiswaApi.getAll(),
                    adminModulApi.getAll({ limit: 50 }),
                    adminKuisApi.getAll({ limit: 50 }),
                ]);
            if (dashData.status === "fulfilled") setStats(dashData.value);
            if (tutorData.status === "fulfilled") setGuruRows(tutorData.value);
            if (siswaData.status === "fulfilled")
                setSiswaRows(siswaData.value.items);
            if (modulData.status === "fulfilled")
                setModulRows(modulData.value.items ?? []);
            if (kuisData.status === "fulfilled")
                setKuisRows(kuisData.value.items ?? []);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // ── Execute confirm action (delete / deactivate) ───────────────────────────
    const executeConfirm = async () => {
        if (!confirmAction) return;
        const { id, type, tab, bulkIds } = confirmAction;
        setConfirmAction(null);
        const idsToProcess = bulkIds ?? [id];
        try {
            if (type === "delete") {
                for (const targetId of idsToProcess) {
                    if (tab === "guru") await adminTutorApi.delete(targetId);
                    else if (tab === "siswa")
                        await adminSiswaApi.delete(targetId);
                    else if (tab === "modul")
                        await adminModulApi.delete(targetId);
                    else await adminKuisApi.delete(targetId);
                }
                setSelectedRowIds({});
                showToast(
                    "success",
                    `${idsToProcess.length > 1 ? `${idsToProcess.length} data` : "Data"} berhasil dihapus.`,
                );
            } else {
                if (tab === "guru") await adminTutorApi.deactivate(id);
                else if (tab === "siswa") await adminSiswaApi.deactivate(id);
                showToast("success", "Akun berhasil dinonaktifkan.");
            }
            fetchAll();
        } catch {
            showToast(
                "error",
                type === "delete"
                    ? "Gagal menghapus data."
                    : "Gagal menonaktifkan akun.",
            );
        }
    };

    // ── Filter options per tab ─────────────────────────────────────────────────
    const filterOptionsByTab: Record<
        string,
        {
            id: string;
            label: string;
            sortFn: (
                a: { col1: string; col2: string; col3: string },
                b: { col1: string; col2: string; col3: string },
            ) => number;
        }[]
    > = {
        guru: [
            {
                id: "nama-az",
                label: "Nama Lengkap A → Z",
                sortFn: (a, b) => a.col1.localeCompare(b.col1),
            },
            {
                id: "nama-za",
                label: "Nama Lengkap Z → A",
                sortFn: (a, b) => b.col1.localeCompare(a.col1),
            },
            {
                id: "nowa-az",
                label: "No WA A → Z",
                sortFn: (a, b) => a.col2.localeCompare(b.col2),
            },
            {
                id: "email-az",
                label: "Email A → Z",
                sortFn: (a, b) => a.col3.localeCompare(b.col3),
            },
        ],
        siswa: [
            {
                id: "nama-az",
                label: "Nama Lengkap A → Z",
                sortFn: (a, b) => a.col1.localeCompare(b.col1),
            },
            {
                id: "nama-za",
                label: "Nama Lengkap Z → A",
                sortFn: (a, b) => b.col1.localeCompare(a.col1),
            },
            {
                id: "email-az",
                label: "Email A → Z",
                sortFn: (a, b) => a.col3.localeCompare(b.col3),
            },
            {
                id: "akses-siswa",
                label: "Tampilkan Siswa Dulu",
                sortFn: (a, b) => a.col2.localeCompare(b.col2),
            },
            {
                id: "akses-umum",
                label: "Tampilkan Umum Dulu",
                sortFn: (a, b) => b.col2.localeCompare(a.col2),
            },
        ],
        modul: [
            {
                id: "nama-az",
                label: "Nama Modul A → Z",
                sortFn: (a, b) => a.col1.localeCompare(b.col1),
            },
            {
                id: "nama-za",
                label: "Nama Modul Z → A",
                sortFn: (a, b) => b.col1.localeCompare(a.col1),
            },
            {
                id: "guru-az",
                label: "Nama Guru A → Z",
                sortFn: (a, b) => a.col2.localeCompare(b.col2),
            },
            {
                id: "siswa-banyak",
                label: "Jml. Siswa Terbanyak",
                sortFn: (a, b) => Number(b.col3) - Number(a.col3),
            },
            {
                id: "siswa-dikit",
                label: "Jml. Siswa Tersedikit",
                sortFn: (a, b) => Number(a.col3) - Number(b.col3),
            },
        ],
        kuis: [
            {
                id: "nama-az",
                label: "Nama Kuis A → Z",
                sortFn: (a, b) => a.col1.localeCompare(b.col1),
            },
            {
                id: "nama-za",
                label: "Nama Kuis Z → A",
                sortFn: (a, b) => b.col1.localeCompare(a.col1),
            },
            {
                id: "modul-az",
                label: "Nama Modul A → Z",
                sortFn: (a, b) => a.col2.localeCompare(b.col2),
            },
            {
                id: "guru-az",
                label: "Nama Guru A → Z",
                sortFn: (a, b) => a.col3.localeCompare(b.col3),
            },
        ],
    };

    const filterOptions = filterOptionsByTab[activeTab] ?? [];

    const baseRows =
        activeTab === "guru"
            ? guruRows.map((r) => ({
                  id: r.id,
                  col1: r.fullName,
                  col2: r.whatsappNumber ?? "-",
                  col3: r.email,
              }))
            : activeTab === "siswa"
              ? siswaRows.map((r) => ({
                    id: r.id,
                    col1: r.nama_lengkap,
                    col2: r.role === "umum" ? "Umum" : "Siswa",
                    col3: r.email,
                }))
              : activeTab === "modul"
                ? modulRows.map((r) => ({
                      id: r.id,
                      col1: r.moduleName,
                      col2: r.tutor?.fullName ?? "-",
                      col3: String(r.totalSiswa ?? 0),
                  }))
                : kuisRows.map((r) => {
                      const namaKuis =
                          r.topiks?.[0]?.nama ??
                          r.topiks?.[0]?.materis?.[0]?.id ??
                          "-";
                      return {
                          id: r.id,
                          col1: namaKuis,
                          col2: r.moduleName,
                          col3: r.tutor?.fullName ?? "-",
                      };
                  });

    // Apply search filter across all three visible columns
    const q = searchQuery.toLowerCase().trim();
    const filteredRows = q
        ? baseRows.filter(
              (r) =>
                  r.col1.toLowerCase().includes(q) ||
                  r.col2.toLowerCase().includes(q) ||
                  r.col3.toLowerCase().includes(q),
          )
        : baseRows;

    // Apply selected sort (single active sort, first match wins)
    const activeSortId = selectedFilters[0];
    const activeSortFn = filterOptions.find(
        (o) => o.id === activeSortId,
    )?.sortFn;
    const allRows = activeSortFn
        ? [...filteredRows].sort(activeSortFn)
        : filteredRows;

    const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const currentRows = allRows.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    const currentRowIds = currentRows.map((r) => r.id);
    const allRowsSelected =
        currentRowIds.length > 0 &&
        currentRowIds.every((id) => selectedRowIds[id]);

    const toggleRow = (id: string) => {
        setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleActionMenu = (id: string) => {
        setOpenActionMenuId((prev) => (prev === id ? null : id));
    };

    const toggleFilterOption = (id: string) => {
        setSelectedFilters((prev) => (prev[0] === id ? [] : [id]));
    };

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSelectedFilters([]);
        setSearchQuery("");
        setSelectedRowIds({});
    };

    const toggleSelectAll = () => {
        setSelectedRowIds((prev) => {
            const next = { ...prev };
            if (allRowsSelected) {
                currentRowIds.forEach((id) => {
                    delete next[id];
                });
            } else {
                currentRowIds.forEach((id) => {
                    next[id] = true;
                });
            }
            return next;
        });
    };

    const colHeaders =
        activeTab === "guru"
            ? ["Nama Lengkap", "No Wa", "Email"]
            : activeTab === "siswa"
              ? ["Nama Lengkap", "Akses", "Email"]
              : activeTab === "modul"
                ? ["Nama Modul", "Guru", "Jml. Siswa"]
                : ["Nama Kuis", "Nama Modul", "Nama Guru"];

    const getEditHref = (id: string) => {
        if (activeTab === "guru")
            return `/admin/manajemen-pengguna/edit-guru?id=${id}`;
        if (activeTab === "siswa")
            return `/admin/manajemen-pengguna/edit-siswa?id=${id}`;
        if (activeTab === "modul")
            return `/admin/manajemen-modul/edit?id=${id}`;
        return "#";
    };

    const getAddHref = () => {
        if (activeTab === "guru")
            return "/admin/manajemen-pengguna/tambah-guru";
        if (activeTab === "siswa")
            return "/admin/manajemen-pengguna/tambah-siswa";
        if (activeTab === "modul") return "/admin/tambah-modul";
        return "#";
    };

    return (
        <div className="min-h-screen bg-[#f3f3f6]">
            {/* Confirm dialog */}
            {confirmAction && (
                <AdminConfirmDialog
                    message={
                        confirmAction.type === "delete"
                            ? confirmAction.bulkIds
                                ? `Yakin ingin menghapus ${confirmAction.bulkIds.length} data yang dipilih? Tindakan ini tidak dapat dibatalkan.`
                                : "Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
                            : "Yakin ingin menonaktifkan akun ini?"
                    }
                    danger={confirmAction.type === "delete"}
                    confirmLabel={
                        confirmAction.type === "delete"
                            ? "Ya, Hapus"
                            : "Ya, Nonaktifkan"
                    }
                    onConfirm={executeConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
            <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

            <AdminHeader />
            <div>
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                    <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
                        <section>
                            <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#7054dc] bg-white px-5 py-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#7054dc] text-[#7054dc]">
                                            <FaHistory size={13} />
                                        </span>
                                        <p className="font-semibold text-[#202126]">
                                            Statistik Platform
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-1 text-sm text-[#202126]">
                                        <FaPaperPlane size={11} />
                                        <span>
                                            Total Pengguna:{" "}
                                            {stats?.countAllUsers ?? "-"}
                                        </span>
                                    </div>
                                </div>
                                <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#f39b39]">
                                    Detail
                                    <MdOutlineKeyboardArrowRight size={15} />
                                </button>
                            </div>

                            <div className="mb-3 grid w-full grid-cols-4 gap-2">
                                {[
                                    { id: "guru", label: "Guru" },
                                    { id: "siswa", label: "Siswa" },
                                    { id: "modul", label: "Modul" },
                                    { id: "kuis", label: "Kuis" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            handleTabChange(
                                                tab.id as typeof activeTab,
                                            );
                                        }}
                                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                                            activeTab === tab.id
                                                ? "bg-[#f39b39] text-white"
                                                : "bg-[#ece7ff] text-[#7054dc] hover:bg-[#f39b39] hover:text-white"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-[#dfdde8] bg-white p-3 shadow-sm">
                                <div className="rounded-2xl border border-[#e4e2ec]">
                                    <div className="flex items-center justify-end gap-2 border-b border-[#eceaf3] px-3 py-3">
                                        {/* Add button — navigates to create page based on active tab */}
                                        <Link
                                            href={getAddHref()}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#7054dc] text-white hover:bg-[#5f46cc] transition-colors"
                                        >
                                            <MdPersonAddAlt1 size={16} />
                                        </Link>
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setIsFilterOpen(
                                                        (prev) => !prev,
                                                    )
                                                }
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ece7ff] text-[#7054dc]"
                                            >
                                                <FaFilter size={11} />
                                            </button>
                                            {isFilterOpen && (
                                                <div className="absolute right-0 top-9 z-30 w-[320px] rounded-2xl border-2 border-[#7f67de] bg-white p-3 shadow-xl">
                                                    <p className="text-sm font-semibold text-[#7054dc]">
                                                        Filter Urutkan Tampilan
                                                    </p>
                                                    <div className="mt-2 h-[1px] w-full bg-[#c7b9ff]" />
                                                    <div className="mt-2 space-y-2">
                                                        {filterOptions.map(
                                                            (option) => {
                                                                const isSelected =
                                                                    selectedFilters.includes(
                                                                        option.id,
                                                                    );
                                                                return (
                                                                    <button
                                                                        key={
                                                                            option.id
                                                                        }
                                                                        onClick={() =>
                                                                            toggleFilterOption(
                                                                                option.id,
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-2 text-left text-sm text-[#30323a]"
                                                                    >
                                                                        <span
                                                                            className={
                                                                                isSelected
                                                                                    ? "text-[#7054dc]"
                                                                                    : "text-[#a8adb8]"
                                                                            }
                                                                        >
                                                                            {isSelected ? (
                                                                                <FaCheckSquare
                                                                                    size={
                                                                                        15
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <FaRegSquare
                                                                                    size={
                                                                                        15
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Selected count badge + bulk delete */}
                                        {Object.values(selectedRowIds).filter(
                                            Boolean,
                                        ).length > 0 && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ece7ff] px-3 py-1 text-xs font-semibold text-[#7054dc]">
                                                {
                                                    Object.values(
                                                        selectedRowIds,
                                                    ).filter(Boolean).length
                                                }{" "}
                                                dipilih
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                const ids = Object.keys(
                                                    selectedRowIds,
                                                ).filter(
                                                    (id) => selectedRowIds[id],
                                                );
                                                if (ids.length === 0) return;
                                                setConfirmAction({
                                                    id: ids[0],
                                                    type: "delete",
                                                    tab: activeTab,
                                                    bulkIds: ids,
                                                });
                                            }}
                                            disabled={
                                                Object.values(
                                                    selectedRowIds,
                                                ).filter(Boolean).length === 0
                                            }
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f36e65] text-white transition-colors hover:bg-[#e05c53] disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <FaTrash size={11} />
                                        </button>
                                        <label className="flex h-8 w-[180px] items-center gap-2 rounded-full border border-[#c8c9d0] bg-white px-3 text-sm text-[#8a8a96]">
                                            <FaSearch
                                                size={12}
                                                className="text-[#a0a3b0]"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Pencarian"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(
                                                        e.target.value,
                                                    );
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full bg-transparent text-sm text-[#202126] placeholder:text-[#a0a3b0] outline-none"
                                            />
                                        </label>
                                    </div>

                                    {isLoading ? (
                                        <div className="flex min-h-[400px] items-center justify-center text-sm text-[#9396a3]">
                                            Memuat data...
                                        </div>
                                    ) : (
                                        <>
                                            {/* Header */}
                                            <div
                                                className={`grid items-center border-b border-[#e8e6ef] bg-[#f7f7fa] px-3 py-2.5 text-xs font-semibold text-[#8a8a96] ${
                                                    activeTab === "guru" ||
                                                    activeTab === "siswa"
                                                        ? "grid-cols-[44px_1.4fr_1fr_1.4fr_32px]"
                                                        : activeTab === "kuis"
                                                          ? "grid-cols-[44px_1.4fr_1.6fr_1fr_32px]"
                                                          : "grid-cols-[44px_2fr_1fr_1fr_32px]"
                                                }`}
                                            >
                                                <button
                                                    onClick={toggleSelectAll}
                                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                                                        allRowsSelected
                                                            ? "border-[#7054dc] bg-[#7054dc] text-white"
                                                            : "border-[#d4d7e2] text-[#9a88e6]"
                                                    }`}
                                                >
                                                    <FaCheck size={11} />
                                                </button>
                                                {colHeaders.map((h) => (
                                                    <p key={h}>{h}</p>
                                                ))}
                                                <div />
                                            </div>

                                            {/* Rows */}
                                            <div className="min-h-[360px]">
                                                {currentRows.map((row) => (
                                                    <div
                                                        key={row.id}
                                                        className={`grid items-center border-b border-[#f1f0f5] px-3 py-3 text-sm text-[#202126] last:border-b-0 ${
                                                            activeTab ===
                                                                "guru" ||
                                                            activeTab ===
                                                                "siswa"
                                                                ? "grid-cols-[44px_1.4fr_1fr_1.4fr_32px]"
                                                                : activeTab ===
                                                                    "kuis"
                                                                  ? "grid-cols-[44px_1.4fr_1.6fr_1fr_32px]"
                                                                  : "grid-cols-[44px_2fr_1fr_1fr_32px]"
                                                        }`}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                toggleRow(
                                                                    row.id,
                                                                )
                                                            }
                                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                                                                selectedRowIds[
                                                                    row.id
                                                                ]
                                                                    ? "border-[#7054dc] bg-[#7054dc] text-white"
                                                                    : "border-[#d4d7e2] text-[#9a88e6]"
                                                            }`}
                                                        >
                                                            <FaCheck
                                                                size={11}
                                                            />
                                                        </button>
                                                        {activeTab ===
                                                        "siswa" ? (
                                                            <Link
                                                                href="/admin/nilai-siswa"
                                                                className="truncate hover:text-[#7054dc] hover:underline transition-colors"
                                                            >
                                                                {row.col1}
                                                            </Link>
                                                        ) : (
                                                            <p className="truncate">
                                                                {row.col1}
                                                            </p>
                                                        )}
                                                        <p className="text-[#6d7280] truncate">
                                                            {row.col2}
                                                        </p>
                                                        <p className="truncate text-[#6d7280]">
                                                            {row.col3}
                                                        </p>
                                                        <div className="relative justify-self-end">
                                                            <button
                                                                onClick={() =>
                                                                    toggleActionMenu(
                                                                        row.id,
                                                                    )
                                                                }
                                                                className="text-[#8f95a3] hover:text-[#7054dc]"
                                                            >
                                                                <FaEllipsisV
                                                                    size={12}
                                                                />
                                                            </button>
                                                            {openActionMenuId ===
                                                                row.id && (
                                                                <div
                                                                    className={`absolute right-0 top-5 z-20 ${activeTab === "modul" ? "w-48 p-2" : "w-36 p-1.5"} rounded-xl border border-[#e4e2ec] bg-white shadow-lg`}
                                                                >
                                                                    {activeTab ===
                                                                    "modul" ? (
                                                                        <>
                                                                            <Link
                                                                                href={getEditHref(
                                                                                    row.id,
                                                                                )}
                                                                                onClick={() =>
                                                                                    setOpenActionMenuId(
                                                                                        null,
                                                                                    )
                                                                                }
                                                                                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] text-[#7054dc] hover:bg-[#f5f1ff]"
                                                                            >
                                                                                <FaRegEdit
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                                Edit
                                                                            </Link>
                                                                            <Link
                                                                                href={`/admin/tambah-modul/siswa?id=${row.id}`}
                                                                                onClick={() =>
                                                                                    setOpenActionMenuId(
                                                                                        null,
                                                                                    )
                                                                                }
                                                                                className="mt-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] text-[#6d7280] hover:bg-[#f5f5f8]"
                                                                            >
                                                                                <MdPersonAddAlt1
                                                                                    size={
                                                                                        18
                                                                                    }
                                                                                />
                                                                                Tambahkan
                                                                                Siswa
                                                                            </Link>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenActionMenuId(
                                                                                        null,
                                                                                    );
                                                                                    // Arsipkan placeholder
                                                                                }}
                                                                                className="mt-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] text-[#6d7280] hover:bg-[#f5f5f8]"
                                                                            >
                                                                                <FaDatabase
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                                Arsipkan
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenActionMenuId(
                                                                                        null,
                                                                                    );
                                                                                    setConfirmAction(
                                                                                        {
                                                                                            id: row.id,
                                                                                            type: "delete",
                                                                                            tab: activeTab,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="mt-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] text-[#6d7280] hover:bg-[#f5f5f8]"
                                                                            >
                                                                                <FaTrash
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                                Hapus
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* Edit */}
                                                                            <Link
                                                                                href={getEditHref(
                                                                                    row.id,
                                                                                )}
                                                                                onClick={() =>
                                                                                    setOpenActionMenuId(
                                                                                        null,
                                                                                    )
                                                                                }
                                                                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#7054dc] hover:bg-[#f5f1ff]"
                                                                            >
                                                                                <FaRegEdit
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                />
                                                                                Edit
                                                                            </Link>
                                                                            {/* Lihat Nilai (siswa only) */}
                                                                            {activeTab ===
                                                                                "siswa" && (
                                                                                <Link
                                                                                    href="/admin/nilai-siswa"
                                                                                    onClick={() =>
                                                                                        setOpenActionMenuId(
                                                                                            null,
                                                                                        )
                                                                                    }
                                                                                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#f39b39] hover:bg-[#fff8ef]"
                                                                                >
                                                                                    <FaChartBar
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                    />
                                                                                    Lihat
                                                                                    Nilai
                                                                                </Link>
                                                                            )}
                                                                            {/* Nonaktifkan (guru & siswa only) */}
                                                                            {(activeTab ===
                                                                                "guru" ||
                                                                                activeTab ===
                                                                                    "siswa") && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setOpenActionMenuId(
                                                                                            null,
                                                                                        );
                                                                                        setConfirmAction(
                                                                                            {
                                                                                                id: row.id,
                                                                                                type: "deactivate",
                                                                                                tab: activeTab,
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]"
                                                                                >
                                                                                    <FaDatabase
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                    />
                                                                                    Nonaktifkan
                                                                                </button>
                                                                            )}
                                                                            {/* Hapus */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenActionMenuId(
                                                                                        null,
                                                                                    );
                                                                                    setConfirmAction(
                                                                                        {
                                                                                            id: row.id,
                                                                                            type: "delete",
                                                                                            tab: activeTab,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#f36e65] hover:bg-[#fff3f2]"
                                                                            >
                                                                                <FaTrash
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                />
                                                                                Hapus
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {currentRows.length === 0 && (
                                                    <div className="flex h-[360px] items-center justify-center text-sm text-[#9396a3]">
                                                        Tidak ada data.
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* ── Pagination ─────────────────────────────── */}
                                    <div className="flex items-center justify-between border-t border-[#f0eff6] px-4 py-3">
                                        <p className="text-xs text-[#9396a3]">
                                            {allRows.length} data · Hal{" "}
                                            {safePage}/{totalPages}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.max(1, p - 1),
                                                    )
                                                }
                                                disabled={safePage <= 1}
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors text-[#7054dc] hover:bg-[#ede9fb] disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <MdKeyboardArrowLeft
                                                    size={18}
                                                />
                                            </button>
                                            {Array.from(
                                                { length: totalPages },
                                                (_, i) => i + 1,
                                            )
                                                .filter(
                                                    (page) =>
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(
                                                            page - safePage,
                                                        ) <= 1,
                                                )
                                                .reduce<(number | "...")[]>(
                                                    (acc, page, idx, arr) => {
                                                        if (
                                                            idx > 0 &&
                                                            (page as number) -
                                                                (arr[
                                                                    idx - 1
                                                                ] as number) >
                                                                1
                                                        )
                                                            acc.push("...");
                                                        acc.push(page);
                                                        return acc;
                                                    },
                                                    [],
                                                )
                                                .map((item, idx) =>
                                                    item === "..." ? (
                                                        <span
                                                            key={`ellipsis-${idx}`}
                                                            className="px-1 text-xs text-[#9396a3]"
                                                        >
                                                            …
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={item}
                                                            onClick={() =>
                                                                setCurrentPage(
                                                                    item as number,
                                                                )
                                                            }
                                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                                                                item ===
                                                                safePage
                                                                    ? "bg-[#7054dc] text-white shadow-sm"
                                                                    : "text-[#6b7080] hover:bg-[#ede9fb] hover:text-[#7054dc]"
                                                            }`}
                                                        >
                                                            {item}
                                                        </button>
                                                    ),
                                                )}
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.min(
                                                            totalPages,
                                                            p + 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    safePage >= totalPages
                                                }
                                                className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors text-[#7054dc] hover:bg-[#ede9fb] disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <MdKeyboardArrowRight
                                                    size={18}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    label="Pengguna Aktif"
                                    value={stats?.countAllUsers ?? 0}
                                    accent="purple"
                                />
                                <StatCard
                                    label="Kelas Aktif"
                                    value={stats?.activeClass ?? 0}
                                    accent="orange"
                                />
                                <StatCard
                                    label="Guru"
                                    value={stats?.activeTutors ?? 0}
                                    accent="purple"
                                />
                                <StatCard
                                    label="Siswa"
                                    value={stats?.activeStudents ?? 0}
                                    accent="orange"
                                />
                                <StatCard
                                    label="Modul"
                                    value={stats?.activeModules ?? 0}
                                    accent="purple"
                                />
                                <StatCard
                                    label="Kuis"
                                    value={stats?.activeQuizzes ?? 0}
                                    accent="orange"
                                />
                            </div>

                            <div className="rounded-2xl border border-[#f39b39] bg-white p-4">
                                <h3 className="text-center text-2xl font-semibold text-[#202126]">
                                    Statistik Penggunaan Sistem
                                </h3>
                                <div className="relative mx-auto mt-4 h-[250px] w-[250px]">
                                    {(() => {
                                        const activePercentage =
                                            stats?.activeUserPercentage ?? 0;
                                        const inactivePercentage =
                                            stats?.inactiveUserPercentage ?? 0;
                                        const circumference = 2 * Math.PI * 74;
                                        const activeDasharray =
                                            (activePercentage / 100) *
                                            circumference;
                                        const inactiveDasharray =
                                            (inactivePercentage / 100) *
                                            circumference;

                                        return (
                                            <svg
                                                className="h-full w-full"
                                                viewBox="0 0 220 220"
                                                aria-label="Diagram penggunaan sistem"
                                                suppressHydrationWarning
                                            >
                                                <circle
                                                    cx="110"
                                                    cy="110"
                                                    r="74"
                                                    fill="none"
                                                    stroke="#f1f0f6"
                                                    strokeWidth="34"
                                                />
                                                <circle
                                                    cx="110"
                                                    cy="110"
                                                    r="74"
                                                    fill="none"
                                                    stroke="#7054dc"
                                                    strokeWidth="34"
                                                    strokeDasharray={`${activeDasharray} ${circumference}`}
                                                    strokeDashoffset="0"
                                                    transform="rotate(-90 110 110)"
                                                />
                                                <circle
                                                    cx="110"
                                                    cy="110"
                                                    r="74"
                                                    fill="none"
                                                    stroke="#f39b39"
                                                    strokeWidth="34"
                                                    strokeDasharray={`${inactiveDasharray} ${circumference}`}
                                                    strokeDashoffset={`-${activeDasharray}`}
                                                    transform="rotate(-90 110 110)"
                                                />
                                            </svg>
                                        );
                                    })()}
                                    <div className="absolute -left-3 bottom-14 h-20 w-20">
                                        <div className="absolute inset-0 rounded-full bg-white/35 blur-md" />
                                        <div className="absolute inset-0 rounded-full bg-white/20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#7054dc] shadow-[0_8px_18px_rgba(112,84,220,0.12)]">
                                                {(
                                                    stats?.activeUserPercentage ??
                                                    0
                                                ).toFixed(1)}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute right-2 top-4 h-20 w-20">
                                        <div className="absolute inset-0 rounded-full bg-white/35 blur-md" />
                                        <div className="absolute inset-0 rounded-full bg-white/20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#f39b39] shadow-[0_8px_18px_rgba(243,155,57,0.12)]">
                                                {(
                                                    stats?.inactiveUserPercentage ??
                                                    0
                                                ).toFixed(1)}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-center gap-5 text-sm font-medium">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#7054dc]" />
                                        Aktif
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#f39b39]" />
                                        Non-Aktif
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
