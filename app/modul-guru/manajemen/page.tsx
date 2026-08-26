"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import {
    FiEdit2,
    FiPlus,
    FiTrash2,
    FiFilter,
    FiArrowLeft,
    FiDownload,
    FiFileText,
} from "react-icons/fi";
import CursorPagination from "../../component/ui/CursorPagination";

import GuruHeader from "../../component/guru/GuruHeader";
import { useGuruModules } from "../hooks/useGuruModules";
import {
    guruModulApi,
    guruTopikApi,
    guruMateriApi,
    guruProgressApi,
} from "../../lib/api";
import { useRoleGuard } from "../../lib/hooks/useRoleGuard";
import { usePopup } from "../../component/ui/PopupProvider";


function ManajemenModulContent() {
    const { isAuthorized } = useRoleGuard(["tutor"]);
    const searchParams = useSearchParams();
    const modulId = searchParams.get("modulId");
    const { toast, confirm } = usePopup();

    // Mode 1: Detailed Module Management (modulId is present)
    const [moduleDetail, setModuleDetail] = useState<any>(null);
    const [topicCount, setTopicCount] = useState(0);
    const [materialCount, setMaterialCount] = useState(0);
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [errorDetails, setErrorDetails] = useState("");
    const [errorStudents, setErrorStudents] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<
        "penguatan" | "remedial" | "pengayaan" | null
    >(null);
    const [studentPage, setStudentPage] = useState(1);

    // Mode 2: Modules List Fallback (modulId is NOT present)
    const [searchModuleQuery, setSearchModuleQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const {
        modules,
        currentPageNumber,
        hasPrev,
        hasNext,
        isLoading: isLoadingModules,
        loadModules,
        nextPage,
        prevPage,
    } = useGuruModules(10);

    // Load modules list if in Mode 2
    useEffect(() => {
        if (!modulId && isAuthorized) {
            loadModules();
        }
    }, [modulId, isAuthorized, loadModules]);

    const filteredModules = useMemo(
        () =>
            modules.filter((m) =>
                m.moduleName
                    .toLowerCase()
                    .includes(searchModuleQuery.toLowerCase()),
            ),
        [modules, searchModuleQuery],
    );

    const handleDeleteModule = async (id: string) => {
        if (deletingId) return;
        const ok = await confirm({
            message: "Apakah Anda yakin ingin menghapus modul ini?",
            variant: "danger",
            confirmText: "Hapus",
        });
        if (!ok) return;
        setDeletingId(id);
        try {
            await guruModulApi.delete(id);
            loadModules();
        } catch (err) {
            console.error("Delete module error:", err);
            toast("Gagal menghapus modul.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    // Load details and students if in Mode 1
    const isCTModule = moduleDetail?.isTestComputationalThinking;

    const loadModuleDetails = useCallback(async () => {
        if (!modulId) return;
        setIsLoadingDetails(true);
        setErrorDetails("");
        try {
            const [detail, topics, materials] = await Promise.all([
                guruModulApi.detail(modulId),
                guruTopikApi.getByModul(modulId),
                guruMateriApi.getByModul(modulId),
            ]);
            setModuleDetail(detail);
            setTopicCount(topics.length);
            setMaterialCount(
                materials.reduce((sum, topik) => sum + (topik.materis?.length ?? 0), 0),
            );
        } catch (err) {
            console.error("Load module detail error:", err);
            setErrorDetails("Gagal memuat detail modul.");
        } finally {
            setIsLoadingDetails(false);
        }
    }, [modulId]);

    const loadEnrolledStudents = useCallback(async () => {
        if (!modulId) return;
        setIsLoadingStudents(true);
        setErrorStudents("");
        try {
            const data = await guruProgressApi.getByModule(modulId);

            const enrolled = data.map((item) => {
                let rec: "pengayaan" | "remedial" | "penguatan" = "penguatan";
                if (item.recommendation === "Pengayaan") rec = "pengayaan";
                if (item.recommendation === "Remedial") rec = "remedial";

                let reason = "Skor siswa belum mencapai batas tuntas.";
                if (rec === "pengayaan") {
                    reason = item.posttestScore
                        ? `Nilai Post-Test sangat baik (${item.posttestScore}), siap untuk materi lanjutan.`
                        : `Progres belajar sangat baik (${Math.round(item.progressPercentage)}%), hampir menyelesaikan modul.`;
                } else if (rec === "remedial") {
                    reason = item.posttestScore
                        ? `Nilai Post-Test (${item.posttestScore}) di bawah standar kelulusan (60), perlu bimbingan ulang.`
                        : `Nilai Pre-Test rendah (${item.pretestScore}) dan belum menyelesaikan Post-Test.`;
                } else {
                    reason = item.posttestScore
                        ? `Nilai Post-Test cukup (${item.posttestScore}), perlu pemantapan materi.`
                        : `Progres belajar sedang berjalan (${Math.round(item.progressPercentage)}%), perlu pengerjaan materi berkelanjutan.`;
                }

                return {
                    id: item.siswaId,
                    name: item.siswaName,
                    email: item.email,
                    quizBreakdown: item.quizBreakdown ?? [],
                    progress: (() => {
                        const raw = Math.round(Number(item.progressPercentage) || 0);
                        // Sanity check: if no evidence of activity, clamp to 0
                        const hasNoActivity =
                            !item.isGraduated &&
                            item.status !== 'COMPLETED' &&
                            item.pretestScore == null &&
                            item.posttestScore == null &&
                            raw > 0 &&
                            raw < 1; // Only clamp truly zero-activity cases
                        return hasNoActivity ? 0 : raw;
                    })(),
                    preTest: item.pretestScore ?? "-",
                    postTest: item.posttestScore ?? "-",
                    rataKuis: item.averageQuizScore ?? "-",
                    rataKuisCt: item.averageCtQuizScore ?? "-",
                    rekomendasi: rec,
                    reason,
                    bktMastery: item.bktMastery ?? 0,
                    bktRecommendation: item.bktRecommendation ?? 'Remedial',
                };
            });

            setEnrolledStudents(enrolled);
        } catch (err) {
            console.error("Load enrolled students error:", err);
            setErrorStudents("Gagal memuat data progres siswa.");
        } finally {
            setIsLoadingStudents(false);
        }
    }, [modulId]);

    useEffect(() => {
        if (modulId && isAuthorized) {
            loadModuleDetails();
            loadEnrolledStudents();
        }
    }, [modulId, isAuthorized, loadModuleDetails, loadEnrolledStudents]);

    // Handle student filtering and pagination
    const filteredStudents = useMemo(() => {
        return enrolledStudents
            .filter((s) =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .filter((s) => !activeFilter || s.rekomendasi === activeFilter);
    }, [enrolledStudents, searchQuery, activeFilter]);

    const STUDENTS_PER_PAGE = 10;
    const totalStudentPages = Math.ceil(
        filteredStudents.length / STUDENTS_PER_PAGE,
    );
    const paginatedStudents = useMemo(() => {
        const start = (studentPage - 1) * STUDENTS_PER_PAGE;
        return filteredStudents.slice(start, start + STUDENTS_PER_PAGE);
    }, [filteredStudents, studentPage]);

    const hasCT = moduleDetail?.isTestComputationalThinking ?? enrolledStudents.some(s => s.rataKuisCt !== "-");
    const hasReguler = enrolledStudents.some(s => s.rataKuis !== "-" || s.preTest !== "-" || s.postTest !== "-");
    const gridColsString = [
        '0.3fr', '1.5fr', '1.1fr', '0.6fr', '0.6fr', '0.8fr', '0.8fr',
        ...(hasReguler ? ['0.9fr'] : []),
        ...(hasCT ? ['0.9fr'] : []),
        '0.5fr'
    ].join(' ');

    const handleExportXLSX = async () => {
        const xlsxModule = await import("xlsx");
        const XLSX = xlsxModule.default || xlsxModule;

        const CT_ABBREV: Record<string, string> = {
            decomposition: "D", pattern_recognition: "P", patternrecognition: "P",
            abstraction: "A", algorithm: "AL",
        };
        const ctAbbr = (a: string | null | undefined) => CT_ABBREV[a?.toLowerCase() ?? ""] ?? a ?? "?";
        const CT_ASPECTS = ["D", "P", "A", "AL"];

        const wb = XLSX.utils.book_new();

        // Sheet 1: Ringkasan
        const rekLabels: Record<string, string> = {
            pengayaan: "Pengayaan",
            remedial: "Remedial",
            penguatan: "Penguatan",
        };
        const ringkasanRows = enrolledStudents.map((s) => {
            const kategoriPenguasaan = s.bktMastery >= 0.8 ? 'Tinggi' : s.bktMastery >= 0.5 ? 'Sedang' : 'Rendah';
            const base: Record<string, string | number> = {
                "Nama Siswa": s.name,
                "Email": s.email,
                "Progress (%)": s.progress,
                "Nilai Pretest": s.preTest,
                "Nilai Posttest": s.postTest,
                "Rata-rata Kuis": s.rataKuis,
                "Rata-rata Kuis CT": s.rataKuisCt,
                "Kategori Penguasaan": kategoriPenguasaan,
                "Rekomendasi BKT": s.bktRecommendation,
            };
            for (const qb of (s.quizBreakdown ?? [])) {
                base[qb.label] = qb.score ?? "-";
            }
            return base;
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ringkasanRows), "Ringkasan");

        // Fetch per-question detail from backend
        if (modulId) {
            const detail = await guruProgressApi.getExportDetail(modulId);

            // Sheet: Pretest
            if (detail.pretestGroups.length > 0) {
                const pretestRows = detail.students.map((s) => {
                    const row: Record<string, string | number> = { "Siswa": s.siswaName };
                    const aspectCounts: Record<string, number> = { D: 0, P: 0, A: 0, AL: 0 };
                    let totalBenar = 0;
                    let totalSoal = 0;
                    for (const group of detail.pretestGroups) {
                        for (const q of group.questions) {
                            const abbr = ctAbbr(q.ctAspect);
                            const colKey = `${group.label}-${abbr}`;
                            const correct = s.pretestAnswers[q.id] ? 1 : 0;
                            row[colKey] = correct;
                            if (CT_ASPECTS.includes(abbr)) aspectCounts[abbr] = (aspectCounts[abbr] ?? 0) + correct;
                            totalBenar += correct;
                            totalSoal++;
                        }
                    }
                    for (const asp of CT_ASPECTS) row[`${asp} Benar`] = aspectCounts[asp] ?? 0;
                    row["Total Benar"] = totalBenar;
                row["Nilai"] = totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0;
                return row;
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pretestRows), "Pre-Test");
        }

        // Sheet: Posttest
        if (detail.posttestGroups && detail.posttestGroups.length > 0) {
            const posttestRows = detail.students.map((s) => {
                const row: Record<string, string | number> = { "Siswa": s.siswaName };
                const aspectCounts: Record<string, number> = { D: 0, P: 0, A: 0, AL: 0 };
                let totalBenar = 0;
                let totalSoal = 0;
                let qIdx = 1;
                for (const group of detail.posttestGroups) {
                    for (const q of group.questions) {
                        const abbr = ctAbbr(q.ctAspect);
                        const colKey = `S-${qIdx} (${abbr})`;
                        const correct = s.posttestAnswers[q.id] ? 1 : 0;
                        row[colKey] = correct;
                        if (CT_ASPECTS.includes(abbr)) aspectCounts[abbr] = (aspectCounts[abbr] ?? 0) + correct;
                        totalBenar += correct;
                        totalSoal++;
                        qIdx++;
                    }
                }
                for (const asp of CT_ASPECTS) row[`${asp} Benar`] = aspectCounts[asp] ?? 0;
                row["Total Benar"] = totalBenar;
                row["Nilai"] = totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0;
                return row;
            });
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(posttestRows), "Post-Test");
        }

            // Sheets: Kuis CT {n}
            for (const group of detail.ctQuizGroups) {
                const rows = detail.students.map((s) => {
                    const row: Record<string, string | number> = { "Siswa": s.siswaName };
                    const aspectCounts: Record<string, number> = { D: 0, P: 0, A: 0, AL: 0 };
                    let totalBenar = 0;
                    let totalSoal = 0;
                    let qIdx = 1;
                    for (const q of group.questions) {
                        const abbr = ctAbbr(q.ctAspect);
                        const colKey = `S-${qIdx} (${abbr})`;
                        const correct = s.quizAnswers[q.id] ? 1 : 0;
                        row[colKey] = correct;
                        if (CT_ASPECTS.includes(abbr)) aspectCounts[abbr] = (aspectCounts[abbr] ?? 0) + correct;
                        totalBenar += correct;
                        totalSoal++;
                        qIdx++;
                    }
                    for (const asp of CT_ASPECTS) row[`${asp} Benar`] = aspectCounts[asp] ?? 0;
                    row["Total Benar"] = totalBenar;
                    row["Nilai"] = totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0;
                    return row;
                });
                const sheetName = group.label.substring(0, 31); // max 31 chars
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
            }

            // Sheets: Kuis Reguler {n}
            for (const group of detail.regulerQuizGroups) {
                const rows = detail.students.map((s) => {
                    const row: Record<string, string | number> = { "Siswa": s.siswaName };
                    let totalBenar = 0;
                    let totalSoal = 0;
                    group.questions.forEach((q, idx) => {
                        const colKey = `S-${idx + 1}`;
                        const correct = s.quizAnswers[q.id] ? 1 : 0;
                        row[colKey] = correct;
                        totalBenar += correct;
                        totalSoal++;
                    });
                    row["Total Benar"] = totalBenar;
                    row["Nilai"] = totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0;
                    return row;
                });
                const sheetName = group.label.substring(0, 31); // max 31 chars
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
            }
        }

        const moduleName = moduleDetail?.moduleName ?? "modul";
        const safeModuleName = moduleName.replace(/[\\/:*?"<>|]/g, "-");
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
        XLSX.writeFile(wb, `${safeModuleName}_${timestamp}.xlsx`);
    };

    const rekomendasiConfig = {
        penguatan: {
            label: "Penguatan",
            bg: "bg-[#e8f4fc]",
            text: "text-[#2a7fbf]",
            icon: "💪",
        },
        remedial: {
            label: "Remedial",
            bg: "bg-[#fdeaea]",
            text: "text-[#d63c3c]",
            icon: "🚨",
        },
        pengayaan: {
            label: "Pengayaan",
            bg: "bg-[#e6f9ed]",
            text: "text-[#2a9d5c]",
            icon: "🌟",
        },
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
                <GuruHeader />
                <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7557ea] border-t-transparent mb-4"></div>
                        <p className="text-sm text-[#8a8d98]">
                            Memeriksa otorisasi...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // --- MODE 1: DETAIL MANAGEMENT VIEW ---
    if (modulId) {
        return (
            <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
                <GuruHeader />

                <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
                    <Link
                        href="/modul-guru"
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]"
                    >
                        <FiArrowLeft size={16} />
                        Kembali ke Halaman Modul
                    </Link>

                    {isLoadingDetails ? (
                        <div className="flex justify-center py-20">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
                        </div>
                    ) : errorDetails ? (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {errorDetails}
                        </div>
                    ) : moduleDetail ? (
                        <>
                            {/* Module Header Card */}
                            <div className="mt-4 flex flex-col items-start gap-4 sm:mt-6 sm:flex-row sm:gap-6">
                                <div className="hidden h-[100px] w-[130px] shrink-0 overflow-hidden rounded-2xl bg-[#d4f0f7] sm:block sm:h-[140px] sm:w-[180px] relative border border-[#e5e3ee]">
                                    <Image
                                        src={
                                            moduleDetail.moduleImgUrl ||
                                            "/assets/images/beranda-siswa/matapelajaran.png"
                                        }
                                        alt={moduleDetail.moduleName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-[18px] font-bold text-[#232530] sm:text-[22px]">
                                            {moduleDetail.moduleName}
                                        </h1>
                                        {isCTModule && (
                                            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#22c55e]">
                                                <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
                                                Berbasis Computational Thinking
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5a5d6a] sm:gap-x-4 sm:text-[12px]">
                                        <span className="flex items-center gap-1">
                                            📘 {topicCount} Topik
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📋 {materialCount} Materi
                                        </span>
                                        <span className="flex items-center gap-1">
                                            ⏱ {moduleDetail.targetTime || 0} Jam
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📅 Materi dalam 6 Bulan
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📄 Sertifikat
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[12px] text-[#7a7e8a]">
                                        Jenjang {moduleDetail.level || "SMA"} |
                                        Kelas {moduleDetail.class || "-"}
                                    </p>
                                    <p className="mt-2 text-[13px] font-semibold text-[#f39b39]">
                                        Siswa Terdaftar:{" "}
                                        {enrolledStudents.length}
                                    </p>
                                </div>
                            </div>

                            {/* Controls bar */}
                            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">

                                <div className="flex flex-1 items-center gap-3">
                                    <div className="flex h-[40px] flex-1 items-center gap-2 rounded-xl border border-[#e5e3ee] bg-white px-4 shadow-sm">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setStudentPage(1);
                                            }}
                                            placeholder="Cari nama siswa ..."
                                            className="min-w-0 flex-1 bg-transparent text-[12px] text-[#232530] outline-none placeholder:text-[#9aa0ad]"
                                        />
                                        <FaSearch
                                            size={14}
                                            className="text-[#9aa0ad]"
                                        />
                                    </div>
                                    <Link
                                        href={`/modul-guru/manajemen/rekap-kelas?modulId=${modulId}`}
                                        className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-xl border border-[#7054dc] px-4 text-[12px] font-semibold text-[#7054dc] hover:bg-[#f5f4fb] shadow-sm transition-colors"
                                    >
                                        <FiFileText size={14} />
                                        Rekap Matriks Kelas
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleExportXLSX}
                                        disabled={enrolledStudents.length === 0}
                                        className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-xl border border-[#7054dc] px-4 text-[12px] font-semibold text-[#7054dc] hover:bg-[#f5f4fb] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm transition-colors"
                                    >
                                        <FiDownload size={14} />
                                        Export
                                    </button>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFilterOpen((p) => !p)
                                            }
                                            className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] shadow-sm transition-colors"
                                        >
                                            <FiFilter size={14} />
                                            Filter
                                        </button>
                                        {filterOpen && (
                                            <div className="absolute right-0 top-full z-20 mt-2 w-[200px] rounded-xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                                                {activeFilter && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveFilter(
                                                                null,
                                                            );
                                                            setStudentPage(1);
                                                            setFilterOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#d63c3c] hover:bg-[#fef2f2]"
                                                    >
                                                        Reset Filter{" "}
                                                        <span className="text-[14px]">
                                                            ×
                                                        </span>
                                                    </button>
                                                )}
                                                {(
                                                    [
                                                        "penguatan",
                                                        "remedial",
                                                        "pengayaan",
                                                    ] as const
                                                ).map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveFilter(
                                                                activeFilter ===
                                                                    type
                                                                    ? null
                                                                    : type,
                                                            );
                                                            setStudentPage(1);
                                                            setFilterOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${activeFilter ===
                                                            type
                                                            ? "bg-[#f0ecff] text-[#7054dc]"
                                                            : "text-[#232530] hover:bg-[#f7f6ff]"
                                                            }`}
                                                    >
                                                        {
                                                            rekomendasiConfig[
                                                                type
                                                            ].label
                                                        }
                                                        {activeFilter ===
                                                            type && (
                                                                <span className="text-[#7054dc]">
                                                                    ✓
                                                                </span>
                                                            )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Table / List */}
                            <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white shadow-sm w-full">
                                <div className="w-full">
                                    <div className="grid gap-4 bg-[#f0eff5] px-5 py-3 text-[12px] font-semibold text-[#232530]" style={{ gridTemplateColumns: gridColsString }}>
                                        <span className="text-center">No</span>
                                        <span>Siswa</span>
                                        <span>Progres</span>
                                        <span className="text-center">
                                            Pre-Test
                                        </span>
                                        <span className="text-center">
                                            Post-Test
                                        </span>
                                        <span className="text-center">
                                            Rata2 Kuis
                                        </span>
                                        <span className="text-center">
                                            Rata2 CT
                                        </span>
                                        {hasReguler && (
                                            <span className="text-center">
                                                Rekomendasi Pengetahuan
                                            </span>
                                        )}
                                        {hasCT && (
                                            <span className="text-center">
                                                Rekomendasi BKT
                                            </span>
                                        )}
                                        <span className="text-center">
                                            Aksi
                                        </span>
                                    </div>

                                    {isLoadingStudents ? (
                                        <div className="flex items-center justify-center py-16">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
                                        </div>
                                    ) : errorStudents ? (
                                        <div className="px-5 py-8 text-center text-sm text-red-500">
                                            {errorStudents}
                                        </div>
                                    ) : filteredStudents.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <Image
                                                src="/assets/images/beranda-siswa/belum-ada.png"
                                                alt="Belum ada siswa"
                                                width={160}
                                                height={130}
                                                className="h-auto w-[160px]"
                                            />
                                            <p className="mt-4 text-[13px] text-[#9aa0ad]">
                                                Belum ada siswa yang terdaftar
                                            </p>
                                        </div>
                                    ) : (
                                        paginatedStudents.map((siswa, index) => {
                                            const globalIndex = (studentPage - 1) * 10 + index + 1;
                                            const cfg = rekomendasiConfig[siswa.rekomendasi as "penguatan" | "remedial" | "pengayaan"];
                                            const bktLabel = siswa.bktRecommendation;
                                            
                                            let bktBg = 'bg-[#fdeaea]';
                                            let bktText = 'text-[#d63c3c]';
                                            if (bktLabel === 'Pengayaan') {
                                                bktBg = 'bg-[#edfbf1]';
                                                bktText = 'text-[#31a04e]';
                                            } else if (bktLabel === 'Penguatan') {
                                                bktBg = 'bg-[#e8f4fc]';
                                                bktText = 'text-[#2a7fbf]';
                                            }
                                            
                                            return (
                                                <div
                                                    key={siswa.id}
                                                    className="grid items-center gap-4 border-t border-[#f0eff5] px-5 py-3.5 text-[12px] text-[#232530] hover:bg-[#fcfcff] transition-colors"
                                                    style={{ gridTemplateColumns: gridColsString }}
                                                >
                                                    <div className="text-center font-medium text-[#7a7e8a]">
                                                        {globalIndex}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/modul-guru/manajemen/siswa?studentId=${siswa.id}&modulId=${modulId}`}
                                                            className="font-semibold text-[#232530] hover:text-[#7054dc] transition-colors"
                                                        >
                                                            {siswa.name}
                                                        </Link>
                                                        <p className="text-[10px] text-[#7a7e8a]">
                                                            {siswa.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 flex-1 rounded-full bg-[#e7e2f6]">
                                                            <div
                                                                className="h-full rounded-full bg-[#7054dc] transition-all"
                                                                style={{
                                                                    width: `${siswa.progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="w-[34px] text-right text-[11px] font-semibold text-[#7a7e8a]">
                                                            {siswa.progress}
                                                            %
                                                        </span>
                                                    </div>
                                                    <span className="text-center font-medium">
                                                        {siswa.preTest}
                                                    </span>
                                                    <span className="text-center font-medium">
                                                        {siswa.postTest}
                                                    </span>
                                                    <span className="text-center font-medium">
                                                        {siswa.rataKuis}
                                                    </span>
                                                    <div className="flex justify-center text-center font-medium">
                                                        <span className="rounded-lg bg-[#f0eff5] px-3 py-1">
                                                            {siswa.rataKuisCt}
                                                        </span>
                                                    </div>

                                                    {hasReguler && (
                                                        <div className="flex justify-center">
                                                            <div
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${cfg.bg} ${cfg.text}`}
                                                            >
                                                                <span>{cfg.label}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {hasCT && (
                                                        <div className="flex justify-center">
                                                            <div className={`inline-flex items-center justify-center rounded-full px-3 py-1 font-semibold ${bktBg} ${bktText} group relative`}>
                                                                {bktLabel}
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-[180px] -translate-x-1/2 rounded-lg bg-[#232530] p-2 text-center text-[10px] text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-30">
                                                                    Nilai Mastery BKT: {Number(siswa.bktMastery).toFixed(2)}
                                                                    <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-[#232530]"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex justify-center">
                                                        <Link
                                                            href={`/modul-guru/manajemen/siswa?studentId=${siswa.id}&modulId=${modulId}`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e3ee] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#7a7e8a] hover:bg-[#f5f4fb] hover:text-[#7054dc] hover:border-[#7054dc] transition-all shadow-sm"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Student list pagination */}
                            {!isLoadingStudents && totalStudentPages > 1 && (
                                <CursorPagination
                                    currentPage={studentPage}
                                    totalPages={totalStudentPages}
                                    hasNext={studentPage < totalStudentPages}
                                    hasPrev={studentPage > 1}
                                    onNext={() => setStudentPage((p) => Math.min(totalStudentPages, p + 1))}
                                    onPrev={() => setStudentPage((p) => Math.max(1, p - 1))}
                                    onPageClick={(page) => setStudentPage(page)}
                                />
                            )}
                        </>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            Modul tidak ditemukan.
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // --- MODE 2: ALL MODULES LIST VIEW (FALLBACK) ---
    return (
        <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
            <GuruHeader />

            <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-[20px] font-semibold text-[#232530]">
                            Manajemen Modul
                        </h1>
                        <p className="mt-1 text-[13px] text-[#7c808f]">
                            Kelola modul Anda dan lihat progres belajar siswa
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-[44px] w-full items-center gap-3 rounded-full border border-[#e3e1ea] bg-white px-4 text-[#8a8d98] shadow-sm md:w-auto">
                            <input
                                type="text"
                                value={searchModuleQuery}
                                onChange={(e) =>
                                    setSearchModuleQuery(e.target.value)
                                }
                                placeholder="Cari modul..."
                                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#2d2d3a] outline-none placeholder:text-[#9ca0ad] md:w-[220px] md:flex-none"
                            />
                            <FaSearch
                                size={14}
                                className="shrink-0 text-[#8a8d98]"
                            />
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

                <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e5e3ee] bg-white shadow-sm">
                    <table className="w-full min-w-[700px] border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-[#f0eff5] text-[13px] font-semibold text-[#232530]">
                                <th className="px-5 py-3.5 text-left font-semibold">
                                    Judul Modul
                                </th>
                                <th className="px-5 py-3.5 text-left font-semibold">
                                    Tingkat
                                </th>
                                <th className="px-5 py-3.5 text-left font-semibold">
                                    Status
                                </th>
                                <th className="px-5 py-3.5 text-right font-semibold">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingModules && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-12 text-center text-[13px] text-[#8a8d98]"
                                    >
                                        Memuat data...
                                    </td>
                                </tr>
                            )}

                            {!isLoadingModules &&
                                filteredModules.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-12 text-center text-[13px] text-[#8a8d98]"
                                        >
                                            Tidak ada modul ditemukan.
                                        </td>
                                    </tr>
                                )}

                            {!isLoadingModules &&
                                filteredModules.map((modul) => (
                                    <tr
                                        key={modul.id}
                                        className="border-t border-[#f0eff5] text-[13px] text-[#232530] transition-colors hover:bg-[#faf9ff]"
                                    >
                                        <td className="px-5 py-4 font-medium">
                                            {modul.moduleName}
                                        </td>
                                        <td className="px-5 py-4 text-[#7c808f]">
                                            {[modul.level, modul.class]
                                                .filter(Boolean)
                                                .join(" | Kelas ") || "-"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-semibold ${modul.isDraft
                                                    ? "bg-[#fef3e2] text-[#f39b39]"
                                                    : "bg-[#e6f7e6] text-[#2e9b4e]"
                                                    }`}
                                            >
                                                {modul.isDraft
                                                    ? "Draft"
                                                    : "Terbit"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                {!modul.isDraft && (
                                                    <Link
                                                        href={`/modul-guru/manajemen?modulId=${modul.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e6] border border-[#f39b39]"
                                                    >
                                                        Kelola
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/modul/${modul.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#7557ea] transition-colors hover:bg-[#f0ebff]"
                                                >
                                                    <FiEdit2 size={13} />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteModule(
                                                            modul.id,
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId === modul.id
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#ff6b5d] transition-colors hover:bg-[#fff1ef] disabled:opacity-50"
                                                >
                                                    <FiTrash2 size={13} />
                                                    {deletingId === modul.id
                                                        ? "Menghapus..."
                                                        : "Hapus"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {!isLoadingModules && modules.length > 0 && (
                    <CursorPagination
                        currentPage={currentPageNumber}
                        hasNext={hasNext}
                        hasPrev={hasPrev}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                )}
            </main>
        </div>
    );
}

export default function ManajemenModulPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
                    <GuruHeader />
                    <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7557ea] border-t-transparent mb-4"></div>
                            <p className="text-sm text-[#8a8d98]">
                                Memuat data...
                            </p>
                        </div>
                    </main>
                </div>
            }
        >
            <ManajemenModulContent />
        </Suspense>
    );
}

