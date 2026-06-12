"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    FaBookOpen,
    FaListAlt,
    FaChevronDown,
    FaChevronUp,
    FaClipboardCheck,
    FaFileAlt,
    FaUsers,
    FaCalendarAlt,
    FaChartLine,
    FaCheck,
    FaStar,
} from "react-icons/fa";
import { MdTimer } from "react-icons/md";
import SiswaHeader from "../../component/siswa/SiswaHeader";
import AccordionMateri from "../../component/siswa/AccordionMateri";
import { siswaModulApi } from "../../lib/api";
import type { ModuleDetailResponse } from "../../lib/types/siswa";
import { ApiError } from "../../lib/types/umum";
import { AxiosError } from "axios";

function getAvatarUrl(seed: string) {
    return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}

function formatDuration(minutes: number): string {
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h} Jam ${m} Menit` : `${h} Jam`;
    }
    return `${minutes} Menit`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// function cleanSubmateriTitle(title: string, moduleName: string): string {
//     return title
//         .replace(/\s*[-–]\s*[c][a-z0-9]{4,24}$/gi, "")
//         .replace(/\b[c][a-z0-9]{4,24}\b/gi, moduleName)
//         .trim();
// }

function getPrice(item: ModuleDetailResponse): string | null {
    if (!item.isPaid || !item.modulPrice) return null;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(item.modulPrice);
}

export default function ModulDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    const [moduleData, setModuleData] = useState<ModuleDetailResponse | null>(
        null,
    );
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [error, setError] = useState("");
    const [enrollError, setEnrollError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError("");
            try {
                const res = await siswaModulApi.getById(id);
                setModuleData(res);
            } catch (err: unknown) {
                console.error("Modul detail fetch error:", err);
                setError(
                    err instanceof AxiosError
                        ? err.message
                        : "Gagal memuat detail modul",
                );
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const totalTopiks = moduleData?.topiks.length ?? 0;
    const totalMateris =
        moduleData?.topiks.reduce((sum, t) => sum + t.materis.length, 0) ?? 0;

    const isEnrolled = moduleData?.progress != null;
    const priceLabel = moduleData ? getPrice(moduleData) : null;

    const descriptionParagraphs = moduleData
        ? moduleData.description.split("\n").filter(Boolean)
        : [];

    const visibleParagraphs = isDescriptionExpanded
        ? descriptionParagraphs
        : descriptionParagraphs.slice(0, 1);

    const handleEnroll = async () => {
        setIsEnrolling(true);
        setEnrollError("");

        await siswaModulApi
            .enroll(id)
            .then(() => {
                window.location.href = `/modul/${id}/materi`;
            })
            .catch(async (err: unknown) => {
                if (err instanceof ApiError && err.status === 409) {
                    window.location.href = `/modul/${id}/materi`;
                    return;
                }

                if (err instanceof ApiError && err.status === 403) {
                    window.location.href = `/pembayaran/${id}`;
                    return;
                }

                const res = await siswaModulApi
                    .getById(id)
                    .catch((checkErr: unknown) => {
                        if (checkErr instanceof AxiosError) {
                            setEnrollError(
                                checkErr.response?.data?.message ||
                                    checkErr.message,
                            );
                        } else {
                            setEnrollError("Gagal mendaftar modul");
                        }
                        setIsEnrolling(false);
                    });

                if (res?.progress) {
                    window.location.href = `/modul/${id}/materi`;
                    return;
                }
                setIsEnrolling(false);
            });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#ffffff] text-[#202126]">
                <SiswaHeader />
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
                        <p className="text-sm text-[#8a8a96]">
                            Memuat detail modul...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !moduleData) {
        return (
            <div className="min-h-screen bg-[#ffffff] text-[#202126]">
                <SiswaHeader />
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <p className="text-red-500">
                            {error || "Modul tidak ditemukan"}
                        </p>
                        <Link
                            href="/eksplor-modul"
                            className="mt-4 inline-block text-sm text-[#7054dc] hover:underline"
                        >
                            ← Kembali ke Eksplor Modul
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#202126]">
            <SiswaHeader />

            <main className="pb-12">
                <section className="rounded-b-[40px] bg-[#E7E1FE]">
                    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28">
                        <div className="flex flex-col gap-6 rounded-3xl bg-transparent lg:flex-row lg:items-start">
                            <div className="mx-auto w-full max-w-[280px] shrink-0 rounded-2xl bg-white p-2 sm:p-3 lg:mx-0">
                                <div className="overflow-hidden rounded-xl bg-white">
                                    <div className="relative aspect-[16/10] w-full bg-white">
                                        <Image
                                            src={
                                                moduleData.moduleImgUrl ||
                                                "/assets/images/beranda-siswa/matapelajaran.png"
                                            }
                                            alt={`Ilustrasi ${moduleData.moduleName}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 280px"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h1 className="mb-2 mt-4 text-3xl font-bold text-[#202126]">
                                    {moduleData.moduleName}
                                </h1>

                                {moduleData.subtitle && (
                                    <p className="mb-4 text-sm text-[#4f5261]">
                                        {moduleData.subtitle}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#202126]">
                                    {totalTopiks > 0 && (
                                        <span className="inline-flex items-center gap-2">
                                            <FaBookOpen
                                                size={16}
                                                className="text-[#7054dc]"
                                            />
                                            {totalTopiks} Topik
                                        </span>
                                    )}
                                    {totalMateris > 0 && (
                                        <span className="inline-flex items-center gap-2">
                                            <FaListAlt
                                                size={16}
                                                className="text-[#7054dc]"
                                            />
                                            {totalMateris} Materi
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-2">
                                        <MdTimer
                                            size={16}
                                            className="text-[#7054dc]"
                                        />
                                        {formatDuration(moduleData.targetTime)}
                                    </span>
                                    {moduleData.pretestPostTestEnabled && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#7054dc]/10 px-3 py-1 text-xs font-medium text-[#7054dc]">
                                            <FaClipboardCheck size={14} />
                                            Pre & Post Test
                                        </span>
                                    )}
                                    {moduleData.hasCertificate && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f39b39]/10 px-3 py-1 text-xs font-medium text-[#f39b39]">
                                            <FaFileAlt size={14} />
                                            Sertifikat
                                        </span>
                                    )}
                                </div>

                                {(moduleData.level || moduleData.class) && (
                                    <p className="mt-3 text-sm font-medium text-[#202126]">
                                        {[moduleData.level, moduleData.class]
                                            .filter(Boolean)
                                            .join(" | ")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 sm:-mt-16">
                    <div className="rounded-2xl border border-[#b6a8f0] bg-white p-4 sm:p-6">
                        <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
                            <div>
                                <h2 className="text-sm font-semibold text-[#202126]">
                                    Deskripsi
                                </h2>
                                <div className="mt-3 space-y-3">
                                    {visibleParagraphs.length > 0 ? (
                                        visibleParagraphs.map(
                                            (paragraph, index) => (
                                                <p
                                                    key={index}
                                                    className="text-xs leading-relaxed text-[#4f5261] sm:text-sm"
                                                >
                                                    {paragraph}
                                                </p>
                                            ),
                                        )
                                    ) : (
                                        <p className="text-xs text-[#8a8a96] sm:text-sm">
                                            Deskripsi belum tersedia.
                                        </p>
                                    )}
                                </div>
                                {descriptionParagraphs.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsDescriptionExpanded(
                                                (prev) => !prev,
                                            )
                                        }
                                        className="mt-4 text-xs font-medium text-[#7054dc] hover:underline"
                                    >
                                        {isDescriptionExpanded
                                            ? "Sembunyikan"
                                            : "Selengkapnya"}{" "}
                                        {isDescriptionExpanded ? (
                                            <FaChevronUp
                                                className="ml-1 inline"
                                                size={10}
                                            />
                                        ) : (
                                            <FaChevronDown
                                                className="ml-1 inline"
                                                size={10}
                                            />
                                        )}
                                    </button>
                                )}
                            </div>

                            <aside className="space-y-2.5 rounded-xl border border-[#efedf7] bg-[#fcfbff] p-3 sm:p-4">
                                {enrollError && (
                                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                        {enrollError}
                                    </p>
                                )}
                                {priceLabel ? (
                                    <p className="w-full text-center text-4xl font-bold text-[#7054dc]">
                                        {priceLabel}
                                    </p>
                                ) : (
                                    <p className="text-xs text-[#72758a]">
                                        {isEnrolled
                                            ? "Kelas aktif kamu"
                                            : "Gratis mengakses kelas ini"}
                                    </p>
                                )}

                                {isEnrolled ? (
                                    <Link
                                        href={`/modul/${id}/materi`}
                                        className="inline-flex w-full items-center justify-center rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    >
                                        Lanjutkan Belajar
                                    </Link>
                                ) : priceLabel ? (
                                    <button
                                        type="button"
                                        onClick={handleEnroll}
                                        disabled={isEnrolling}
                                        className="w-full rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                    >
                                        {isEnrolling
                                            ? "Memproses..."
                                            : "Daftar"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleEnroll}
                                        disabled={isEnrolling}
                                        className="w-full rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                    >
                                        {isEnrolling
                                            ? "Memproses..."
                                            : "Daftar Gratis"}
                                    </button>
                                )}

                                {moduleData.hasStudyGroup && (
                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#7054dc] px-3 py-2.5 text-sm font-medium text-[#7054dc] transition-colors hover:bg-[#f6f2ff]"
                                    >
                                        <FaUsers size={12} />
                                        Kelompok Belajar
                                    </button>
                                )}

                                {isEnrolled && moduleData.progress && (
                                    <div className="mt-2 rounded-lg bg-[#f5f2ff] p-3">
                                        <p className="text-xs font-semibold text-[#7054dc]">
                                            Progress Kamu
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e2ec]">
                                                <div
                                                    className="h-full rounded-full bg-[#7054dc]"
                                                    style={{
                                                        width: `${moduleData.progress.progressPercentage ?? 0}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-[#7054dc]">
                                                {Math.round(
                                                    moduleData.progress
                                                        .progressPercentage ??
                                                        0,
                                                )}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>
                    </div>
                </div>

                <section className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:mt-10 sm:px-6 lg:grid-cols-[1fr_290px]">
                    <div>
                        <h3 className="text-lg font-bold text-[#202126]">
                            Materi yang Dipelajari
                        </h3>

                        <div className="mt-4 space-y-3">
                            {moduleData.pretest && (
                                <div className="flex items-center gap-3 rounded-xl border border-[#f9e5b8] bg-[#fffbe6] px-4 py-3 text-sm font-medium text-[#202126]">
                                    <FaStar
                                        className="shrink-0 text-[#f2b445]"
                                        size={16}
                                    />
                                    {moduleData.pretest.pretestName ||
                                        "Pretest"}
                                </div>
                            )}

                            <AccordionMateri
                                topiks={moduleData.topiks}
                                completedSubmateri={moduleData.progress?.completedSubmateri}
                                completedContentItems={moduleData.progress?.completedContentItems}
                                modulId={id}
                            />

                            {moduleData.posttest && (
                                <div className="flex items-center gap-3 rounded-xl border border-[#dcdae6] bg-[#fcfbff] px-4 py-3 text-sm font-medium text-[#202126]">
                                    <FaClipboardCheck
                                        className="shrink-0 text-[#7054dc]"
                                        size={16}
                                    />
                                    Posttest
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        {moduleData.tutor && (
                            <div>
                                <h4 className="text-lg font-bold text-[#202126]">
                                    Pengajar
                                </h4>
                                <div className="mt-3 flex items-start gap-3 text-sm text-[#3f4454]">
                                    <img
                                        src={
                                            moduleData.tutor.profileImg ||
                                            getAvatarUrl(
                                                moduleData.tutor.fullName,
                                            )
                                        }
                                        alt="Foto profil pengajar"
                                        className="h-10 w-10 rounded-full border border-[#e7e4f2] bg-[#f3f1ff] object-cover"
                                    />
                                    <p>
                                        {moduleData.tutor.fullName}
                                        <br />
                                        <span className="font-bold">
                                            Pengajar
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-lg font-bold text-[#202126]">
                                Terakhir Update
                            </h4>
                            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                                <FaCalendarAlt className="text-[#f39b39]" />
                                {formatDate(moduleData.updatedAt)}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-[#202126]">
                                Durasi Pembelajaran
                            </h4>
                            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                                <MdTimer className="text-[#f39b39]" />
                                {formatDuration(moduleData.targetTime)}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-[#202126]">
                                Tingkat Kesulitan
                            </h4>
                            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                                <FaChartLine className="text-[#f39b39]" />
                                {moduleData.difficulty}
                            </p>
                        </div>

                        {isEnrolled && moduleData.progress && (
                            <div>
                                <h4 className="text-lg font-bold text-[#202126]">
                                    Status Belajar
                                </h4>
                                <div className="mt-3 space-y-1 text-sm text-[#3f4454]">
                                    {moduleData.progress.pretestScore !=
                                        null && (
                                        <p className="inline-flex items-center gap-2">
                                            <FaCheck
                                                className="text-[#37b66a]"
                                                size={12}
                                            />
                                            Pre-Test:{" "}
                                            {moduleData.progress.pretestScore}
                                            /100
                                        </p>
                                    )}
                                    {moduleData.progress.posttestScore !=
                                        null && (
                                        <p className="inline-flex items-center gap-2">
                                            <FaCheck
                                                className="text-[#37b66a]"
                                                size={12}
                                            />
                                            Post-Test:{" "}
                                            {moduleData.progress
                                                .posttestScore ?? ""}
                                            /100
                                        </p>
                                    )}
                                    {moduleData.progress.isGraduated && (
                                        <p className="inline-flex items-center gap-2 font-semibold text-[#f39b39]">
                                            <FaCheck
                                                className="text-[#f39b39]"
                                                size={12}
                                            />
                                            Lulus
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>
                </section>
            </main>
        </div>
    );
}
