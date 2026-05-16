'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
} from 'react-icons/fi';

import GuruHeader from '../../../component/guru/GuruHeader';

function RichTextEditor({ placeholder }: { placeholder: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const updateEmptyState = () => {
    const text = editorRef.current?.textContent?.trim() ?? '';
    setIsEmpty(text.length === 0);
  };

  const applyCommand = (command: string) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command);
    updateEmptyState();
  };

  const applyLink = () => {
    if (!editorRef.current) {
      return;
    }

    const url = window.prompt('Masukkan tautan');
    if (!url) {
      return;
    }

    editorRef.current.focus();
    document.execCommand('createLink', false, url);
    updateEmptyState();
  };

  return (
    <div className="rounded-xl border border-[#d9d7df] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#e8e9ef] px-3 py-2 text-[11px] text-[#6f7381]">
        <button type="button" className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-[#f5f4fb]">
          Normal Teks
          <FiChevronDown size={12} />
        </button>
        <span className="h-4 w-px bg-[#e4e5eb]" />
        <button
          type="button"
          onClick={() => applyCommand('bold')}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md font-semibold text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyCommand('italic')}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md italic text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyCommand('underline')}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md underline text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => applyCommand('insertUnorderedList')}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[12px] text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Bullet list"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="5" cy="7" r="2" fill="currentColor" />
            <circle cx="5" cy="17" r="2" fill="currentColor" />
            <path d="M10 7h10M10 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => applyCommand('insertOrderedList')}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[12px] text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Numbered list"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 7h10M10 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={applyLink}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Insert link"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10 13.5l4-4M7 17a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-2 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#232530] hover:bg-[#f5f4fb]"
          aria-label="Insert image"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="9" cy="11" r="2" fill="currentColor" />
            <path d="M20 16l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="relative px-3 py-3 text-[12px] text-[#232530]">
        {isEmpty && (
          <span className="pointer-events-none absolute left-3 top-3 text-[11px] text-[#9aa0ad]">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={updateEmptyState}
          onBlur={updateEmptyState}
          className="min-h-[120px] outline-none"
        />
      </div>
    </div>
  );
}

function QuizMiniEditor({ placeholder }: { placeholder: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const updateEmptyState = () => {
    setIsEmpty((editorRef.current?.textContent?.trim() ?? '').length === 0);
  };
  const applyCommand = (cmd: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd);
    updateEmptyState();
  };
  return (
    <div className="rounded-xl border border-[#d9d7df] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#e8e9ef] px-3 py-2">
        <button type="button" onClick={() => applyCommand('bold')} className="inline-flex h-6 w-6 items-center justify-center rounded-md font-semibold text-[#232530] hover:bg-[#f5f4fb]" aria-label="Bold">B</button>
        <button type="button" onClick={() => applyCommand('italic')} className="inline-flex h-6 w-6 items-center justify-center rounded-md italic text-[#232530] hover:bg-[#f5f4fb]" aria-label="Italic">I</button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#232530] hover:bg-[#f5f4fb]" aria-label="Image">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="11" r="2" fill="currentColor" /><path d="M20 16l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="relative px-3 py-3 text-[12px] text-[#232530]">
        {isEmpty && <span className="pointer-events-none absolute left-3 top-3 text-[11px] text-[#9aa0ad]">{placeholder}</span>}
        <div ref={editorRef} contentEditable onInput={updateEmptyState} onBlur={updateEmptyState} className="min-h-[80px] outline-none" />
      </div>
    </div>
  );
}

export default function TambahModulKontenPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTopicAdded, setIsTopicAdded] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [materials, setMaterials] = useState<
    {
      id: number;
      title: string;
      type: 'video' | 'artikel';
      isSaved: boolean;
      isExpanded: boolean;
      videoSource: 'upload' | 'link';
      linkUrl: string;
      linkPreviewTitle: string;
      linkPreviewThumb: string;
      linkVideoTitle: string;
      linkVideoDuration: string;
      showUploadSuccess: boolean;
      fileName: string;
      fileSize: string;
      uploadProgress: number;
      uploadStatus: 'idle' | 'uploading' | 'done';
      previewUrl: string;
      duration: string;
      articleContent: string;
    }[]
  >([]);
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'video' | 'artikel'>('video');
  const [isNewMaterialTypeOpen, setIsNewMaterialTypeOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [openTypeMenuId, setOpenTypeMenuId] = useState<number | null>(null);

  const [quizzes, setQuizzes] = useState<{
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
  }[]>([]);
  const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editQuizTitle, setEditQuizTitle] = useState('');

  const uploadIntervalsRef = useRef<Record<number, number>>({});
  const uploadSuccessTimersRef = useRef<Record<number, number>>({});
  const materialsRef = useRef(materials);

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    const intervals = uploadIntervalsRef.current;
    const successTimers = uploadSuccessTimersRef.current;

    return () => {
      Object.values(intervals).forEach((intervalId) => {
        window.clearInterval(intervalId);
      });
      Object.values(successTimers).forEach((timerId) => {
        window.clearTimeout(timerId);
      });

      materialsRef.current.forEach((material) => {
        if (material.previewUrl) {
          URL.revokeObjectURL(material.previewUrl);
        }
      });
    };
  }, []);

  const startFakeUpload = (materialId: number) => {
    if (uploadIntervalsRef.current[materialId]) {
      window.clearInterval(uploadIntervalsRef.current[materialId]);
    }

    const intervalId = window.setInterval(() => {
      setMaterials((prev) =>
        prev.map((material) => {
          if (material.id !== materialId || material.uploadStatus !== 'uploading') {
            return material;
          }

          const nextProgress = Math.min(material.uploadProgress + 12, 100);
          if (nextProgress >= 100) {
            window.clearInterval(intervalId);
            delete uploadIntervalsRef.current[materialId];
          }
          return {
            ...material,
            uploadProgress: nextProgress,
            uploadStatus: nextProgress >= 100 ? 'done' : 'uploading',
            showUploadSuccess: nextProgress >= 100 ? true : material.showUploadSuccess,
          };
        })
      );
    }, 300);

    uploadIntervalsRef.current[materialId] = intervalId;
  };

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
              : item
          )
        );
        delete uploadSuccessTimersRef.current[material.id];
      }, 3000);
    });
  }, [materials]);

  const handleFileChange = (materialId: number, file: File | null) => {
    if (!file) {
      return;
    }

    setMaterials((prev) =>
      prev.map((material) => {
        if (material.id !== materialId) {
          return material;
        }

        if (material.previewUrl) {
          URL.revokeObjectURL(material.previewUrl);
        }

        return {
          ...material,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadProgress: 0,
          uploadStatus: 'uploading',
          previewUrl: URL.createObjectURL(file),
        };
      })
    );

    startFakeUpload(materialId);
  };

  const handleDeleteMaterial = (materialId: number) => {
    setMaterials((prev) => {
      const next = prev.filter((material) => material.id !== materialId);
      setActiveMaterialId((current) => (current === materialId ? next[0]?.id ?? 0 : current));
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
          : material
      )
    );
    setEditingMaterialId(null);
  };

  const isMaterialFormComplete = (material: { type: 'video' | 'artikel'; videoSource: 'upload' | 'link'; uploadStatus: 'idle' | 'uploading' | 'done'; linkUrl: string }) => {
    if (material.type === 'artikel') {
      return true;
    }

    if (material.videoSource === 'upload') {
      return material.uploadStatus === 'done';
    }

    return material.linkUrl.trim().length > 0;
  };

  const getYoutubeThumb = (url: string) => {
    const match = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{6,})/);
    if (!match) {
      return '';
    }
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  };

  const handleCreateMaterial = () => {
    const trimmedTitle = newMaterialTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    const nextId = Date.now();
    setMaterials((prev) => [
      ...prev,
      {
        id: nextId,
        title: trimmedTitle,
        type: newMaterialType,
        isSaved: false,
        isExpanded: true,
        videoSource: 'upload',
        linkUrl: '',
        linkPreviewTitle: '',
        linkPreviewThumb: '',
        linkVideoTitle: '',
        linkVideoDuration: '',
        showUploadSuccess: false,
        fileName: '',
        fileSize: '',
        uploadProgress: 0,
        uploadStatus: 'idle',
        previewUrl: '',
        duration: '00:00',
        articleContent: '',
      },
    ]);
    setActiveMaterialId(nextId);
    setIsMaterialFormOpen(false);
    setNewMaterialTitle('');
    setNewMaterialType('video');
  };

  const handleSaveMaterialContent = (materialId: number) => {
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === materialId
          ? {
              ...item,
              isSaved: true,
              isExpanded: false,
            }
          : item
      )
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
            }
          : item
      )
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
          : item
      )
    );
  };

  const ctSubLabels = [
    'Soal Pemecahan Masalah (Dekomposisi)',
    'Soal Pengenalan Pola',
    'Soal Menyaring Informasi Penting (Abstraksi)',
    'Soal Menyusun Langkah Solusi',
  ];

  const makeCTStory = () => ({
    id: Date.now(),
    subQuestions: ctSubLabels.map((label, i) => ({
      id: Date.now() + i + 1,
      label,
      answers: [
        { id: Date.now() + i * 10 + 100, text: '', isCorrect: false },
        { id: Date.now() + i * 10 + 101, text: '', isCorrect: false },
      ],
    })),
  });

  const handleCreateQuiz = () => {
    const nextId = Date.now();
    setQuizzes((prev) => [
      ...prev,
      {
        id: nextId,
        title: 'Untitled',
        isExpanded: true,
        ctMode: false,
        duration: 90,
        minScore: 0,
        scorePerQuestion: 0,
        questions: [
          {
            id: nextId + 1,
            label: 'Soal Kuis 1',
            answers: [
              { id: nextId + 10, text: '', isCorrect: false },
              { id: nextId + 11, text: '', isCorrect: false },
              { id: nextId + 12, text: '', isCorrect: false },
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
                { id: Date.now() + 10, text: '', isCorrect: false },
                { id: Date.now() + 11, text: '', isCorrect: false },
                { id: Date.now() + 12, text: '', isCorrect: false },
              ],
            },
          ],
        };
      })
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
              ? { ...qn, answers: [...qn.answers, { id: Date.now(), text: '', isCorrect: false }] }
              : qn
          ),
        };
      })
    );
  };

  const handleRemoveAnswer = (quizId: number, questionId: number, answerId: number) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          questions: q.questions.map((qn) =>
            qn.id === questionId
              ? { ...qn, answers: qn.answers.filter((a) => a.id !== answerId) }
              : qn
          ),
        };
      })
    );
  };

  const handleAddCTStory = (quizId: number) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, ctStories: [...q.ctStories, makeCTStory()] } : q))
    );
  };

  const handleAddCTAnswer = (quizId: number, storyId: number, subQId: number) => {
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
                      ? { ...sq, answers: [...sq.answers, { id: Date.now(), text: '', isCorrect: false }] }
                      : sq
                  ),
                }
              : s
          ),
        };
      })
    );
  };

  const handleRemoveCTAnswer = (quizId: number, storyId: number, subQId: number, answerId: number) => {
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
                      ? { ...sq, answers: sq.answers.filter((a) => a.id !== answerId) }
                      : sq
                  ),
                }
              : s
          ),
        };
      })
    );
  };

  const handleToggleCTMode = (quizId: number, enabled: boolean) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, ctMode: enabled } : q))
    );
  };

  const handleSaveQuizSettings = (quizId: number, settings: { duration: number; minScore: number; scorePerQuestion: number; ctMode: boolean }) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, ...settings } : q))
    );
    setIsQuizSettingsOpen(false);
  };

  const handleDeleteQuiz = (quizId: number) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="w-full px-0 py-0">
        <div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden border border-[#e5e3ee] bg-white px-5 py-6 lg:block lg:min-h-[calc(100vh-74px)]">
            <div className="flex h-full flex-col">
              <p className="text-[13px] font-semibold text-[#232530]">Rencanakan Modul anda</p>
              <nav className="mt-4 space-y-3 text-[13px]">
                <Link href="/modul-guru/tambah/profil" className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiFileText size={12} />
                  Profil Modul Anda
                </Link>
                <Link href="/modul-guru/tambah/harga" className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiDollarSign size={12} />
                  Penetapan Harga Modul
                </Link>
              </nav>

              <p className="mt-8 text-[13px] font-semibold text-[#232530]">Konten Modul Anda</p>
              <nav className="mt-4 space-y-3 text-[13px]">
                <div className="flex items-center gap-2 text-[#7054dc]">
                  <FiLayers size={12} />
                  <span className="font-semibold">Konten Modul</span>
                </div>
                <Link href="/modul-guru/tambah/pre-post-test" className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiCheckSquare size={12} />
                  Pree - Post Test Modul
                </Link>
                <Link href="/modul-guru/tambah/sertifikat" className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiBookOpen size={12} />
                  Capaian Sertifikat
                </Link>
              </nav>

              <button
                type="button"
                className="mt-16 w-full cursor-pointer rounded-full bg-[#f39b39] px-4 py-2.5 text-[12px] font-semibold text-white"
              >
                Terbitkan Modul
              </button>
            </div>
          </aside>

          <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
            <h1 className="text-[18px] font-semibold text-[#232530]">Membuat konten modul anda</h1>
            <p className="mt-2 max-w-[620px] text-[12px] leading-[1.6] text-[#7e8290]">
              Mulailah menyusun kursus Anda dengan membuat bagian, pelajaran, dan aktivitas praktik
              (kuis, latihan coding, dan tugas). Gunakan garis besar kursus untuk menyusun konten
              serta melalui bagian dan pelajaran Anda dengan jelas. Jika Anda berniat menawarkan
              kursus secara gratis, total durasi konten video untuk kursus tidak boleh melebihi 2 jam.
            </p>

            <div className="mt-6">
              <p className="text-[12px] font-semibold text-[#232530]">Mulai Buat konten anda</p>

              {!isTopicAdded && !isFormOpen && (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="mt-3 inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]"
                >
                  Topik <FiPlus size={14} />
                </button>
              )}

              {isFormOpen && !isTopicAdded && (
                <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(20,20,30,0.05)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[12px] font-semibold text-[#232530]">Topik 1:</p>
                    <input
                      type="text"
                      value={topicTitle}
                      onChange={(event) => setTopicTitle(event.target.value)}
                      placeholder="Masukkan Judul Topik"
                      className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="cursor-pointer text-[12px] font-semibold text-[#7a7e8a]"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (topicTitle.trim().length === 0) {
                          return;
                        }
                        setIsTopicAdded(true);
                        setIsFormOpen(false);
                        setActiveMaterialId(null);
                      }}
                      className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[12px] font-semibold text-white"
                    >
                      Tambah Topik
                    </button>
                  </div>
                </div>
              )}

              {isTopicAdded && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <p className="text-[12px] font-semibold text-[#232530]">Topik 1:</p>
                        <p className="text-[12px] font-semibold text-[#232530]">
                          {topicTitle || 'Sel Unit Terkecil Kehidupan'}
                        </p>
                        <button type="button" className="cursor-pointer text-[#7a7e8a]" aria-label="Edit topik">
                          <FiEdit2 size={14} />
                        </button>
                        <button type="button" className="cursor-pointer text-[#7a7e8a]" aria-label="Hapus topik">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {materials.map((material, index) => (
                        <div
                          key={material.id}
                          className={`rounded-2xl border border-[#e5e3ee] px-4 py-3 ${
                            activeMaterialId === material.id ? 'bg-white' : 'bg-[#fbfbfe]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setActiveMaterialId(material.id)}
                                className="text-left"
                              >
                                <span className="text-[12px] font-semibold text-[#232530]">Materi {index + 1}:</span>
                              </button>
                              {editingMaterialId === material.id ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(event) => setEditTitle(event.target.value)}
                                  className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveMaterialId(material.id)}
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
                                  onClick={() => handleStartEdit(material.id, material.title)}
                                  className="cursor-pointer text-[#7a7e8a]"
                                  aria-label="Edit materi"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(material.id)}
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
                                    onClick={() => toggleMaterialExpanded(material.id)}
                                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                    aria-label={material.isExpanded ? 'Tutup' : 'Buka'}
                                  >
                                    <FiChevronDown
                                      size={16}
                                      className={`transition-transform ${
                                        material.isExpanded ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"
                                    aria-label="Pindahkan materi"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenTypeMenuId((prev) => (prev === material.id ? null : material.id))
                                    }
                                    className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#f39b39]"
                                  >
                                    {material.type === 'video' ? 'Materi Video' : 'Materi Artikel'}
                                    <FiChevronDown size={14} className="text-[#f39b39]" />
                                  </button>

                                  {openTypeMenuId === material.id && (
                                    <div className="absolute right-0 top-full z-10 mt-2 w-[180px] rounded-2xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                                      {(['video', 'artikel'] as const).map((type) => (
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
                                                  : item
                                              )
                                            );
                                            setOpenTypeMenuId(null);
                                          }}
                                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors ${
                                            material.type === type
                                              ? 'bg-[#f0ecff] text-[#7054dc]'
                                              : 'text-[#232530] hover:bg-[#f7f6ff]'
                                          }`}
                                        >
                                          {type === 'video' ? 'Materi Video' : 'Materi Artikel'}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {((material.isSaved && material.isExpanded) || (activeMaterialId === material.id && material.isExpanded)) && (
                            <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-4">
                              {material.isSaved ? (
                                <div>
                                  {material.type === 'video' ? (
                                    <>
                                      <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-3">
                                            {material.videoSource === 'link' && getYoutubeThumb(material.linkUrl) ? (
                                              <Image
                                                src={getYoutubeThumb(material.linkUrl)}
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
                                                {material.videoSource === 'link'
                                                  ? <>{material.linkVideoTitle || material.linkPreviewTitle || 'Video dari tautan'} <span className="font-normal text-[#7a7e8a]">(YouTube)</span></>
                                                  : material.fileName || 'Video berhasil diunggah'}
                                              </p>
                                              <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                {material.videoSource === 'link' ? (material.linkVideoDuration || '04:55') : material.duration}
                                                {material.fileSize ? ` (${material.fileSize})` : ''}
                                              </p>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleEditMaterialContent(material.id)}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7054dc]"
                                          >
                                            <FiEdit2 size={13} />
                                            Edit Konten Materi
                                          </button>
                                        </div>
                                      </div>
                                      {(material.videoSource === 'link' && material.linkUrl.trim().length > 0) && (
                                        <p className="mt-2 text-[10px] text-[#3aa65c]">Video ditemukan!</p>
                                      )}
                                      {material.showUploadSuccess && (
                                        <p className="mt-2 text-[10px] text-[#3aa65c]">Unggah video sukses!</p>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-start justify-between gap-3">
                                        <p className="text-[12px] font-semibold text-[#232530]">Bahan Bacaan</p>
                                        <button
                                          type="button"
                                          onClick={() => handleEditMaterialContent(material.id)}
                                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7054dc]"
                                        >
                                          <FiEdit2 size={13} />
                                          Edit Konten Materi
                                        </button>
                                      </div>
                                      <div className="mt-2 rounded-xl border border-[#e5e3ee] bg-white px-3 py-3">
                                        <p className="text-[12px] leading-[1.7] text-[#232530]">
                                          {material.articleContent || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et vehicula ipsum. Donec ut turpis in nisl interdum faucibus. Aenean lacinia, metus a efficitur venenatis, lectus dolor tempus lacus, sit amet dignissim erat est id metus. Vivamus fermentum ac lacus sit amet cursus. Integer nec suscipit tortor, vitae auctor arcu. Etiam feugiat mauris vel hendrerit rutrum. Ut est elit, vestibulum sit amet volutpat ac, congue ullamcorper mauris.'}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-[11px] text-[#7a7e8a]">Deskiprsi Video jika ada</p>
                                    </>
                                  )}
                                </div>
                              ) : material.type === 'video' ? (
                                <div>
                                  <div className="flex items-center gap-4 text-[12px] font-semibold">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMaterials((prev) =>
                                          prev.map((item) =>
                                            item.id === material.id ? { ...item, videoSource: 'upload' } : item
                                          )
                                        )
                                      }
                                      className={`pb-2 ${
                                        material.videoSource === 'upload'
                                          ? 'border-b-2 border-[#7054dc] text-[#232530]'
                                          : 'text-[#7a7e8a]'
                                      }`}
                                    >
                                      Unggah Video
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMaterials((prev) =>
                                          prev.map((item) =>
                                            item.id === material.id ? { ...item, videoSource: 'link' } : item
                                          )
                                        )
                                      }
                                      className={`pb-2 ${
                                        material.videoSource === 'link'
                                          ? 'border-b-2 border-[#7054dc] text-[#232530]'
                                          : 'text-[#7a7e8a]'
                                      }`}
                                    >
                                      Tempel Link Video
                                    </button>
                                  </div>

                                  {material.videoSource === 'upload' ? (
                                    <div className="mt-4 space-y-3">
                                      {material.uploadStatus !== 'done' ? (
                                        <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                          {!material.fileName ? (
                                            <div className="flex items-center justify-between gap-3">
                                              <p className="text-[11px] text-[#7a7e8a]">Tidak ada file yang dipilih</p>
                                              <label className="inline-flex h-[28px] cursor-pointer items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[11px] font-semibold text-white">
                                                Pilih File
                                                <input
                                                  type="file"
                                                  accept="video/*"
                                                  className="hidden"
                                                  onChange={(event) =>
                                                    handleFileChange(material.id, event.target.files?.[0] ?? null)
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
                                                      style={{ width: `${material.uploadProgress}%` }}
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
                                                          item.id === material.id
                                                            ? {
                                                                ...item,
                                                                fileName: '',
                                                                fileSize: '',
                                                                uploadProgress: 0,
                                                                uploadStatus: 'idle',
                                                                previewUrl: '',
                                                              }
                                                            : item
                                                        )
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
                                                Menyiapkan file untuk diproses...
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
                                                {material.fileName || 'Video berhasil diunggah'}
                                              </p>
                                              <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                {material.duration} {material.fileSize ? `(${material.fileSize})` : ''}
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
                                            <p className="mt-2 text-[10px] text-[#3aa65c]">Unggah video sukses!</p>
                                          )}
                                        </div>
                                      )}
                                      <p className="text-[10px] text-[#7a7e8a]">
                                        Catatan: Semua file harus beresolusi minimum 720p dan kurang dari 4,0 GB.
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
                                                ? { ...item, linkUrl: event.target.value }
                                                : item
                                            )
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
                                                {getYoutubeThumb(material.linkUrl) ? (
                                                  <Image
                                                    src={getYoutubeThumb(material.linkUrl)}
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
                                                    {material.linkPreviewTitle || 'Satu Kebetulan yang Selamatkan Jutaan Nyawa'}{' '}
                                                    <span className="font-normal text-[#7a7e8a]">(YouTube)</span>
                                                  </p>
                                                  <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                                    {material.linkVideoDuration || '04:55'}
                                                  </p>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setMaterials((prev) =>
                                                    prev.map((item) =>
                                                      item.id === material.id
                                                        ? { ...item, linkUrl: '', linkPreviewTitle: '', linkVideoTitle: '', linkVideoDuration: '' }
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
                                    <p className="text-[12px] font-semibold text-[#232530]">Bahan Bacaan</p>
                                    <div className="mt-2">
                                      <RichTextEditor placeholder="Tulis bahan bacaan di sini..." />
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7a7e8a]">Deskiprsi Video jika ada</p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-[12px] font-semibold text-[#232530]">Bahan Bacaan</p>
                                  <div className="mt-2">
                                    <RichTextEditor placeholder="Tulis materi artikel di sini..." />
                                  </div>
                                  <p className="mt-1 text-[11px] text-[#7a7e8a]">Deskiprsi Video jika ada</p>
                                </div>
                              )}

                              {!material.isSaved && (
                                <div className="mt-4 flex items-center justify-end gap-3">
                                  <button
                                    type="button"
                                    className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!isMaterialFormComplete(material)}
                                    className={`inline-flex h-[32px] items-center justify-center rounded-lg px-4 text-[12px] font-semibold text-white transition-colors ${
                                      isMaterialFormComplete(material)
                                        ? 'bg-[#7054dc] hover:bg-[#5f46cc]'
                                        : 'cursor-not-allowed bg-[#c9cbd3]'
                                    }`}
                                    onClick={() => handleSaveMaterialContent(material.id)}
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
                          <p className="whitespace-nowrap text-[12px] font-semibold text-[#232530]">Materi {materials.length + 1}:</p>
                          <input
                            type="text"
                            value={newMaterialTitle}
                            onChange={(e) => setNewMaterialTitle(e.target.value)}
                            placeholder="Masukkan Materi yang Dibahas"
                            className="h-[36px] flex-1 rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none"
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-3">
                          <button type="button" onClick={() => { setIsMaterialFormOpen(false); setNewMaterialTitle(''); }} className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                          <button type="button" onClick={handleCreateMaterial} disabled={!newMaterialTitle.trim()} className={`inline-flex h-[32px] items-center justify-center rounded-lg px-4 text-[12px] font-semibold text-white transition-colors ${newMaterialTitle.trim() ? 'bg-[#f39b39] hover:bg-[#e08c2e]' : 'cursor-not-allowed bg-[#c9cbd3]'}`}>Tambah Materi</button>
                        </div>
                      </div>
                    )}

                    {quizzes.map((quiz, qIdx) => (
                      <div key={quiz.id} className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-semibold text-[#232530]">Kuis Topik 1:</span>
                            {editingQuizId === quiz.id ? (
                              <>
                                <input type="text" value={editQuizTitle} onChange={(e) => setEditQuizTitle(e.target.value)} className="h-[30px] w-[160px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]" />
                                <button type="button" onClick={() => { setQuizzes((p) => p.map((q) => q.id === quiz.id ? { ...q, title: editQuizTitle } : q)); setEditingQuizId(null); }} className="text-[12px] font-semibold text-[#7054dc]">Simpan</button>
                              </>
                            ) : (
                              <span className="text-[12px] font-semibold text-[#232530]">{quiz.title}</span>
                            )}
                            {editingQuizId !== quiz.id && (
                              <button type="button" onClick={() => { setEditingQuizId(quiz.id); setEditQuizTitle(quiz.title); }} className="cursor-pointer text-[#7a7e8a]"><FiEdit2 size={14} /></button>
                            )}
                            <button type="button" onClick={() => handleDeleteQuiz(quiz.id)} className="cursor-pointer text-[#7a7e8a]"><FiTrash2 size={14} /></button>
                            <button type="button" onClick={() => { setActiveQuizId(quiz.id); setIsQuizSettingsOpen(true); }} className="cursor-pointer text-[#7a7e8a]"><FiSettings size={14} /></button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setQuizzes((p) => p.map((q) => q.id === quiz.id ? { ...q, isExpanded: !q.isExpanded } : q))} className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]">
                              <FiChevronDown size={16} className={`transition-transform ${quiz.isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <button type="button" className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        </div>

                        {quiz.isExpanded && (
                          <div className="mt-4">
                            {quiz.ctMode ? (
                              <>
                                <p className="mb-3 text-[12px] font-semibold text-[#7054dc]">Mode Computational Thinking</p>
                                {quiz.ctStories.map((story, sIdx) => (
                                  <div key={story.id} className="mb-6">
                                    <QuizMiniEditor placeholder="Masukkan cerita di sini ..." />
                                    {story.subQuestions.map((sq) => (
                                      <div key={sq.id} className="mt-4">
                                        <p className="mb-2 text-[12px] font-semibold text-[#232530]">{sq.label}</p>
                                        <QuizMiniEditor placeholder="Masukkan soal ..." />
                                        <div className="mt-3 space-y-2">
                                          {sq.answers.map((ans, aIdx) => (
                                            <div key={ans.id} className="flex items-center gap-2">
                                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#d9d7df]" />
                                              <input type="text" value={ans.text} onChange={(e) => { const val = e.target.value; setQuizzes((p) => p.map((q) => q.id !== quiz.id ? q : { ...q, ctStories: q.ctStories.map((s) => s.id !== story.id ? s : { ...s, subQuestions: s.subQuestions.map((sqq) => sqq.id !== sq.id ? sqq : { ...sqq, answers: sqq.answers.map((a) => a.id === ans.id ? { ...a, text: val } : a) }) }) })); }} placeholder={aIdx < sq.answers.length - 1 ? 'Masukkan Jawaban' : 'Tambah Opsi Jawaban'} className="h-[36px] flex-1 rounded-lg border border-[#e5e3ee] bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]" />
                                              <button type="button" onClick={() => handleRemoveCTAnswer(quiz.id, story.id, sq.id, ans.id)} className="text-[#7a7e8a] hover:text-[#e04e4e]"><FiX size={16} /></button>
                                            </div>
                                          ))}
                                        </div>
                                        <p className="mt-2 text-[11px] text-[#7a7e8a]"><span className="font-semibold italic">Catatan:</span> Pilih salah satu opsi untuk jawaban yang benar.</p>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                                <button type="button" onClick={() => handleAddCTStory(quiz.id)} className="mt-2 text-[12px] font-semibold text-[#f39b39]">Tambah Cerita dan Soal Baru &nbsp;+</button>
                              </>
                            ) : (
                              <>
                                {quiz.questions.map((question) => (
                                  <div key={question.id} className="mb-4">
                                    <p className="mb-2 text-[12px] font-semibold text-[#232530]">{question.label}</p>
                                    <QuizMiniEditor placeholder="Masukkan soal ..." />
                                    <div className="mt-3 space-y-2">
                                      {question.answers.map((ans, aIdx) => (
                                        <div key={ans.id} className="flex items-center gap-2">
                                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#d9d7df]" />
                                          <input type="text" value={ans.text} onChange={(e) => { const val = e.target.value; setQuizzes((p) => p.map((q) => q.id !== quiz.id ? q : { ...q, questions: q.questions.map((qn) => qn.id !== question.id ? qn : { ...qn, answers: qn.answers.map((a) => a.id === ans.id ? { ...a, text: val } : a) }) })); }} placeholder={aIdx < question.answers.length - 1 ? 'Masukkan Jawaban' : 'Tambah Opsi Jawaban'} className="h-[36px] flex-1 rounded-lg border border-[#e5e3ee] bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]" />
                                          <button type="button" onClick={() => handleRemoveAnswer(quiz.id, question.id, ans.id)} className="text-[#7a7e8a] hover:text-[#e04e4e]"><FiX size={16} /></button>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="mt-2 text-[11px] text-[#7a7e8a]"><span className="font-semibold italic">Catatan:</span> Pilih salah satu opsi untuk jawaban yang benar.</p>
                                  </div>
                                ))}
                                <button type="button" onClick={() => handleAddQuestion(quiz.id)} className="mt-1 text-[12px] font-semibold text-[#f39b39]">Soal Pilihan ganda &nbsp;+</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {!isMaterialFormOpen && (
                      <div className="mt-4 rounded-2xl border border-dashed border-[#8e7bff] bg-[#f7f6ff] px-4 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <button type="button" onClick={() => setIsMaterialFormOpen(true)} className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]">
                            Materi <FiPlus size={14} />
                          </button>
                          <button type="button" onClick={handleCreateQuiz} className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]">
                            Kuis <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]">
                    Topik <FiPlus size={14} />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {isQuizSettingsOpen && activeQuizId && (() => {
        const quiz = quizzes.find((q) => q.id === activeQuizId);
        if (!quiz) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setIsQuizSettingsOpen(false)}>
            <div className="relative w-[440px] rounded-2xl bg-white px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#7054dc]">Pengaturan Kuis</h3>
                <button type="button" onClick={() => setIsQuizSettingsOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e3ee] text-[#7a7e8a] hover:bg-[#f5f4fb]"><FiX size={16} /></button>
              </div>

              <div className="mt-5 rounded-xl border border-[#e5e3ee] px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[#232530]">Aktifkan Mode Computational Thinking</p>
                  <button type="button" onClick={() => handleToggleCTMode(quiz.id, !quiz.ctMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${quiz.ctMode ? 'bg-[#7054dc]' : 'bg-[#d1d5db]'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${quiz.ctMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-[1.6] text-[#7a7e8a]">Kuis akan disajikan dalam bentuk studi kasus. Setiap satu cerita akan memiliki 4 pertanyaan turunan berdasarkan pilar pemikiran komputasional.</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
                <p className="text-[13px] font-semibold text-[#232530]">Durasi Pengerjaan (Menit)</p>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={quiz.duration} id={`dur-${quiz.id}`} className="h-[32px] w-[60px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none" />
                  <span className="text-[12px] text-[#7a7e8a]">Menit</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
                <div>
                  <p className="text-[13px] font-semibold text-[#232530]">Batas Nilai Minimal</p>
                  <p className="mt-1 text-[11px] text-[#7a7e8a]">Siswa harus mencapai nilai ini untuk dinyatakan lulus</p>
                </div>
                <input type="number" defaultValue={quiz.minScore} id={`min-${quiz.id}`} min={0} max={100} className="h-[32px] w-[70px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none" placeholder="0 - 100" />
              </div>

              <div className="mt-4 flex items-center justify-between pb-2">
                <div>
                  <p className="text-[13px] font-semibold text-[#232530]">Skor Standar Per Soal</p>
                  <p className="mt-1 text-[11px] text-[#7a7e8a]">Nilai poin untuk setiap soal baru</p>
                </div>
                <input type="number" defaultValue={quiz.scorePerQuestion} id={`sps-${quiz.id}`} min={0} max={100} className="h-[32px] w-[70px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none" placeholder="0 - 100" />
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsQuizSettingsOpen(false)} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                <button type="button" onClick={() => {
                  const dur = parseInt((document.getElementById(`dur-${quiz.id}`) as HTMLInputElement)?.value) || 90;
                  const min = parseInt((document.getElementById(`min-${quiz.id}`) as HTMLInputElement)?.value) || 0;
                  const sps = parseInt((document.getElementById(`sps-${quiz.id}`) as HTMLInputElement)?.value) || 0;
                  handleSaveQuizSettings(quiz.id, { duration: dur, minScore: min, scorePerQuestion: sps, ctMode: quiz.ctMode });
                }} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Simpan</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
