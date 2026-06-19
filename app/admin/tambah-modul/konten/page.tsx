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

import AdminHeader from "../../../component/admin/AdminHeader";
import AdminModuleSidebar from "../../components/AdminModuleSidebar";
import {
  adminModulApi,
  adminTopikApi,
  adminMateriApi,
  guruKuisApi,
  uploadApi,
  guruMateriApi,
} from "../../../lib/api";
import type { GuruTopikWithMateri } from "../../../lib/types/guru";

import { usePopup } from "../../../component/ui/PopupProvider";
import TrixEditor from "../../../component/ui/TrixEditor";

const getYoutubeThumb = (url: string) => {
  const match = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{6,})/);
  if (!match) {
    return "";
  }
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
};

function TambahModulKontenPageContent() {
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
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
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
        subQuestions: {
          id: number;
          label: string;
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
  const [materialApiIds, setMaterialApiIds] = useState<Record<number, string>>(
    {},
  );
  const [quizApiIds, setQuizApiIds] = useState<Record<number, string>>({});
  const [subQuizApiIds, setSubQuizApiIds] = useState<Record<number, string>>({});
  const [isSavingMaterial, setIsSavingMaterial] = useState<number | null>(null);
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
    if (!modulId) { setIsLoading(false); return; }
    const loadContent = async () => {
      try {
        const items = await guruMateriApi.getByModul(modulId);
        setTopiks(items);
        if (items.length > 0) {
          const firstTopik = items[0];
          setActiveTopikId(firstTopik.id);
          setTopicTitle(firstTopik.nama);
          setTopicId(firstTopik.id);
          setIsTopicAdded(true);

          if (firstTopik.materis.length > 0) {
            const loaded = firstTopik.materis.map((item: any, idx: number) => {
              const localId = Date.now() + idx;
              setMaterialApiIds((prev) => ({
                ...prev,
                [localId]: item.id,
              }));
              return {
                id: localId,
        title: item.isVideo ? `Video ${idx + 1}` : `Materi ${idx + 1}`,
                type: (item.isVideo ? "video" : "artikel") as "video" | "artikel",
                isSaved: true,
                isExpanded: false,
                videoSource: "link" as const,
                linkUrl: item.videoUrl || "",
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
                previewUrl: "",
                duration: "00:00",
                articleContent: item.article || "",
              };
            });
            setMaterials(loaded);
            if (loaded.length > 0) setActiveMaterialId(loaded[0].id);
          }

          // Load quizzes from API
          const quizIds: Record<number, string> = {};
          const mappedQuizzes = (firstTopik.quizzes || []).map((q: any, qIdx: number) => {
            const localId = Date.now() + qIdx + 1000;
            quizIds[localId] = q.id;
            return {
              id: localId,
              title:
                q.question.length > 40
                  ? q.question.substring(0, 40) + "…"
                  : q.question,
              isExpanded: false,
              ctMode: q.quizType === "COMPUTATIONAL_THINKING",
              duration: q.quizSettings[0]?.timeLimit
                ? Math.round(q.quizSettings[0].timeLimit / 60)
                : 90,
              minScore: q.quizSettings[0]?.minScoreTreshold ?? 0,
              scorePerQuestion:
                q.quizSettings[0]?.standardScorePerQuestion ?? 10,
              questions: [
                {
                  id: localId + 1,
                  label: q.question,
                  answers: (q.quizAnswerOptions || []).map((opt: any, oIdx: number) => ({
                    id: localId + 10 + oIdx,
                    text: opt.option,
                    isCorrect: opt.option === q.correctAnswer,
                  })),
                },
              ],
              ctStories: [makeCTStory()],
            };
          });
          setQuizzes(mappedQuizzes);
          setQuizApiIds((prev) => ({ ...prev, ...quizIds }));
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

      uploadSuccessTimersRef.current[material.id] = window.setTimeout(() => {
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
      }, 3000);
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

  const handleSaveEdit = () => {
    if (editingMaterialId === null) {
      return;
    }

    setMaterials((prev) =>
      prev.map((material) =>
        material.id === editingMaterialId
          ? {
              ...material,
              title: editTitle.trim() || material.title,
            }
          : material,
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
      const created = await adminMateriApi.create({ title: trimmedTitle, topikId: topicId, modulId: modulId || "" });
      setMaterialApiIds((prev) => ({ ...prev, [nextId]: created.id }));
    } catch (err) {
      console.error("Create material error:", err);
      toast("Gagal membuat materi. Pastikan topik sudah tersimpan.", "error");
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
    if (material && apiId) {
      setIsSavingMaterial(materialId);
      showLoading("Menyimpan materi...");
      try {
        await adminMateriApi.update(apiId, { isVideo: material.type === "video", videoUrl: material.type === "video" ? (material.videoSource === "link" ? material.linkUrl : material.previewUrl) : undefined, article: material.type === "artikel" || (material.type === "video" && material.articleContent) ? material.articleContent : undefined });
      } catch (err) {
        console.error("Save material error:", err);
        toast("Gagal menyimpan materi.", "error");
        hideLoading();
        setIsSavingMaterial(null);
        return;
      } finally {
        hideLoading();
        setIsSavingMaterial(null);
      }
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
  };

  const handleEditMaterialContent = (materialId: number) => {
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === materialId
          ? {
              ...item,
              isSaved: false,
              isExpanded: true,
              _editSnapshot: { articleContent: item.articleContent },
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
          articleContent: item._editSnapshot?.articleContent ?? item.articleContent,
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
    subQuestions: ctSubLabels.map((label, i) => ({
      id: Date.now() + i + 1,
      label,
      answers: [
        { id: Date.now() + i * 10 + 100, text: "", isCorrect: false },
        { id: Date.now() + i * 10 + 101, text: "", isCorrect: false },
      ],
    })),
  });

  const loadTopicData = useCallback((topik: any) => {
    setActiveTopikId(topik.id);
    setTopicTitle(topik.nama);
    setTopicId(topik.id);
    if (!topik.materis) topik.materis = [];
    if (!topik.quizzes) topik.quizzes = [];

    const loaded = topik.materis.map((item: any, idx: number) => {
      const localId = Date.now() + idx;
      setMaterialApiIds((prev) => ({
        ...prev,
        [localId]: item.id,
      }));
      return {
        id: localId,
        title: item.article ? `Materi ${idx + 1}` : `Video ${idx + 1}`,
        type: (item.isVideo ? "video" : "artikel") as "video" | "artikel",
        isSaved: true,
        isExpanded: false,
        videoSource: "link" as const,
        linkUrl: item.videoUrl || "",
        linkPreviewTitle: "",
        linkPreviewThumb: item.videoUrl ? getYoutubeThumb(item.videoUrl) : "",
        linkVideoTitle: "",
        linkVideoDuration: "",
        showUploadSuccess: false,
        fileName: "",
        fileSize: "",
        uploadProgress: 100,
        uploadStatus: "done" as const,
        previewUrl: "",
        duration: "00:00",
        articleContent: item.article || "",
      };
    });
    setMaterials(loaded);
    if (loaded.length > 0) setActiveMaterialId(loaded[0].id);
    else setActiveMaterialId(null);

    const quizIds: Record<number, string> = {};
    const mappedQuiz = topik.quizzes.map((q: any, qIdx: number) => {
      const localId = Date.now() + qIdx + 1000;
      quizIds[localId] = q.id;
      return {
        id: localId,
        title: q.question?.length > 40 ? q.question.substring(0, 40) + "…" : q.question || "Untitled",
        isExpanded: false,
        ctMode: q.quizType === "COMPUTATIONAL_THINKING",
        duration: q.quizSettings?.[0]?.timeLimit ? Math.round(q.quizSettings[0].timeLimit / 60) : 90,
        minScore: q.quizSettings?.[0]?.minScoreTreshold ?? 0,
        scorePerQuestion: q.quizSettings?.[0]?.standardScorePerQuestion ?? 10,
        questions: [
          {
            id: localId + 1,
            label: q.question || "Soal Kuis",
            answers: (q.quizAnswerOptions || []).map((opt: any, oIdx: number) => ({
              id: localId + 10 + oIdx,
              text: opt.option,
              isCorrect: opt.option === q.correctAnswer,
            })),
          },
        ],
        ctStories: [makeCTStory()],
      };
    });
    setQuizzes(mappedQuiz);
    setQuizApiIds((prev) => ({ ...prev, ...quizIds }));
  }, [getYoutubeThumb, makeCTStory]);

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
      const created = await guruKuisApi.create({
        quiz: {
          topikId: topicId,
          quizType: false ? "COMPUTATIONAL_THINKING" : "REGULER",
          question: "Soal Kuis 1",
          correctAnswer: "A",
          skor: 10,
        },
        answerOptions: [{ option: "A" }, { option: "B" }, { option: "C" }],
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
                  answers: qn.answers.filter((a) => a.id !== answerId),
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
                          answers: sq.answers.filter((a) => a.id !== answerId),
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

  const activeTopik = topiks.find(t => t.id === activeTopikId);
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
    const apiId = quizApiIds[quizId];
    const quiz = quizzes.find((q) => q.id === quizId);
    const subIds = quiz?.ctStories.flatMap((s) =>
      s.subQuestions.map((sq) => subQuizApiIds[sq.id]).filter(Boolean),
    ) ?? [];

    showLoading("Menghapus kuis...");
    try {
      if (apiId) await guruKuisApi.delete(apiId);
      for (const sid of subIds) await guruKuisApi.delete(sid);
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
        toast("Masukkan teks soal untuk setiap sub-soal CT.", "warning");
        return;
      }
      const hasEmpty = quiz.ctStories.some((s) =>
        s.subQuestions.some((sq) =>
          sq.answers.some((a) => !a.text.trim()),
        ),
      );
      if (hasEmpty) {
        toast("Lengkapi semua opsi jawaban CT terlebih dahulu.", "warning");
        return;
      }
      const hasCorrect = quiz.ctStories.every((s) =>
        s.subQuestions.every((sq) =>
          sq.answers.some((a) => a.isCorrect),
        ),
      );
      if (!hasCorrect) {
        toast("Pilih jawaban benar untuk setiap sub-soal CT.", "warning");
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
    }

    setIsSavingQuiz(true);
    showLoading("Menyimpan kuis...");
    try {
      if (quiz.ctMode) {
        let firstSaved = false;
        const newSubIds: Record<number, string> = {};

        for (const story of quiz.ctStories) {
          for (const sq of story.subQuestions) {
            const payload = {
              question: sq.label || "Soal CT",
              correctAnswer:
                sq.answers.find((a) => a.isCorrect)?.text ||
                sq.answers[0]?.text ||
                "",
              skor: quiz.scorePerQuestion || 10,
              quizType: "COMPUTATIONAL_THINKING" as const,
              answerOptions: sq.answers.map((a) => ({ option: a.text })),
              setting: {
                timeLimit: quiz.duration * 60,
                allowMultipleAttempts: false,
                isComputationalThinkingEnabled: true,
                minScoreTreshold: quiz.minScore,
                standardScorePerQuestion: quiz.scorePerQuestion,
              },
            };

            if (!firstSaved) {
              const apiId = quizApiIds[quizId];
              if (apiId) {
                await guruKuisApi.update(apiId, payload);
              } else {
                const created = await guruKuisApi.create({
                  quiz: {
                    topikId: topicId!,
                    question: payload.question,
                    correctAnswer: payload.correctAnswer,
                    skor: payload.skor,
                    quizType: "COMPUTATIONAL_THINKING",
                  },
                  answerOptions: payload.answerOptions,
                  setting: payload.setting,
                });
                setQuizApiIds((prev) => ({ ...prev, [quizId]: created.id }));
              }
              firstSaved = true;
            } else {
              const existingApiId = subQuizApiIds[sq.id];
              if (existingApiId) {
                await guruKuisApi.update(existingApiId, payload);
              } else {
                const created = await guruKuisApi.create({
                  quiz: {
                    topikId: topicId!,
                    question: payload.question,
                    correctAnswer: payload.correctAnswer,
                    skor: payload.skor,
                    quizType: "COMPUTATIONAL_THINKING",
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
      } else {
        const question = quiz.questions[0]?.label || "Soal Kuis";
        const answers = quiz.questions[0]?.answers || [];
        const correctAnswer =
          answers.find((a) => a.isCorrect)?.text || answers[0]?.text || "";
        const answerOptions = answers.map((a) => ({ option: a.text }));

        const apiId = quizApiIds[quizId];
        if (apiId) {
          await guruKuisApi.update(apiId, {
            question,
            correctAnswer,
            skor: quiz.scorePerQuestion || 10,
            quizType: "REGULER",
            answerOptions,
            setting: {
              timeLimit: quiz.duration * 60,
              allowMultipleAttempts: false,
              isComputationalThinkingEnabled: false,
              minScoreTreshold: quiz.minScore,
              standardScorePerQuestion: quiz.scorePerQuestion,
            },
          });
          toast("Kuis berhasil diperbarui.", "success");
        } else {
          const created = await guruKuisApi.create({
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
              isComputationalThinkingEnabled: false,
              minScoreTreshold: quiz.minScore,
              standardScorePerQuestion: quiz.scorePerQuestion,
            },
          });
          setQuizApiIds((prev) => ({ ...prev, [quizId]: created.id }));
          toast("Kuis berhasil disimpan.", "success");
        }
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
        name: topicTitle.trim(), modulId, order: topiks.length + 1
      });
      setTopicId(created.id);
      setIsTopicAdded(true);
      setIsFormOpen(false);
      setActiveMaterialId(null);
      setActiveTopikId(created.id);
      setTopiks((prev) => [...prev, { ...created, nama: (created as any).name || (created as any).nama, materis: [], quizzes: [] } as any]);
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
      await adminTopikApi.update(topicId, { name: editTopicTitle.trim() });
      setTopicTitle(editTopicTitle.trim());
      setIsEditingTopic(false);
      setTopiks((prev) =>
        prev.map((t) =>
          t.id === topicId ? { ...t, nama: editTopicTitle.trim() } : t,
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
  const handleDeleteTopic = useCallback(async (id?: string) => {
    const targetId = id || topicId;
    if (!targetId) return;
    const ok = await confirm({
      message: "Apakah Anda yakin ingin menghapus topik ini?",
      variant: "danger",
      confirmText: "Hapus",
    });
    if (!ok) return;
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
        err instanceof Error ? err.message : "Gagal menghapus topik.",
        "error",
      );
    } finally {
      hideLoading();
    }
  }, [topicId]);

  // Publish module
  const handlePublish = useCallback(async () => {
    if (!modulId) { setIsLoading(false); return; }
    const ok2 = await confirm({
      message: "Apakah Anda yakin ingin menerbitkan modul ini?",
      confirmText: "Terbitkan",
    });
    if (!ok2) return;
    showLoading("Menerbitkan modul...");
    try {
      await adminModulApi.update(modulId, { isDraft: false });
      router.push("/modul-guru?tab=published");
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
            <p className="text-sm text-[#8a8d98]">{isLoading ? 'Memuat data konten...' : 'Memeriksa otorisasi...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />

      <main className="flex w-full">
        <AdminModuleSidebar basePath="/admin/tambah-modul" modulId={modulId ?? undefined} title="Tambah Modul" showSiswaTab={false} />
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
                      onChange={(event) => setTopicTitle(event.target.value)}
                      placeholder="Masukkan Judul Topik"
                      className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateTopic();
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
                      {isCreatingTopic ? "Menyimpan..." : "Tambah Topik"}
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
                        activeTopikId === topik.id ? "bg-white" : "bg-[#fbfbfe]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <p className="text-[12px] font-semibold text-[#232530]">
                            Topik {topikIndex + 1}:
                          </p>
                        {isEditingTopic && topicId === topik.id ? (
                          <>
                            <input
                              type="text"
                              value={editTopicTitle}
                              onChange={(e) =>
                                setEditTopicTitle(e.target.value)
                              }
                              className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEditTopic();
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditTopic}
                              className="text-[12px] font-semibold text-[#7054dc]"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingTopic(false)}
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
                                setEditTopicTitle(topik.nama);
                                setIsEditingTopic(true);
                                if (activeTopikId !== topik.id) {
                                  loadTopicData(topik);
                                }
                              }}
                              className="cursor-pointer text-[#7a7e8a] hover:text-[#7054dc]"
                              aria-label="Edit topik"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTopic(topik.id)}
                              className="cursor-pointer text-[#7a7e8a] hover:text-[#e04e4e]"
                              aria-label="Hapus topik"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {activeTopikId === topik.id ? (
                      <>
                      <div className="mt-4 space-y-3">
                      {materials.map((material, index) => (
                        <div
                          key={material.id}
                          className={`rounded-2xl border border-[#e5e3ee] px-4 py-3 ${
                            activeMaterialId === material.id
                              ? "bg-white"
                              : "bg-[#fbfbfe]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setActiveMaterialId(material.id)}
                                className="text-left"
                              >
                                <span className="text-[12px] font-semibold text-[#232530]">
                                  {material.type === "video" ? `Video ${index + 1}` : `Materi ${index + 1}`}:
                                </span>
                              </button>
                              {editingMaterialId === material.id ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(event) =>
                                    setEditTitle(event.target.value)
                                  }
                                  className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMaterialId(material.id)
                                  }
                                  className="text-[12px] font-semibold text-[#232530]"
                                >
                                  {material.title}
                                </button>
                              )}
                              {editingMaterialId === material.id ? (
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  className="text-[12px] font-semibold text-[#7054dc]"
                                >
                                  Simpan
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartEdit(material.id, material.title)
                                  }
                                  className="cursor-pointer text-[#7a7e8a]"
                                  aria-label="Edit materi"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMaterial(material.id)
                                }
                                className="cursor-pointer text-[#7a7e8a]"
                                aria-label="Hapus materi"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {material.isSaved ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleMaterialExpanded(material.id)
                                    }
                                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                    aria-label={
                                      material.isExpanded ? "Tutup" : "Buka"
                                    }
                                  >
                                    <FiChevronDown
                                      size={16}
                                      className={`transition-transform ${
                                        material.isExpanded ? "rotate-180" : ""
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
                                      setOpenTypeMenuId((prev) =>
                                        prev === material.id
                                          ? null
                                          : material.id,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#f39b39]"
                                  >
                                    {material.type === "video"
                                      ? "Materi Video"
                                      : "Materi Artikel"}
                                    <FiChevronDown
                                      size={14}
                                      className="text-[#f39b39]"
                                    />
                                  </button>

                                  {openTypeMenuId === material.id && (
                                    <div className="absolute right-0 top-full z-10 mt-2 w-[180px] rounded-2xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                                      {(["video", "artikel"] as const).map(
                                        (type) => (
                                          <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                              setMaterials((prev) =>
                                                prev.map((item) =>
                                                  item.id === material.id
                                                    ? {
                                                        ...item,
                                                        type,
                                                      }
                                                    : item,
                                                ),
                                              );
                                              setOpenTypeMenuId(null);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors ${
                                              material.type === type
                                                ? "bg-[#f0ecff] text-[#7054dc]"
                                                : "text-[#232530] hover:bg-[#f7f6ff]"
                                            }`}
                                          >
                                            {type === "video"
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

                          {((material.isSaved && material.isExpanded) ||
                            (activeMaterialId === material.id &&
                              material.isExpanded)) && (
                            <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-4">
                              {material.isSaved ? (
                                <div>
                                  {material.type === "video" ? (
                                    <>
                                      <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-3">
                                            {material.videoSource === "link" &&
                                            getYoutubeThumb(
                                              material.linkUrl,
                                            ) ? (
                                              <Image
                                                src={getYoutubeThumb(
                                                  material.linkUrl,
                                                )}
                                                alt="Preview video"
                                                width={78}
                                                height={52}
                                                className="h-[52px] w-[78px] rounded-md object-cover"
                                              />
                                            ) : material.previewUrl ? (
                                              <video
                                                src={material.previewUrl}
                                                className="h-[52px] w-[78px] rounded-md object-cover"
                                                muted
                                              />
                                            ) : (
                                              <div className="h-[52px] w-[78px] rounded-md bg-[#f1f1fb]" />
                                            )}
                                            <div>
                                              <p className="text-[12px] font-semibold text-[#232530]">
                                                {material.videoSource ===
                                                "link" ? (
                                                  <>
                                                    {material.linkVideoTitle ||
                                                      material.linkPreviewTitle ||
                                                      "Video dari tautan"}{" "}
                                                    <span className="font-normal text-[#7a7e8a]">
                                                      (YouTube)
                                                    </span>
                                                  </>
                                                ) : (
                                                  material.fileName ||
                                                  "Video berhasil diunggah"
                                                )}
                                              </p>
                                              <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                {material.videoSource === "link"
                                                  ? material.linkVideoDuration ||
                                                    "04:55"
                                                  : material.duration}
                                                {material.fileSize
                                                  ? ` (${material.fileSize})`
                                                  : ""}
                                              </p>
                                            </div>
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
                                            <FiEdit2 size={13} />
                                            Edit Konten Materi
                                          </button>
                                        </div>
                                      </div>
                                      {material.videoSource === "link" &&
                                        material.linkUrl.trim().length > 0 && (
                                          <p className="mt-2 text-[10px] text-[#3aa65c]">
                                            Video ditemukan!
                                          </p>
                                        )}
                                      {material.showUploadSuccess && (
                                        <p className="mt-2 text-[10px] text-[#3aa65c]">
                                          Unggah video sukses!
                                        </p>
                                      )}
                                      {material.articleContent && (
                                        <div className="mt-3">
                                          <p className="mb-1 text-[12px] font-semibold text-[#232530]">
                                            Bahan Bacaan
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
                                          Bahan Bacaan
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
                                          <FiEdit2 size={13} />
                                          Edit Konten Materi
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
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et vehicula ipsum. Donec ut turpis in nisl interdum faucibus.
                                          </p>
                                        )}
                                      </div>
                                      <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                        Deskiprsi Video jika ada
                                      </p>
                                    </>
                                  )}
                                </div>
                              ) : material.type === "video" ? (
                                <div>
                                  <div className="flex items-center gap-4 text-[12px] font-semibold">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMaterials((prev) =>
                                          prev.map((item) =>
                                            item.id === material.id
                                              ? {
                                                  ...item,
                                                  videoSource: "upload",
                                                }
                                              : item,
                                          ),
                                        )
                                      }
                                      className={`pb-2 ${
                                        material.videoSource === "upload"
                                          ? "border-b-2 border-[#7054dc] text-[#232530]"
                                          : "text-[#7a7e8a]"
                                      }`}
                                    >
                                      Unggah Video
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMaterials((prev) =>
                                          prev.map((item) =>
                                            item.id === material.id
                                              ? {
                                                  ...item,
                                                  videoSource: "link",
                                                }
                                              : item,
                                          ),
                                        )
                                      }
                                      className={`pb-2 ${
                                        material.videoSource === "link"
                                          ? "border-b-2 border-[#7054dc] text-[#232530]"
                                          : "text-[#7a7e8a]"
                                      }`}
                                    >
                                      Tempel Link Video
                                    </button>
                                  </div>

                                  {material.videoSource === "upload" ? (
                                    <div className="mt-4 space-y-3">
                                      {material.uploadStatus !== "done" ? (
                                        <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                          {!material.fileName ? (
                                            <div className="flex items-center justify-between gap-3">
                                              <p className="text-[11px] text-[#7a7e8a]">
                                                Tidak ada file yang dipilih
                                              </p>
                                              <label className="inline-flex h-[28px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[11px] font-semibold text-white">
                                                Pilih File
                                                <input
                                                  type="file"
                                                  accept="video/*"
                                                  className="hidden"
                                                  onChange={(event) =>
                                                    handleFileChange(
                                                      material.id,
                                                      event.target.files?.[0] ??
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
                                                  {material.fileName}
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
                                                    {material.uploadProgress}%
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setMaterials((prev) =>
                                                        prev.map((item) =>
                                                          item.id ===
                                                          material.id
                                                            ? {
                                                                ...item,
                                                                fileName: "",
                                                                fileSize: "",
                                                                uploadProgress: 0,
                                                                uploadStatus:
                                                                  "idle",
                                                                previewUrl: "",
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
                                                Menyiapkan file untuk
                                                diproses...
                                              </p>
                                            </>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                          <div className="flex items-start gap-3">
                                            {material.previewUrl ? (
                                              <video
                                                src={material.previewUrl}
                                                className="h-[52px] w-[78px] rounded-md object-cover"
                                                muted
                                              />
                                            ) : (
                                              <div className="h-[52px] w-[78px] rounded-md bg-[#f1f1fb]" />
                                            )}
                                            <div className="flex-1">
                                              <p className="text-[12px] font-semibold text-[#232530]">
                                                {material.fileName ||
                                                  "Video berhasil diunggah"}
                                              </p>
                                              <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                {material.duration}{" "}
                                                {material.fileSize
                                                  ? `(${material.fileSize})`
                                                  : ""}
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              className="text-[11px] font-semibold text-[#7054dc]"
                                            >
                                              Ganti Video
                                            </button>
                                          </div>
                                          {material.showUploadSuccess && (
                                            <p className="mt-2 text-[10px] text-[#3aa65c]">
                                              Unggah video sukses!
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      <p className="text-[10px] text-[#7a7e8a]">
                                        Catatan: Semua file harus beresolusi
                                        minimum 720p dan kurang dari 4,0 GB.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="mt-4">
                                      <input
                                        type="text"
                                        value={material.linkUrl}
                                        onChange={(event) =>
                                          setMaterials((prev) =>
                                            prev.map((item) =>
                                              item.id === material.id
                                                ? {
                                                    ...item,
                                                    linkUrl: event.target.value,
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
                                          <div className="mt-3 rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex items-start gap-3">
                                                {getYoutubeThumb(
                                                  material.linkUrl,
                                                ) ? (
                                                  <Image
                                                    src={getYoutubeThumb(
                                                      material.linkUrl,
                                                    )}
                                                    alt="Preview video"
                                                    width={78}
                                                    height={52}
                                                    className="h-[52px] w-[78px] rounded-md object-cover"
                                                  />
                                                ) : (
                                                  <div className="h-[52px] w-[78px] rounded-md bg-[#f1f1fb]" />
                                                )}
                                                <div>
                                                  <p className="text-[12px] font-semibold text-[#232530]">
                                                    {material.linkPreviewTitle ||
                                                      "Satu Kebetulan yang Selamatkan Jutaan Nyawa"}{" "}
                                                    <span className="font-normal text-[#7a7e8a]">
                                                      (YouTube)
                                                    </span>
                                                  </p>
                                                  <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                    {material.linkVideoDuration ||
                                                      "04:55"}
                                                  </p>
                                                </div>
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
                                                            linkPreviewTitle:
                                                              "",
                                                            linkVideoTitle: "",
                                                            linkVideoDuration:
                                                              "",
                                                          }
                                                        : item,
                                                    ),
                                                  )
                                                }
                                                className="whitespace-nowrap text-[11px] font-semibold text-[#7054dc]"
                                              >
                                                Ganti Link
                                              </button>
                                            </div>
                                          </div>
                                          <p className="mt-2 text-[10px] text-[#3aa65c]">
                                            Video ditemukan!
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  <div className="mt-4">
                                    <p className="text-[12px] font-semibold text-[#232530]">
                                      Bahan Bacaan
                                    </p>
                                    <div className="mt-2">
                                      <TrixEditor
                                        id={`materi-video-article-${material.id}`}
                                        placeholder="Tulis bahan bacaan di sini..."
                                        value={material.articleContent}
                                        onChange={(html) =>
                                          setMaterials((prev) =>
                                            prev.map((m) =>
                                              m.id === material.id
                                                ? { ...m, articleContent: html }
                                                : m,
                                            ),
                                          )
                                        }
                                      />
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                      Deskiprsi Video jika ada
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-[12px] font-semibold text-[#232530]">
                                    Bahan Bacaan
                                  </p>
                                  <div className="mt-2">
                                    <TrixEditor
                                      id={`materi-article-${material.id}`}
                                      placeholder="Tulis materi artikel di sini..."
                                      value={material.articleContent}
                                      onChange={(html) =>
                                        setMaterials((prev) =>
                                          prev.map((m) =>
                                            m.id === material.id
                                              ? { ...m, articleContent: html }
                                              : m,
                                          ),
                                        )
                                      }
                                    />
                                  </div>
                                  <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                    Deskiprsi Video jika ada
                                  </p>
                                </div>
                              )}

                              {!material.isSaved && (
                                <div className="mt-4 flex items-center justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleCancelEditMaterial(material.id)}
                                    className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!isMaterialFormComplete(material)}
                                    className={`inline-flex h-[32px] items-center justify-center rounded-lg px-4 text-[12px] font-semibold text-white transition-colors ${
                                      isMaterialFormComplete(material)
                                        ? "bg-[#7054dc] hover:bg-[#5f46cc]"
                                        : "cursor-not-allowed bg-[#c9cbd3]"
                                    }`}
                                    onClick={() =>
                                      handleSaveMaterialContent(material.id)
                                    }
                                  >
                                    Simpan
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {isMaterialFormOpen && (
                      <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <p className="whitespace-nowrap text-[12px] font-semibold text-[#232530]">
                            Materi {materials.length + 1}:
                          </p>
                          <input
                            type="text"
                            value={newMaterialTitle}
                            onChange={(e) =>
                              setNewMaterialTitle(e.target.value)
                            }
                            placeholder="Masukkan Materi yang Dibahas"
                            className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMaterialFormOpen(false);
                              setNewMaterialTitle("");
                            }}
                            className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateMaterial}
                            disabled={!newMaterialTitle.trim()}
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
                            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              quiz.ctMode
                                ? "bg-[#fef3c7] text-[#b45309]"
                                : "bg-[#eef2ff] text-[#4f46e5]"
                            }`}>
                              {quiz.ctMode ? "CT" : "REGULER"}
                            </span>
                            {editingQuizId === quiz.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editQuizTitle}
                                  onChange={(e) =>
                                    setEditQuizTitle(e.target.value)
                                  }
                                  className="h-[30px] w-[160px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizzes((p) =>
                                      p.map((q) =>
                                        q.id === quiz.id
                                          ? {
                                              ...q,
                                              title: editQuizTitle,
                                            }
                                          : q,
                                      ),
                                    );
                                    setEditingQuizId(null);
                                  }}
                                  className="text-[12px] font-semibold text-[#7054dc]"
                                >
                                  Simpan
                                </button>
                              </>
                            ) : (
                              <span className="max-w-[300px] truncate text-[12px] font-semibold text-[#232530]">
                                {quiz.title}
                              </span>
                            )}
                            {editingQuizId !== quiz.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuizId(quiz.id);
                                  setEditQuizTitle(quiz.title);
                                }}
                                className="cursor-pointer text-[#7a7e8a]"
                              >
                                <FiEdit2 size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="cursor-pointer text-[#7a7e8a]"
                            >
                              <FiTrash2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveQuizId(quiz.id);
                                setIsQuizSettingsOpen(true);
                              }}
                              className="cursor-pointer text-[#7a7e8a]"
                            >
                              <FiSettings size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitQuiz(quiz.id)}
                              className="inline-flex h-[26px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-3 text-[11px] font-semibold text-white hover:bg-[#5f46cc]"
                            >
                              Simpan
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setQuizzes((p) =>
                                  p.map((q) =>
                                    q.id === quiz.id
                                      ? {
                                          ...q,
                                          isExpanded: !q.isExpanded,
                                        }
                                      : q,
                                  ),
                                )
                              }
                              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                            >
                              <FiChevronDown
                                size={16}
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
                            {quiz.questions[0]?.answers.length || 0} pilihan
                            <span className="mx-1.5">·</span>
                            {quiz.duration} menit
                            <span className="mx-1.5">·</span>
                            Minimal {quiz.minScore}
                          </p>
                        )}

                        {quiz.isExpanded && (
                          <div className="mt-4">

                            {quiz.ctMode ? (
                              <>
                                {quiz.ctStories.map((story, sIdx) => (
                                  <div key={story.id} className="mb-6">
                                    <TrixEditor id={`quiz-ct-story-${story.id}`} placeholder="Masukkan cerita di sini ..." minHeight="80px" />
                                    {story.subQuestions.map((sq) => (
                                      <div key={sq.id} className="mt-4">
                                        <p className="mb-2 text-[12px] font-semibold text-[#232530]">
                                          {sq.label ? sq.label.replace(/<[^>]*>?/gm, '') : ""}
                                        </p>
                                        <TrixEditor
                                          id={`quiz-ct-sq-${sq.id}`}
                                          placeholder="Masukkan soal ..."
                                          value={sq.label}
                                          minHeight="80px"
                                          onChange={(html) => setQuizzes((p) =>
                                            p.map((q) =>
                                              q.id !== quiz.id ? q : {
                                                ...q,
                                                ctStories: q.ctStories.map((s) =>
                                                  s.id !== story.id ? s : {
                                                    ...s,
                                                    subQuestions: s.subQuestions.map((sub) =>
                                                      sub.id !== sq.id ? sub : { ...sub, label: html }
                                                    ),
                                                  }
                                                ),
                                              }
                                            )
                                          )}
                                        />
                                        <div className="mt-3 space-y-2">
                                          {sq.answers.map((ans, aIdx) => (
                                            <div
                                              key={ans.id}
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
                                                type="text"
                                                value={ans.text}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  setQuizzes((p) =>
                                                    p.map((q) =>
                                                      q.id !== quiz.id
                                                        ? q
                                                        : {
                                                            ...q,
                                                            ctStories:
                                                              q.ctStories.map(
                                                                (s) =>
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
                                                  sq.answers.length - 1
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
                                                <FiX size={16} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleAddCTStory(quiz.id)}
                                  className="mt-2 text-[12px] font-semibold text-[#f39b39]"
                                >
                                  Tambah Cerita dan Soal Baru &nbsp;+
                                </button>
                              </>
                            ) : (
                              <>
                                {quiz.questions.map((question) => (
                                  <div key={question.id} className="mb-4">
                                    <p className="mb-2 text-[12px] font-semibold text-[#232530]">
                                      {question.label ? question.label.replace(/<[^>]*>?/gm, '') : ""}
                                    </p>
                                    <TrixEditor
                                      id={`quiz-q-${question.id}`}
                                      placeholder="Masukkan soal ..."
                                      value={question.label}
                                      minHeight="80px"
                                      onChange={(html) => setQuizzes((p) =>
                                        p.map((q) =>
                                          q.id !== quiz.id ? q : {
                                            ...q,
                                            questions: q.questions.map((qn) =>
                                              qn.id !== question.id ? qn : { ...qn, label: html }
                                            ),
                                          }
                                        )
                                      )}
                                    />
                                    <div className="mt-3 space-y-2">
                                      {question.answers.map((ans, aIdx) => (
                                        <div
                                          key={ans.id}
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
                                            type="text"
                                            value={ans.text}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setQuizzes((p) =>
                                                p.map((q) =>
                                                  q.id !== quiz.id
                                                    ? q
                                                    : {
                                                        ...q,
                                                        questions:
                                                          q.questions.map(
                                                            (qn) =>
                                                              qn.id !==
                                                              question.id
                                                                ? qn
                                                                : {
                                                                    ...qn,
                                                                    answers:
                                                                      qn.answers.map(
                                                                        (a) =>
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
                                              question.answers.length - 1
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
                                            <FiX size={16} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleAddQuestion(quiz.id)}
                                  className="mt-1 text-[12px] font-semibold text-[#f39b39]"
                                >
                                  Soal Pilihan ganda &nbsp;+
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
                            onClick={() => setIsMaterialFormOpen(true)}
                            className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]"
                          >
                            Materi <FiPlus size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateQuiz}
                            className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]"
                          >
                            Kuis <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-4">
                    <p className="text-[12px] text-[#7a7e8a]">
                      {topik.materis.length} materi
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTopikId !== topik.id) {
                          loadTopicData(topik);
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
                          onChange={(event) => setTopicTitle(event.target.value)}
                          placeholder="Masukkan Judul Topik"
                          className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateTopic();
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
                          {isCreatingTopic ? "Menyimpan..." : "Tambah Topik"}
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
                    onClick={() => setIsQuizSettingsOpen(false)}
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
                    <span className="text-[12px] text-[#7a7e8a]">Menit</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#232530]">
                      Batas Nilai Minimal
                    </p>
                    <p className="mt-1 text-[11px] text-[#7a7e8a]">
                      Siswa harus mencapai nilai ini untuk dinyatakan lulus
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

                <div className="mt-4 flex items-center justify-between pb-2">
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

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQuizSettingsOpen(false)}
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
                      handleSaveQuizSettings(quiz.id, {
                        duration: dur,
                        minScore: min,
                        scorePerQuestion: sps,
                        ctMode: quiz.ctMode,
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

export default function TambahModulKontenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <TambahModulKontenPageContent />
    </Suspense>
  );
}
