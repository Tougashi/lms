"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FiBookOpen,
    FiCheckSquare,
    FiChevronDown,
    FiDollarSign,
    FiEdit2,
    FiFileText,
    FiLayers,
    FiPlus,
    FiSettings,
    FiTrash2,
    FiX,
} from "react-icons/fi";

import AdminHeader from "../../../../component/admin/AdminHeader";
import AdminModuleSidebar from "../../../components/AdminModuleSidebar";
import {
    adminModulApi,
    adminTopikApi,
    adminMateriApi,
    adminTopikKuisApi,
    uploadApi,
    guruMateriApi,
} from "../../../../lib/api";
import type { GuruTopikWithMateri } from "../../../../lib/types/guru";

import { usePopup } from "../../../../component/ui/PopupProvider";
import TrixEditor from "../../../../component/ui/TrixEditor";

const getYoutubeVideoId = (url: string) => {
    const match = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{6,})/);
    return match ? match[1] : null;
};

const getYoutubeThumb = (url: string) => {
    const id = getYoutubeVideoId(url);
    if (!id) return "";
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

// Bug 3: Strip HTML tags (dari TrixEditor) saat simpan/tampilkan
const stripHtml = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
};

function EditModulKontenPageContent() {
    const isAuthorized = true;
    const searchParams = useSearchParams();
    const router = useRouter();
    const modulId = searchParams.get("id") || searchParams.get("modulId");
    const { toast, confirm, showLoading, hideLoading } = usePopup();

    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTopicAdded, setIsTopicAdded] = useState(false);
    const [topicTitle, setTopicTitle] = useState("");
    const [topicId, setTopicId] = useState<string | null>(null);
    const [topiks, setTopiks] = useState<GuruTopikWithMateri[]>([]);
    const [activeTopikId, setActiveTopikId] = useState<string | null>(null);
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [topicError, setTopicError] = useState("");
    const [isEditingTopic, setIsEditingTopic] = useState(false);
    const [editTopicTitle, setEditTopicTitle] = useState("");
    const [materials, setMaterials] = useState<
        {
            id: number;
            title: string;
            type: "video" | "artikel";
            isSaved: boolean;
            isExpanded: boolean;
            videoSource: "upload" | "link";
            linkUrl: string;
            linkPreviewTitle: string;
            linkPreviewThumb: string;
            linkVideoTitle: string;
            linkVideoDuration: string;
            showUploadSuccess: boolean;
            fileName: string;
            fileSize: string;
            uploadProgress: number;
            uploadStatus: "idle" | "uploading" | "done";
            previewUrl: string;
            duration: string;
            articleContent: string;
            _editSnapshot?: { articleContent: string } | null;
        }[]
    >([]);
    const [activeMaterialId, setActiveMaterialId] = useState<number | null>(
        null,
    );
    const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
    const [newMaterialTitle, setNewMaterialTitle] = useState("");
    const [newMaterialType, setNewMaterialType] = useState<"video" | "artikel">(
        "video",
    );
    const [isNewMaterialTypeOpen, setIsNewMaterialTypeOpen] = useState(false);
    const [editingMaterialId, setEditingMaterialId] = useState<number | null>(
        null,
    );
    const [editTitle, setEditTitle] = useState("");
    const [openTypeMenuId, setOpenTypeMenuId] = useState<number | null>(null);

    const [quizzes, setQuizzes] = useState<
        {
            id: number;
            title: string;
            isExpanded: boolean;
            ctMode: boolean;
            duration: number;
            minScore: number;
            scorePerQuestion: number;
            questions: {
                id: number;
                label: string;
                answers: { id: number; text: string; isCorrect: boolean }[];
            }[];
            ctStories: {
                id: number;
                cerita?: string;
                subQuestions: {
                    id: number;
                    label: string;
                    ctAspect?: string;
                    answers: { id: number; text: string; isCorrect: boolean }[];
                }[];
            }[];
        }[]
    >([]);
    const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);
    const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
    const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
    const [editQuizTitle, setEditQuizTitle] = useState("");

    // Maps local numeric IDs to server string IDs for materials and quizzes
    const [materialApiIds, setMaterialApiIds] = useState<
        Record<number, string>
    >({});
    const [quizApiIds, setQuizApiIds] = useState<Record<number, string>>({});
    const [subQuizApiIds, setSubQuizApiIds] = useState<Record<number, string>>(
        {},
    );
    const [isSavingMaterial, setIsSavingMaterial] = useState<number | null>(
        null,
    );
    const [isDeletingMaterial, setIsDeletingMaterial] = useState<number | null>(
        null,
    );
    const [isSavingQuiz, setIsSavingQuiz] = useState(false);

    const uploadSuccessTimersRef = useRef<Record<number, number>>({});
    const materialsRef = useRef(materials);

    useEffect(() => {
        materialsRef.current = materials;
    }, [materials]);

    // Load existing topics & materials from unified API
    useEffect(() => {
        if (!modulId) {
            setIsLoading(false);
            return;
        }
        const loadContent = async () => {
            try {
                const items = await adminMateriApi.getByModul(modulId);
                setTopiks(items);
                if (items.length > 0) {
                    const firstTopik = items[0];
                    setActiveTopikId(firstTopik.id);
                    setTopicTitle(firstTopik.nama);
                    setTopicId(firstTopik.id);
                    setIsTopicAdded(true);

                    // Bug 1: Gunakan offset berbasis index agar localId tidak collision
                    const baseId = Date.now();
                    const newMaterialApiIds: Record<number, string> = {};
                    const loaded = firstTopik.materis.map(
                        (item: any, idx: number) => {
                            const localId = baseId + idx * 10;
                            newMaterialApiIds[localId] = item.id;
                            return {
                                id: localId,
                                title: item.title || item.judul ||
                                    (item.isVideo
                                        ? `Video ${idx + 1}`
                                        : `Materi ${idx + 1}`),
                                type: (item.isVideo
                                    ? "video"
                                    : "artikel") as "video" | "artikel",
                                isSaved: true,
                                isExpanded: false,
                                videoSource: (item.videoUrl && !getYoutubeVideoId(item.videoUrl)) ? ("upload" as const) : ("link" as const),
                                linkUrl: (item.videoUrl && getYoutubeVideoId(item.videoUrl)) ? item.videoUrl : "",
                                linkPreviewTitle: "",
                                linkPreviewThumb: item.videoUrl
                                    ? getYoutubeThumb(item.videoUrl)
                                    : "",
                                linkVideoTitle: "",
                                linkVideoDuration: "",
                                showUploadSuccess: false,
                                fileName: "",
                                fileSize: "",
                                uploadProgress: 100,
                                uploadStatus: "done" as const,
                                previewUrl: (item.videoUrl && !getYoutubeVideoId(item.videoUrl)) ? item.videoUrl : "",
                                duration: "00:00",
                                articleContent: item.article || "",
                            };
                        },
                    );
                    setMaterialApiIds(newMaterialApiIds);
                    setMaterials(loaded);
                    if (loaded.length > 0)
                        setActiveMaterialId(loaded[0].id);
                    else
                        setActiveMaterialId(null);

                    // Load quizzes from API
                    // Bug 3: Strip HTML dari quiz title
                    const rawQuizzes = firstTopik.quizzes || [];
                    const groupedQuizzes: any[] = [];
                    const ctGroupMap = new Map<string, any[]>();
                    
                    for (const q of rawQuizzes) {
                        if (q.quizType === "COMPUTATIONAL_THINKING" && q.ctGroupId) {
                            if (!ctGroupMap.has(q.ctGroupId)) {
                                ctGroupMap.set(q.ctGroupId, []);
                            }
                            ctGroupMap.get(q.ctGroupId)!.push(q);
                        } else {
                            groupedQuizzes.push({ type: "SINGLE", item: q });
                        }
                    }
                    
                    for (const [groupId, items] of Array.from(ctGroupMap.entries())) {
                        groupedQuizzes.push({ type: "GROUP", groupId, items });
                    }

                    const quizIds: Record<number, string> = {};
                    const subQuizIds: Record<number, string> = {};
                    const baseQuizId = Date.now() + 100000;
                    
                    const mappedQuizzes = groupedQuizzes.map((g, qIdx) => {
                        const localId = baseQuizId + qIdx * 10;
                        if (g.type === "SINGLE") {
                            const q = g.item;
                            quizIds[localId] = q.id;
                            const rawTitle = stripHtml(q.question || "");
                            const isCT = q.quizType === "COMPUTATIONAL_THINKING";
                            
                            return {
                                id: localId,
                                title: rawTitle.length > 40 ? rawTitle.substring(0, 40) + "…" : rawTitle || "Untitled",
                                isExpanded: false,
                                ctMode: isCT,
                                duration: q.quizSettings?.[0]?.timeLimit ? Math.round(q.quizSettings[0].timeLimit / 60) : 90,
                                minScore: q.quizSettings?.[0]?.minScoreTreshold ?? 0,
                                scorePerQuestion: q.quizSettings?.[0]?.standardScorePerQuestion ?? 10,
                                questions: isCT ? [] : [
                                    {
                                        id: localId + 1,
                                        label: q.question || "",
                                        answers: (() => {
                                            let foundCorrect = false;
                                            return (q.quizAnswerOptions || []).map((opt: any, oIdx: number) => {
                                                const isMatch = opt.option === q.correctAnswer && !foundCorrect;
                                                if (isMatch) foundCorrect = true;
                                                return {
                                                    id: localId + 10 + oIdx,
                                                    text: opt.option,
                                                    isCorrect: isMatch,
                                                };
                                            });
                                        })(),
                                    },
                                ],
                                ctStories: isCT ? [
                                    {
                                        id: localId + 2,
                                        subQuestions: [
                                            {
                                                id: localId + 3,
                                                label: q.question || "",
                                                ctAspect: q.ctAspect || "Soal CT",
                                                answers: (() => {
                                                    let foundCorrect = false;
                                                    return (q.quizAnswerOptions || []).map((opt: any, oIdx: number) => {
                                                        const isMatch = opt.option === q.correctAnswer && !foundCorrect;
                                                        if (isMatch) foundCorrect = true;
                                                        return {
                                                            id: localId + 20 + oIdx,
                                                            text: opt.option,
                                                            isMatch: isMatch,
                                                            isCorrect: isMatch,
                                                        };
                                                    });
                                                })(),
                                            }
                                        ]
                                    }
                                ] : [{ ...makeCTStory(), cerita: q.ctStory || "" }],
                            };
                        } else {
                            const items = g.items;
                            const firstItem = items[0];
                            quizIds[localId] = firstItem.id;
                            
                            const ctStory = {
                                id: localId + 2,
                                cerita: firstItem.ctStory || "",
                                subQuestions: items.map((q: any, i: number) => {
                                    const subId = localId + 100 + i;
                                    if (i > 0) subQuizIds[subId] = q.id;
                                    return {
                                        id: subId,
                                        label: q.question || "",
                                        ctAspect: q.ctAspect || "Soal CT",
                                        answers: (() => {
                                            let foundCorrect = false;
                                            return (q.quizAnswerOptions || []).map((opt: any, oIdx: number) => {
                                                const isMatch = opt.option === q.correctAnswer && !foundCorrect;
                                                if (isMatch) foundCorrect = true;
                                                return {
                                                    id: localId + 200 + (i * 10) + oIdx,
                                                    text: opt.option,
                                                    isCorrect: isMatch,
                                                };
                                            });
                                        })(),
                                    };
                                })
                            };
                            
                            return {
                                id: localId,
                                title: "Soal Computational Thinking",
                                isExpanded: false,
                                ctMode: true,
                                duration: firstItem.quizSettings?.[0]?.timeLimit ? Math.round(firstItem.quizSettings[0].timeLimit / 60) : 90,
                                minScore: firstItem.quizSettings?.[0]?.minScoreTreshold ?? 0,
                                scorePerQuestion: firstItem.quizSettings?.[0]?.standardScorePerQuestion ?? 10,
                                questions: [],
                                ctStories: [ctStory],
                            };
                        }
                    });
                    setQuizzes(mappedQuizzes);
                    setQuizApiIds(quizIds);
                    setSubQuizApiIds(subQuizIds);
                } else {
                    // Tidak ada topik, pastikan state bersih
                    setMaterials([]);
                    setQuizzes([]);
                }
            } catch (err) {
                console.error("Load content error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, [modulId]);

    useEffect(() => {
        const successTimers = uploadSuccessTimersRef.current;

        return () => {
            Object.values(successTimers).forEach((timerId) => {
                window.clearTimeout(timerId);
            });
        };
    }, []);

    useEffect(() => {
        materials.forEach((material) => {
            if (!material.showUploadSuccess) {
                return;
            }

            if (uploadSuccessTimersRef.current[material.id]) {
                return;
            }

            uploadSuccessTimersRef.current[material.id] = window.setTimeout(
                () => {
                    setMaterials((prev) =>
                        prev.map((item) =>
                            item.id === material.id
                                ? {
                                      ...item,
                                      showUploadSuccess: false,
                                  }
                                : item,
                        ),
                    );
                    delete uploadSuccessTimersRef.current[material.id];
                },
                3000,
            );
        });
    }, [materials]);

    const handleFileChange = async (materialId: number, file: File | null) => {
        if (!file) {
            return;
        }

        setMaterials((prev) =>
            prev.map((material) => {
                if (material.id !== materialId) {
                    return material;
                }
                return {
                    ...material,
                    fileName: file.name,
                    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    uploadProgress: 0,
                    uploadStatus: "uploading",
                };
            }),
        );

        try {
            const res = await uploadApi.upload(file, "MATERI_VIDEO");
            setMaterials((prev) =>
                prev.map((material) => {
                    if (material.id !== materialId) return material;
                    if (material.uploadStatus !== "uploading") return material;
                    return {
                        ...material,
                        uploadProgress: 100,
                        uploadStatus: "done",
                        previewUrl: res.url,
                        showUploadSuccess: true,
                    };
                }),
            );
        } catch (err) {
            console.error("Upload video error:", err);
            setMaterials((prev) =>
                prev.map((material) => {
                    if (material.id !== materialId) return material;
                    return {
                        ...material,
                        uploadProgress: 0,
                        uploadStatus: "idle",
                    };
                }),
            );
            toast("Gagal mengunggah video.", "error");
        }
    };

    const handleDeleteMaterial = async (materialId: number) => {
        const material = materials.find((m) => m.id === materialId);
        const isConfirmed = await confirm({
            title: "Hapus Materi",
            message: `Apakah Anda yakin ingin menghapus materi "${material?.title || 'ini'}"?`,
            confirmText: "Hapus",
            cancelText: "Batal",
            variant: "danger",
        });
        if (!isConfirmed) return;

        const apiId = materialApiIds[materialId];
        if (apiId) {
            setIsDeletingMaterial(materialId);
            showLoading("Menghapus materi...");
            try {
                await adminMateriApi.delete(apiId);
                setMaterialApiIds((prev) => {
                    const next = { ...prev };
                    delete next[materialId];
                    return next;
                });
            } catch (err) {
                console.error("Delete material error:", err);
                toast("Gagal menghapus materi.", "error");
                hideLoading();
                setIsDeletingMaterial(null);
                return;
            } finally {
                hideLoading();
                setIsDeletingMaterial(null);
            }
        }
        setMaterials((prev) => {
            const next = prev.filter((material) => material.id !== materialId);
            setActiveMaterialId((current) =>
                current === materialId ? (next[0]?.id ?? 0) : current,
            );
            return next;
        });
    };

    const handleStartEdit = (materialId: number, title: string) => {
        setEditingMaterialId(materialId);
        setEditTitle(title);
    };

    const handleSaveEdit = async () => {
        if (editingMaterialId === null) {
            return;
        }

        const material = materials.find((m) => m.id === editingMaterialId);
        const apiId = materialApiIds[editingMaterialId];
        const newTitle = editTitle.trim() || material?.title || "";

        if (apiId) {
            showLoading("Menyimpan judul materi...");
            try {
                const videoUrl =
                    material?.type === "video"
                        ? material.videoSource === "link"
                            ? material.linkUrl
                            : material.previewUrl
                        : undefined;
                
                await adminMateriApi.update(apiId, {
                    isVideo: material?.type === "video",
                    title: newTitle,
                    videoUrl: videoUrl || undefined,
                    article: material?.articleContent || undefined,
                });
            } catch (err: any) {
                console.error("Save material title error:", err);
                toast(
                    err?.response?.data?.message || err?.message || "Gagal menyimpan judul materi.",
                    "error",
                );
                hideLoading();
                return;
            } finally {
                hideLoading();
            }
        }

        setMaterials((prev) =>
            prev.map((m) =>
                m.id === editingMaterialId
                    ? {
                          ...m,
                          title: newTitle,
                      }
                    : m,
            ),
        );
        setEditingMaterialId(null);
    };

    const isMaterialFormComplete = (material: {
        type: "video" | "artikel";
        videoSource: "upload" | "link";
        uploadStatus: "idle" | "uploading" | "done";
        linkUrl: string;
    }) => {
        if (material.type === "artikel") {
            return true;
        }

        if (material.videoSource === "upload") {
            return material.uploadStatus === "done";
        }

        return material.linkUrl.trim().length > 0;
    };

    const handleCreateMaterial = async () => {
        const trimmedTitle = newMaterialTitle.trim();
        if (!trimmedTitle || !topicId) {
            return;
        }

        const nextId = Date.now();
        const isVideo = newMaterialType === "video";

        // Create in API first
        showLoading("Menambahkan materi...");
        try {
            const created = await adminMateriApi.create({
                title: trimmedTitle,
                topikId: topicId,
                modulId: modulId || "",
                isVideo: newMaterialType === "video",
            });
            setMaterialApiIds((prev) => ({ ...prev, [nextId]: created.id }));
        } catch (err) {
            console.error("Create material error:", err);
            toast(
                "Gagal membuat materi. Pastikan topik sudah tersimpan.",
                "error",
            );
            hideLoading();
            return;
        } finally {
            hideLoading();
        }

        setMaterials((prev) => [
            ...prev,
            {
                id: nextId,
                title: trimmedTitle,
                type: newMaterialType,
                isSaved: false,
                isExpanded: true,
                videoSource: "upload",
                linkUrl: "",
                linkPreviewTitle: "",
                linkPreviewThumb: "",
                linkVideoTitle: "",
                linkVideoDuration: "",
                showUploadSuccess: false,
                fileName: "",
                fileSize: "",
                uploadProgress: 0,
                uploadStatus: "idle",
                previewUrl: "",
                duration: "00:00",
                articleContent: "",
            },
        ]);
        setActiveMaterialId(nextId);
        setIsMaterialFormOpen(false);
        setNewMaterialTitle("");
        setNewMaterialType("video");
    };

    const handleSaveMaterialContent = async (materialId: number) => {
        const material = materials.find((m) => m.id === materialId);
        const apiId = materialApiIds[materialId];
        if (!material) return;

        // Bug 5: Selalu kirim ke API (baik ada apiId atau tidak)
        if (apiId) {
            setIsSavingMaterial(materialId);
            showLoading("Menyimpan materi...");
            try {
                const videoUrl =
                    material.type === "video"
                        ? material.videoSource === "link"
                            ? material.linkUrl
                            : material.previewUrl
                        : undefined;
                await adminMateriApi.update(apiId, {
                    isVideo: material.type === "video",
                    title: material.title,
                    videoUrl: videoUrl || undefined,
                    article: material.articleContent || undefined,
                });
            } catch (err: any) {
                console.error("Save material error:", err);
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Gagal menyimpan materi.";
                toast(msg, "error");
                hideLoading();
                setIsSavingMaterial(null);
                return;
            } finally {
                hideLoading();
                setIsSavingMaterial(null);
            }
        } else {
            toast("Materi belum memiliki ID dari server.", "error");
            return;
        }

        setMaterials((prev) =>
            prev.map((item) =>
                item.id === materialId
                    ? {
                          ...item,
                          isSaved: true,
                          isExpanded: false,
                          _editSnapshot: undefined,
                      }
                    : item,
            ),
        );
        toast("Materi berhasil disimpan.", "success");
    };

    const handleEditMaterialContent = (materialId: number) => {
        setMaterials((prev) =>
            prev.map((item) =>
                item.id === materialId
                    ? {
                          ...item,
                          isSaved: false,
                          isExpanded: true,
                          _editSnapshot: {
                              articleContent: item.articleContent,
                          },
                      }
                    : item,
            ),
        );
    };

    const handleCancelEditMaterial = (materialId: number) => {
        setMaterials((prev) =>
            prev.map((item) => {
                if (item.id !== materialId) return item;
                return {
                    ...item,
                    isSaved: true,
                    isExpanded: false,
                    articleContent:
                        item._editSnapshot?.articleContent ??
                        item.articleContent,
                    _editSnapshot: undefined,
                };
            }),
        );
    };

    const toggleMaterialExpanded = (materialId: number) => {
        setMaterials((prev) =>
            prev.map((item) =>
                item.id === materialId
                    ? {
                          ...item,
                          isExpanded: !item.isExpanded,
                      }
                    : item,
            ),
        );
    };

    const ctSubLabels = [
        "Soal Pemecahan Masalah (Dekomposisi)",
        "Soal Pengenalan Pola",
        "Soal Menyaring Informasi Penting (Abstraksi)",
        "Soal Menyusun Langkah Solusi",
    ];

    const makeCTStory = () => ({
        id: Date.now(),
        cerita: "",
        subQuestions: ctSubLabels.map((label, i) => ({
            id: Date.now() + i + 1,
            label,
            answers: [
                { id: Date.now() + i * 10 + 100, text: "", isCorrect: false },
                { id: Date.now() + i * 10 + 101, text: "", isCorrect: false },
            ],
        })),
    });

    const loadTopicData = useCallback(
        (topik: any) => {
            // Bug 6: Reset semua state terkait materi/quiz saat ganti topik
            setEditingMaterialId(null);
            setOpenTypeMenuId(null);
            setIsMaterialFormOpen(false);
            setNewMaterialTitle("");
            setEditingQuizId(null);
            setIsEditingTopic(false);

            setActiveTopikId(topik.id);
            setTopicTitle(topik.nama);
            setTopicId(topik.id);
            const materis = topik.materis || [];
            const quizzes = topik.quizzes || [];

            // Bug 1: Gunakan offset berbasis index agar localId tidak collision
            const baseId = Date.now();
            const newMaterialApiIds: Record<number, string> = {};
            const loaded = materis.map((item: any, idx: number) => {
                const localId = baseId + idx * 10;
                newMaterialApiIds[localId] = item.id;
                return {
                    id: localId,
                    title: item.title || item.judul ||
                        (item.isVideo
                            ? `Video ${idx + 1}`
                            : `Materi ${idx + 1}`),
                    type: (item.isVideo ? "video" : "artikel") as
                        | "video"
                        | "artikel",
                    isSaved: true,
                    isExpanded: false,
                    videoSource: (item.videoUrl && !getYoutubeVideoId(item.videoUrl)) ? ("upload" as const) : ("link" as const),
                    linkUrl: (item.videoUrl && getYoutubeVideoId(item.videoUrl)) ? item.videoUrl : "",
                    linkPreviewTitle: "",
                    linkPreviewThumb: item.videoUrl
                        ? getYoutubeThumb(item.videoUrl)
                        : "",
                    linkVideoTitle: "",
                    linkVideoDuration: "",
                    showUploadSuccess: false,
                    fileName: "",
                    fileSize: "",
                    uploadProgress: 100,
                    uploadStatus: "done" as const,
                    previewUrl: (item.videoUrl && !getYoutubeVideoId(item.videoUrl)) ? item.videoUrl : "",
                    duration: "00:00",
                    articleContent: item.article || "",
                };
            });
            setMaterialApiIds(newMaterialApiIds);
            setMaterials(loaded);
            if (loaded.length > 0) setActiveMaterialId(loaded[0].id);
            else setActiveMaterialId(null);

            // Bug 3: Strip HTML dari quiz title
            const baseQuizId = baseId + 100000;
            const quizIds: Record<number, string> = {};
            const mappedQuiz = quizzes.map((q: any, qIdx: number) => {
                const localId = baseQuizId + qIdx * 10;
                quizIds[localId] = q.id;
                const rawTitle = stripHtml(q.question || "");
                return {
                    id: localId,
                    title:
                        rawTitle.length > 40
                            ? rawTitle.substring(0, 40) + "…"
                            : rawTitle || "Untitled",
                    isExpanded: false,
                    ctMode: q.quizType === "COMPUTATIONAL_THINKING",
                    duration: q.quizSettings?.[0]?.timeLimit
                        ? Math.round(q.quizSettings[0].timeLimit / 60)
                        : 90,
                    minScore: q.quizSettings?.[0]?.minScoreTreshold ?? 0,
                    scorePerQuestion:
                        q.quizSettings?.[0]?.standardScorePerQuestion ?? 10,
                    questions: [
                        {
                            id: localId + 1,
                            label: q.question || "",
                            answers: (q.quizAnswerOptions || []).map(
                                (opt: any, oIdx: number) => ({
                                    id: localId + 10 + oIdx,
                                    text: opt.option,
                                    isCorrect: opt.option === q.correctAnswer,
                                }),
                            ),
                        },
                    ],
                    ctStories: [makeCTStory()],
                };
            });
            setQuizzes(mappedQuiz);
            setQuizApiIds(quizIds);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const handleCreateQuiz = async () => {
        if (!topicId) {
            toast(
                "Pilih topik terlebih dahulu sebelum membuat kuis.",
                "warning",
            );
            return;
        }

        const nextId = Date.now();

        // Create quiz in API
        setIsSavingQuiz(true);
        showLoading("Membuat kuis...");
        try {
            const created = await adminTopikKuisApi.create({
                quiz: {
                    topikId: topicId,
                    quizType: false ? "COMPUTATIONAL_THINKING" : "REGULER",
                    question: "Soal Kuis 1",
                    correctAnswer: "A",
                    skor: 10,
                },
                answerOptions: [
                    { option: "A" },
                    { option: "B" },
                    { option: "C" },
                ],
                setting: {
                    timeLimit: 90 * 60,
                    allowMultipleAttempts: false,
                    isComputationalThinkingEnabled: false,
                    minScoreTreshold: 0,
                    standardScorePerQuestion: 100,
                },
            });
            setQuizApiIds((prev) => ({ ...prev, [nextId]: created.id }));
        } catch (err) {
            console.error("Create quiz error:", err);
            toast("Gagal membuat kuis.", "error");
            hideLoading();
            setIsSavingQuiz(false);
            return;
        } finally {
            hideLoading();
            setIsSavingQuiz(false);
        }

        setQuizzes((prev) => [
            ...prev,
            {
                id: nextId,
                title: "Untitled",
                isExpanded: true,
                ctMode: false,
                duration: 90,
                minScore: 0,
                scorePerQuestion: 10,
                questions: [
                    {
                        id: nextId + 1,
                        label: "Soal Kuis 1",
                        answers: [
                            { id: nextId + 10, text: "", isCorrect: false },
                            { id: nextId + 11, text: "", isCorrect: false },
                            { id: nextId + 12, text: "", isCorrect: false },
                        ],
                    },
                ],
                ctStories: [makeCTStory()],
            },
        ]);
        setActiveQuizId(nextId);
    };

    const handleAddQuestion = (quizId: number) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                const num = q.questions.length + 1;
                return {
                    ...q,
                    questions: [
                        ...q.questions,
                        {
                            id: Date.now(),
                            label: `Soal Kuis ${num}`,
                            answers: [
                                {
                                    id: Date.now() + 10,
                                    text: "",
                                    isCorrect: false,
                                },
                                {
                                    id: Date.now() + 11,
                                    text: "",
                                    isCorrect: false,
                                },
                                {
                                    id: Date.now() + 12,
                                    text: "",
                                    isCorrect: false,
                                },
                            ],
                        },
                    ],
                };
            }),
        );
    };

    const handleAddAnswer = (quizId: number, questionId: number) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                return {
                    ...q,
                    questions: q.questions.map((qn) =>
                        qn.id === questionId
                            ? {
                                  ...qn,
                                  answers: [
                                      ...qn.answers,
                                      {
                                          id: Date.now(),
                                          text: "",
                                          isCorrect: false,
                                      },
                                  ],
                              }
                            : qn,
                    ),
                };
            }),
        );
    };

    const handleRemoveAnswer = (
        quizId: number,
        questionId: number,
        answerId: number,
    ) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                return {
                    ...q,
                    questions: q.questions.map((qn) =>
                        qn.id === questionId
                            ? {
                                  ...qn,
                                  answers: qn.answers.filter(
                                      (a) => a.id !== answerId,
                                  ),
                              }
                            : qn,
                    ),
                };
            }),
        );
    };

    const handleAddCTStory = (quizId: number) => {
        setQuizzes((prev) =>
            prev.map((q) =>
                q.id === quizId
                    ? { ...q, ctStories: [...q.ctStories, makeCTStory()] }
                    : q,
            ),
        );
    };

    const handleAddCTAnswer = (
        quizId: number,
        storyId: number,
        subQId: number,
    ) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                return {
                    ...q,
                    ctStories: q.ctStories.map((s) =>
                        s.id === storyId
                            ? {
                                  ...s,
                                  subQuestions: s.subQuestions.map((sq) =>
                                      sq.id === subQId
                                          ? {
                                                ...sq,
                                                answers: [
                                                    ...sq.answers,
                                                    {
                                                        id: Date.now(),
                                                        text: "",
                                                        isCorrect: false,
                                                    },
                                                ],
                                            }
                                          : sq,
                                  ),
                              }
                            : s,
                    ),
                };
            }),
        );
    };

    const handleRemoveCTAnswer = (
        quizId: number,
        storyId: number,
        subQId: number,
        answerId: number,
    ) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                return {
                    ...q,
                    ctStories: q.ctStories.map((s) =>
                        s.id === storyId
                            ? {
                                  ...s,
                                  subQuestions: s.subQuestions.map((sq) =>
                                      sq.id === subQId
                                          ? {
                                                ...sq,
                                                answers: sq.answers.filter(
                                                    (a) => a.id !== answerId,
                                                ),
                                            }
                                          : sq,
                                  ),
                              }
                            : s,
                    ),
                };
            }),
        );
    };

    const activeTopik = topiks.find((t) => t.id === activeTopikId);
    const isTopicCT = activeTopik?.isComputationalThinking ?? false;

    const handleToggleCTMode = (quizId: number, enabled: boolean) => {
        if (isTopicCT) return;
        setQuizzes((prev) =>
            prev.map((q) => (q.id === quizId ? { ...q, ctMode: enabled } : q)),
        );
    };

    const handleSaveQuizSettings = (
        quizId: number,
        settings: {
            duration: number;
            minScore: number;
            scorePerQuestion: number;
            ctMode: boolean;
        },
    ) => {
        setQuizzes((prev) =>
            prev.map((q) => (q.id === quizId ? { ...q, ...settings } : q)),
        );
        setIsQuizSettingsOpen(false);
    };

    const handleDeleteQuiz = async (quizId: number) => {
        const quiz = quizzes.find((q) => q.id === quizId);
        const isConfirmed = await confirm({
            title: "Hapus Kuis",
            message: `Apakah Anda yakin ingin menghapus kuis "${quiz?.title || 'ini'}" beserta semua soalnya?`,
            confirmText: "Hapus",
            cancelText: "Batal",
            variant: "danger",
        });
        if (!isConfirmed) return;

        const apiId = quizApiIds[quizId];
        const subIds =
            quiz?.ctStories.flatMap((s) =>
                s.subQuestions
                    .map((sq) => subQuizApiIds[sq.id])
                    .filter(Boolean),
            ) ?? [];

        showLoading("Menghapus kuis...");
        try {
            if (apiId) await adminTopikKuisApi.delete(apiId);
            for (const sid of subIds) await adminTopikKuisApi.delete(sid);
        } catch (err) {
            console.error("Delete quiz error:", err);
            toast("Gagal menghapus kuis.", "error");
            hideLoading();
            return;
        }
        hideLoading();
        setQuizApiIds((prev) => {
            const next = { ...prev };
            delete next[quizId];
            return next;
        });
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    };

    const handleSelectCorrectAnswer = (
        quizId: number,
        questionId: number,
        answerId: number,
    ) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                return {
                    ...q,
                    questions: q.questions.map((qn) => {
                        if (qn.id !== questionId) return qn;
                        return {
                            ...qn,
                            answers: qn.answers.map((a) => ({
                                ...a,
                                isCorrect: a.id === answerId,
                            })),
                        };
                    }),
                };
            }),
        );
    };

    const handleSelectCTCorrectAnswer = (
        quizId: number,
        storyId: number,
        subQId: number,
        answerId: number,
    ) => {
        setQuizzes((prev) =>
            prev.map((q) => {
                if (q.id !== quizId) return q;
                return {
                    ...q,
                    ctStories: q.ctStories.map((s) => {
                        if (s.id !== storyId) return s;
                        return {
                            ...s,
                            subQuestions: s.subQuestions.map((sq) => {
                                if (sq.id !== subQId) return sq;
                                return {
                                    ...sq,
                                    answers: sq.answers.map((a) => ({
                                        ...a,
                                        isCorrect: a.id === answerId,
                                    })),
                                };
                            }),
                        };
                    }),
                };
            }),
        );
    };

    const handleSubmitQuiz = async (quizId: number) => {
        const quiz = quizzes.find((q) => q.id === quizId);
        if (!quiz) return;

        if (quiz.ctMode) {
            const hasEmptyQuestion = quiz.ctStories.some((s) =>
                s.subQuestions.some((sq) => !sq.label.trim()),
            );
            if (hasEmptyQuestion) {
                toast(
                    "Masukkan teks soal untuk setiap sub-soal CT.",
                    "warning",
                );
                return;
            }
            const hasEmpty = quiz.ctStories.some((s) =>
                s.subQuestions.some((sq) =>
                    sq.answers.some((a) => !a.text.trim()),
                ),
            );
            if (hasEmpty) {
                toast(
                    "Lengkapi semua opsi jawaban CT terlebih dahulu.",
                    "warning",
                );
                return;
            }
            const hasCorrect = quiz.ctStories.every((s) =>
                s.subQuestions.every((sq) =>
                    sq.answers.some((a) => a.isCorrect),
                ),
            );
            if (!hasCorrect) {
                toast(
                    "Pilih jawaban benar untuk setiap sub-soal CT.",
                    "warning",
                );
                return;
            }

            let duplicateAnsId: number | null = null;
            const hasDuplicate = quiz.ctStories.some((s) =>
                s.subQuestions.some((sq) => {
                    const seen = new Set<string>();
                    for (const a of sq.answers) {
                        const t = a.text.trim().toLowerCase();
                        if (seen.has(t)) {
                            duplicateAnsId = a.id;
                            return true;
                        }
                        seen.add(t);
                    }
                    return false;
                })
            );
            if (hasDuplicate && duplicateAnsId) {
                toast(
                    "Terdapat opsi jawaban dengan teks yang sama pada soal CT. Pastikan setiap opsi unik.",
                    "warning"
                );
                setTimeout(() => {
                    const el = document.getElementById(`ans-input-${duplicateAnsId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.focus();
                    }
                }, 100);
                return;
            }
        } else {
            const qn = quiz.questions[0];
            if (!qn || !qn.label.trim()) {
                toast("Masukkan teks soal terlebih dahulu.", "warning");
                return;
            }
            if (qn.answers.length < 2) {
                toast("Minimal 2 opsi jawaban.", "warning");
                return;
            }
            if (!qn.answers.some((a) => a.isCorrect)) {
                toast("Pilih jawaban yang benar.", "warning");
                return;
            }

            let duplicateAnsId: number | null = null;
            const seen = new Set<string>();
            for (const a of qn.answers) {
                const t = a.text.trim().toLowerCase();
                if (seen.has(t)) {
                    duplicateAnsId = a.id;
                    break;
                }
                seen.add(t);
            }

            if (duplicateAnsId) {
                toast("Terdapat opsi jawaban dengan teks yang sama. Pastikan setiap opsi unik.", "warning");
                setTimeout(() => {
                    const el = document.getElementById(`ans-input-${duplicateAnsId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.focus();
                    }
                }, 100);
                return;
            }
        }

        setIsSavingQuiz(true);
        showLoading("Menyimpan kuis...");
        try {
            if (quiz.ctMode) {
                let firstSaved = false;
                const newSubIds: Record<number, string> = {};

                for (const story of quiz.ctStories) {
                    for (const sq of story.subQuestions) {
                        const ctGroupId = "ct-" + story.id;
                        const payload = {
                            question: sq.label || "Soal CT",
                            correctAnswer:
                                sq.answers.find((a) => a.isCorrect)?.text ||
                                sq.answers[0]?.text ||
                                "",
                            skor: quiz.scorePerQuestion || 10,
                            quizType: "COMPUTATIONAL_THINKING" as const,
                            ctGroupId: ctGroupId,
                            ctStory: story.cerita || "",
                            ctAspect: sq.ctAspect || "Soal CT",
                            answerOptions: sq.answers.map((a) => ({
                                option: a.text,
                            })),
                            setting: {
                                timeLimit: quiz.duration * 60,
                                allowMultipleAttempts: false,
                                isComputationalThinkingEnabled: quiz.ctMode,
                                minScoreTreshold: quiz.minScore,
                                standardScorePerQuestion: quiz.scorePerQuestion,
                            },
                        };

                        if (!firstSaved) {
                            const apiId = quizApiIds[quizId];
                            if (apiId) {
                                await adminTopikKuisApi.update(apiId, payload);
                            } else {
                                const created = await adminTopikKuisApi.create({
                                    quiz: {
                                        topikId: topicId!,
                                        question: payload.question,
                                        correctAnswer: payload.correctAnswer,
                                        skor: payload.skor,
                                        quizType: "COMPUTATIONAL_THINKING",
                                        ctGroupId: payload.ctGroupId,
                                        ctStory: payload.ctStory,
                                        ctAspect: payload.ctAspect,
                                    },
                                    answerOptions: payload.answerOptions,
                                    setting: payload.setting,
                                });
                                setQuizApiIds((prev) => ({
                                    ...prev,
                                    [quizId]: created.id,
                                }));
                            }
                            firstSaved = true;
                        } else {
                            const existingApiId = subQuizApiIds[sq.id];
                            if (existingApiId) {
                                await adminTopikKuisApi.update(
                                    existingApiId,
                                    payload,
                                );
                            } else {
                                const created = await adminTopikKuisApi.create({
                                    quiz: {
                                        topikId: topicId!,
                                        question: payload.question,
                                        correctAnswer: payload.correctAnswer,
                                        skor: payload.skor,
                                        quizType: "COMPUTATIONAL_THINKING",
                                        ctGroupId: payload.ctGroupId,
                                        ctStory: payload.ctStory,
                                        ctAspect: payload.ctAspect,
                                    },
                                    answerOptions: payload.answerOptions,
                                    setting: payload.setting,
                                });
                                newSubIds[sq.id] = created.id;
                            }
                        }
                    }
                }

                if (Object.keys(newSubIds).length > 0) {
                    setSubQuizApiIds((prev) => ({ ...prev, ...newSubIds }));
                }
                toast("Kuis CT berhasil disimpan.", "success");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                // Bug 3: Strip HTML dari question label saat submit
                const question = stripHtml(quiz.questions[0]?.label || "Soal Kuis");
                const answers = quiz.questions[0]?.answers || [];
                const correctAnswer =
                    answers.find((a) => a.isCorrect)?.text ||
                    answers[0]?.text ||
                    "";
                const answerOptions = answers.map((a) => ({ option: a.text }));

                const apiId = quizApiIds[quizId];
                if (apiId) {
                    await adminTopikKuisApi.update(apiId, {
                        question,
                        correctAnswer,
                        skor: quiz.scorePerQuestion || 10,
                        quizType: "REGULER",
                        answerOptions,
                        setting: {
                            timeLimit: quiz.duration * 60,
                            allowMultipleAttempts: false,
                            isComputationalThinkingEnabled: quiz.ctMode,
                            minScoreTreshold: quiz.minScore,
                            standardScorePerQuestion: quiz.scorePerQuestion,
                        },
                    });
                    // Update title di state lokal setelah simpan berhasil
                    const newTitle = question.length > 40 ? question.substring(0, 40) + "…" : question;
                    setQuizzes((prev) =>
                        prev.map((q) =>
                            q.id === quizId ? { ...q, title: newTitle } : q,
                        ),
                    );
                    toast("Kuis berhasil diperbarui.", "success");
                } else {
                    const created = await adminTopikKuisApi.create({
                        quiz: {
                            topikId: topicId!,
                            quizType: "REGULER",
                            question,
                            correctAnswer,
                            skor: quiz.scorePerQuestion || 10,
                        },
                        answerOptions,
                        setting: {
                            timeLimit: quiz.duration * 60,
                            allowMultipleAttempts: false,
                            isComputationalThinkingEnabled: quiz.ctMode,
                            minScoreTreshold: quiz.minScore,
                            standardScorePerQuestion: quiz.scorePerQuestion,
                        },
                    });
                    setQuizApiIds((prev) => ({
                        ...prev,
                        [quizId]: created.id,
                    }));
                }
                toast("Kuis berhasil disimpan.", "success");
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (err) {
            console.error("Submit quiz error:", err);
            toast("Gagal menyimpan kuis.", "error");
        } finally {
            hideLoading();
            setIsSavingQuiz(false);
        }
    };

    // Create topic via API
    const handleCreateTopic = useCallback(async () => {
        if (topicTitle.trim().length === 0) return;
        if (!modulId) {
            setTopicError("Module ID tidak ditemukan.");
            return;
        }
        setIsCreatingTopic(true);
        setTopicError("");
        showLoading("Membuat topik...");
        try {
            const created = await adminTopikApi.create({
                name: topicTitle.trim(),
                modulId,
                order: topiks.length + 1,
            });
            setTopicId(created.id);
            setIsTopicAdded(true);
            setIsFormOpen(false);
            setActiveTopikId(created.id);
            // Bug 2: Reset materials & quizzes saat topik baru dibuat
            setMaterials([]);
            setQuizzes([]);
            setActiveMaterialId(null);
            setMaterialApiIds({});
            setQuizApiIds({});
            setEditingMaterialId(null);
            setOpenTypeMenuId(null);
            setIsMaterialFormOpen(false);
            setTopiks((prev) => [
                ...prev,
                {
                    ...created,
                    nama: (created as any).name || (created as any).nama,
                    materis: [],
                    quizzes: [],
                } as any,
            ]);
        } catch (err: unknown) {
            console.error("Create topic error:", err);
            setTopicError(
                err instanceof Error ? err.message : "Gagal membuat topik.",
            );
        } finally {
            hideLoading();
            setIsCreatingTopic(false);
        }
    }, [topicTitle, modulId]);

    // Edit topic via API
    const handleSaveEditTopic = useCallback(async () => {
        if (!topicId || editTopicTitle.trim().length === 0) return;
        showLoading("Menyimpan perubahan topik...");
        try {
            await adminTopikApi.update(topicId, {
                name: editTopicTitle.trim(),
            });
            setTopicTitle(editTopicTitle.trim());
            setIsEditingTopic(false);
            setTopiks((prev) =>
                prev.map((t) =>
                    t.id === topicId
                        ? { ...t, nama: editTopicTitle.trim() }
                        : t,
                ),
            );
        } catch (err: unknown) {
            console.error("Update topic error:", err);
            toast(
                err instanceof Error ? err.message : "Gagal memperbarui topik.",
                "error",
            );
        } finally {
            hideLoading();
        }
    }, [topicId, editTopicTitle]);

    // Delete topic via API
    const handleDeleteTopic = useCallback(
        async (id?: string) => {
            const targetId = id || topicId;
            if (!targetId) return;
            const topic = topiks.find((t) => t.id === targetId);
            const isConfirmed = await confirm({
                title: "Hapus Topik",
                message: `Apakah Anda yakin ingin menghapus topik "${topic?.nama || 'ini'}"? Semua materi dan quiz di dalamnya akan ikut terhapus.`,
                confirmText: "Hapus",
                cancelText: "Batal",
                variant: "danger",
            });
            if (!isConfirmed) return;
            showLoading("Menghapus topik...");
            try {
                await adminTopikApi.delete(targetId);
                setTopicTitle("");
                setTopicId(null);
                setIsTopicAdded(false);
                setMaterials([]);
                setQuizzes([]);
                setTopiks((prev) => prev.filter((t) => t.id !== targetId));
                setActiveTopikId((prev) => (prev === targetId ? null : prev));
            } catch (err: unknown) {
                console.error("Delete topic error:", err);
                toast(
                    err instanceof Error
                        ? err.message
                        : "Gagal menghapus topik.",
                    "error",
                );
            } finally {
                hideLoading();
            }
        },
        [topicId, topiks, confirm, toast, showLoading, hideLoading],
    );

    // Publish module
    const handlePublish = useCallback(async () => {
        if (!modulId) {
            setIsLoading(false);
            return;
        }
        const ok2 = await confirm({
            message: "Apakah Anda yakin ingin menerbitkan modul ini?",
            confirmText: "Terbitkan",
        });
        if (!ok2) return;
        showLoading("Menerbitkan modul...");
        try {
            await adminModulApi.update(modulId, { isDraft: false });
            router.push("/admin/manajemen-modul");
        } catch (err: unknown) {
            console.error("Publish error:", err);
            toast(
                err instanceof Error ? err.message : "Gagal menerbitkan modul.",
                "error",
            );
        } finally {
            hideLoading();
        }
    }, [modulId, router]);

    if (!isAuthorized || isLoading) {
        return (
            <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
                <AdminHeader />
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
                        <p className="text-sm text-[#8a8d98]">
                            {isLoading
                                ? "Memuat data konten..."
                                : "Memeriksa otorisasi..."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
            <AdminHeader />

            <main className="flex w-full">
                <AdminModuleSidebar
                    basePath="/admin/manajemen-modul/edit"
                    modulId={modulId ?? undefined}
                    title="Edit Modul"
                    showSiswaTab={true}
                />
                <section className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
                    <h1 className="text-[18px] font-semibold text-[#232530]">
                        Membuat konten modul anda
                    </h1>

                    <div className="mt-6">
                        <p className="text-[12px] font-semibold text-[#232530]">
                            Mulai Buat konten anda
                        </p>

                        {topicError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                                {topicError}
                            </div>
                        )}

                        {topiks.length === 0 && !isFormOpen && (
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(true)}
                                className="mt-3 inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]"
                            >
                                Topik <FiPlus size={14} />
                            </button>
                        )}

                        {topiks.length === 0 && isFormOpen && (
                            <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(20,20,30,0.05)]">
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-[12px] font-semibold text-[#232530]">
                                        Topik {topiks.length + 1}:
                                    </p>
                                    <input
                                        type="text"
                                        value={topicTitle}
                                        onChange={(event) =>
                                            setTopicTitle(event.target.value)
                                        }
                                        placeholder="Masukkan Judul Topik"
                                        className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                handleCreateTopic();
                                        }}
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsFormOpen(false);
                                            setTopicError("");
                                        }}
                                        className="cursor-pointer text-[12px] font-semibold text-[#7a7e8a]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateTopic}
                                        disabled={isCreatingTopic}
                                        className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
                                    >
                                        {isCreatingTopic
                                            ? "Menyimpan..."
                                            : "Tambah Topik"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {topiks.length > 0 && (
                            <div className="mt-4 space-y-6">
                                {topiks.map((topik, topikIndex) => (
                                    <div
                                        key={topik.id}
                                        className={`rounded-2xl border border-[#e5e3ee] px-5 py-4 ${
                                            activeTopikId === topik.id
                                                ? "bg-white"
                                                : "bg-[#fbfbfe]"
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[12px] font-semibold text-[#232530]">
                                                    Topik {topikIndex + 1}:
                                                </p>
                                                {isEditingTopic &&
                                                topicId === topik.id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={
                                                                editTopicTitle
                                                            }
                                                            onChange={(e) =>
                                                                setEditTopicTitle(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                )
                                                                    handleSaveEditTopic();
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handleSaveEditTopic
                                                            }
                                                            className="text-[12px] font-semibold text-[#7054dc]"
                                                        >
                                                            Simpan
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setIsEditingTopic(
                                                                    false,
                                                                )
                                                            }
                                                            className="text-[12px] font-semibold text-[#7a7e8a]"
                                                        >
                                                            Batal
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-[12px] font-semibold text-[#232530]">
                                                            {topik.nama}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditTopicTitle(
                                                                    topik.nama,
                                                                );
                                                                setIsEditingTopic(
                                                                    true,
                                                                );
                                                                if (
                                                                    activeTopikId !==
                                                                    topik.id
                                                                ) {
                                                                    loadTopicData(
                                                                        topik,
                                                                    );
                                                                }
                                                            }}
                                                            className="cursor-pointer text-[#7a7e8a] hover:text-[#7054dc]"
                                                            aria-label="Edit topik"
                                                        >
                                                            <FiEdit2
                                                                size={14}
                                                            />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteTopic(
                                                                    topik.id,
                                                                )
                                                            }
                                                            className="cursor-pointer text-[#7a7e8a] hover:text-[#e04e4e]"
                                                            aria-label="Hapus topik"
                                                        >
                                                            <FiTrash2
                                                                size={14}
                                                            />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {activeTopikId === topik.id ? (
                                            <>
                                                <div className="mt-4 space-y-3">
                                                    {materials.map(
                                                        (material, index) => (
                                                            <div
                                                                key={
                                                                    material.id
                                                                }
                                                                className={`rounded-2xl border border-[#e5e3ee] px-4 py-3 ${
                                                                    activeMaterialId ===
                                                                    material.id
                                                                        ? "bg-white"
                                                                        : "bg-[#fbfbfe]"
                                                                }`}
                                                            >
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setActiveMaterialId(
                                                                                    material.id,
                                                                                )
                                                                            }
                                                                            className="text-left"
                                                                        >
                                                                            <span className="text-[12px] font-semibold text-[#232530]">
                                                                                {material.type ===
                                                                                "video"
                                                                                    ? `Video ${index + 1}`
                                                                                    : `Materi ${index + 1}`}

                                                                                :
                                                                            </span>
                                                                        </button>
                                                                        {/* Saat mode edit: input title inline langsung */}
                                                                        {!material.isSaved ? (
                                                                            <input
                                                                                type="text"
                                                                                value={material.title}
                                                                                onChange={(e) =>
                                                                                    setMaterials(
                                                                                        (prev) =>
                                                                                            prev.map(
                                                                                                (m) =>
                                                                                                    m.id ===
                                                                                                    material.id
                                                                                                        ? {
                                                                                                              ...m,
                                                                                                              title: e.target.value,
                                                                                                          }
                                                                                                        : m,
                                                                                            ),
                                                                                    )
                                                                                }
                                                                                placeholder="Judul materi..."
                                                                                className="h-[30px] w-[200px] rounded-md border border-[#8e7bff] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                                            />
                                                                        ) : editingMaterialId ===
                                                                          material.id ? (
                                                                            <input
                                                                                type="text"
                                                                                value={
                                                                                    editTitle
                                                                                }
                                                                                onChange={(
                                                                                    event,
                                                                                ) =>
                                                                                    setEditTitle(
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                                className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setActiveMaterialId(
                                                                                        material.id,
                                                                                    )
                                                                                }
                                                                                className="text-[12px] font-semibold text-[#232530]"
                                                                            >
                                                                                {
                                                                                    material.title
                                                                                }
                                                                            </button>
                                                                        )}
                                                                        {/* Tombol simpan/edit title hanya untuk mode non-edit (isSaved=true) */}
                                                                        {material.isSaved && (
                                                                            <>
                                                                                {editingMaterialId ===
                                                                                material.id ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={
                                                                                            handleSaveEdit
                                                                                        }
                                                                                        className="text-[12px] font-semibold text-[#7054dc]"
                                                                                    >
                                                                                        Simpan
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleStartEdit(
                                                                                                material.id,
                                                                                                material.title,
                                                                                            )
                                                                                        }
                                                                                        className="cursor-pointer text-[#7a7e8a]"
                                                                                        aria-label="Edit materi"
                                                                                    >
                                                                                        <FiEdit2
                                                                                            size={
                                                                                                14
                                                                                            }
                                                                                        />
                                                                                    </button>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteMaterial(
                                                                                    material.id,
                                                                                )
                                                                            }
                                                                            className="cursor-pointer text-[#7a7e8a]"
                                                                            aria-label="Hapus materi"
                                                                        >
                                                                            <FiTrash2
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        {material.isSaved ? (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        toggleMaterialExpanded(
                                                                                            material.id,
                                                                                        )
                                                                                    }
                                                                                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                                                                    aria-label={
                                                                                        material.isExpanded
                                                                                            ? "Tutup"
                                                                                            : "Buka"
                                                                                    }
                                                                                >
                                                                                    <FiChevronDown
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                        className={`transition-transform ${
                                                                                            material.isExpanded
                                                                                                ? "rotate-180"
                                                                                                : ""
                                                                                        }`}
                                                                                    />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                                                                    aria-label="Pindahkan materi"
                                                                                >
                                                                                    <svg
                                                                                        width="16"
                                                                                        height="16"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        aria-hidden="true"
                                                                                    >
                                                                                        <path
                                                                                            d="M4 6h16M4 12h16M4 18h16"
                                                                                            stroke="currentColor"
                                                                                            strokeWidth="2"
                                                                                            strokeLinecap="round"
                                                                                        />
                                                                                    </svg>
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <div className="relative">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        setOpenTypeMenuId(
                                                                                            (
                                                                                                prev,
                                                                                            ) =>
                                                                                                prev ===
                                                                                                material.id
                                                                                                    ? null
                                                                                                    : material.id,
                                                                                        )
                                                                                    }
                                                                                    className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#f39b39]"
                                                                                >
                                                                                    {material.type ===
                                                                                    "video"
                                                                                        ? "Materi Video"
                                                                                        : "Materi Artikel"}
                                                                                    <FiChevronDown
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="text-[#f39b39]"
                                                                                    />
                                                                                </button>

                                                                                {openTypeMenuId ===
                                                                                    material.id && (
                                                                                    <div className="absolute right-0 top-full z-10 mt-2 w-[180px] rounded-2xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                                                                                        {(
                                                                                            [
                                                                                                "video",
                                                                                                "artikel",
                                                                                            ] as const
                                                                                        ).map(
                                                                                            (
                                                                                                type,
                                                                                            ) => (
                                                                                                <button
                                                                                                    key={
                                                                                                        type
                                                                                                    }
                                                                                                    type="button"
                                                                                                    onClick={() => {
                                                                                                        setMaterials(
                                                                                                            (
                                                                                                                prev,
                                                                                                            ) =>
                                                                                                                prev.map(
                                                                                                                    (
                                                                                                                        item,
                                                                                                                    ) =>
                                                                                                                        item.id ===
                                                                                                                        material.id
                                                                                                                            ? {
                                                                                                                                  ...item,
                                                                                                                                  type,
                                                                                                                              }
                                                                                                                            : item,
                                                                                                                ),
                                                                                                        );
                                                                                                        setOpenTypeMenuId(
                                                                                                            null,
                                                                                                        );
                                                                                                    }}
                                                                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors ${
                                                                                                        material.type ===
                                                                                                        type
                                                                                                            ? "bg-[#f0ecff] text-[#7054dc]"
                                                                                                            : "text-[#232530] hover:bg-[#f7f6ff]"
                                                                                                    }`}
                                                                                                >
                                                                                                    {type ===
                                                                                                    "video"
                                                                                                        ? "Materi Video"
                                                                                                        : "Materi Artikel"}
                                                                                                </button>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Bug 4: Tampilkan expanded content selama isExpanded = true, tidak peduli isSaved */}
                                                                {material.isExpanded && (
                                                                    <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-4">
                                                                        {material.isSaved ? (
                                                                            <div>
                                                                                {material.type ===
                                                                                "video" ? (
                                                                                    <>
                                                                                        <div className="rounded-xl border border-[#ede9ff] bg-white overflow-hidden mt-2">
                                                                                            {material.videoSource === "link" && getYoutubeVideoId(material.linkUrl) ? (
                                                                                                <iframe
                                                                                                    className="w-full aspect-video"
                                                                                                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(material.linkUrl)}`}
                                                                                                    title="YouTube video player"
                                                                                                    frameBorder="0"
                                                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                    allowFullScreen
                                                                                                ></iframe>
                                                                                            ) : material.previewUrl ? (
                                                                                                <video
                                                                                                    src={material.previewUrl}
                                                                                                    className="w-full aspect-video bg-black object-contain"
                                                                                                    controls
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="w-full aspect-video bg-[#f1f1fb] flex items-center justify-center">
                                                                                                    <span className="text-gray-400 text-sm">Preview tidak tersedia</span>
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="px-3 py-3 border-t border-[#ede9ff] flex items-start justify-between gap-3">
                                                                                                <div>
                                                                                                    <p className="text-[12px] font-semibold text-[#232530]">
                                                                                                        {material.videoSource === "link" ? (
                                                                                                            <>
                                                                                                                {material.linkVideoTitle || material.linkPreviewTitle || "Video YouTube"}{" "}
                                                                                                                <span className="font-normal text-[#7a7e8a]">
                                                                                                                    (YouTube)
                                                                                                                </span>
                                                                                                            </>
                                                                                                        ) : (
                                                                                                            material.fileName || "Video Materi"
                                                                                                        )}
                                                                                                    </p>
                                                                                                    <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                                                                        {material.videoSource === "link"
                                                                                                            ? material.linkVideoDuration || "-"
                                                                                                            : material.duration}
                                                                                                        {material.fileSize
                                                                                                            ? ` (${material.fileSize})`
                                                                                                            : ""}
                                                                                                    </p>
                                                                                                </div>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        handleEditMaterialContent(
                                                                                                            material.id,
                                                                                                        )
                                                                                                    }
                                                                                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7054dc]"
                                                                                                >
                                                                                                    <FiEdit2
                                                                                                        size={
                                                                                                            13
                                                                                                        }
                                                                                                    />
                                                                                                    Edit
                                                                                                    Konten
                                                                                                    Materi
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                        {material.videoSource ===
                                                                                            "link" &&
                                                                                            material.linkUrl.trim()
                                                                                                .length >
                                                                                                0 && (
                                                                                                <p className="mt-2 text-[10px] text-[#3aa65c]">
                                                                                                    Video
                                                                                                    ditemukan!
                                                                                                </p>
                                                                                            )}
                                                                                        {material.showUploadSuccess && (
                                                                                            <p className="mt-2 text-[10px] text-[#3aa65c]">
                                                                                                Unggah
                                                                                                video
                                                                                                sukses!
                                                                                            </p>
                                                                                        )}
                                                                                        {material.articleContent && (
                                                                                            <div className="mt-3">
                                                                                                <p className="mb-1 text-[12px] font-semibold text-[#232530]">
                                                                                                    Bahan
                                                                                                    Bacaan
                                                                                                </p>
                                                                                                <div className="rounded-xl border border-[#e5e3ee] bg-white px-3 py-3">
                                                                                                    <div
                                                                                                        className="text-[12px] leading-[1.7] text-[#232530] [&_img]:max-w-full [&_img]:rounded-lg"
                                                                                                        dangerouslySetInnerHTML={{
                                                                                                            __html: material.articleContent,
                                                                                                        }}
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="flex items-start justify-between gap-3">
                                                                                            <p className="text-[12px] font-semibold text-[#232530]">
                                                                                                Bahan
                                                                                                Bacaan
                                                                                            </p>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    handleEditMaterialContent(
                                                                                                        material.id,
                                                                                                    )
                                                                                                }
                                                                                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7054dc]"
                                                                                            >
                                                                                                <FiEdit2
                                                                                                    size={
                                                                                                        13
                                                                                                    }
                                                                                                />
                                                                                                Edit
                                                                                                Konten
                                                                                                Materi
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="mt-2 rounded-xl border border-[#e5e3ee] bg-white px-3 py-3">
                                                                                            {material.articleContent ? (
                                                                                                <div
                                                                                                    className="text-[12px] leading-[1.7] text-[#232530] [&_img]:max-w-full [&_img]:rounded-lg"
                                                                                                    dangerouslySetInnerHTML={{
                                                                                                        __html: material.articleContent,
                                                                                                    }}
                                                                                                />
                                                                                            ) : (
                                                                                                <p className="text-[12px] leading-[1.7] text-[#232530]">
                                                                                                    Lorem
                                                                                                    ipsum
                                                                                                    dolor
                                                                                                    sit
                                                                                                    amet,
                                                                                                    consectetur
                                                                                                    adipiscing
                                                                                                    elit.
                                                                                                    Suspendisse
                                                                                                    et
                                                                                                    vehicula
                                                                                                    ipsum.
                                                                                                    Donec
                                                                                                    ut
                                                                                                    turpis
                                                                                                    in
                                                                                                    nisl
                                                                                                    interdum
                                                                                                    faucibus.
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                                                            Deskiprsi
                                                                                            Video
                                                                                            jika
                                                                                            ada
                                                                                        </p>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        ) : material.type ===
                                                                          "video" ? (
                                                                            <div>
                                                                                <div className="flex items-center gap-4 text-[12px] font-semibold">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            setMaterials(
                                                                                                (
                                                                                                    prev,
                                                                                                ) =>
                                                                                                    prev.map(
                                                                                                        (
                                                                                                            item,
                                                                                                        ) =>
                                                                                                            item.id ===
                                                                                                            material.id
                                                                                                                ? {
                                                                                                                      ...item,
                                                                                                                      videoSource:
                                                                                                                          "upload",
                                                                                                                  }
                                                                                                                : item,
                                                                                                    ),
                                                                                            )
                                                                                        }
                                                                                        className={`pb-2 ${
                                                                                            material.videoSource ===
                                                                                            "upload"
                                                                                                ? "border-b-2 border-[#7054dc] text-[#232530]"
                                                                                                : "text-[#7a7e8a]"
                                                                                        }`}
                                                                                    >
                                                                                        Unggah
                                                                                        Video
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            setMaterials(
                                                                                                (
                                                                                                    prev,
                                                                                                ) =>
                                                                                                    prev.map(
                                                                                                        (
                                                                                                            item,
                                                                                                        ) =>
                                                                                                            item.id ===
                                                                                                            material.id
                                                                                                                ? {
                                                                                                                      ...item,
                                                                                                                      videoSource:
                                                                                                                          "link",
                                                                                                                  }
                                                                                                                : item,
                                                                                                    ),
                                                                                            )
                                                                                        }
                                                                                        className={`pb-2 ${
                                                                                            material.videoSource ===
                                                                                            "link"
                                                                                                ? "border-b-2 border-[#7054dc] text-[#232530]"
                                                                                                : "text-[#7a7e8a]"
                                                                                        }`}
                                                                                    >
                                                                                        Tempel
                                                                                        Link
                                                                                        Video
                                                                                    </button>
                                                                                </div>

                                                                                {material.videoSource ===
                                                                                "upload" ? (
                                                                                    <div className="mt-4 space-y-3">
                                                                                        {material.uploadStatus !==
                                                                                        "done" ? (
                                                                                            <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                                                                                {!material.fileName ? (
                                                                                                    <div className="flex items-center justify-between gap-3">
                                                                                                        <p className="text-[11px] text-[#7a7e8a]">
                                                                                                            Tidak
                                                                                                            ada
                                                                                                            file
                                                                                                            yang
                                                                                                            dipilih
                                                                                                        </p>
                                                                                                        <label className="inline-flex h-[28px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[11px] font-semibold text-white">
                                                                                                            Pilih
                                                                                                            File
                                                                                                            <input
                                                                                                                type="file"
                                                                                                                accept="video/*"
                                                                                                                className="hidden"
                                                                                                                onChange={(
                                                                                                                    event,
                                                                                                                ) =>
                                                                                                                    handleFileChange(
                                                                                                                        material.id,
                                                                                                                        event
                                                                                                                            .target
                                                                                                                            .files?.[0] ??
                                                                                                                            null,
                                                                                                                    )
                                                                                                                }
                                                                                                            />
                                                                                                        </label>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <div className="flex items-center gap-3 rounded-lg border border-[#ece7ff] bg-[#fbf9ff] px-3 py-2">
                                                                                                            <p className="flex-1 text-[12px] font-semibold text-[#232530]">
                                                                                                                {
                                                                                                                    material.fileName
                                                                                                                }
                                                                                                            </p>
                                                                                                            <div className="flex items-center gap-3">
                                                                                                                <div className="h-2 w-[140px] rounded-full bg-[#e7e2f6]">
                                                                                                                    <div
                                                                                                                        className="h-full rounded-full bg-[#7054dc] transition-all"
                                                                                                                        style={{
                                                                                                                            width: `${material.uploadProgress}%`,
                                                                                                                        }}
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <span className="text-[11px] font-semibold text-[#7a7e8a]">
                                                                                                                    {
                                                                                                                        material.uploadProgress
                                                                                                                    }

                                                                                                                    %
                                                                                                                </span>
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() =>
                                                                                                                        setMaterials(
                                                                                                                            (
                                                                                                                                prev,
                                                                                                                            ) =>
                                                                                                                                prev.map(
                                                                                                                                    (
                                                                                                                                        item,
                                                                                                                                    ) =>
                                                                                                                                        item.id ===
                                                                                                                                        material.id
                                                                                                                                            ? {
                                                                                                                                                  ...item,
                                                                                                                                                  fileName:
                                                                                                                                                      "",
                                                                                                                                                  fileSize:
                                                                                                                                                      "",
                                                                                                                                                  uploadProgress: 0,
                                                                                                                                                  uploadStatus:
                                                                                                                                                      "idle",
                                                                                                                                                  previewUrl:
                                                                                                                                                      "",
                                                                                                                                              }
                                                                                                                                            : item,
                                                                                                                                ),
                                                                                                                        )
                                                                                                                    }
                                                                                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d9d7df] text-[12px] text-[#7a7e8a]"
                                                                                                                    aria-label="Batalkan unggahan"
                                                                                                                >
                                                                                                                    x
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <p className="mt-2 text-[11px] text-[#7a7e8a]">
                                                                                                            Menyiapkan
                                                                                                            file
                                                                                                            untuk
                                                                                                            diproses...
                                                                                                        </p>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="rounded-xl border border-[#ede9ff] bg-white overflow-hidden mt-2">
                                                                                                {material.previewUrl ? (
                                                                                                    <video
                                                                                                        src={
                                                                                                            material.previewUrl
                                                                                                        }
                                                                                                        className="w-full aspect-video bg-black object-contain"
                                                                                                        controls
                                                                                                    />
                                                                                                ) : (
                                                                                                    <div className="w-full aspect-video bg-[#f1f1fb] flex items-center justify-center">
                                                                                                        <span className="text-gray-400 text-sm">Tidak ada preview</span>
                                                                                                    </div>
                                                                                                )}
                                                                                                <div className="px-3 py-3 flex items-start gap-3 border-t border-[#ede9ff]">
                                                                                                    <div className="flex-1">
                                                                                                        <p className="text-[12px] font-semibold text-[#232530]">
                                                                                                            {material.fileName ||
                                                                                                                "Video Materi"}
                                                                                                        </p>
                                                                                                        <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                                                                            {
                                                                                                                material.duration
                                                                                                            }{" "}
                                                                                                            {material.fileSize
                                                                                                                ? `(${material.fileSize})`
                                                                                                                : ""}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                    <label className="cursor-pointer text-[11px] font-semibold text-[#7054dc] mt-1">
                                                                                                        Ganti Video
                                                                                                        <input
                                                                                                            type="file"
                                                                                                            accept="video/*"
                                                                                                            className="hidden"
                                                                                                            onChange={(event) =>
                                                                                                                handleFileChange(
                                                                                                                    material.id,
                                                                                                                    event.target.files?.[0] ?? null,
                                                                                                                )
                                                                                                            }
                                                                                                        />
                                                                                                    </label>
                                                                                                </div>
                                                                                                {material.showUploadSuccess && (
                                                                                                    <p className="mt-2 text-[10px] text-[#3aa65c]">
                                                                                                        Unggah
                                                                                                        video
                                                                                                        sukses!
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                        <p className="text-[10px] text-[#7a7e8a]">
                                                                                            Catatan:
                                                                                            Semua
                                                                                            file
                                                                                            harus
                                                                                            beresolusi
                                                                                            minimum
                                                                                            720p
                                                                                            dan
                                                                                            kurang
                                                                                            dari
                                                                                            4,0
                                                                                            GB.
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="mt-4">
                                                                                        <input
                                                                                            type="text"
                                                                                            value={
                                                                                                material.linkUrl
                                                                                            }
                                                                                            onChange={(
                                                                                                event,
                                                                                            ) =>
                                                                                                setMaterials(
                                                                                                    (
                                                                                                        prev,
                                                                                                    ) =>
                                                                                                        prev.map(
                                                                                                            (
                                                                                                                item,
                                                                                                            ) =>
                                                                                                                item.id ===
                                                                                                                material.id
                                                                                                                    ? {
                                                                                                                          ...item,
                                                                                                                          linkUrl:
                                                                                                                              event
                                                                                                                                  .target
                                                                                                                                  .value,
                                                                                                                      }
                                                                                                                    : item,
                                                                                                        ),
                                                                                                )
                                                                                            }
                                                                                            placeholder="https://"
                                                                                            className="h-[40px] w-full rounded-lg border border-[#d9d7df] bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                                                        />
                                                                                        {material.linkUrl.trim().length > 0 && (
                                                                                            <>
                                                                                                <div className="mt-3 rounded-xl border border-[#ede9ff] bg-white overflow-hidden">
                                                                                                    {getYoutubeVideoId(material.linkUrl) ? (
                                                                                                        <iframe
                                                                                                            className="w-full aspect-video"
                                                                                                            src={`https://www.youtube.com/embed/${getYoutubeVideoId(material.linkUrl)}`}
                                                                                                            title="YouTube video player"
                                                                                                            frameBorder="0"
                                                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                            allowFullScreen
                                                                                                        ></iframe>
                                                                                                    ) : (
                                                                                                        <div className="w-full aspect-video bg-[#f1f1fb] flex items-center justify-center">
                                                                                                            <span className="text-gray-400 text-sm">Preview tidak tersedia</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <div className="px-3 py-3 flex items-start justify-between gap-3 border-t border-[#ede9ff]">
                                                                                                        <div className="flex-1">
                                                                                                            <p className="text-[12px] font-semibold text-[#232530]">
                                                                                                                {material.linkPreviewTitle || "Video YouTube"}{" "}
                                                                                                                <span className="font-normal text-[#7a7e8a]">(YouTube)</span>
                                                                                                            </p>
                                                                                                            <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                                                                                {material.linkVideoDuration || "-"}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() =>
                                                                                                                setMaterials((prev) =>
                                                                                                                    prev.map((item) =>
                                                                                                                        item.id === material.id
                                                                                                                            ? {
                                                                                                                                  ...item,
                                                                                                                                  linkUrl: "",
                                                                                                                                  linkPreviewTitle: "",
                                                                                                                                  linkVideoTitle: "",
                                                                                                                                  linkVideoDuration: "",
                                                                                                                              }
                                                                                                                            : item
                                                                                                                    )
                                                                                                                )
                                                                                                            }
                                                                                                            className="whitespace-nowrap text-[11px] font-semibold text-[#7054dc]"
                                                                                                        >
                                                                                                            Ganti Link
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <p className="mt-2 text-[10px] text-[#3aa65c]">Video ditemukan!</p>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                <div className="mt-4">
                                                                                    <p className="text-[12px] font-semibold text-[#232530]">
                                                                                        Bahan
                                                                                        Bacaan
                                                                                    </p>
                                                                                    <div className="mt-2">
                                                                                        <TrixEditor
                                                                                            id={`materi-video-article-${material.id}`}
                                                                                            placeholder="Tulis bahan bacaan di sini..."
                                                                                            value={
                                                                                                material.articleContent
                                                                                            }
                                                                                            onChange={(
                                                                                                html,
                                                                                            ) =>
                                                                                                setMaterials(
                                                                                                    (
                                                                                                        prev,
                                                                                                    ) =>
                                                                                                        prev.map(
                                                                                                            (
                                                                                                                m,
                                                                                                            ) =>
                                                                                                                m.id ===
                                                                                                                material.id
                                                                                                                    ? {
                                                                                                                          ...m,
                                                                                                                          articleContent:
                                                                                                                              html,
                                                                                                                      }
                                                                                                                    : m,
                                                                                                        ),
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                                                        Deskiprsi
                                                                                        Video
                                                                                        jika
                                                                                        ada
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                <p className="text-[12px] font-semibold text-[#232530]">
                                                                                    Bahan
                                                                                    Bacaan
                                                                                </p>
                                                                                <div className="mt-2">
                                                                                    <TrixEditor
                                                                                        id={`materi-article-${material.id}`}
                                                                                        placeholder="Tulis materi artikel di sini..."
                                                                                        value={
                                                                                            material.articleContent
                                                                                        }
                                                                                        onChange={(
                                                                                            html,
                                                                                        ) =>
                                                                                            setMaterials(
                                                                                                (
                                                                                                    prev,
                                                                                                ) =>
                                                                                                    prev.map(
                                                                                                        (
                                                                                                            m,
                                                                                                        ) =>
                                                                                                            m.id ===
                                                                                                            material.id
                                                                                                                ? {
                                                                                                                      ...m,
                                                                                                                      articleContent:
                                                                                                                          html,
                                                                                                                  }
                                                                                                                : m,
                                                                                                    ),
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                                                    Deskiprsi
                                                                                    Video
                                                                                    jika
                                                                                    ada
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {!material.isSaved && (
                                                                            <div className="mt-4 flex items-center justify-end gap-3">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleCancelEditMaterial(
                                                                                            material.id,
                                                                                        )
                                                                                    }
                                                                                    className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                                                                                >
                                                                                    Batal
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={
                                                                                        !isMaterialFormComplete(
                                                                                            material,
                                                                                        )
                                                                                    }
                                                                                    className={`inline-flex h-[32px] items-center justify-center rounded-lg px-4 text-[12px] font-semibold text-white transition-colors ${
                                                                                        isMaterialFormComplete(
                                                                                            material,
                                                                                        )
                                                                                            ? "bg-[#7054dc] hover:bg-[#5f46cc]"
                                                                                            : "cursor-not-allowed bg-[#c9cbd3]"
                                                                                    }`}
                                                                                    onClick={() =>
                                                                                        handleSaveMaterialContent(
                                                                                            material.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Simpan
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                {isMaterialFormOpen && (
                                                    <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <p className="whitespace-nowrap text-[12px] font-semibold text-[#232530]">
                                                                Materi{" "}
                                                                {materials.length +
                                                                    1}
                                                                :
                                                            </p>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    newMaterialTitle
                                                                }
                                                                onChange={(e) =>
                                                                    setNewMaterialTitle(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Masukkan Materi yang Dibahas"
                                                                className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                                                            />
                                                        </div>
                                                        <div className="mt-3 flex items-center justify-end gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsMaterialFormOpen(
                                                                        false,
                                                                    );
                                                                    setNewMaterialTitle(
                                                                        "",
                                                                    );
                                                                }}
                                                                className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    handleCreateMaterial
                                                                }
                                                                disabled={
                                                                    !newMaterialTitle.trim()
                                                                }
                                                                className={`inline-flex h-[32px] items-center justify-center rounded-lg px-4 text-[12px] font-semibold text-white transition-colors ${newMaterialTitle.trim() ? "bg-[#f39b39] hover:bg-[#e08c2e]" : "cursor-not-allowed bg-[#c9cbd3]"}`}
                                                            >
                                                                Tambah Materi
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {quizzes.map((quiz, qIdx) => (
                                                    <div
                                                        key={quiz.id}
                                                        className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                                                        quiz.ctMode
                                                                            ? "bg-[#fef3c7] text-[#b45309]"
                                                                            : "bg-[#eef2ff] text-[#4f46e5]"
                                                                    }`}
                                                                >
                                                                    {quiz.ctMode
                                                                        ? "CT"
                                                                        : "REGULER"}
                                                                </span>
                                                                {editingQuizId ===
                                                                quiz.id ? (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                editQuizTitle
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditQuizTitle(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-[30px] w-[160px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setQuizzes(
                                                                                    (
                                                                                        p,
                                                                                    ) =>
                                                                                        p.map(
                                                                                            (
                                                                                                q,
                                                                                            ) =>
                                                                                                q.id ===
                                                                                                quiz.id
                                                                                                    ? {
                                                                                                          ...q,
                                                                                                          title: editQuizTitle,
                                                                                                      }
                                                                                                    : q,
                                                                                        ),
                                                                                );
                                                                                setEditingQuizId(
                                                                                    null,
                                                                                );
                                                                            }}
                                                                            className="text-[12px] font-semibold text-[#7054dc]"
                                                                        >
                                                                            Simpan
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="max-w-[300px] truncate text-[12px] font-semibold text-[#232530]">
                                                                        {
                                                                            quiz.title
                                                                        }
                                                                    </span>
                                                                )}
                                                                {editingQuizId !==
                                                                    quiz.id && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditingQuizId(
                                                                                quiz.id,
                                                                            );
                                                                            setEditQuizTitle(
                                                                                quiz.title,
                                                                            );
                                                                        }}
                                                                        className="cursor-pointer text-[#7a7e8a]"
                                                                    >
                                                                        <FiEdit2
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteQuiz(
                                                                            quiz.id,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-[#7a7e8a]"
                                                                >
                                                                    <FiTrash2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setActiveQuizId(
                                                                            quiz.id,
                                                                        );
                                                                        setIsQuizSettingsOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer text-[#7a7e8a]"
                                                                >
                                                                    <FiSettings
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </button>
                                                                {/* Bug 7: Tombol Simpan kuis hanya muncul saat isExpanded (sedang di-edit) */}
                                                                {quiz.isExpanded && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleSubmitQuiz(
                                                                                quiz.id,
                                                                            )
                                                                        }
                                                                        className="inline-flex h-[26px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-3 text-[11px] font-semibold text-white hover:bg-[#5f46cc]"
                                                                    >
                                                                        Simpan
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setQuizzes(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.map(
                                                                                    (
                                                                                        q,
                                                                                    ) =>
                                                                                        q.id ===
                                                                                        quiz.id
                                                                                            ? {
                                                                                                  ...q,
                                                                                                  isExpanded:
                                                                                                      !q.isExpanded,
                                                                                              }
                                                                                            : q,
                                                                                ),
                                                                        )
                                                                    }
                                                                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                                                >
                                                                    <FiChevronDown
                                                                        size={
                                                                            16
                                                                        }
                                                                        className={`transition-transform ${quiz.isExpanded ? "rotate-180" : ""}`}
                                                                    />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                                                >
                                                                    <svg
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                    >
                                                                        <path
                                                                            d="M4 6h16M4 12h16M4 18h16"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {!quiz.isExpanded && (
                                                            <p className="mt-1.5 text-[11px] text-[#7a7e8a]">
                                                                {quiz
                                                                    .questions[0]
                                                                    ?.answers
                                                                    .length ||
                                                                    0}{" "}
                                                                pilihan
                                                                <span className="mx-1.5">
                                                                    ·
                                                                </span>
                                                                {quiz.duration}{" "}
                                                                menit
                                                                <span className="mx-1.5">
                                                                    ·
                                                                </span>
                                                                Minimal{" "}
                                                                {quiz.minScore}
                                                            </p>
                                                        )}

                                                        {quiz.isExpanded && (
                                                            <div className="mt-4">
                                                                {quiz.ctMode ? (
                                                                    <>
                                                                        {quiz.ctStories.map(
                                                                            (
                                                                                story,
                                                                                sIdx,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        story.id
                                                                                    }
                                                                                    className="mb-6"
                                                                                >
                                                                                    <TrixEditor
                                                                                        id={`quiz-ct-story-${story.id}`}
                                                                                        placeholder="Masukkan cerita di sini ..."
                                                                                        value={story.cerita || ""}
                                                                                        minHeight="80px"
                                                                                        onChange={(html) =>
                                                                                            setQuizzes((prev) =>
                                                                                                prev.map((q) =>
                                                                                                    q.id !== quiz.id
                                                                                                        ? q
                                                                                                        : {
                                                                                                              ...q,
                                                                                                              ctStories: q.ctStories.map((s) =>
                                                                                                                  s.id !== story.id
                                                                                                                      ? s
                                                                                                                      : { ...s, cerita: html },
                                                                                                              ),
                                                                                                          },
                                                                                                ),
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    {story.subQuestions.map(
                                                                                        (
                                                                                            sq,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    sq.id
                                                                                                }
                                                                                                className="mt-4"
                                                                                            >
                                                                                                <p className="mb-2 text-[12px] font-semibold text-[#232530]">
                                                                                                    {sq.label
                                                                                                        ? sq.label.replace(
                                                                                                              /<[^>]*>?/gm,
                                                                                                              "",
                                                                                                          )
                                                                                                        : ""}
                                                                                                </p>
                                                                                                <TrixEditor
                                                                                                    id={`quiz-ct-sq-${sq.id}`}
                                                                                                    placeholder="Masukkan soal ..."
                                                                                                    value={
                                                                                                        sq.label
                                                                                                    }
                                                                                                    minHeight="80px"
                                                                                                    onChange={(
                                                                                                        html,
                                                                                                    ) =>
                                                                                                        setQuizzes(
                                                                                                            (
                                                                                                                p,
                                                                                                            ) =>
                                                                                                                p.map(
                                                                                                                    (
                                                                                                                        q,
                                                                                                                    ) =>
                                                                                                                        q.id !==
                                                                                                                        quiz.id
                                                                                                                            ? q
                                                                                                                            : {
                                                                                                                                  ...q,
                                                                                                                                  ctStories:
                                                                                                                                      q.ctStories.map(
                                                                                                                                          (
                                                                                                                                              s,
                                                                                                                                          ) =>
                                                                                                                                              s.id !==
                                                                                                                                              story.id
                                                                                                                                                  ? s
                                                                                                                                                  : {
                                                                                                                                                        ...s,
                                                                                                                                                        subQuestions:
                                                                                                                                                            s.subQuestions.map(
                                                                                                                                                                (
                                                                                                                                                                    sub,
                                                                                                                                                                ) =>
                                                                                                                                                                    sub.id !==
                                                                                                                                                                    sq.id
                                                                                                                                                                        ? sub
                                                                                                                                                                        : {
                                                                                                                                                                              ...sub,
                                                                                                                                                                              label: html,
                                                                                                                                                                          },
                                                                                                                                                            ),
                                                                                                                                                    },
                                                                                                                                      ),
                                                                                                                              },
                                                                                                                ),
                                                                                                        )
                                                                                                    }
                                                                                                />
                                                                                                <div className="mt-3 space-y-2">
                                                                                                    {sq.answers.map(
                                                                                                        (
                                                                                                            ans,
                                                                                                            aIdx,
                                                                                                        ) => (
                                                                                                            <div
                                                                                                                key={
                                                                                                                    ans.id
                                                                                                                }
                                                                                                                className="flex items-center gap-2"
                                                                                                            >
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() =>
                                                                                                                        handleSelectCTCorrectAnswer(
                                                                                                                            quiz.id,
                                                                                                                            story.id,
                                                                                                                            sq.id,
                                                                                                                            ans.id,
                                                                                                                        )
                                                                                                                    }
                                                                                                                    className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors"
                                                                                                                    style={{
                                                                                                                        borderColor:
                                                                                                                            ans.isCorrect
                                                                                                                                ? "#7054dc"
                                                                                                                                : "#d9d7df",
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {ans.isCorrect && (
                                                                                                                        <span className="h-2.5 w-2.5 rounded-full bg-[#7054dc]" />
                                                                                                                    )}
                                                                                                                </button>
                                                                                                                <input
                                                                                                                    id={`ans-input-${ans.id}`}
                                                                                                                    type="text"
                                                                                                                    value={
                                                                                                                        ans.text
                                                                                                                    }
                                                                                                                    onChange={(
                                                                                                                        e,
                                                                                                                    ) => {
                                                                                                                        const val =
                                                                                                                            e
                                                                                                                                .target
                                                                                                                                .value;
                                                                                                                        setQuizzes(
                                                                                                                            (
                                                                                                                                p,
                                                                                                                            ) =>
                                                                                                                                p.map(
                                                                                                                                    (
                                                                                                                                        q,
                                                                                                                                    ) =>
                                                                                                                                        q.id !==
                                                                                                                                        quiz.id
                                                                                                                                            ? q
                                                                                                                                            : {
                                                                                                                                                  ...q,
                                                                                                                                                  ctStories:
                                                                                                                                                      q.ctStories.map(
                                                                                                                                                          (
                                                                                                                                                              s,
                                                                                                                                                          ) =>
                                                                                                                                                              s.id !==
                                                                                                                                                              story.id
                                                                                                                                                                  ? s
                                                                                                                                                                  : {
                                                                                                                                                                        ...s,
                                                                                                                                                                        subQuestions:
                                                                                                                                                                            s.subQuestions.map(
                                                                                                                                                                                (
                                                                                                                                                                                    sqq,
                                                                                                                                                                                ) =>
                                                                                                                                                                                    sqq.id !==
                                                                                                                                                                                    sq.id
                                                                                                                                                                                        ? sqq
                                                                                                                                                                                        : {
                                                                                                                                                                                              ...sqq,
                                                                                                                                                                                              answers:
                                                                                                                                                                                                  sqq.answers.map(
                                                                                                                                                                                                      (
                                                                                                                                                                                                          a,
                                                                                                                                                                                                      ) =>
                                                                                                                                                                                                          a.id ===
                                                                                                                                                                                                          ans.id
                                                                                                                                                                                                              ? {
                                                                                                                                                                                                                    ...a,
                                                                                                                                                                                                                    text: val,
                                                                                                                                                                                                                }
                                                                                                                                                                                                              : a,
                                                                                                                                                                                                  ),
                                                                                                                                                                                          },
                                                                                                                                                                            ),
                                                                                                                                                                    },
                                                                                                                                                      ),
                                                                                                                                              },
                                                                                                                                ),
                                                                                                                        );
                                                                                                                    }}
                                                                                                                    placeholder={
                                                                                                                        aIdx <
                                                                                                                        sq
                                                                                                                            .answers
                                                                                                                            .length -
                                                                                                                            1
                                                                                                                            ? "Masukkan Jawaban"
                                                                                                                            : "Tambah Opsi Jawaban"
                                                                                                                    }
                                                                                                                    className="h-[36px] flex-1 rounded-lg border border-[#e5e3ee] bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                                                                                />
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() =>
                                                                                                                        handleRemoveCTAnswer(
                                                                                                                            quiz.id,
                                                                                                                            story.id,
                                                                                                                            sq.id,
                                                                                                                            ans.id,
                                                                                                                        )
                                                                                                                    }
                                                                                                                    className="text-[#7a7e8a] hover:text-[#e04e4e]"
                                                                                                                >
                                                                                                                    <FiX
                                                                                                                        size={
                                                                                                                            16
                                                                                                                        }
                                                                                                                    />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        ),
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAddCTStory(
                                                                                    quiz.id,
                                                                                )
                                                                            }
                                                                            className="mt-2 text-[12px] font-semibold text-[#f39b39]"
                                                                        >
                                                                            Tambah
                                                                            Cerita
                                                                            dan
                                                                            Soal
                                                                            Baru
                                                                            &nbsp;+
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {quiz.questions.map(
                                                                            (
                                                                                question,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        question.id
                                                                                    }
                                                                                    className="mb-4"
                                                                                >
                                                                                    <p className="mb-2 text-[12px] font-semibold text-[#232530]">
                                                                                        {question.label
                                                                                            ? question.label.replace(
                                                                                                  /<[^>]*>?/gm,
                                                                                                  "",
                                                                                              )
                                                                                            : ""}
                                                                                    </p>
                                                                                    <TrixEditor
                                                                                        id={`quiz-q-${question.id}`}
                                                                                        placeholder="Masukkan soal ..."
                                                                                        value={
                                                                                            question.label
                                                                                        }
                                                                                        minHeight="80px"
                                                                                        onChange={(
                                                                                            html,
                                                                                        ) =>
                                                                                            setQuizzes(
                                                                                                (
                                                                                                    p,
                                                                                                ) =>
                                                                                                    p.map(
                                                                                                        (
                                                                                                            q,
                                                                                                        ) =>
                                                                                                            q.id !==
                                                                                                            quiz.id
                                                                                                                ? q
                                                                                                                : {
                                                                                                                      ...q,
                                                                                                                      questions:
                                                                                                                          q.questions.map(
                                                                                                                              (
                                                                                                                                  qn,
                                                                                                                              ) =>
                                                                                                                                  qn.id !==
                                                                                                                                  question.id
                                                                                                                                      ? qn
                                                                                                                                      : {
                                                                                                                                            ...qn,
                                                                                                                                            label: html,
                                                                                                                                        },
                                                                                                                          ),
                                                                                                                  },
                                                                                                    ),
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <div className="mt-3 space-y-2">
                                                                                        {question.answers.map(
                                                                                            (
                                                                                                ans,
                                                                                                aIdx,
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        ans.id
                                                                                                    }
                                                                                                    className="flex items-center gap-2"
                                                                                                >
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() =>
                                                                                                            handleSelectCorrectAnswer(
                                                                                                                quiz.id,
                                                                                                                question.id,
                                                                                                                ans.id,
                                                                                                            )
                                                                                                        }
                                                                                                        className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors"
                                                                                                        style={{
                                                                                                            borderColor:
                                                                                                                ans.isCorrect
                                                                                                                    ? "#7054dc"
                                                                                                                    : "#d9d7df",
                                                                                                        }}
                                                                                                    >
                                                                                                        {ans.isCorrect && (
                                                                                                            <span className="h-2.5 w-2.5 rounded-full bg-[#7054dc]" />
                                                                                                        )}
                                                                                                    </button>
                                                                                                    <input
                                                                                                        id={`ans-input-${ans.id}`}
                                                                                                        type="text"
                                                                                                        value={
                                                                                                            ans.text
                                                                                                        }
                                                                                                        onChange={(
                                                                                                            e,
                                                                                                        ) => {
                                                                                                            const val =
                                                                                                                e
                                                                                                                    .target
                                                                                                                    .value;
                                                                                                            setQuizzes(
                                                                                                                (
                                                                                                                    p,
                                                                                                                ) =>
                                                                                                                    p.map(
                                                                                                                        (
                                                                                                                            q,
                                                                                                                        ) =>
                                                                                                                            q.id !==
                                                                                                                            quiz.id
                                                                                                                                ? q
                                                                                                                                : {
                                                                                                                                      ...q,
                                                                                                                                      questions:
                                                                                                                                          q.questions.map(
                                                                                                                                              (
                                                                                                                                                  qn,
                                                                                                                                              ) =>
                                                                                                                                                  qn.id !==
                                                                                                                                                  question.id
                                                                                                                                                      ? qn
                                                                                                                                                      : {
                                                                                                                                                            ...qn,
                                                                                                                                                            answers:
                                                                                                                                                                qn.answers.map(
                                                                                                                                                                    (
                                                                                                                                                                        a,
                                                                                                                                                                    ) =>
                                                                                                                                                                        a.id ===
                                                                                                                                                                        ans.id
                                                                                                                                                                            ? {
                                                                                                                                                                                  ...a,
                                                                                                                                                                                  text: val,
                                                                                                                                                                              }
                                                                                                                                                                            : a,
                                                                                                                                                                ),
                                                                                                                                                        },
                                                                                                                                          ),
                                                                                                                                  },
                                                                                                                    ),
                                                                                                            );
                                                                                                        }}
                                                                                                        placeholder={
                                                                                                            aIdx <
                                                                                                            question
                                                                                                                .answers
                                                                                                                .length -
                                                                                                                1
                                                                                                                ? "Masukkan Jawaban"
                                                                                                                : "Tambah Opsi Jawaban"
                                                                                                        }
                                                                                                        className="h-[36px] flex-1 rounded-lg border border-[#e5e3ee] bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                                                                                    />
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() =>
                                                                                                            handleRemoveAnswer(
                                                                                                                quiz.id,
                                                                                                                question.id,
                                                                                                                ans.id,
                                                                                                            )
                                                                                                        }
                                                                                                        className="text-[#7a7e8a] hover:text-[#e04e4e]"
                                                                                                    >
                                                                                                        <FiX
                                                                                                            size={
                                                                                                                16
                                                                                                            }
                                                                                                        />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAddQuestion(
                                                                                    quiz.id,
                                                                                )
                                                                            }
                                                                            className="mt-1 text-[12px] font-semibold text-[#f39b39]"
                                                                        >
                                                                            Soal
                                                                            Pilihan
                                                                            ganda
                                                                            &nbsp;+
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {!isMaterialFormOpen && (
                                                    <div className="mt-4 rounded-2xl border border-dashed border-[#8e7bff] bg-[#f7f6ff] px-4 py-4">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setIsMaterialFormOpen(
                                                                        true,
                                                                    )
                                                                }
                                                                className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]"
                                                            >
                                                                Materi{" "}
                                                                <FiPlus
                                                                    size={14}
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    handleCreateQuiz
                                                                }
                                                                className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]"
                                                            >
                                                                Kuis{" "}
                                                                <FiPlus
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="mt-4">
                                                <p className="text-[12px] text-[#7a7e8a]">
                                                    {topik.materis.length}{" "}
                                                    materi
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            activeTopikId !==
                                                            topik.id
                                                        ) {
                                                            loadTopicData(
                                                                topik,
                                                            );
                                                        }
                                                    }}
                                                    className="mt-2 text-[12px] font-semibold text-[#7054dc] hover:underline"
                                                >
                                                    Kelola Konten
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {!isFormOpen ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTopicTitle("");
                                            setTopicError("");
                                            setIsFormOpen(true);
                                        }}
                                        className="inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]"
                                    >
                                        Topik <FiPlus size={14} />
                                    </button>
                                ) : (
                                    <div className="rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(20,20,30,0.05)]">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-[12px] font-semibold text-[#232530]">
                                                Topik {topiks.length + 1}:
                                            </p>
                                            <input
                                                type="text"
                                                value={topicTitle}
                                                onChange={(event) =>
                                                    setTopicTitle(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan Judul Topik"
                                                className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        handleCreateTopic();
                                                }}
                                            />
                                        </div>
                                        <div className="mt-4 flex items-center justify-end gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsFormOpen(false);
                                                    setTopicError("");
                                                }}
                                                className="cursor-pointer text-[12px] font-semibold text-[#7a7e8a]"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreateTopic}
                                                disabled={isCreatingTopic}
                                                className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
                                            >
                                                {isCreatingTopic
                                                    ? "Menyimpan..."
                                                    : "Tambah Topik"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {isQuizSettingsOpen &&
                activeQuizId &&
                (() => {
                    const quiz = quizzes.find((q) => q.id === activeQuizId);
                    if (!quiz) return null;
                    return (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                            onClick={() => setIsQuizSettingsOpen(false)}
                        >
                            <div
                                className="relative w-[440px] rounded-2xl bg-white px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[16px] font-semibold text-[#7054dc]">
                                        Pengaturan Kuis
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsQuizSettingsOpen(false)
                                        }
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e3ee] text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
                                    <p className="text-[13px] font-semibold text-[#232530]">
                                        Durasi Pengerjaan (Menit)
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            defaultValue={quiz.duration}
                                            id={`dur-${quiz.id}`}
                                            className="h-[32px] w-[60px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none"
                                        />
                                        <span className="text-[12px] text-[#7a7e8a]">
                                            Menit
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#232530]">
                                            Batas Nilai Minimal
                                        </p>
                                        <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                            Siswa harus mencapai nilai ini untuk
                                            dinyatakan lulus
                                        </p>
                                    </div>
                                    <input
                                        type="number"
                                        defaultValue={quiz.minScore}
                                        id={`min-${quiz.id}`}
                                        min={0}
                                        max={100}
                                        className="h-[32px] w-[70px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none"
                                        placeholder="0 - 100"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#232530]">
                                            Skor Standar Per Soal
                                        </p>
                                        <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                            Nilai poin untuk setiap soal baru
                                        </p>
                                    </div>
                                    <input
                                        type="number"
                                        defaultValue={quiz.scorePerQuestion}
                                        id={`sps-${quiz.id}`}
                                        min={0}
                                        max={100}
                                        className="h-[32px] w-[70px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none"
                                        placeholder="0 - 100"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between pb-2">
                                    <div className="flex-1 pr-4">
                                        <p className="text-[13px] font-semibold text-[#232530]">
                                            Mode Computational Thinking
                                        </p>
                                        <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                            Aktifkan untuk menambahkan soal CT (Dekomposisi, Pola, Abstraksi, Algoritma)
                                        </p>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            id={`ct-${quiz.id}`}
                                            defaultChecked={quiz.ctMode}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-[28px] w-[52px] rounded-full bg-[#d9d7df] after:absolute after:left-[3px] after:top-[3px] after:h-[22px] after:w-[22px] after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#7054dc] peer-checked:after:translate-x-[24px]"></div>
                                    </label>
                                </div>

                                <div className="mt-5 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsQuizSettingsOpen(false)
                                        }
                                        className="text-[12px] font-semibold text-[#7a7e8a]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const dur =
                                                parseInt(
                                                    (
                                                        document.getElementById(
                                                            `dur-${quiz.id}`,
                                                        ) as HTMLInputElement
                                                    )?.value,
                                                ) || 90;
                                            const min =
                                                parseInt(
                                                    (
                                                        document.getElementById(
                                                            `min-${quiz.id}`,
                                                        ) as HTMLInputElement
                                                    )?.value,
                                                ) || 0;
                                            const sps =
                                                parseInt(
                                                    (
                                                        document.getElementById(
                                                            `sps-${quiz.id}`,
                                                        ) as HTMLInputElement
                                                    )?.value,
                                                ) || 0;
                                            const ct =
                                                (
                                                    document.getElementById(
                                                        `ct-${quiz.id}`,
                                                    ) as HTMLInputElement
                                                )?.checked ?? quiz.ctMode;
                                            handleSaveQuizSettings(quiz.id, {
                                                duration: dur,
                                                minScore: min,
                                                scorePerQuestion: sps,
                                                ctMode: ct,
                                            });
                                        }}
                                        className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </div>
    );
}

export default function EditModulKontenPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
            <EditModulKontenPageContent />
        </Suspense>
    );
}
