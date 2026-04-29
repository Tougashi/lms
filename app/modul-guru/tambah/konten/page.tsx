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
  FiTrash2,
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
      showUploadSuccess: boolean;
      fileName: string;
      fileSize: string;
      uploadProgress: number;
      uploadStatus: 'idle' | 'uploading' | 'done';
      previewUrl: string;
      duration: string;
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
        showUploadSuccess: false,
        fileName: '',
        fileSize: '',
        uploadProgress: 0,
        uploadStatus: 'idle',
        previewUrl: '',
        duration: '00:00',
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

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="w-full px-0 py-0">
        <div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="border border-[#e5e3ee] bg-white px-5 py-6 lg:min-h-[calc(100vh-74px)]">
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
                <div className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiCheckSquare size={12} />
                  Pree - Post Test Modul
                </div>
                <div className="flex items-center gap-2 text-[#7a7e8a]">
                  <FiBookOpen size={12} />
                  Capaian Sertifikat
                </div>
              </nav>

              <button
                type="button"
                className="mt-16 w-full cursor-pointer rounded-full bg-[#f39b39] px-4 py-2.5 text-[12px] font-semibold text-white"
              >
                Terbitkan Modul
              </button>
            </div>
          </aside>

          <section className="pb-8 pr-2 pt-6 lg:pr-6">
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

                    {isMaterialFormOpen && (
                      <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <p className="text-[12px] font-semibold text-[#232530]">Materi:</p>
                            <input
                              type="text"
                              value={newMaterialTitle}
                              onChange={(event) => setNewMaterialTitle(event.target.value)}
                              placeholder="Masukkan nama materi"
                              className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                            />
                          </div>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsNewMaterialTypeOpen((prev) => !prev)}
                              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#f39b39]"
                            >
                              {newMaterialType === 'video' ? 'Materi Video' : 'Materi Artikel'}
                              <FiChevronDown size={14} className="text-[#f39b39]" />
                            </button>

                            {isNewMaterialTypeOpen && (
                              <div className="absolute right-0 top-full z-10 mt-2 w-[180px] rounded-2xl border border-[#eceaf4] bg-white p-2 shadow-[0_16px_30px_rgba(20,20,30,0.12)]">
                                {(['video', 'artikel'] as const).map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                      setNewMaterialType(type);
                                      setIsNewMaterialTypeOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors ${
                                      newMaterialType === type
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
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMaterialFormOpen(false);
                              setNewMaterialTitle('');
                              setNewMaterialType('video');
                            }}
                            className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateMaterial}
                            disabled={!newMaterialTitle.trim()}
                            className={`inline-flex h-[32px] items-center justify-center rounded-lg px-4 text-[12px] font-semibold text-white transition-colors ${
                              newMaterialTitle.trim()
                                ? 'bg-[#7054dc] hover:bg-[#5f46cc]'
                                : 'cursor-not-allowed bg-[#c9cbd3]'
                            }`}
                          >
                            Simpan Materi
                          </button>
                        </div>
                      </div>
                    )}

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

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  if (material.isSaved) {
                                    toggleMaterialExpanded(material.id);
                                    return;
                                  }
                                  setOpenTypeMenuId((prev) => (prev === material.id ? null : material.id));
                                }}
                                className={`inline-flex items-center gap-2 text-[12px] font-semibold text-[#f39b39] ${
                                  material.isSaved ? 'cursor-pointer' : 'cursor-default'
                                }`}
                              >
                                {material.type === 'video' ? 'Materi Video' : 'Materi Artikel'}
                                <FiChevronDown
                                  size={14}
                                  className={`text-[#f39b39] transition-transform ${
                                    material.isSaved && material.isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              {!material.isSaved && openTypeMenuId === material.id && (
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
                          </div>

                          {activeMaterialId === material.id && material.isExpanded && (
                            <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-4">
                              {material.isSaved ? (
                                <div>
                                  <div className="rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
                                    <div className="flex items-start justify-between gap-3">
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
                                        <div>
                                          <p className="text-[12px] font-semibold text-[#232530]">
                                            {material.fileName || 'Konten materi tersimpan'}
                                          </p>
                                          <p className="mt-1 text-[11px] text-[#7a7e8a]">
                                            {material.duration} {material.fileSize ? `(${material.fileSize})` : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleEditMaterialContent(material.id)}
                                        className="text-[11px] font-semibold text-[#7054dc]"
                                      >
                                        Edit Konten Materi
                                      </button>
                                    </div>
                                  </div>

                                  {material.showUploadSuccess && (
                                    <p className="mt-2 text-[10px] text-[#3aa65c]">Unggah video sukses!</p>
                                  )}

                                  <div className="mt-4">
                                    <p className="text-[12px] font-semibold text-[#232530]">Bahan Bacaan</p>
                                    <div className="mt-2">
                                      <RichTextEditor placeholder="Tulis bahan bacaan di sini..." />
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7a7e8a]">Deskripsi video jika ada</p>
                                  </div>
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
                                          <p className="mt-2 text-[11px] text-[#7a7e8a]">Mencari video...</p>
                                          <div className="mt-3 rounded-xl border border-[#ede9ff] bg-white px-3 py-3">
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
                                              <div className="flex-1">
                                                <p className="text-[12px] font-semibold text-[#232530]">
                                                  {material.linkPreviewTitle || 'Preview video dari tautan'}
                                                </p>
                                                <p className="mt-1 text-[11px] text-[#7a7e8a]">00:00</p>
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  <div className="mt-4">
                                    <p className="text-[12px] font-semibold text-[#232530]">Bahan Bacaan</p>
                                    <div className="mt-2">
                                      <RichTextEditor placeholder="Tulis bahan bacaan di sini..." />
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7a7e8a]">Deskripsi video jika ada</p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-[12px] font-semibold text-[#232530]">Materi Artikel</p>
                                  <div className="mt-2">
                                    <RichTextEditor placeholder="Tulis materi artikel di sini..." />
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 flex items-center justify-end gap-3">
                                <button
                                  type="button"
                                  className="inline-flex h-[32px] items-center justify-center rounded-lg px-3 text-[12px] font-semibold text-[#7a7e8a]"
                                >
                                  Batal
                                </button>
                                {!material.isSaved && (
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
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

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
                          className="inline-flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8e7bff] bg-white px-4 text-[12px] font-semibold text-[#7054dc]"
                        >
                          Kuis <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]"
                  >
                    Topik <FiPlus size={14} />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
