"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaLock, FaSearch } from "react-icons/fa";
import SiswaHeader from "../component/siswa/SiswaHeader";
import { siswaModulApi } from "../lib/api";
import type { ModuleItem } from "../lib/types/modul";
import type { EnrolledModuleItem } from "../lib/types/siswa";

const statusFilters = [
    { id: "semua", label: "Semua" },
    { id: "dalam-progress", label: "Dalam Progress" },
    { id: "selesai", label: "Selesai" },
] as const;

type StatusFilter = (typeof statusFilters)[number]["id"];

function getStatusFromEnrolled(
    item: EnrolledModuleItem,
): "belum-mulai" | "dalam-progress" | "selesai" {
    if (item.progress?.isGraduated || item.progress?.status === "COMPLETED") return "selesai";
    const pct = item.progress?.progressPercentage ?? 0;
    if (pct > 0) return "dalam-progress";
    return "belum-mulai";
}

function getModuleName(item: ModuleItem): string {
    return item.nama_modul || item.moduleName || "Modul";
}

function getTutorName(item: ModuleItem): string {
    return item.tutor?.fullName || item.tutor?.nama_lengkap || "Pengajar";
}

function getThumbnail(item: ModuleItem): string {
    return (
        item.thumbnailUrl ||
        item.thumbnail ||
        "/assets/images/beranda-siswa/matapelajaran.png"
    );
}

function getPreTestLabel(item: EnrolledModuleItem): string {
    const score = item.progress?.pretestScore;
    if (score != null) return `Pre-Test: ${score}/100`;
    return "Pre-Test: -";
}

function getProgress(item: EnrolledModuleItem): number {
    return item.progress?.progressPercentage ?? 0;
}

function getJenjangKelas(item: ModuleItem): string {
    const jenjang = item.jenjang ? `Jenjang ${item.jenjang.toUpperCase()}` : "";
    const kelas = item.kelas_sekolah ? `Kelas ${item.kelas_sekolah}` : "";
    if (jenjang && kelas) return `${jenjang} | ${kelas}`;
    return jenjang || kelas || "";
}

export default function EksplorModulPage() {
    const [activeTab, setActiveTab] = useState<"relevan" | "terdaftar">(
        "terdaftar",
    );
    const [activeStatus, setActiveStatus] = useState<StatusFilter>("semua");
    const [searchQuery, setSearchQuery] = useState("");

    const [relevantModules, setRelevantModules] = useState<ModuleItem[]>([]);
    const [enrolledModules, setEnrolledModules] = useState<
        EnrolledModuleItem[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // API may return array directly OR { data: [...] } wrapper
        function extractArray<T>(res: unknown): T[] {
            if (Array.isArray(res)) return res as T[];
            if (res && typeof res === "object") {
                const obj = res as Record<string, unknown>;
                if ("data" in obj && Array.isArray(obj.data))
                    return obj.data as T[];
                if ("items" in obj && Array.isArray(obj.items))
                    return obj.items as T[];
            }
            return [];
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError("");
            try {
                const [allRes, enrolledRes] = await Promise.all([
                    siswaModulApi.getAll({ limit: 50 }),
                    siswaModulApi.getEnrolled({ limit: 50 }),
                ]);

                const allModules = extractArray<ModuleItem>(allRes);
                const enrolled = extractArray<EnrolledModuleItem>(enrolledRes);

                const enrolledIds = new Set(enrolled.map((e) => e.id));
                setRelevantModules(
                    allModules.filter((m) => !enrolledIds.has(m.id)),
                );
                setEnrolledModules(enrolled);
            } catch (err: unknown) {
                console.error("Eksplor modul fetch error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Gagal memuat data modul",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredModules = useMemo(() => {
        const source =
            activeTab === "terdaftar" ? enrolledModules : relevantModules;

        return source.filter((item) => {
            const name = getModuleName(item).toLowerCase();
            const tutor = getTutorName(item).toLowerCase();
            const matchesSearch =
                name.includes(searchQuery.toLowerCase()) ||
                tutor.includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab !== "terdaftar" || activeStatus === "semua")
                return true;

            const status = getStatusFromEnrolled(item as EnrolledModuleItem);
            if (activeStatus === "dalam-progress")
                return status === "dalam-progress" || status === "belum-mulai";
            if (activeStatus === "selesai") return status === "selesai";
            return true;
        });
    }, [
        activeStatus,
        activeTab,
        enrolledModules,
        relevantModules,
        searchQuery,
    ]);

    return (
        <div className="min-h-screen bg-[#ffffff]">
            <SiswaHeader />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[#202126]">
                            Eksplor Modul
                        </h1>
                        <div className="mt-3 flex items-center gap-5 text-sm font-medium">
                            <button
                                type="button"
                                onClick={() => setActiveTab("relevan")}
                                className={`border-b-2 pb-1 transition-colors ${
                                    activeTab === "relevan"
                                        ? "border-[#7054dc] text-[#202126]"
                                        : "border-transparent text-[#60636d] hover:text-[#202126]"
                                }`}
                            >
                                Modul yang Relevan
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("terdaftar")}
                                className={`border-b-2 pb-1 transition-colors ${
                                    activeTab === "terdaftar"
                                        ? "border-[#7054dc] text-[#202126]"
                                        : "border-transparent text-[#60636d] hover:text-[#202126]"
                                }`}
                            >
                                Terdaftar
                                {enrolledModules.length > 0 && (
                                    <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#7054dc] px-1 text-[10px] font-bold text-white">
                                        {enrolledModules.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {activeTab === "terdaftar" && (
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                {statusFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() =>
                                            setActiveStatus(filter.id)
                                        }
                                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                                            activeStatus === filter.id
                                                ? "border-[#e0d5ff] bg-[#efe8ff] text-[#7054dc]"
                                                : "border-[#d8d9e0] bg-white text-[#8d909c] hover:border-[#d2caef] hover:text-[#202126]"
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative w-full md:mt-2 md:max-w-sm">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari modul belajarmu di sini"
                            className="w-full rounded-lg border border-[#d8d9e0] bg-white px-4 py-2.5 pr-10 text-sm text-[#202126] placeholder:text-[#8d909c] focus:border-[#7054dc] focus:outline-none"
                        />
                        <FaSearch
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d909c]"
                            size={14}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-2xl border border-[#d8d9e0] bg-white p-4 sm:p-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-[88px] w-[88px] shrink-0 rounded-xl bg-[#f0eeff]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 w-2/3 rounded bg-[#f0eeff]" />
                                        <div className="h-3 w-1/3 rounded bg-[#f5f5f5]" />
                                        <div className="h-3 w-1/2 rounded bg-[#f5f5f5]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredModules.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredModules.map((item) => {
                            const isEnrolled = activeTab === "terdaftar";
                            const enrolledItem = isEnrolled
                                ? (item as EnrolledModuleItem)
                                : null;
                            const progress = enrolledItem
                                ? getProgress(enrolledItem)
                                : 0;
                            const status = enrolledItem
                                ? getStatusFromEnrolled(enrolledItem)
                                : null;

                            return (
                                <article
                                    key={item.id}
                                    className="relative rounded-2xl border border-[#d8d9e0] bg-white p-4 sm:p-5 transition-shadow hover:shadow-md"
                                >
                                    {activeTab === "relevan" && (
                                        <div className="absolute right-4 top-4 text-[#a4a8b2]">
                                            {item.isPaid ? (
                                                <FaLock size={14} />
                                            ) : (
                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                                    Gratis
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className={`flex items-center gap-3 ${activeTab === "relevan" ? "pr-7 sm:gap-4" : ""}`}
                                    >
                                        <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl sm:h-[88px] sm:w-[88px]">
                                            <Image
                                                src={getThumbnail(item)}
                                                alt={getModuleName(item)}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xl font-semibold text-[#202126]">
                                                {getModuleName(item)}
                                            </h3>
                                            <p className="mt-1 text-xs text-[#60636d]">
                                                {getJenjangKelas(item)}
                                            </p>

                                            {enrolledItem ? (
                                                <div className="mt-4 flex items-end gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] font-medium text-[#f39b39]">
                                                            {getPreTestLabel(
                                                                enrolledItem,
                                                            )}
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e2ec]">
                                                                <div
                                                                    className="h-full rounded-full bg-[#7d57df] transition-all"
                                                                    style={{
                                                                        width: `${progress}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[11px] text-[#4f5565]">
                                                                {Math.round(
                                                                    progress,
                                                                )}
                                                                % Progress
                                                            </span>
                                                        </div>
                                                        {status ===
                                                            "selesai" && (
                                                            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#f39b39]">
                                                                <FaBookOpen
                                                                    size={9}
                                                                />{" "}
                                                                Selesai
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link
                                                        href={`/modul/${item.id}/materi`}
                                                        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#f39b39] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                                    >
                                                        {status === "selesai"
                                                            ? "Ulangi"
                                                            : "Lanjut"}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <p className="truncate text-xs text-[#202126] sm:text-sm">
                                                        {getTutorName(item)}
                                                    </p>
                                                    <Link
                                                        href={`/modul/${item.id}`}
                                                        className="text-xs font-semibold text-[#f39b39] transition-opacity hover:opacity-90 sm:text-sm"
                                                    >
                                                        Lihat Lebih Lanjut
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[#d8d9e0] bg-white px-4 py-10 sm:px-8">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <Image
                                src="/assets/images/beranda-siswa/belum-ada.png"
                                alt="Belum ada modul"
                                width={150}
                                height={150}
                            />
                            <p className="text-sm text-[#8a8a96]">
                                {activeTab === "terdaftar"
                                    ? "Belum ada modul yang didaftarkan"
                                    : "Belum ada modul tersedia"}
                            </p>
                            {activeTab === "terdaftar" && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("relevan")}
                                    className="mt-2 rounded-lg bg-[#7054dc] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                >
                                    Jelajahi Modul
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
