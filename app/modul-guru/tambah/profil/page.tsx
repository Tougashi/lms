"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FiBookOpen,
    FiCheckSquare,
    FiDollarSign,
    FiEdit2,
    FiFileText,
    FiLayers,
} from "react-icons/fi";

import GuruHeader from "../../../component/guru/GuruHeader";
import { guruModulApi, uploadApi } from "../../../lib/api";
import { useRoleGuard } from "../../../lib/hooks/useRoleGuard";
import { useUpload } from "../../hooks/useUpload";
import type { GuruModuleUpdatePayload } from "../../../lib/types/guru";
import { AxiosError } from "axios";

import { useAuth } from "../../../context/AuthContext";
import { usePopup } from "../../../component/ui/PopupProvider";

const inputClassName =
    "mt-2 h-[40px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]";

const textareaClassName =
    "mt-2 w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]";

function TambahModulProfilPageContent() {
    const { isAuthorized } = useRoleGuard(["tutor"]);
    const { upload: uploadImage, isUploading: isImageUploading } = useUpload();
    const searchParams = useSearchParams();
    const router = useRouter();
    const modulId = searchParams.get("modulId");

    const [isExpanded, setIsExpanded] = useState(false);
    const [accessType, setAccessType] = useState<"SISWA" | "UMUM">("SISWA");
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [coverUploading, setCoverUploading] = useState(false);
    const coverObjectUrlRef = useRef<string | null>(null);
    const { user } = useAuth();
    const { showLoading, hideLoading, toast } = usePopup();

    const [isLoading, setIsLoading] = useState(!!modulId);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form state
    const [moduleName, setModuleName] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState("");
    const [kelas, setKelas] = useState("");
    const [difficulty, setDifficulty] = useState("Menengah");
    const [targetTime, setTargetTime] = useState(1);
    const [targetTimeUnit, setTargetTimeUnit] = useState<"bulan" | "minggu">(
        "bulan",
    );
    const [hasCertificate, setHasCertificate] = useState(false);

    // Load existing module data if editing
    useEffect(() => {
        if (!modulId) return;
        const load = async () => {
            try {
                const data = await guruModulApi.detail(modulId);
                setModuleName(data.moduleName || "");
                setSubtitle(data.subtitle || "");
                setDescription(data.description || "");
                setLevel(data.level || "");
                setKelas(data.class || "");
                setDifficulty(data.difficulty || "Menengah");
                setAccessType((data.modulType as "SISWA" | "UMUM") || "SISWA");
                if (data.targetTime) {
                    if (data.targetTime >= 60) {
                        setTargetTime(Math.round(data.targetTime / 60));
                        setTargetTimeUnit("bulan");
                    } else {
                        setTargetTime(data.targetTime);
                        setTargetTimeUnit("minggu");
                    }
                }
                if (data.moduleImgUrl) {
                    setCoverUrl(data.moduleImgUrl);
                    setCoverPreview(data.moduleImgUrl);
                }
                setHasCertificate(data.hasCertificate ?? false);
                setIsExpanded(true);
            } catch (err) {
                console.error("Load module error:", err);
                setError("Gagal memuat data modul.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [modulId]);

    useEffect(() => {
        return () => {
            if (coverObjectUrlRef.current) URL.revokeObjectURL(coverObjectUrlRef.current);
        };
    }, []);

    // Dynamic class options based on selected level (jenjang)
    const kelasOptions = useMemo(() => {
        switch (level) {
            case "SD":
                return ["1", "2", "3", "4", "5", "6"];
            case "SMP":
                return ["7", "8", "9"];
            case "SMA":
                return ["10", "11", "12"];
            default:
                return [];
        }
    }, [level]);

    // Reset kelas when jenjang changes and current kelas is no longer valid
    const prevLevelRef = useRef(level);
    useEffect(() => {
        if (prevLevelRef.current !== level) {
            prevLevelRef.current = level;
            if (kelas && !kelasOptions.includes(kelas)) {
                setKelas("");
            }
        }
    }, [level, kelasOptions, kelas]);

    const computedTargetTime = useMemo(() => {
        return targetTimeUnit === "bulan" ? targetTime * 60 : targetTime * 7;
    }, [targetTime, targetTimeUnit]);

    const handleSave = async () => {
        if (!moduleName.trim()) {
            setError("Judul modul wajib diisi.");
            return;
        }
        if (!subtitle.trim()) {
            setError("Subtitle modul wajib diisi.");
            return;
        }

        setIsSaving(true);
        setError("");
        setSuccessMsg("");
        showLoading("Menyimpan profil modul...");

        try {
            const payload = {
                moduleName: moduleName.trim(),
                subtitle: subtitle.trim(),
                description: description.trim(),
                targetTime: computedTargetTime,
                moduleImgUrl: coverUrl || undefined,
                difficulty,
                level: level || undefined,
                class: kelas || undefined,
                modulType: accessType,
                hasCertificate,
            };

            if (modulId) {
                await guruModulApi.update(modulId, payload);
                setSuccessMsg("Modul berhasil diperbarui!");
            } else {
                if (!user?.id) {
                    setError(
                        "Gagal mengidentifikasi tutor. Silakan login ulang.",
                    );
                    return;
                }
                const newModul = await guruModulApi.create({
                    ...payload,
                    difficulty: payload.difficulty as
                        | "Beginner"
                        | "Intermediate"
                        | "Advanced",
                    tutorId: user.id,
                });
                setSuccessMsg("Modul berhasil dibuat!");
                router.replace(
                    `/modul-guru/tambah/profil?modulId=${newModul.id}`,
                );
            }
        } catch (err: unknown) {
            console.error("Save module error:", err);
            setError(
                err instanceof Error ? err.message : "Gagal menyimpan modul.",
            );
        } finally {
            hideLoading();
            setIsSaving(false);
        }
    };

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
                <GuruHeader />
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
                        <p className="text-sm text-[#8a8d98]">
                            Memuat data modul...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
            <GuruHeader />

            <main className="w-full px-0 py-0">
                <div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
                    <aside className="hidden border border-[#e5e3ee] bg-white px-5 py-6 lg:block lg:min-h-[calc(100vh-74px)]">
                        <div className="flex h-full flex-col">
                            <p className="text-[13px] font-semibold text-[#232530]">
                                Rencanakan Modul anda
                            </p>
                            <nav className="mt-4 space-y-3 text-[13px]">
                                <div className="flex items-center gap-2 text-[#7054dc]">
                                    <FiFileText size={12} />
                                    <span className="font-semibold">
                                        Profil Modul Anda
                                    </span>
                                </div>
                                <Link
                                    href={
                                        modulId
                                            ? `/modul-guru/tambah/harga?modulId=${modulId}`
                                            : "#"
                                    }
                                    className="flex items-center gap-2 text-[#7a7e8a] hover:text-[#7054dc] transition-colors"
                                >
                                    <FiDollarSign size={12} />
                                    Penetapan Harga Modul
                                </Link>
                            </nav>

                            <p className="mt-8 text-[13px] font-semibold text-[#232530]">
                                Konten Modul Anda
                            </p>
                            <nav className="mt-4 space-y-3 text-[13px] text-[#7a7e8a]">
                                <Link
                                    href={
                                        modulId
                                            ? `/modul-guru/tambah/konten?modulId=${modulId}`
                                            : "#"
                                    }
                                    className="flex items-center gap-2 hover:text-[#7054dc] transition-colors"
                                >
                                    <FiLayers size={12} />
                                    Konten Modul
                                </Link>
                                <Link
                                    href={
                                        modulId
                                            ? `/modul-guru/tambah/pre-post-test?modulId=${modulId}`
                                            : "#"
                                    }
                                    className="flex items-center gap-2 hover:text-[#7054dc] transition-colors"
                                >
                                    <FiCheckSquare size={12} />
                                    Pree - Post Test Modul
                                </Link>
                            </nav>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="mt-16 w-full cursor-pointer rounded-full bg-[#7054dc] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </aside>

                    <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                                {successMsg}
                            </div>
                        )}

                        <div className="flex flex-col items-center">
                            <div className="rounded-[26px] border border-[#f0eff6] bg-white p-3 shadow-[0_10px_24px_rgba(20,20,30,0.06)]">
                                <div className="relative h-[180px] w-[300px] overflow-hidden rounded-[20px] border border-[#e5e3ee] bg-[#f4f3ff]">
                                    {coverUploading && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-[20px]">
                                            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[#7054dc] shadow-md">
                                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Mengunggah...
                                            </div>
                                        </div>
                                    )}
                                    {coverPreview ? (
                                        <Image
                                            src={coverPreview}
                                            alt="Preview cover modul"
                                            width={300}
                                            height={180}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <FiBookOpen
                                                size={34}
                                                className="text-[#7054dc]"
                                            />
                                        </div>
                                    )}
                                    <label
                                        htmlFor="cover-upload"
                                        className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#d9d7df] bg-white text-[#7054dc]"
                                        aria-label="Edit cover"
                                    >
                                        <FiEdit2 size={12} />
                                    </label>
                                    <input
                                        id="cover-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (event) => {
                                            const file =
                                                event.target.files?.[0];
                                            if (!file) return;
                                            setCoverUrl(null);
                                            if (coverObjectUrlRef.current) {
                                                URL.revokeObjectURL(coverObjectUrlRef.current);
                                                coverObjectUrlRef.current = null;
                                            }
                                            const localUrl =
                                                URL.createObjectURL(file);
                                            coverObjectUrlRef.current = localUrl;
                                            setCoverPreview(localUrl);
                                            setCoverUploading(true);
                                            showLoading("Mengunggah cover modul...");
                                            try {
                                                const res =
                                                    await uploadApi.upload(
                                                        file,
                                                        "MODULE_IMAGE",
                                                    );
                                                setCoverUrl(res.url);
                                                setCoverPreview(res.url);
                                                URL.revokeObjectURL(localUrl);
                                                coverObjectUrlRef.current = null;
                                            } catch {
                                                // preview lokal tetap dipakai
                                                toast("Gagal mengunggah gambar", "error");
                                            } finally {
                                                hideLoading();
                                                setCoverUploading(false);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-[12px] font-semibold text-[#232530]">
                                Judul Modul
                            </label>
                            <input
                                type="text"
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                                placeholder="Masukkan judul modul"
                                className={inputClassName}
                            />
                            <p className="mt-1 text-[11px] text-[#7e8290]">
                                Judul sebaiknya menarik perhatian, informatif,
                                dan dioptimalkan untuk penelusuran
                            </p>

                            <label className="mt-4 block text-[12px] font-semibold text-[#232530]">
                                Subtitle kursus
                            </label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Masukkan subtitle modul"
                                className={inputClassName}
                            />
                            <p className="mt-1 text-[11px] text-[#7e8290]">
                                Gunakan 1 atau 2 kata kunci terkait, dan
                                sebutkan 3-4 area terpenting yang telah Anda
                                bahas sepanjang kursus Anda.
                            </p>
                        </div>

                        <div className="mt-6">
                            <label className="text-[12px] font-semibold text-[#232530]">
                                Deskripsi kursus
                            </label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Masukkan deskripsi kursus ..."
                                className={textareaClassName}
                            />
                            <div className="mt-1 flex items-center justify-between text-[11px] text-[#7e8290]">
                                <span>
                                    Deskripsikan kursus anda secara singkat
                                </span>
                                <span>{description.length}/200</span>
                            </div>
                        </div>

                        {!isExpanded && (
                            <div className="mt-5">
                                <p className="text-[12px] font-semibold text-[#232530]">
                                    Pilih Akses
                                </p>
                                <div className="mt-3 flex items-center gap-6 text-[12px] text-[#6e7280]">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="akses"
                                            checked={accessType === "SISWA"}
                                            onChange={() =>
                                                setAccessType("SISWA")
                                            }
                                        />
                                        Siswa
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="akses"
                                            checked={accessType === "UMUM"}
                                            onChange={() =>
                                                setAccessType("UMUM")
                                            }
                                        />
                                        Umum
                                    </label>
                                </div>
                            </div>
                        )}

                        {isExpanded && (
                            <div className="mt-6 space-y-4">
                                {accessType === "SISWA" && (
                                    <>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="text-[12px] font-semibold text-[#232530]">
                                                    Jenjang Sekolah
                                                </label>
                                                <select
                                                    className={inputClassName}
                                                    value={level}
                                                    onChange={(e) =>
                                                        setLevel(e.target.value)
                                                    }
                                                >
                                                    <option value="" disabled>
                                                        Pilih Jenjang
                                                    </option>
                                                    <option value="SD">
                                                        SD
                                                    </option>
                                                    <option value="SMP">
                                                        SMP
                                                    </option>
                                                    <option value="SMA">
                                                        SMA
                                                    </option>
                                                </select>
                                                <p className="mt-1 text-[11px] text-[#7e8290]">
                                                    Sebutkan kurikulum modul
                                                    anda
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-[12px] font-semibold text-[#232530]">
                                                    Kelas
                                                </label>
                                                <select
                                                    className={inputClassName}
                                                    value={kelas}
                                                    onChange={(e) =>
                                                        setKelas(e.target.value)
                                                    }
                                                    disabled={!level}
                                                >
                                                    <option value="" disabled>
                                                        {level
                                                            ? "Pilih Tingkatan Kelas"
                                                            : "Pilih jenjang terlebih dahulu"}
                                                    </option>
                                                    {kelasOptions.map((k) => (
                                                        <option
                                                            key={k}
                                                            value={k}
                                                        >
                                                            Kelas {k}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="mt-1 text-[11px] text-[#7e8290]">
                                                    Berapa lama pengerjaan modul
                                                    ini bagi siswa
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="text-[12px] font-semibold text-[#232530]">
                                        Level Kesulitan
                                    </label>
                                    <select
                                        className={inputClassName}
                                        value={difficulty}
                                        onChange={(e) =>
                                            setDifficulty(e.target.value)
                                        }
                                    >
                                        <option value="Beginner">Mudah</option>
                                        <option value="Intermediate">
                                            Menengah
                                        </option>
                                        <option value="Advanced">Sulit</option>
                                    </select>
                                    <p className="mt-1 text-[11px] text-[#7e8290]">
                                        Level kesulitan yang sesuai dengan isi
                                        modul
                                    </p>
                                </div>

                                <div>
                                    <label className="text-[12px] font-semibold text-[#232530]">
                                        Durasi Pembelajaran
                                    </label>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="number"
                                            value={targetTime}
                                            onChange={(e) =>
                                                setTargetTime(
                                                    Number(e.target.value) || 1,
                                                )
                                            }
                                            min={1}
                                            className={`${inputClassName} mt-0 w-[90px]`}
                                        />
                                        <select
                                            className={`${inputClassName} mt-0 w-[120px]`}
                                            value={targetTimeUnit}
                                            onChange={(e) =>
                                                setTargetTimeUnit(
                                                    e.target.value as
                                                        | "bulan"
                                                        | "minggu",
                                                )
                                            }
                                        >
                                            <option value="bulan">Bulan</option>
                                            <option value="minggu">
                                                Minggu
                                            </option>
                                        </select>
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7e8290]">
                                        Durasi pembelajaran modul yang diakses
                                        siswa merupakan materi selama beberapa
                                        waktu
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[12px] font-semibold text-[#232530]">
                                        Sertifikat
                                    </p>
                                    <div className="mt-3 flex items-center gap-6 text-[12px] text-[#6e7280]">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="hasCertificate"
                                                checked={hasCertificate}
                                                onChange={() => setHasCertificate(true)}
                                            />
                                            Ya
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="hasCertificate"
                                                checked={!hasCertificate}
                                                onChange={() => setHasCertificate(false)}
                                            />
                                            Tidak
                                        </label>
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7e8290]">
                                        Apakah modul ini memberikan sertifikat kepada siswa yang lulus
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pb-6">
                            {isExpanded ? (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white disabled:opacity-50"
                                >
                                    {isSaving
                                        ? "Menyimpan..."
                                        : "Simpan Profil Modul"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(true)}
                                    className="inline-flex h-[40px] w-[260px] cursor-pointer items-center justify-center rounded-xl bg-[#7054dc] text-[13px] font-semibold text-white"
                                >
                                    Selanjutnya
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default function TambahModulProfilPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
            <TambahModulProfilPageContent />
        </Suspense>
    );
}
