"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUploadCloud, FiX, FiAlertCircle, FiCheckCircle, FiDownload, FiFile } from "react-icons/fi";
import { guruImportApi, ImportModulResult, ImportValidationError } from "../../lib/api";
import { ApiError } from "../../lib/types/umum";

interface ImportModulModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type View = "picker" | "errors" | "success";

export default function ImportModulModal({ isOpen, onClose, onSuccess }: ImportModulModalProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [view, setView] = useState<View>("picker");
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportModulResult | null>(null);
    const [errors, setErrors] = useState<ImportValidationError[]>([]);

    const reset = useCallback(() => {
        setView("picker");
        setFile(null);
        setIsDragOver(false);
        setIsUploading(false);
        setResult(null);
        setErrors([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleClose = () => {
        reset();
        onClose();
    };

    const acceptFile = (f: File) => {
        if (!f.name.endsWith(".xlsx")) return;
        setFile(f);
        setView("picker");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) acceptFile(f);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) acceptFile(f);
    };

    const handleImport = async () => {
        if (!file || isUploading) return;
        setIsUploading(true);
        try {
            const res = await guruImportApi.importModul(file);
            setResult(res);
            setView("success");
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                const data = err.data as { errors?: ImportValidationError[] };
                setErrors(data?.errors ?? []);
                setView("errors");
            } else {
                const msg = err instanceof ApiError ? err.message : "Gagal mengimpor modul. Coba lagi.";
                setErrors([{ sheet: "-", row: 0, field: "-", message: msg }]);
                setView("errors");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleViewModule = () => {
        if (!result) return;
        handleClose();
        onSuccess();
        router.push(`/modul-guru/tambah/konten?modulId=${result.modulId}`);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className="relative w-full max-w-[540px] rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-[#7557ea] px-6 py-4">
                    <div>
                        <h2 className="text-[15px] font-semibold text-white">
                            {view === "picker" && "Import Modul dari Excel"}
                            {view === "errors" && "Ditemukan Kesalahan pada Template"}
                            {view === "success" && "Import Berhasil!"}
                        </h2>
                        <p className="mt-0.5 text-[12px] text-white/70">
                            {view === "picker" && "Unggah file .xlsx yang sudah diisi sesuai template"}
                            {view === "errors" && "Perbaiki baris berikut lalu coba import ulang"}
                            {view === "success" && "Semua konten berhasil dibuat secara otomatis"}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {/* ── Picker view ── */}
                    {view === "picker" && (
                        <>
                            {/* Download template */}
                            <a
                                href={guruImportApi.templateUrl}
                                download
                                className="mb-4 flex items-center gap-3 rounded-xl border border-[#e3e1ea] bg-[#f9f8ff] px-4 py-3 transition-colors hover:bg-[#f0ebff]"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7557ea]/10">
                                    <FiDownload size={16} className="text-[#7557ea]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-[#232530]">Unduh Template Excel</p>
                                    <p className="text-[11px] text-[#8a8d98]">
                                        Template berisi contoh data dan panduan pengisian
                                    </p>
                                </div>
                            </a>

                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
                                    isDragOver
                                        ? "border-[#7557ea] bg-[#f0ebff]"
                                        : file
                                        ? "border-[#7557ea]/40 bg-[#f9f8ff]"
                                        : "border-[#e3e1ea] bg-[#fafafa] hover:border-[#7557ea]/50 hover:bg-[#f9f8ff]"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {file ? (
                                    <>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7557ea]/10">
                                            <FiFile size={24} className="text-[#7557ea]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-semibold text-[#232530]">{file.name}</p>
                                            <p className="mt-1 text-[11px] text-[#8a8d98]">
                                                {(file.size / 1024).toFixed(1)} KB — Klik untuk ganti file
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0ebff]">
                                            <FiUploadCloud size={24} className="text-[#7557ea]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-semibold text-[#232530]">
                                                Seret file ke sini atau klik untuk memilih
                                            </p>
                                            <p className="mt-1 text-[11px] text-[#8a8d98]">
                                                Hanya file .xlsx yang didukung (maks. 10 MB)
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    className="h-[40px] rounded-full border border-[#e3e1ea] px-5 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f4f4f7]"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!file || isUploading}
                                    className="inline-flex h-[40px] items-center gap-2 rounded-full bg-[#7557ea] px-5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(117,87,234,0.3)] transition-colors hover:bg-[#6648df] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Memproses...
                                        </>
                                    ) : (
                                        "Mulai Import"
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Errors view ── */}
                    {view === "errors" && (
                        <>
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#fca5a5]/40 bg-[#fef2f2] px-4 py-3">
                                <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-[#dc2626]" />
                                <p className="text-[13px] text-[#991b1b]">
                                    Ditemukan {errors.length} kesalahan. Perbaiki semua baris berikut di file Excel Anda lalu coba import ulang.
                                </p>
                            </div>

                            <div className="max-h-[280px] overflow-y-auto rounded-xl border border-[#e3e1ea]">
                                <table className="w-full text-[12px]">
                                    <thead className="sticky top-0 bg-[#f9f8ff]">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-[#6b7280]">Sheet</th>
                                            <th className="px-3 py-2 text-left font-semibold text-[#6b7280]">Baris</th>
                                            <th className="px-3 py-2 text-left font-semibold text-[#6b7280]">Kolom</th>
                                            <th className="px-3 py-2 text-left font-semibold text-[#6b7280]">Pesan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {errors.map((err, i) => (
                                            <tr
                                                key={i}
                                                className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
                                            >
                                                <td className="px-3 py-2 font-medium text-[#7557ea]">{err.sheet}</td>
                                                <td className="px-3 py-2 text-[#6b7280]">{err.row || "-"}</td>
                                                <td className="px-3 py-2 text-[#374151]">{err.field}</td>
                                                <td className="px-3 py-2 text-[#dc2626]">{err.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    className="h-[40px] rounded-full border border-[#e3e1ea] px-5 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f4f4f7]"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => { reset(); }}
                                    className="h-[40px] rounded-full bg-[#7557ea] px-5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(117,87,234,0.3)] transition-colors hover:bg-[#6648df]"
                                >
                                    Pilih File Lain
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Success view ── */}
                    {view === "success" && result && (
                        <>
                            <div className="mb-5 flex flex-col items-center gap-3 py-2 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4]">
                                    <FiCheckCircle size={28} className="text-[#16a34a]" />
                                </div>
                                <p className="text-[13px] text-[#374151]">
                                    Modul berhasil dibuat. Semua konten di bawah sudah siap.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Topik", value: result.summary.topik },
                                    { label: "Materi", value: result.summary.materi },
                                    { label: "Rangkuman", value: result.summary.rangkuman },
                                    { label: "Grup Kuis", value: result.summary.quizGroup },
                                    { label: "Soal Kuis", value: result.summary.quiz },
                                    { label: "Soal Pretest", value: result.summary.pretestSoal },
                                ].map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex flex-col items-center rounded-xl border border-[#e3e1ea] bg-[#f9f8ff] px-3 py-3"
                                    >
                                        <span className="text-[22px] font-bold text-[#7557ea]">{s.value}</span>
                                        <span className="mt-0.5 text-[11px] text-[#8a8d98]">{s.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => { reset(); onSuccess(); onClose(); }}
                                    className="h-[40px] rounded-full border border-[#e3e1ea] px-5 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f4f4f7]"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={handleViewModule}
                                    className="h-[40px] rounded-full bg-[#7557ea] px-5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(117,87,234,0.3)] transition-colors hover:bg-[#6648df]"
                                >
                                    Lihat Modul
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
