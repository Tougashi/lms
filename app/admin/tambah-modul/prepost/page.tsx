'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FiCheckSquare, FiChevronDown, FiEdit2, FiMoreVertical,
  FiPlus, FiSettings, FiTrash2, FiX,
} from 'react-icons/fi';
import AdminHeader from '../../../component/admin/AdminHeader';
import AdminModuleSidebar from '../../components/AdminModuleSidebar';
import { adminPretestApi, adminPosttestApi, adminModulApi } from '../../../lib/api';
import { usePopup } from '../../../component/ui/PopupProvider';

/* ─── Mini Editor ─── */
function MiniEditor({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(true);
  const up = () => {
    setEmpty((ref.current?.textContent?.trim() ?? '').length === 0);
    onChange?.(ref.current?.textContent?.trim() || '');
  };
  const cmd = (c: string) => { ref.current?.focus(); document.execCommand(c); up(); };

  useEffect(() => {
    if (ref.current && value && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
      setEmpty((ref.current?.textContent?.trim() ?? '').length === 0);
    }
  }, [value]);

  return (
    <div className="rounded-xl border border-[#d9d7df] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#e8e9ef] px-3 py-2">
        <button type="button" onClick={() => cmd('bold')} className="inline-flex h-6 w-6 items-center justify-center rounded-md font-semibold text-[#232530] hover:bg-[#f5f4fb]">B</button>
        <button type="button" onClick={() => cmd('italic')} className="inline-flex h-6 w-6 items-center justify-center rounded-md italic text-[#232530] hover:bg-[#f5f4fb]">I</button>
      </div>
      <div className="relative px-3 py-3 text-[12px] text-[#232530]">
        {empty && <span className="pointer-events-none absolute left-3 top-3 text-[11px] text-[#9aa0ad]">{placeholder}</span>}
        <div ref={ref} contentEditable onInput={up} onBlur={up} className="min-h-[80px] outline-none" />
      </div>
    </div>
  );
}

/* ─── Types ─── */
type LocalAnswer = { id: number; text: string; isCorrect: boolean };

type LocalQuestion = {
  id: number;
  apiSoalId: string | null;
  pertanyaan: string;
  isExpanded: boolean;
  skor: number;
  answers: LocalAnswer[];
};

const CT_ASPECTS = [
  'Dekomposisi',
  'Pengenalan Pola',
  'Abstraksi',
  'Algoritma',
] as const;

type CTAspect = typeof CT_ASPECTS[number];

type LocalCTSubQuestion = {
  id: number;
  apiSoalId: string | null;
  ctAspect: CTAspect;
  label: string;
  skor: number;
  answers: LocalAnswer[];
};

type LocalCTStory = {
  id: number;
  groupId: string;
  cerita: string;
  isExpanded: boolean;
  subQuestions: LocalCTSubQuestion[];
};

type BankSoal = {
  id: number;
  name: string;
  type: 'pretest' | 'posttest';
  apiId: string | null;
  questions: LocalQuestion[];
  ctStories: LocalCTStory[];
};

function makeCTStory(): LocalCTStory {
  const gid = `ct-${Date.now()}`;
  return {
    id: Date.now(),
    groupId: gid,
    cerita: '',
    isExpanded: true,
    subQuestions: CT_ASPECTS.map((aspect, i) => ({
      id: Date.now() + i + 1,
      apiSoalId: null,
      ctAspect: aspect,
      label: `Soal ${aspect}`,
      skor: 10,
      answers: [
        { id: Date.now() + i * 10 + 100, text: '', isCorrect: false },
        { id: Date.now() + i * 10 + 101, text: '', isCorrect: false },
      ],
    })),
  };
}

/* ─── Inner page ─── */
function AdminPrePostPageContent() {
  const searchParams = useSearchParams();
  const modulId = searchParams.get('id');
  const { toast, confirm } = usePopup();

  const [banks, setBanks] = useState<BankSoal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankType, setNewBankType] = useState<'pretest' | 'posttest'>('pretest');
  const [activeBankId, setActiveBankId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingSoalId, setEditingSoalId] = useState<number | null>(null);
  const [editSoalTitle, setEditSoalTitle] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTargetBankId, setSettingsTargetBankId] = useState<number | null>(null);
  const [settingsDuration, setSettingsDuration] = useState(90);
  const [settingsSoalTampil, setSettingsSoalTampil] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBank, setIsCreatingBank] = useState(false);

  // CT mode for the whole module
  const [isTestComputationalThinking, setIsTestComputationalThinking] = useState(false);
  const [isSavingCTMode, setIsSavingCTMode] = useState(false);

  const activeBank = banks.find((b) => b.id === activeBankId) ?? null;
  const settingsTargetBank = banks.find((b) => b.id === settingsTargetBankId) ?? null;

  /* Load existing pretest & posttest */
  useEffect(() => {
    if (!modulId) { setIsLoading(false); return; }
    const load = async () => {
      const loadedBanks: BankSoal[] = [];
      try {
        // Load module CT flag
        try {
          const modul = await adminModulApi.getById(modulId);
          setIsTestComputationalThinking((modul as any).isTestComputationalThinking ?? false);
        } catch { /* ignore */ }

        try {
          const pretest = await adminPretestApi.getByModul(modulId);
          if (pretest?.id) {
            const questions = (pretest.pretestQuestions || [])
              .filter((q: any) => !q.ctGroupId)
              .map((q: any, idx: number) => ({
                id: Date.now() + idx, apiSoalId: q.id,
                pertanyaan: q.pertanyaan, isExpanded: false, skor: q.skor || 10,
                answers: (q.answerOptions || []).map((opt: any, aidx: number) => ({
                  id: Date.now() + idx * 100 + aidx, text: opt.option,
                  isCorrect: opt.option === q.correctAnswer,
                })),
              }));
            
            // Group CT questions by ctGroupId
            const ctGroups: Record<string, any[]> = {};
            (pretest.pretestQuestions || [])
              .filter((q: any) => q.ctGroupId)
              .forEach((q: any) => {
                if (!ctGroups[q.ctGroupId]) ctGroups[q.ctGroupId] = [];
                ctGroups[q.ctGroupId].push(q);
              });
            
            const ctStories: LocalCTStory[] = Object.entries(ctGroups).map(([gid, qs], si) => ({
              id: Date.now() + 10000 + si,
              groupId: gid,
              cerita: qs[0]?.ctStory || '',
              isExpanded: false,
              subQuestions: qs.map((q: any, qi: number) => ({
                id: Date.now() + 10000 + si * 100 + qi,
                apiSoalId: q.id,
                ctAspect: (q.ctAspect || CT_ASPECTS[qi % CT_ASPECTS.length]) as CTAspect,
                label: q.pertanyaan || `Soal ${q.ctAspect || qi + 1}`,
                skor: q.skor || 10,
                answers: (q.answerOptions || []).map((opt: any, aidx: number) => ({
                  id: Date.now() + 10000 + si * 1000 + qi * 10 + aidx,
                  text: opt.option,
                  isCorrect: opt.option === q.correctAnswer,
                })),
              })),
            }));

            loadedBanks.push({
              id: Date.now(), name: pretest.pretestName || 'Pre Test',
              type: 'pretest', apiId: pretest.id, questions, ctStories,
            });
            const settings = pretest.pretestSettings;
            if (settings?.length) {
              setSettingsDuration(settings[0].duration ?? 90);
              setSettingsSoalTampil(settings[0].countShownQuestions ?? 30);
            }
          }
        } catch { /* no pretest yet */ }

        try {
          const posttest = await adminPosttestApi.getByModul(modulId);
          if (posttest?.id) {
            const questions = (posttest.soals || []).map((q: any, idx: number) => ({
              id: Date.now() + 5000 + idx, apiSoalId: q.id,
              pertanyaan: q.question, isExpanded: false, skor: q.skor || 10,
              answers: (q.pilihan || []).map((opt: string, aidx: number) => ({
                id: Date.now() + 5000 + idx * 100 + aidx, text: opt,
                isCorrect: opt === q.correctAnswer,
              })),
            }));
            loadedBanks.push({
              id: Date.now() + 9000, name: 'Post Test',
              type: 'posttest', apiId: posttest.id, questions, ctStories: [],
            });
            const ptSettings = posttest.posttestSettings;
            if (ptSettings?.length) {
              setSettingsDuration(ptSettings[0].duration ?? 90);
              setSettingsSoalTampil(ptSettings[0].countShownQuestions ?? 30);
            }
          }
        } catch { /* no posttest yet */ }

        if (loadedBanks.length > 0) setBanks(loadedBanks);
      } finally { setIsLoading(false); }
    };
    load();
  }, [modulId]);

  const handleToggleCTMode = async (enabled: boolean) => {
    if (!modulId) { setIsLoading(false); return; }

    if (!activeBank) {
      setIsTestComputationalThinking(enabled);
      setIsSavingCTMode(true);
      try {
        await adminModulApi.update(modulId, { isTestComputationalThinking: enabled } as any);
        toast(`Mode Computational Thinking ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
      } catch {
        toast('Gagal menyimpan pengaturan CT.', 'error');
        setIsTestComputationalThinking(!enabled);
      } finally {
        setIsSavingCTMode(false);
      }
      return;
    }

    const hasQuestions = activeBank.questions.length > 0 || activeBank.ctStories.length > 0;
    if (hasQuestions) {
      const ok = await confirm({
        title: 'Ubah Mode Test',
        message: enabled
          ? 'Mengubah ke mode CT akan menghapus soal reguler yang sudah ada dan membuat 4 soal CT otomatis. Lanjutkan?'
          : 'Mengubah ke mode Reguler akan menghapus soal CT yang sudah ada. Lanjutkan?',
        confirmText: 'Ya, Ubah',
        variant: 'danger',
      });
      if (!ok) return;
    }

    setIsTestComputationalThinking(enabled);
    setIsSavingCTMode(true);
    try {
      if (activeBank.apiId) {
        if (enabled) {
          if (activeBank.type === 'pretest') {
            await adminPretestApi.deleteAllQuestions(activeBank.apiId);
          } else {
            await adminPosttestApi.deleteAllQuestions(activeBank.apiId);
          }
          setBanks((p) =>
            p.map((b) =>
              b.id !== activeBank.id
                ? b
                : { ...b, questions: [], ctStories: [makeCTStory()] },
            ),
          );
        } else {
          if (activeBank.type === 'pretest') {
            await adminPretestApi.deleteAllQuestions(activeBank.apiId);
          } else {
            await adminPosttestApi.deleteAllQuestions(activeBank.apiId);
          }
          setBanks((p) =>
            p.map((b) =>
              b.id !== activeBank.id
                ? b
                : {
                    ...b,
                    ctStories: [],
                    questions: [
                      {
                        id: Date.now(),
                        apiSoalId: null,
                        pertanyaan: '',
                        isExpanded: true,
                        skor: 10,
                        answers: [
                          { id: Date.now() + 10, text: '', isCorrect: false },
                          { id: Date.now() + 11, text: '', isCorrect: false },
                          { id: Date.now() + 12, text: '', isCorrect: false },
                        ],
                      },
                    ],
                  },
            ),
          );
        }
      }

      await adminModulApi.update(modulId, { isTestComputationalThinking: enabled } as any);
      toast(`Mode Computational Thinking ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
    } catch {
      toast('Gagal menyimpan pengaturan CT.', 'error');
      setIsTestComputationalThinking(!enabled);
    } finally {
      setIsSavingCTMode(false);
    }
  };

  const handleSaveNewBank = useCallback(async () => {
    if (!modulId) { toast('Simpan profil modul terlebih dahulu.', 'error'); return; }
    const name = newBankName.trim() || `Bank Soal ${banks.length + 1}`;
    const nid = Date.now();
    setIsCreatingBank(true);
    try {
      let apiId: string | null = null;
      if (newBankType === 'pretest') {
        const created = await adminPretestApi.create({ modul_id: modulId });
        apiId = created.id;
      } else {
        const created = await adminPosttestApi.create({ modul_id: modulId });
        apiId = created.id;
      }
      setBanks((p) => [...p, { id: nid, name, type: newBankType, apiId, questions: [], ctStories: [] }]);
      setNewBankName(''); setNewBankType('pretest'); setIsCreating(false);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Gagal membuat bank soal.', 'error');
    } finally { setIsCreatingBank(false); }
  }, [modulId, newBankName, newBankType, banks.length, toast]);

  const handleDeleteBank = useCallback(async (id: number) => {
    const bank = banks.find((b) => b.id === id);
    if (bank?.apiId) {
      try {
        if (bank.type === 'pretest') await adminPretestApi.delete(bank.apiId);
        else await adminPosttestApi.delete(bank.apiId);
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : 'Gagal menghapus bank soal.', 'error'); return;
      }
    }
    setBanks((p) => p.filter((b) => b.id !== id));
    setOpenMenuId(null);
    if (activeBankId === id) setActiveBankId(null);
  }, [banks, activeBankId, toast]);

  const handleAddQuestion = () => {
    if (!activeBankId) return;
    const nid = Date.now();
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: [...b.questions, {
        id: nid, apiSoalId: null, pertanyaan: '', isExpanded: true, skor: 10,
        answers: [{ id: nid + 10, text: '', isCorrect: false }, { id: nid + 11, text: '', isCorrect: false }, { id: nid + 12, text: '', isCorrect: false }],
      }],
    }));
  };

  const handleAddCTStory = () => {
    if (!activeBankId) return;
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, ctStories: [...b.ctStories, makeCTStory()] }));
  };

  const handleDeleteQuestion = useCallback(async (qId: number) => {
    if (!activeBank) return;
    const question = activeBank.questions.find((q) => q.id === qId);
    if (question?.apiSoalId) {
      try {
        if (activeBank.type === 'pretest') await adminPretestApi.deleteSoal(question.apiSoalId);
        else await adminPosttestApi.deleteSoal(question.apiSoalId);
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : 'Gagal menghapus soal.', 'error'); return;
      }
    }
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.filter((q) => q.id !== qId) }));
  }, [activeBank, activeBankId, toast]);

  const handleDeleteCTStory = useCallback(async (storyId: number) => {
    if (!activeBank) return;
    const story = activeBank.ctStories.find((s) => s.id === storyId);
    if (story) {
      for (const sq of story.subQuestions) {
        if (sq.apiSoalId) {
          try {
            if (activeBank.type === 'pretest') await adminPretestApi.deleteSoal(sq.apiSoalId);
            else await adminPosttestApi.deleteSoal(sq.apiSoalId);
          } catch { /* ignore */ }
        }
      }
    }
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, ctStories: b.ctStories.filter((s) => s.id !== storyId) }));
  }, [activeBank, activeBankId]);

  const handleToggleCorrect = (qId: number, aId: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: b.questions.map((q) => q.id !== qId ? q : { ...q, answers: q.answers.map((a) => ({ ...a, isCorrect: a.id === aId })) }),
    }));
  };
  const handleRemoveAnswer = (qId: number, aId: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: b.questions.map((q) => q.id !== qId ? q : { ...q, answers: q.answers.filter((a) => a.id !== aId) }),
    }));
  };
  const handleAddAnswer = (qId: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: b.questions.map((q) => q.id !== qId ? q : { ...q, answers: [...q.answers, { id: Date.now(), text: '', isCorrect: false }] }),
    }));
  };
  const handleUpdateQuestionText = (qId: number, text: string) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: b.questions.map((q) => q.id === qId ? { ...q, pertanyaan: text } : q),
    }));
  };
  const handleUpdateSkor = (qId: number, skor: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: b.questions.map((q) => q.id === qId ? { ...q, skor } : q),
    }));
  };
  const handleUpdateAnswerText = (qId: number, aId: number, text: string) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, questions: b.questions.map((q) => q.id !== qId ? q : { ...q, answers: q.answers.map((a) => a.id === aId ? { ...a, text } : a) }),
    }));
  };

  // CT story update helpers
  const handleUpdateCTCerita = (storyId: number, cerita: string) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, ctStories: b.ctStories.map((s) => s.id === storyId ? { ...s, cerita } : s),
    }));
  };
  const handleUpdateCTAnswer = (storyId: number, sqId: number, aId: number, text: string) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, ctStories: b.ctStories.map((s) => s.id !== storyId ? s : {
        ...s, subQuestions: s.subQuestions.map((sq) => sq.id !== sqId ? sq : {
          ...sq, answers: sq.answers.map((a) => a.id === aId ? { ...a, text } : a),
        }),
      }),
    }));
  };
  const handleToggleCTCorrect = (storyId: number, sqId: number, aId: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, ctStories: b.ctStories.map((s) => s.id !== storyId ? s : {
        ...s, subQuestions: s.subQuestions.map((sq) => sq.id !== sqId ? sq : {
          ...sq, answers: sq.answers.map((a) => ({ ...a, isCorrect: a.id === aId })),
        }),
      }),
    }));
  };
  const handleAddCTAnswer = (storyId: number, sqId: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, ctStories: b.ctStories.map((s) => s.id !== storyId ? s : {
        ...s, subQuestions: s.subQuestions.map((sq) => sq.id !== sqId ? sq : {
          ...sq, answers: [...sq.answers, { id: Date.now(), text: '', isCorrect: false }],
        }),
      }),
    }));
  };
  const handleRemoveCTAnswer = (storyId: number, sqId: number, aId: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, ctStories: b.ctStories.map((s) => s.id !== storyId ? s : {
        ...s, subQuestions: s.subQuestions.map((sq) => sq.id !== sqId ? sq : {
          ...sq, answers: sq.answers.filter((a) => a.id !== aId),
        }),
      }),
    }));
  };
  const handleUpdateCTSkor = (storyId: number, sqId: number, skor: number) => {
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
      ...b, ctStories: b.ctStories.map((s) => s.id !== storyId ? s : {
        ...s, subQuestions: s.subQuestions.map((sq) => sq.id !== sqId ? sq : { ...sq, skor }),
      }),
    }));
  };

  const handleSaveQuestion = useCallback(async (question: LocalQuestion) => {
    if (!activeBank?.apiId) { toast('Bank soal belum tersimpan.', 'error'); return; }
    if (!question.pertanyaan.trim()) { toast('Pertanyaan tidak boleh kosong.', 'error'); return; }
    const correctAns = question.answers.find((a) => a.isCorrect);
    if (!correctAns?.text.trim()) { toast('Pilih dan isi jawaban yang benar.', 'error'); return; }
    const filledAnswers = question.answers.filter((a) => a.text.trim());
    if (filledAnswers.length < 2) { toast('Minimal 2 pilihan jawaban harus diisi.', 'error'); return; }

    setIsSaving(true);
    try {
      const payload = { pertanyaan: question.pertanyaan, pilihan: filledAnswers.map((a) => a.text), jawaban_benar: correctAns.text, skor: question.skor };
      if (question.apiSoalId) {
        if (activeBank.type === 'pretest') await adminPretestApi.updateSoal(question.apiSoalId, payload);
        else await adminPosttestApi.updateSoal(question.apiSoalId, payload);
      } else {
        if (activeBank.type === 'pretest') await adminPretestApi.addSoal({ pretest_id: activeBank.apiId, ...payload });
        else await adminPosttestApi.addSoal({ posttest_id: activeBank.apiId, ...payload });
      }
      setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
        ...b, questions: b.questions.map((q) => q.id === question.id ? { ...q, isExpanded: false } : q),
      }));
      toast('Soal berhasil disimpan!', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan soal.', 'error');
    } finally { setIsSaving(false); }
  }, [activeBank, activeBankId, toast]);

  const handleSaveCTStory = useCallback(async (story: LocalCTStory) => {
    if (!activeBank?.apiId) { toast('Bank soal belum tersimpan.', 'error'); return; }
    if (!story.cerita.trim()) { toast('Cerita/konteks CT tidak boleh kosong.', 'error'); return; }
    for (const sq of story.subQuestions) {
      const filled = sq.answers.filter((a) => a.text.trim());
      if (filled.length < 2) { toast('Setiap sub-soal minimal 2 pilihan jawaban.', 'error'); return; }
      const correct = sq.answers.find((a) => a.isCorrect);
      if (!correct?.text.trim()) { toast('Setiap sub-soal harus memiliki jawaban benar.', 'error'); return; }
    }

    setIsSaving(true);
    try {
      const updatedSubIds: Record<number, string> = {};
      for (const sq of story.subQuestions) {
        const payload: any = {
          pertanyaan: story.cerita,
          pilihan: sq.answers.filter((a) => a.text.trim()).map((a) => a.text),
          jawaban_benar: sq.answers.find((a) => a.isCorrect)?.text || '',
          skor: sq.skor,
          ctGroupId: story.groupId,
          ctStory: story.cerita,
          ctAspect: sq.ctAspect,
        };
        if (activeBank.type === 'pretest') {
          payload.pretest_id = activeBank.apiId;
        } else {
          payload.posttest_id = activeBank.apiId;
        }

        if (sq.apiSoalId) {
          if (activeBank.type === 'pretest') await adminPretestApi.updateSoal(sq.apiSoalId, payload);
          else await adminPosttestApi.updateSoal(sq.apiSoalId, payload);
        } else {
          let result: any;
          if (activeBank.type === 'pretest') result = await adminPretestApi.addSoal(payload);
          else result = await adminPosttestApi.addSoal(payload);
          if (result?.id) updatedSubIds[sq.id] = result.id;
        }
      }

      setBanks((p) => p.map((b) => b.id !== activeBankId ? b : {
        ...b, ctStories: b.ctStories.map((s) => s.id !== story.id ? s : {
          ...s,
          isExpanded: false,
          subQuestions: s.subQuestions.map((sq) =>
            updatedSubIds[sq.id] ? { ...sq, apiSoalId: updatedSubIds[sq.id] } : sq
          ),
        }),
      }));
      toast('Soal CT berhasil disimpan!', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan soal CT.', 'error');
    } finally { setIsSaving(false); }
  }, [activeBank, activeBankId, toast]);

  const handleSaveSettings = useCallback(async () => {
    if (!settingsTargetBank?.apiId) { setIsSettingsOpen(false); return; }
    setIsSaving(true);
    try {
      if (settingsTargetBank.type === 'pretest') {
        await adminPretestApi.updateSettings(settingsTargetBank.apiId, { duration: settingsDuration, countShownQuestions: settingsSoalTampil });
      } else {
        await adminPosttestApi.updateSettings(settingsTargetBank.apiId, { duration: settingsDuration, countShownQuestions: settingsSoalTampil });
      }
      toast('Pengaturan berhasil disimpan!', 'success');
      setIsSettingsOpen(false); setSettingsTargetBankId(null);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.', 'error');
    } finally { setIsSaving(false); }
  }, [settingsTargetBank, settingsDuration, settingsSoalTampil, toast]);

  const SettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[500px] rounded-2xl bg-white px-6 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#7054dc]">Pengaturan Bank Soal</h3>
          <button type="button" onClick={() => setIsSettingsOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e3ee] text-[#7a7e8a] hover:bg-[#f5f4fb]"><FiX size={16} /></button>
        </div>
        <div className="mt-5 flex items-center justify-between border-b border-[#f0eff5] pb-4">
          <div><p className="text-[13px] font-semibold text-[#232530]">Durasi Pengerjaan (Menit)</p><p className="mt-1 text-[11px] text-[#7a7e8a]">Batas waktu siswa untuk menyelesaikan</p></div>
          <div className="flex items-center gap-2"><input type="number" value={settingsDuration} onChange={(e) => setSettingsDuration(parseInt(e.target.value) || 0)} className="h-[32px] w-[60px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] outline-none" /><span className="text-[12px] text-[#7a7e8a]">Menit</span></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4">
          <div><p className="text-[13px] font-semibold text-[#232530]">Jumlah Soal Tampil</p><p className="mt-1 text-[11px] text-[#7a7e8a]">Jumlah soal acak dari bank soal</p></div>
          <div className="flex items-center gap-2"><input type="number" value={settingsSoalTampil} onChange={(e) => setSettingsSoalTampil(parseInt(e.target.value) || 0)} className="h-[32px] w-[60px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] outline-none" /><span className="text-[12px] text-[#7a7e8a]">Soal</span></div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button type="button" onClick={() => setIsSettingsOpen(false)} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
          <button type="button" onClick={handleSaveSettings} disabled={isSaving} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6fb]">
        <AdminHeader />
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
        </div>
      </div>
    );
  }

  /* Detail view (inside a bank) */
  if (activeBank) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <AdminHeader />
        <main className="flex w-full">
          <AdminModuleSidebar basePath="/admin/tambah-modul" modulId={modulId ?? undefined} title="Tambah Modul" showSiswaTab={false} />
          <section className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setActiveBankId(null)} className="mb-4 text-[12px] font-medium text-[#7054dc]">← Kembali ke Daftar Bank Soal</button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece7ff] text-[#7054dc]"><FiCheckSquare size={18} /></div>
              <h1 className="text-[18px] font-bold text-[#232530]">Pre - Post Test Modul</h1>
            </div>

            <div className="mt-6">
              <div className="rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-semibold text-[#232530]">{activeBank.name}</p>
                  <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold ${activeBank.type === 'pretest' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {activeBank.type === 'pretest' ? 'Pre Test' : 'Post Test'}
                  </span>
                  <button type="button" onClick={() => { setSettingsTargetBankId(activeBank.id); setIsSettingsOpen(true); }} className="text-[#7a7e8a] hover:text-[#7054dc]"><FiSettings size={14} /></button>
                  <button type="button" onClick={() => { handleDeleteBank(activeBank.id); }} className="ml-auto text-[#7a7e8a] hover:text-red-500"><FiTrash2 size={14} /></button>
                </div>
              </div>

              {/* CT Mode Toggle — only visible when inside a bank */}
              {modulId && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-[#e5e3ee] bg-white px-4 py-3">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#232530]">Mode Computational Thinking</p>
                    <p className="text-[11px] text-[#7a7e8a]">Aktifkan untuk menambahkan soal CT (Dekomposisi, Pola, Abstraksi, Algoritma)</p>
                  </div>
                  <button
                    type="button"
                    disabled={isSavingCTMode}
                    onClick={() => handleToggleCTMode(!isTestComputationalThinking)}
                    className={`relative h-[28px] w-[52px] shrink-0 rounded-full transition-colors ${isTestComputationalThinking ? 'bg-[#7054dc]' : 'bg-[#d9d7df]'} disabled:opacity-50`}
                  >
                    <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${isTestComputationalThinking ? 'left-[27px]' : 'left-[3px]'}`} />
                  </button>
                </div>
              )}

              {/* Regular questions */}
              <div className="mt-5 space-y-4">
                {activeBank.questions.map((question, idx) => (
                  <div key={question.id} className="rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-semibold text-[#232530]">Soal {idx + 1}:</span>
                        {editingSoalId === question.id ? (
                          <>
                            <input type="text" value={editSoalTitle} onChange={(e) => setEditSoalTitle(e.target.value)} className="h-[30px] w-[240px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] outline-none focus:border-[#7054dc]" onKeyDown={(e) => { if (e.key === 'Enter') { handleUpdateQuestionText(question.id, editSoalTitle); setEditingSoalId(null); } }} />
                            <button type="button" onClick={() => { handleUpdateQuestionText(question.id, editSoalTitle); setEditingSoalId(null); }} className="text-[12px] font-semibold text-[#7054dc]">Simpan</button>
                          </>
                        ) : (
                          <>
                            <span className="text-[12px] font-semibold text-[#232530]">{question.pertanyaan || '(belum ada pertanyaan)'}</span>
                            <button type="button" onClick={() => { setEditingSoalId(question.id); setEditSoalTitle(question.pertanyaan); }} className="text-[#7a7e8a]"><FiEdit2 size={14} /></button>
                          </>
                        )}
                        <button type="button" onClick={() => handleDeleteQuestion(question.id)} className="text-[#7a7e8a] hover:text-red-500"><FiTrash2 size={14} /></button>
                      </div>
                      <button type="button" onClick={() => setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.map((q) => q.id === question.id ? { ...q, isExpanded: !q.isExpanded } : q) }))} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]">
                        <FiChevronDown size={16} className={`transition-transform ${question.isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {question.isExpanded && (
                      <div className="mt-4">
                        <p className="mb-2 text-[12px] font-semibold text-[#232530]">Pertanyaan</p>
                        <MiniEditor placeholder="Masukkan pertanyaan..." value={question.pertanyaan} onChange={(html) => handleUpdateQuestionText(question.id, html)} />

                        <div className="mt-4 flex items-center gap-3">
                          <p className="text-[12px] font-semibold text-[#232530]">Skor:</p>
                          <input type="number" value={question.skor} onChange={(e) => handleUpdateSkor(question.id, parseInt(e.target.value) || 0)} min={0} max={100} className="h-[32px] w-[70px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] outline-none focus:border-[#7054dc]" />
                          <span className="text-[11px] text-[#7a7e8a]">Poin</span>
                        </div>

                        <p className="mb-2 mt-4 text-[12px] font-semibold text-[#232530]">Pilihan Jawaban</p>
                        <div className="space-y-2">
                          {question.answers.map((ans) => (
                            <div key={ans.id} className="flex items-center gap-2">
                              <button type="button" onClick={() => handleToggleCorrect(question.id, ans.id)} className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${ans.isCorrect ? 'border-[#7054dc] bg-[#7054dc]' : 'border-[#d9d7df] bg-white'}`}>
                                {ans.isCorrect && <span className="h-2 w-2 rounded-full bg-white" />}
                              </button>
                              <input type="text" value={ans.text} onChange={(e) => handleUpdateAnswerText(question.id, ans.id, e.target.value)} placeholder="Masukkan jawaban" className={`h-[36px] flex-1 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-[#7054dc] ${ans.isCorrect ? 'border-[#7054dc]' : 'border-[#e5e3ee]'}`} />
                              <button type="button" onClick={() => handleRemoveAnswer(question.id, ans.id)} className="text-[#7a7e8a] hover:text-red-500"><FiX size={16} /></button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => handleAddAnswer(question.id)} className="mt-2 text-[11px] font-semibold text-[#7054dc]">+ Tambah opsi jawaban</button>

                        <div className="mt-4 flex justify-end">
                          <button type="button" onClick={() => handleSaveQuestion(question)} disabled={isSaving} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">
                            {isSaving ? 'Menyimpan...' : 'Simpan Soal'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CT Stories */}
              {activeBank.ctStories.length > 0 && (
                <div className="mt-5 space-y-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-[#7054dc]">Soal Computational Thinking</p>
                  {activeBank.ctStories.map((story, si) => (
                    <div key={story.id} className="rounded-2xl border-2 border-[#c8b8f8] bg-white px-5 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#7054dc]">CT Story {si + 1}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, ctStories: b.ctStories.map((s) => s.id === story.id ? { ...s, isExpanded: !s.isExpanded } : s) }))} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]">
                            <FiChevronDown size={16} className={`transition-transform ${story.isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <button type="button" onClick={() => handleDeleteCTStory(story.id)} className="text-[#7a7e8a] hover:text-red-500"><FiTrash2 size={14} /></button>
                        </div>
                      </div>

                      {story.isExpanded && (
                        <div className="mt-4">
                          <p className="mb-2 text-[12px] font-semibold text-[#232530]">Cerita / Konteks</p>
                          <MiniEditor placeholder="Masukkan cerita/konteks soal CT..." value={story.cerita} onChange={(html) => handleUpdateCTCerita(story.id, html)} />

                          <div className="mt-4 space-y-4">
                            {story.subQuestions.map((sq, sqi) => (
                              <div key={sq.id} className="rounded-xl border border-[#e8e3ff] bg-[#faf8ff] p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ece7ff] px-2 py-1 text-[10px] font-bold text-[#7054dc]">
                                    Sub-soal {sqi + 1}: {sq.ctAspect}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-[#7a7e8a]">Skor:</span>
                                    <input type="number" value={sq.skor} onChange={(e) => handleUpdateCTSkor(story.id, sq.id, parseInt(e.target.value) || 0)} min={0} max={100} className="h-[28px] w-[55px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[11px] outline-none" />
                                  </div>
                                </div>
                                <p className="mb-2 text-[11px] font-semibold text-[#6e7280]">Pilihan Jawaban</p>
                                <div className="space-y-2">
                                  {sq.answers.map((ans) => (
                                    <div key={ans.id} className="flex items-center gap-2">
                                      <button type="button" onClick={() => handleToggleCTCorrect(story.id, sq.id, ans.id)} className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${ans.isCorrect ? 'border-[#7054dc] bg-[#7054dc]' : 'border-[#d9d7df] bg-white'}`}>
                                        {ans.isCorrect && <span className="h-2 w-2 rounded-full bg-white" />}
                                      </button>
                                      <input type="text" value={ans.text} onChange={(e) => handleUpdateCTAnswer(story.id, sq.id, ans.id, e.target.value)} placeholder="Masukkan jawaban" className={`h-[34px] flex-1 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-[#7054dc] ${ans.isCorrect ? 'border-[#7054dc]' : 'border-[#e5e3ee]'}`} />
                                      <button type="button" onClick={() => handleRemoveCTAnswer(story.id, sq.id, ans.id)} className="text-[#7a7e8a] hover:text-red-500"><FiX size={14} /></button>
                                    </div>
                                  ))}
                                </div>
                                <button type="button" onClick={() => handleAddCTAnswer(story.id, sq.id)} className="mt-2 text-[11px] font-semibold text-[#7054dc]">+ Tambah opsi</button>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button type="button" onClick={() => handleSaveCTStory(story)} disabled={isSaving} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">
                              {isSaving ? 'Menyimpan...' : 'Simpan Soal CT'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-4">
                <button type="button" onClick={handleAddQuestion} className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#f39b39]">
                  Tambah Soal <FiPlus size={14} />
                </button>
                <button type="button" onClick={handleAddCTStory} className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#7054dc]">
                  + Soal CT <FiPlus size={14} />
                </button>
              </div>
            </div>
            {isSettingsOpen && <SettingsModal />}
          </section>
        </main>
      </div>
    );
  }

  /* Cards view */
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <AdminHeader />
      <main className="flex w-full">
        <AdminModuleSidebar basePath="/admin/tambah-modul" modulId={modulId ?? undefined} title="Tambah Modul" showSiswaTab={false} />
        <section className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece7ff] text-[#7054dc]"><FiCheckSquare size={18} /></div>
            <div>
              <h1 className="text-[18px] font-bold text-[#232530]">Pre - Post Test Modul</h1>
              <p className="text-[12px] text-[#7a7e8a]">Buat soal evaluasi awal dan akhir modul</p>
            </div>
          </div>
          {!modulId && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">Simpan profil modul terlebih dahulu untuk membuat bank soal.</div>}

          {banks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {banks.map((bank) => (
                <div key={bank.id} onClick={() => setActiveBankId(bank.id)} className="group relative h-[130px] w-[170px] cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#c8b8f8] to-[#ddd4fa] p-4 transition-transform hover:scale-[1.03]">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#7054dc] text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </span>
                    <div className="relative">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === bank.id ? null : bank.id); }} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#7054dc] opacity-70 hover:bg-white/30 hover:opacity-100"><FiMoreVertical size={16} /></button>
                      {openMenuId === bank.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-[130px] rounded-xl border border-[#eceaf4] bg-white p-1.5 shadow-md" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => { setActiveBankId(bank.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#232530] hover:bg-[#f7f6ff]"><FiEdit2 size={13} />Sunting</button>
                          <button type="button" onClick={() => handleDeleteBank(bank.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50"><FiTrash2 size={13} />Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <svg className="absolute bottom-0 left-0 right-0 opacity-20" viewBox="0 0 170 50" fill="none"><path d="M0 30 Q40 10 85 25 T170 20 V50 H0Z" fill="#7054dc" /></svg>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[13px] font-semibold text-white">{bank.name}</p>
                    <p className="text-[10px] text-white/70">{bank.type === 'pretest' ? 'Pre Test' : 'Post Test'} • {bank.questions.length + bank.ctStories.length} soal</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isCreating ? (
            <div className="mt-6 w-[400px] rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
              <p className="text-[13px] font-semibold text-[#232530]">Nama Bank Soal</p>
              <input type="text" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder={`Bank Soal ${banks.length + 1}`} className="mt-2 h-[36px] w-full rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNewBank(); }} />
              <p className="mt-3 text-[13px] font-semibold text-[#232530]">Tipe Tes</p>
              <div className="mt-2 flex items-center gap-4 text-[12px] text-[#6e7280]">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="bankType" checked={newBankType === 'pretest'} onChange={() => setNewBankType('pretest')} /> Pre Test</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="bankType" checked={newBankType === 'posttest'} onChange={() => setNewBankType('posttest')} /> Post Test</label>
              </div>
              <div className="mt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setIsCreating(false); setNewBankName(''); }} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                <button type="button" onClick={handleSaveNewBank} disabled={isCreatingBank} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc] disabled:opacity-50">{isCreatingBank ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <button type="button" onClick={() => setIsCreating(true)} className="inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]">
                Bank Soal <FiPlus size={14} />
              </button>
            </div>
          )}
          {isSettingsOpen && <SettingsModal />}
        </section>
      </main>
    </div>
  );
}

export default function TambahModulPrepostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <AdminPrePostPageContent />
    </Suspense>
  );
}
