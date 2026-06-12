'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiChevronDown, FiEdit2, FiLayers, FiPlus, FiTrash2, FiX,
} from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { adminTopikApi, adminMateriApi, uploadApi } from '../../../lib/api';

/* ─── Rich Text Editor ─── */
function RichTextEditor({ placeholder }: { placeholder: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const updateEmptyState = () => {
    setIsEmpty((editorRef.current?.textContent?.trim() ?? '').length === 0);
  };
  const applyCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    updateEmptyState();
  };
  const applyLink = () => {
    const url = window.prompt('Masukkan tautan');
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand('createLink', false, url);
    updateEmptyState();
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await uploadApi.upload(file, 'MATERI_IMAGE');
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertImage', false, res.url);
        updateEmptyState();
      }
    } catch { /* silent */ } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-[#d9d7df] bg-white">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#e8e9ef] px-3 py-2 text-[11px] text-[#6f7381]">
        <button type="button" onClick={() => applyCommand('bold')} className="inline-flex h-6 w-6 items-center justify-center rounded-md font-semibold text-[#232530] hover:bg-[#f5f4fb]">B</button>
        <button type="button" onClick={() => applyCommand('italic')} className="inline-flex h-6 w-6 items-center justify-center rounded-md italic text-[#232530] hover:bg-[#f5f4fb]">I</button>
        <button type="button" onClick={() => applyCommand('underline')} className="inline-flex h-6 w-6 items-center justify-center rounded-md underline text-[#232530] hover:bg-[#f5f4fb]">U</button>
        <button type="button" onClick={applyLink} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#232530] hover:bg-[#f5f4fb]" aria-label="Link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 13.5l4-4M7 17a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#232530] hover:bg-[#f5f4fb] disabled:opacity-50" aria-label="Image">
          {isUploadingImage ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7054dc] border-t-transparent" /> : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="11" r="2" fill="currentColor"/><path d="M20 16l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </button>
      </div>
      <div className="relative px-3 py-3 text-[12px] text-[#232530]">
        {isEmpty && <span className="pointer-events-none absolute left-3 top-3 text-[11px] text-[#9aa0ad]">{placeholder}</span>}
        <div ref={editorRef} contentEditable onInput={updateEmptyState} onBlur={updateEmptyState} className="min-h-[120px] outline-none" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  );
}

/* ─── Types ─── */
type Material = {
  id: number;
  title: string;
  type: 'video' | 'artikel';
  isSaved: boolean;
  isExpanded: boolean;
  videoSource: 'upload' | 'link';
  linkUrl: string;
  linkPreviewThumb: string;
  showUploadSuccess: boolean;
  fileName: string;
  fileSize: string;
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'done';
  previewUrl: string;
  duration: string;
  articleContent: string;
};

/* ─── helper ─── */
const getYoutubeThumb = (url: string) => {
  const match = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
};

/* ─── Inner Page (needs Suspense for useSearchParams) ─── */
function AdminKontenPageContent() {
  const searchParams = useSearchParams();
  const modulId = searchParams.get('id');

  const [isTopicAdded, setIsTopicAdded] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [topicError, setTopicError] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTopicTitle, setEditTopicTitle] = useState('');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'video' | 'artikel'>('video');
  const [isNewMaterialTypeOpen, setIsNewMaterialTypeOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [materialApiIds, setMaterialApiIds] = useState<Record<number, string>>({});
  const [isSavingMaterial, setIsSavingMaterial] = useState<number | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const uploadIntervalsRef = useRef<Record<number, number>>({});
  const uploadSuccessTimersRef = useRef<Record<number, number>>({});
  const materialsRef = useRef(materials);
  useEffect(() => { materialsRef.current = materials; }, [materials]);

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const showFeedback = (msg: string, type: 'success' | 'error') => {
    setFeedbackMsg(msg); setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  /* Load existing topics */
  useEffect(() => {
    if (!modulId) return;
    adminTopikApi.getByModul(modulId).then((topics) => {
      if (topics.length > 0) {
        setTopicTitle(topics[0].name);
        setTopicId(topics[0].id);
        setIsTopicAdded(true);
      }
    }).catch(() => {});
  }, [modulId]);

  /* Load existing materials */
  useEffect(() => {
    if (!modulId) return;
    adminMateriApi.getByModul(modulId).then((items) => {
      if (items.length > 0) {
        const loaded: Material[] = items.map((item, idx) => {
          const localId = Date.now() + idx;
          setMaterialApiIds((prev) => ({ ...prev, [localId]: item.id }));
          return {
            id: localId,
            title: item.title || `Materi ${idx + 1}`,
            type: 'video' as const,
            isSaved: true, isExpanded: false,
            videoSource: 'link' as const,
            linkUrl: '', linkPreviewThumb: '',
            showUploadSuccess: false, fileName: '', fileSize: '',
            uploadProgress: 100, uploadStatus: 'done' as const,
            previewUrl: '', duration: '00:00', articleContent: '',
          };
        });
        setMaterials(loaded);
        if (loaded.length > 0) setActiveMaterialId(loaded[0].id);
      }
    }).catch(() => {});
  }, [modulId]);

  /* Cleanup on unmount */
  useEffect(() => {
    const intervals = uploadIntervalsRef.current;
    const timers = uploadSuccessTimersRef.current;
    return () => {
      Object.values(intervals).forEach((id) => window.clearInterval(id));
      Object.values(timers).forEach((id) => window.clearTimeout(id));
      materialsRef.current.forEach((m) => { if (m.previewUrl) URL.revokeObjectURL(m.previewUrl); });
    };
  }, []);

  /* Show upload success banner briefly */
  useEffect(() => {
    materials.forEach((m) => {
      if (!m.showUploadSuccess || uploadSuccessTimersRef.current[m.id]) return;
      uploadSuccessTimersRef.current[m.id] = window.setTimeout(() => {
        setMaterials((prev) => prev.map((item) => item.id === m.id ? { ...item, showUploadSuccess: false } : item));
        delete uploadSuccessTimersRef.current[m.id];
      }, 3000);
    });
  }, [materials]);

  const startFakeUpload = (materialId: number) => {
    if (uploadIntervalsRef.current[materialId]) window.clearInterval(uploadIntervalsRef.current[materialId]);
    const iid = window.setInterval(() => {
      setMaterials((prev) => prev.map((m) => {
        if (m.id !== materialId || m.uploadStatus !== 'uploading') return m;
        const next = Math.min(m.uploadProgress + 12, 100);
        if (next >= 100) { window.clearInterval(iid); delete uploadIntervalsRef.current[materialId]; }
        return { ...m, uploadProgress: next, uploadStatus: next >= 100 ? 'done' : 'uploading', showUploadSuccess: next >= 100 };
      }));
    }, 300);
    uploadIntervalsRef.current[materialId] = iid;
  };

  const handleFileChange = (materialId: number, file: File | null) => {
    if (!file) return;
    setMaterials((prev) => prev.map((m) => {
      if (m.id !== materialId) return m;
      if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
      return { ...m, fileName: file.name, fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, uploadProgress: 0, uploadStatus: 'uploading', previewUrl: URL.createObjectURL(file) };
    }));
    startFakeUpload(materialId);
  };

  const handleDeleteMaterial = async (materialId: number) => {
    const apiId = materialApiIds[materialId];
    if (apiId) {
      setIsDeletingMaterial(materialId);
      try {
        await adminMateriApi.delete(apiId);
        setMaterialApiIds((prev) => { const n = { ...prev }; delete n[materialId]; return n; });
      } catch { showFeedback('Gagal menghapus materi.', 'error'); setIsDeletingMaterial(null); return; }
      finally { setIsDeletingMaterial(null); }
    }
    setMaterials((prev) => {
      const next = prev.filter((m) => m.id !== materialId);
      setActiveMaterialId((cur) => cur === materialId ? (next[0]?.id ?? null) : cur);
      return next;
    });
  };

  const handleCreateTopic = async () => {
    const title = topicTitle.trim();
    if (!title) { setTopicError('Nama topik tidak boleh kosong'); return; }
    if (!modulId) { setTopicError('Simpan profil modul terlebih dahulu'); return; }
    setIsCreatingTopic(true); setTopicError('');
    try {
      const created = await adminTopikApi.create({ name: title, modulId, order: 1 });
      setTopicId(created.id);
      setIsTopicAdded(true);
      setIsFormOpen(false);
    } catch (err: unknown) {
      setTopicError(err instanceof Error ? err.message : 'Gagal membuat topik');
    } finally { setIsCreatingTopic(false); }
  };

  const handleUpdateTopic = async () => {
    if (!topicId) return;
    const title = editTopicTitle.trim();
    if (!title) return;
    try {
      await adminTopikApi.update(topicId, { name: title });
      setTopicTitle(title);
      setIsEditingTopic(false);
    } catch { showFeedback('Gagal memperbarui topik.', 'error'); }
  };

  const handleCreateMaterial = async () => {
    const trimmedTitle = newMaterialTitle.trim();
    if (!trimmedTitle || !topicId || !modulId) return;
    const nextId = Date.now();
    const isVideo = newMaterialType === 'video';
    try {
      const created = await adminMateriApi.create({ title: trimmedTitle, topikId: topicId, modulId, order: materials.length + 1 });
      setMaterialApiIds((prev) => ({ ...prev, [nextId]: created.id }));
    } catch { showFeedback('Gagal membuat materi. Pastikan topik sudah tersimpan.', 'error'); return; }
    setMaterials((prev) => [...prev, {
      id: nextId, title: trimmedTitle, type: newMaterialType, isSaved: false, isExpanded: true,
      videoSource: 'upload', linkUrl: '', linkPreviewThumb: '', showUploadSuccess: false,
      fileName: '', fileSize: '', uploadProgress: 0, uploadStatus: 'idle', previewUrl: '',
      duration: '00:00', articleContent: isVideo ? '' : '',
    }]);
    setActiveMaterialId(nextId);
    setIsMaterialFormOpen(false); setNewMaterialTitle(''); setNewMaterialType('video');
  };

  const handleSaveMaterialContent = useCallback(async (materialId: number) => {
    const material = materials.find((m) => m.id === materialId);
    const apiId = materialApiIds[materialId];
    if (material && apiId) {
      setIsSavingMaterial(materialId);
      try {
        await adminMateriApi.update(apiId, { title: material.title });
      } catch { showFeedback('Gagal menyimpan materi.', 'error'); setIsSavingMaterial(null); return; }
      finally { setIsSavingMaterial(null); }
    }
    setMaterials((prev) => prev.map((item) => item.id === materialId ? { ...item, isSaved: true, isExpanded: false } : item));
  }, [materials, materialApiIds]);

  const activeMaterial = materials.find((m) => m.id === activeMaterialId) ?? null;

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />
      <main className="flex w-full">
        <AdminModuleSidebar basePath="/admin/tambah-modul" modulId={modulId ?? undefined} title="Tambah Modul" showSiswaTab={false} />

        <section className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece7ff] text-[#7054dc]"><FiLayers size={18} /></div>
            <div>
              <h1 className="text-[18px] font-bold text-[#232530]">Konten Modul</h1>
              <p className="text-[12px] text-[#7a7e8a]">Kelola topik dan materi pembelajaran modul</p>
            </div>
          </div>

          {!modulId && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
              Simpan profil modul terlebih dahulu untuk mengisi konten.
            </div>
          )}

          {feedbackMsg && (
            <div className={`mt-4 rounded-lg px-4 py-2 text-[13px] font-medium ${feedbackType === 'success' ? 'border border-green-200 bg-green-50 text-green-700' : 'border border-red-200 bg-red-50 text-red-600'}`}>
              {feedbackMsg}
            </div>
          )}

          {/* Topic section */}
          <div className="mt-6 rounded-2xl border border-[#e5e3ee] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#232530]">Topik Modul</p>
              {!isTopicAdded && !isFormOpen && (
                <button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-[#7054dc] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">
                  <FiPlus size={13} /> Tambah Topik
                </button>
              )}
            </div>

            {isFormOpen && !isTopicAdded && (
              <div className="mt-4">
                <input
                  type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Nama Topik..." autoFocus
                  className="h-[40px] w-full rounded-xl border border-[#7054dc] bg-white px-3 text-[13px] text-[#232530] outline-none"
                />
                {topicError && <p className="mt-1 text-[11px] text-red-500">{topicError}</p>}
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={handleCreateTopic} disabled={isCreatingTopic} className="inline-flex h-[36px] items-center justify-center rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">
                    {isCreatingTopic ? 'Menyimpan...' : 'Simpan Topik'}
                  </button>
                  <button type="button" onClick={() => { setIsFormOpen(false); setTopicTitle(''); setTopicError(''); }} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                </div>
              </div>
            )}

            {isTopicAdded && (
              <div className="mt-4 rounded-xl border border-[#e5e3ee] bg-[#f9f8ff] px-4 py-3">
                {isEditingTopic ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text" value={editTopicTitle} onChange={(e) => setEditTopicTitle(e.target.value)} autoFocus
                      className="h-[36px] flex-1 rounded-xl border border-[#7054dc] bg-white px-3 text-[13px] text-[#232530] outline-none"
                    />
                    <button type="button" onClick={handleUpdateTopic} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-4 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Simpan</button>
                    <button type="button" onClick={() => setIsEditingTopic(false)} className="text-[12px] text-[#7a7e8a]">Batal</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <FiLayers size={16} className="text-[#7054dc]" />
                    <p className="flex-1 text-[13px] font-semibold text-[#232530]">{topicTitle}</p>
                    <button type="button" onClick={() => { setIsEditingTopic(true); setEditTopicTitle(topicTitle); }} className="text-[#7a7e8a] hover:text-[#7054dc]"><FiEdit2 size={14} /></button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Materials section */}
          {isTopicAdded && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold text-[#232530]">Materi</p>
                {!isMaterialFormOpen && (
                  <button type="button" onClick={() => setIsMaterialFormOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-[#7054dc] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">
                    <FiPlus size={13} /> Tambah Materi
                  </button>
                )}
              </div>

              {/* New material form */}
              {isMaterialFormOpen && (
                <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white p-4">
                  <p className="text-[13px] font-semibold text-[#232530]">Nama Materi</p>
                  <input type="text" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} placeholder="Judul materi..." autoFocus className="mt-2 h-[40px] w-full rounded-xl border border-[#7054dc] bg-white px-3 text-[13px] text-[#232530] outline-none" />
                  <p className="mt-3 text-[13px] font-semibold text-[#232530]">Tipe Materi</p>
                  <div className="relative mt-2 w-[160px]">
                    <button type="button" onClick={() => setIsNewMaterialTypeOpen((v) => !v)} className="flex h-[38px] w-full items-center justify-between rounded-xl border border-[#d9d7df] bg-white px-3 text-[12px] text-[#232530]">
                      {newMaterialType === 'video' ? 'Video' : 'Artikel'}<FiChevronDown size={14} />
                    </button>
                    {isNewMaterialTypeOpen && (
                      <div className="absolute top-full z-10 mt-1 w-full rounded-xl border border-[#e5e3ee] bg-white p-1 shadow-md">
                        {(['video', 'artikel'] as const).map((t) => (
                          <button key={t} type="button" onClick={() => { setNewMaterialType(t); setIsNewMaterialTypeOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-1.5 text-[12px] capitalize hover:bg-[#f5f2ff]">{t}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button type="button" onClick={handleCreateMaterial} className="inline-flex h-[36px] items-center justify-center rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Buat Materi</button>
                    <button type="button" onClick={() => { setIsMaterialFormOpen(false); setNewMaterialTitle(''); }} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                  </div>
                </div>
              )}

              {/* Material list with side-by-side layout */}
              {materials.length > 0 && (
                <div className="mt-4 flex gap-4">
                  {/* Left: material list */}
                  <div className="w-[220px] shrink-0 space-y-1">
                    {materials.map((m) => (
                      <button
                        key={m.id} type="button"
                        onClick={() => { setActiveMaterialId(m.id); setMaterials((prev) => prev.map((item) => item.id === m.id ? { ...item, isExpanded: true } : item)); }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[12px] transition-colors ${activeMaterialId === m.id ? 'bg-[#ece7ff] font-semibold text-[#7054dc]' : 'bg-white text-[#5a5f6a] hover:bg-[#f5f2ff]'}`}
                      >
                        <FiLayers size={13} className="shrink-0" />
                        <span className="flex-1 truncate">{m.title}</span>
                        {m.isSaved && <span className="h-1.5 w-1.5 rounded-full bg-green-400" />}
                      </button>
                    ))}
                  </div>

                  {/* Right: active material editor */}
                  {activeMaterial && (
                    <div className="flex-1 rounded-2xl border border-[#e5e3ee] bg-white p-5">
                      <div className="flex items-center justify-between">
                        {editingMaterialId === activeMaterial.id ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-[32px] w-[200px] rounded-lg border border-[#7054dc] bg-white px-2 text-[12px] outline-none" />
                            <button type="button" onClick={() => { setMaterials((prev) => prev.map((item) => item.id === activeMaterial.id ? { ...item, title: editTitle.trim() || item.title } : item)); setEditingMaterialId(null); }} className="text-[12px] font-semibold text-[#7054dc]">Simpan</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-bold text-[#232530]">{activeMaterial.title}</p>
                            <button type="button" onClick={() => { setEditingMaterialId(activeMaterial.id); setEditTitle(activeMaterial.title); }} className="text-[#7a7e8a] hover:text-[#7054dc]"><FiEdit2 size={13} /></button>
                          </div>
                        )}
                        <button type="button" onClick={() => handleDeleteMaterial(activeMaterial.id)} disabled={isDeletingMaterial === activeMaterial.id} className="text-[#7a7e8a] hover:text-red-500 disabled:opacity-50"><FiTrash2 size={14} /></button>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#7a7e8a]">
                        <span className="rounded-full bg-[#ece7ff] px-2 py-0.5 font-semibold capitalize text-[#7054dc]">{activeMaterial.type}</span>
                      </div>

                      {/* Video source */}
                      {activeMaterial.type === 'video' && (
                        <div className="mt-4">
                          <p className="text-[12px] font-semibold text-[#232530]">Sumber Video</p>
                          <div className="mt-2 flex gap-3">
                            {(['upload', 'link'] as const).map((src) => (
                              <label key={src} className="flex items-center gap-2 text-[12px] text-[#6e7280] capitalize cursor-pointer">
                                <input type="radio" name={`vsrc-${activeMaterial.id}`} checked={activeMaterial.videoSource === src}
                                  onChange={() => setMaterials((prev) => prev.map((m) => m.id === activeMaterial.id ? { ...m, videoSource: src } : m))} />
                                {src === 'upload' ? 'Upload File' : 'Link YouTube'}
                              </label>
                            ))}
                          </div>

                          {activeMaterial.videoSource === 'link' && (
                            <div className="mt-3">
                              <input type="text" value={activeMaterial.linkUrl}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  setMaterials((prev) => prev.map((m) => m.id === activeMaterial.id ? { ...m, linkUrl: url, linkPreviewThumb: getYoutubeThumb(url) } : m));
                                }}
                                placeholder="https://youtube.com/watch?v=..."
                                className="h-[40px] w-full rounded-xl border border-[#d9d7df] bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"
                              />
                              {activeMaterial.linkPreviewThumb && (
                                <img src={activeMaterial.linkPreviewThumb} alt="preview" className="mt-3 h-[100px] rounded-lg object-cover" />
                              )}
                            </div>
                          )}

                          {activeMaterial.videoSource === 'upload' && (
                            <label className="mt-3 flex h-[80px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#c8bfff] bg-[#f9f8ff] text-[12px] text-[#7054dc] hover:bg-[#f0eeff]">
                              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(activeMaterial.id, e.target.files?.[0] ?? null)} />
                              {activeMaterial.uploadStatus === 'done' ? (
                                <span className="font-semibold text-green-600">✓ {activeMaterial.fileName}</span>
                              ) : activeMaterial.uploadStatus === 'uploading' ? (
                                <span>Mengunggah... {activeMaterial.uploadProgress}%</span>
                              ) : (
                                <span>+ Upload Video</span>
                              )}
                            </label>
                          )}
                        </div>
                      )}

                      {/* Article editor */}
                      {activeMaterial.type === 'artikel' && (
                        <div className="mt-4">
                          <p className="text-[12px] font-semibold text-[#232530]">Konten Artikel</p>
                          <div className="mt-2"><RichTextEditor placeholder="Tulis konten artikel..." /></div>
                        </div>
                      )}

                      <div className="mt-5 flex justify-end">
                        <button type="button" onClick={() => handleSaveMaterialContent(activeMaterial.id)} disabled={isSavingMaterial === activeMaterial.id}
                          className="inline-flex h-[36px] items-center justify-center rounded-xl bg-[#7054dc] px-6 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">
                          {isSavingMaterial === activeMaterial.id ? 'Menyimpan...' : 'Simpan Materi'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {materials.length === 0 && !isMaterialFormOpen && (
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c8bfff] bg-white py-14">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f2ff] text-[#7054dc]"><FiLayers size={22} /></div>
                  <p className="mt-3 text-[13px] font-semibold text-[#232530]">Belum ada materi</p>
                  <p className="mt-1 text-[11px] text-[#7a7e8a]">Klik Tambah Materi untuk mulai</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function TambahModulKontenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <AdminKontenPageContent />
    </Suspense>
  );
}
