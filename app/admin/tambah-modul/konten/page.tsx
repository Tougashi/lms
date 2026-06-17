'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiChevronDown, FiEdit2, FiLayers, FiPlus, FiTrash2, FiX, FiChevronUp, FiVideo, FiFileText
} from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { adminTopikApi, adminMateriApi, uploadApi } from '../../../lib/api';
import { usePopup } from '../../../component/ui/PopupProvider';
import TrixEditor from '../../../component/ui/TrixEditor';


/* ─── Types ─── */
type Material = {
  id: number;
  title: string;
  type: 'video' | 'artikel';
  isSaved: boolean;
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
  fileObj?: File;
};

type TopicWithMaterials = {
  id: string;
  name: string;
  isExpanded: boolean;
  isEditing: boolean;
  editTitle: string;
  materials: Material[];
};

const getYoutubeThumb = (url: string) => {
  const match = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
};

/* ─── Inner Page ─── */
function AdminKontenPageContent() {
  const searchParams = useSearchParams();
  const modulId = searchParams.get('id');
  const { confirm, toast } = usePopup();

  const [topics, setTopics] = useState<TopicWithMaterials[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [topicError, setTopicError] = useState('');

  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  
  // Create Material state
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState<string | null>(null); // holds topicId
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'video' | 'artikel'>('video');
  const [isNewMaterialTypeOpen, setIsNewMaterialTypeOpen] = useState(false);
  
  // Edit Material state
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const [materialApiIds, setMaterialApiIds] = useState<Record<number, string>>({});
  const [isSavingMaterial, setIsSavingMaterial] = useState<number | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState<number | null>(null);

  const uploadIntervalsRef = useRef<Record<number, number>>({});
  const uploadSuccessTimersRef = useRef<Record<number, number>>({});

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const showFeedback = (msg: string, type: 'success' | 'error') => {
    setFeedbackMsg(msg); setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  /* Load existing topics & materials */
  useEffect(() => {
    if (!modulId) return;
    
    Promise.all([
      adminTopikApi.getByModul(modulId).catch(() => []),
      adminMateriApi.getByModul(modulId).catch(() => [])
    ]).then(([fetchedTopics, fetchedMaterials]) => {
      const materialsByTopicId = fetchedMaterials.reduce((acc, item, idx) => {
        const localId = Date.now() + idx;
        setMaterialApiIds((prev) => ({ ...prev, [localId]: item.id }));
        const material: Material = {
          id: localId,
          title: item.title || `Materi ${idx + 1}`,
          type: item.isVideo ? 'video' : 'artikel',
          isSaved: true,
          videoSource: item.videoUrl ? 'link' : 'upload',
          linkUrl: item.videoUrl || '', linkPreviewThumb: item.videoUrl ? getYoutubeThumb(item.videoUrl) : '',
          showUploadSuccess: false, fileName: '', fileSize: '',
          uploadProgress: 100, uploadStatus: 'done' as const,
          previewUrl: item.videoUrl || '', duration: '00:00', articleContent: item.article || '',
        };
        const tid = item.topikId || 'unknown';
        if(!acc[tid]) acc[tid] = [];
        acc[tid].push(material);
        return acc;
      }, {} as Record<string, Material[]>);

      const loadedTopics: TopicWithMaterials[] = fetchedTopics.map((t: any) => ({
        id: t.id,
        name: t.name,
        isExpanded: false,
        isEditing: false,
        editTitle: t.name,
        materials: materialsByTopicId[t.id] || []
      }));
      setTopics(loadedTopics);
    });
  }, [modulId]);

  /* Cleanup on unmount */
  useEffect(() => {
    const intervals = uploadIntervalsRef.current;
    const timers = uploadSuccessTimersRef.current;
    return () => {
      Object.values(intervals).forEach((id) => window.clearInterval(id));
      Object.values(timers).forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    topics.forEach(t => {
      t.materials.forEach(m => {
        if (!m.showUploadSuccess || uploadSuccessTimersRef.current[m.id]) return;
        uploadSuccessTimersRef.current[m.id] = window.setTimeout(() => {
          setTopics(prev => prev.map(topic => ({
            ...topic,
            materials: topic.materials.map(item => item.id === m.id ? { ...item, showUploadSuccess: false } : item)
          })));
          delete uploadSuccessTimersRef.current[m.id];
        }, 3000);
      });
    });
  }, [topics]);

  const startFakeUpload = (materialId: number) => {
    if (uploadIntervalsRef.current[materialId]) window.clearInterval(uploadIntervalsRef.current[materialId]);
    const iid = window.setInterval(() => {
      setTopics(prev => prev.map(topic => ({
        ...topic,
        materials: topic.materials.map(m => {
          if (m.id !== materialId || m.uploadStatus !== 'uploading') return m;
          const next = Math.min(m.uploadProgress + 12, 100);
          if (next >= 100) { window.clearInterval(iid); delete uploadIntervalsRef.current[materialId]; }
          return { ...m, uploadProgress: next, uploadStatus: next >= 100 ? 'done' : 'uploading', showUploadSuccess: next >= 100 };
        })
      })));
    }, 300);
    uploadIntervalsRef.current[materialId] = iid;
  };

  const handleFileChange = (topicId: string, materialId: number, file: File | null) => {
    if (!file) return;
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        materials: t.materials.map(m => {
          if (m.id !== materialId) return m;
          if (m.previewUrl && m.previewUrl.startsWith('blob:')) URL.revokeObjectURL(m.previewUrl);
          return { ...m, fileObj: file, fileName: file.name, fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, uploadProgress: 0, uploadStatus: 'uploading', previewUrl: URL.createObjectURL(file) };
        })
      };
    }));
    startFakeUpload(materialId);
  };

  const handleDeleteMaterial = async (topicId: string, materialId: number) => {
    const isConfirmed = await confirm({
      title: 'Hapus Materi',
      message: 'Apakah Anda yakin ingin menghapus materi ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    const apiId = materialApiIds[materialId];
    if (apiId) {
      setIsDeletingMaterial(materialId);
      try {
        await adminMateriApi.delete(apiId);
        setMaterialApiIds((prev) => { const n = { ...prev }; delete n[materialId]; return n; });
        toast('Materi berhasil dihapus!', 'success');
      } catch { toast('Gagal menghapus materi.', 'error'); setIsDeletingMaterial(null); return; }
      finally { setIsDeletingMaterial(null); }
    }
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const nextMats = t.materials.filter(m => m.id !== materialId);
      return { ...t, materials: nextMats };
    }));
    setActiveMaterialId((cur) => cur === materialId ? null : cur);
  };

  const handleCreateTopic = async () => {
    const title = topicTitle.trim();
    if (!title) { setTopicError('Nama topik tidak boleh kosong'); return; }
    if (!modulId) { setTopicError('Simpan profil modul terlebih dahulu'); return; }
    setIsCreatingTopic(true); setTopicError('');
    try {
      const created = await adminTopikApi.create({ name: title, modulId, order: topics.length + 1 });
      setTopics(prev => [...prev, {
        id: created.id,
        name: title,
        isExpanded: true,
        isEditing: false,
        editTitle: title,
        materials: []
      }]);
      setIsFormOpen(false);
      setTopicTitle('');
      toast('Bab berhasil ditambahkan!', 'success');
    } catch (err: unknown) {
      setTopicError(err instanceof Error ? err.message : 'Gagal membuat topik');
    } finally { setIsCreatingTopic(false); }
  };

  const handleUpdateTopic = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    const title = topic.editTitle.trim();
    if (!title) return;
    try {
      await adminTopikApi.update(topicId, { name: title });
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, name: title, isEditing: false } : t));
      toast('Judul Bab berhasil diperbarui!', 'success');
    } catch { toast('Gagal memperbarui topik.', 'error'); }
  };
  
  const handleDeleteTopic = async (topicId: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Bab',
      message: 'Apakah Anda yakin ingin menghapus bab ini beserta seluruh materinya?',
      confirmText: 'Hapus Bab',
      cancelText: 'Batal',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await adminTopikApi.delete(topicId);
      setTopics(prev => prev.filter(t => t.id !== topicId));
      toast('Bab berhasil dihapus!', 'success');
    } catch { toast('Gagal menghapus bab.', 'error'); }
  };

  const handleCreateMaterial = async (topicId: string) => {
    const trimmedTitle = newMaterialTitle.trim();
    if (!trimmedTitle || !modulId) return;
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    const nextId = Date.now();
    const isVideo = newMaterialType === 'video';
    try {
      const created = await adminMateriApi.create({ title: trimmedTitle, topikId: topicId, modulId, order: topic.materials.length + 1 });
      setMaterialApiIds((prev) => ({ ...prev, [nextId]: created.id }));
      toast('Materi berhasil dibuat, silakan isi kontennya.', 'success');
    } catch { toast('Gagal membuat materi. Pastikan koneksi aman.', 'error'); return; }
    
    setTopics(prev => prev.map(t => {
      if(t.id !== topicId) return t;
      return {
        ...t,
        materials: [...t.materials, {
          id: nextId, title: trimmedTitle, type: newMaterialType, isSaved: false,
          videoSource: 'upload', linkUrl: '', linkPreviewThumb: '', showUploadSuccess: false,
          fileName: '', fileSize: '', uploadProgress: 0, uploadStatus: 'idle', previewUrl: '',
          duration: '00:00', articleContent: isVideo ? '' : '',
        }]
      };
    }));
    setActiveMaterialId(nextId);
    setIsMaterialFormOpen(null); setNewMaterialTitle(''); setNewMaterialType('video');
  };

  const handleSaveMaterialContent = useCallback(async (topicId: string, materialId: number) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    const material = topic.materials.find((m) => m.id === materialId);
    const apiId = materialApiIds[materialId];
    if (material && apiId) {
      setIsSavingMaterial(materialId);
      try {
        let videoUrl = material.videoSource === 'link' ? material.linkUrl : undefined;
        let isVideo = material.type === 'video';

        if (isVideo && material.videoSource === 'upload' && material.fileObj) {
          const uploadRes = await uploadApi.upload(material.fileObj, 'MATERI_VIDEO');
          videoUrl = uploadRes.url;
        }

        await adminMateriApi.update(apiId, { 
          title: material.title,
          isVideo: isVideo,
          videoUrl: videoUrl,
          article: material.type === 'artikel' ? material.articleContent : undefined,
        });
        
        setTopics(prev => prev.map(t => {
          if (t.id !== topicId) return t;
          return {
            ...t,
            materials: t.materials.map(m => m.id === materialId ? { ...m, uploadStatus: 'done', uploadProgress: 100, isSaved: true } : m)
          };
        }));
        toast('Materi berhasil disimpan!', 'success');
      } catch { toast('Gagal menyimpan materi.', 'error'); setIsSavingMaterial(null); return; }
      finally { setIsSavingMaterial(null); }
    }
  }, [topics, materialApiIds]);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />
      <main className="flex w-full">
        <AdminModuleSidebar
          basePath="/admin/tambah-modul"
          modulId={modulId ?? undefined}
          title="Tambah Modul"
          showSiswaTab={false}
        />

        <section className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8 w-full">
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

          {/* Topics List */}
          <div className="mt-6 space-y-4">
            {topics.map((topic, index) => (
              <div key={topic.id} className="rounded-2xl border border-[#e5e3ee] bg-white shadow-sm overflow-hidden">
                {/* Topic Header */}
                <div className="flex items-center justify-between p-4 bg-[#fcfbff] border-b border-[#e5e3ee]">
                  <div className="flex items-center gap-3 flex-1">
                    <button type="button" onClick={() => setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, isExpanded: !t.isExpanded } : t))} className="text-[#7a7e8a] hover:text-[#7054dc]">
                      {topic.isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                    {topic.isEditing ? (
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <input
                          type="text" value={topic.editTitle} onChange={(e) => setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, editTitle: e.target.value } : t))} autoFocus
                          className="h-[32px] flex-1 rounded-lg border border-[#7054dc] bg-white px-3 text-[13px] text-[#232530] outline-none"
                        />
                        <button type="button" onClick={() => handleUpdateTopic(topic.id)} className="inline-flex h-[30px] items-center justify-center rounded-lg bg-[#7054dc] px-3 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Simpan</button>
                        <button type="button" onClick={() => setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, isEditing: false, editTitle: t.name } : t))} className="text-[12px] text-[#7a7e8a]">Batal</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-[15px] font-bold text-[#232530]">Bab {index + 1}: {topic.name}</p>
                        <button type="button" onClick={() => setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, isEditing: true, editTitle: t.name } : t))} className="text-[#7a7e8a] hover:text-[#7054dc]"><FiEdit2 size={13} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleDeleteTopic(topic.id)} className="text-[#7a7e8a] hover:text-red-500"><FiTrash2 size={14} /></button>
                  </div>
                </div>

                {/* Topic Materials (Expanded) */}
                {topic.isExpanded && (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[13px] font-semibold text-[#6e7280]">Daftar Materi Bab {index + 1}</p>
                      {isMaterialFormOpen !== topic.id && (
                        <button type="button" onClick={() => { setIsMaterialFormOpen(topic.id); setNewMaterialTitle(''); setNewMaterialType('video'); }} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f2ff] px-3 py-1.5 text-[12px] font-semibold text-[#7054dc] hover:bg-[#ece7ff]">
                          <FiPlus size={12} /> Tambah Materi
                        </button>
                      )}
                    </div>

                    {isMaterialFormOpen === topic.id && (
                      <div className="mb-5 rounded-2xl border border-[#e5e3ee] bg-[#fcfbff] p-4">
                        <p className="text-[13px] font-semibold text-[#232530]">Nama Materi</p>
                        <input type="text" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} placeholder="Judul materi..." autoFocus className="mt-2 h-[40px] w-full rounded-xl border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]" />
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
                          <button type="button" onClick={() => handleCreateMaterial(topic.id)} className="inline-flex h-[36px] items-center justify-center rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Buat Materi</button>
                          <button type="button" onClick={() => { setIsMaterialFormOpen(null); setNewMaterialTitle(''); }} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {topic.materials.length === 0 && isMaterialFormOpen !== topic.id && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d9d7df] py-8 text-[#7a7e8a]">
                          <FiFileText size={20} className="mb-2" />
                          <p className="text-[12px]">Belum ada materi di bab ini.</p>
                        </div>
                      )}

                      {topic.materials.map((m) => {
                        const isActive = activeMaterialId === m.id;
                        return (
                          <div key={m.id} className={`rounded-xl border ${isActive ? 'border-[#7054dc]' : 'border-[#e5e3ee]'} bg-white overflow-hidden transition-colors`}>
                            {/* Material Header (Click to expand) */}
                            <div 
                              onClick={() => setActiveMaterialId(isActive ? null : m.id)}
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer ${isActive ? 'bg-[#fcfbff]' : 'hover:bg-[#fcfbff]'}`}
                            >
                              <div className="flex items-center gap-3">
                                {m.type === 'video' ? <FiVideo className="text-[#7a7e8a]" size={14} /> : <FiFileText className="text-[#7a7e8a]" size={14} />}
                                <span className={`text-[13px] ${isActive ? 'font-bold text-[#7054dc]' : 'font-semibold text-[#232530]'}`}>{m.title}</span>
                                {m.isSaved && <span className="h-1.5 w-1.5 rounded-full bg-green-400" title="Tersimpan" />}
                              </div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(topic.id, m.id); }} className="text-[#c1c4cd] hover:text-red-500"><FiTrash2 size={14} /></button>
                            </div>

                            {/* Material Content (Active) */}
                            {isActive && (
                              <div className="p-4 border-t border-[#e5e3ee] bg-white cursor-default" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-2 mb-4">
                                  {editingMaterialId === m.id ? (
                                    <div className="flex items-center gap-2 w-full max-w-sm">
                                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-[32px] w-full rounded-lg border border-[#7054dc] px-2 text-[12px] outline-none" />
                                      <button type="button" onClick={() => { setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, materials: t.materials.map(mat => mat.id === m.id ? { ...mat, title: editTitle.trim() || mat.title } : mat) } : t)); setEditingMaterialId(null); }} className="text-[12px] font-semibold text-[#7054dc]">Simpan</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <p className="text-[14px] font-bold text-[#232530]">{m.title}</p>
                                      <button type="button" onClick={() => { setEditingMaterialId(m.id); setEditTitle(m.title); }} className="text-[#7a7e8a] hover:text-[#7054dc]"><FiEdit2 size={13} /></button>
                                    </div>
                                  )}
                                </div>

                                {m.type === 'video' && (
                                  <div className="mt-2">
                                    <p className="text-[12px] font-semibold text-[#232530]">Sumber Video</p>
                                    <div className="mt-2 flex gap-3">
                                      {(['upload', 'link'] as const).map((src) => (
                                        <label key={src} className="flex items-center gap-2 text-[12px] text-[#6e7280] capitalize cursor-pointer">
                                          <input type="radio" checked={m.videoSource === src}
                                            onChange={() => setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, materials: t.materials.map(mat => mat.id === m.id ? { ...mat, videoSource: src } : mat) } : t))} />
                                          {src === 'upload' ? 'Upload File' : 'Link YouTube'}
                                        </label>
                                      ))}
                                    </div>

                                    {m.videoSource === 'link' && (
                                      <div className="mt-3">
                                        <input type="text" value={m.linkUrl}
                                          onChange={(e) => {
                                            const url = e.target.value;
                                            setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, materials: t.materials.map(mat => mat.id === m.id ? { ...mat, linkUrl: url, linkPreviewThumb: getYoutubeThumb(url) } : mat) } : t));
                                          }}
                                          placeholder="https://youtube.com/watch?v=..."
                                          className="h-[40px] w-full max-w-md rounded-xl border border-[#d9d7df] bg-white px-3 text-[12px] outline-none focus:border-[#7054dc]"
                                        />
                                        {m.linkPreviewThumb && (
                                          <img src={m.linkPreviewThumb} alt="preview" className="mt-3 h-[100px] rounded-lg object-cover" />
                                        )}
                                      </div>
                                    )}

                                    {m.videoSource === 'upload' && (
                                      <div className="mt-3 flex flex-col gap-3">
                                        {m.previewUrl && (
                                          <div className="w-full max-w-md overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center">
                                            <video src={m.previewUrl} controls className="max-h-full max-w-full" />
                                          </div>
                                        )}
                                        <label className="flex h-[80px] max-w-md cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#c8bfff] bg-[#f9f8ff] text-[12px] text-[#7054dc] hover:bg-[#f0eeff]">
                                          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(topic.id, m.id, e.target.files?.[0] ?? null)} />
                                          {m.uploadStatus === 'done'
                                            ? <span className="font-semibold text-green-600">✓ {m.fileName || 'Video Tersimpan'} (Ubah)</span>
                                            : m.uploadStatus === 'uploading'
                                              ? <span>Mengunggah... {m.uploadProgress}%</span>
                                              : <span>+ Upload Video</span>
                                          }
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {m.type === 'artikel' && (
                                  <div className="mt-2">
                                    <p className="text-[12px] font-semibold text-[#232530] mb-2">Konten Artikel</p>
                                    <TrixEditor 
                                      id={`admin-tambah-artikel-${m.id}`}
                                      placeholder="Tulis konten artikel..." 
                                      value={m.articleContent}
                                      onChange={(html) => setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, materials: t.materials.map(mat => mat.id === m.id ? { ...mat, articleContent: html } : mat) } : t))}
                                    />
                                  </div>
                                )}

                                <div className="mt-5 flex justify-end">
                                  <button type="button" onClick={() => handleSaveMaterialContent(topic.id, m.id)} disabled={isSavingMaterial === m.id}
                                    className="inline-flex h-[36px] items-center justify-center rounded-xl bg-[#7054dc] px-6 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">
                                    {isSavingMaterial === m.id ? 'Menyimpan...' : 'Simpan Materi'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add New Topic Section */}
            {isFormOpen ? (
              <div className="mt-4 rounded-2xl border border-[#7054dc] bg-white p-5 shadow-sm">
                <p className="text-[13px] font-semibold text-[#232530] mb-2">Nama Topik/Bab Baru</p>
                <input
                  type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Contoh: Bab 1 Pendahuluan" autoFocus
                  className="h-[40px] w-full max-w-md rounded-xl border border-[#d9d7df] bg-white px-3 text-[13px] text-[#232530] outline-none focus:border-[#7054dc]"
                />
                {topicError && <p className="mt-1 text-[11px] text-red-500">{topicError}</p>}
                <div className="mt-4 flex items-center gap-3">
                  <button type="button" onClick={handleCreateTopic} disabled={isCreatingTopic} className="inline-flex h-[36px] items-center justify-center rounded-xl bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">
                    {isCreatingTopic ? 'Menyimpan...' : 'Simpan Topik'}
                  </button>
                  <button type="button" onClick={() => { setIsFormOpen(false); setTopicTitle(''); setTopicError(''); }} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setIsFormOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c8bfff] bg-[#fcfbff] py-5 text-[13px] font-semibold text-[#7054dc] hover:bg-[#f5f2ff] transition-colors">
                <FiPlus size={16} /> Tambah Topik Baru
              </button>
            )}
          </div>
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
