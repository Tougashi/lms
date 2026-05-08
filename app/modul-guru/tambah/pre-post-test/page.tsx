'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { FiBookOpen, FiCheckSquare, FiChevronDown, FiDollarSign, FiEdit2, FiFileText, FiLayers, FiMoreVertical, FiPlus, FiSettings, FiTrash2, FiX } from 'react-icons/fi';
import GuruHeader from '../../../component/guru/GuruHeader';

function MiniEditor({ placeholder }: { placeholder: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(true);
  const up = () => setEmpty((ref.current?.textContent?.trim() ?? '').length === 0);
  const cmd = (c: string) => { ref.current?.focus(); document.execCommand(c); up(); };
  return (
    <div className="rounded-xl border border-[#d9d7df] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#e8e9ef] px-3 py-2">
        <button type="button" onClick={() => cmd('bold')} className="inline-flex h-6 w-6 items-center justify-center rounded-md font-semibold text-[#232530] hover:bg-[#f5f4fb]">B</button>
        <button type="button" onClick={() => cmd('italic')} className="inline-flex h-6 w-6 items-center justify-center rounded-md italic text-[#232530] hover:bg-[#f5f4fb]">I</button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#232530] hover:bg-[#f5f4fb]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="11" r="2" fill="currentColor"/><path d="M20 16l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="relative px-3 py-3 text-[12px] text-[#232530]">
        {empty && <span className="pointer-events-none absolute left-3 top-3 text-[11px] text-[#9aa0ad]">{placeholder}</span>}
        <div ref={ref} contentEditable onInput={up} onBlur={up} className="min-h-[80px] outline-none" />
      </div>
    </div>
  );
}

type BankSoal = { id: number; name: string; questions: { id: number; title: string; isExpanded: boolean; answers: { id: number; text: string; isCorrect: boolean }[] }[] };

export default function PrePostTestPage() {
  const [banks, setBanks] = useState<BankSoal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [activeBankId, setActiveBankId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingSoalId, setEditingSoalId] = useState<number | null>(null);
  const [editSoalTitle, setEditSoalTitle] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDuration, setSettingsDuration] = useState(90);
  const [settingsSoalTampil, setSettingsSoalTampil] = useState(30);
  const [aksesRules, setAksesRules] = useState<{ id: number; minScore: number; topik: string }[]>([{ id: 1, minScore: 30, topik: '' }]);

  const activeBank = banks.find((b) => b.id === activeBankId) ?? null;

  const handleSaveNewBank = () => {
    const name = newBankName.trim() || `Bank Soal ${banks.length + 1}`;
    const nid = Date.now();
    setBanks((p) => [...p, { id: nid, name, questions: [{ id: nid + 1, title: 'Biologi Ilmiah mahkluk hidup', isExpanded: true, answers: [{ id: nid + 10, text: '', isCorrect: false }, { id: nid + 11, text: '', isCorrect: false }, { id: nid + 12, text: '', isCorrect: false }] }] }]);
    setNewBankName('');
    setIsCreating(false);
  };

  const handleDeleteBank = (id: number) => { setBanks((p) => p.filter((b) => b.id !== id)); setOpenMenuId(null); };
  const handleAddQuestion = () => {
    if (!activeBankId) return;
    const nid = Date.now();
    setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: [...b.questions, { id: nid, title: 'Biologi Ilmiah mahkluk hidup', isExpanded: true, answers: [{ id: nid + 10, text: '', isCorrect: false }, { id: nid + 11, text: '', isCorrect: false }, { id: nid + 12, text: '', isCorrect: false }] }] }));
  };
  const handleDeleteQuestion = (qId: number) => { setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.filter((q) => q.id !== qId) })); };
  const handleToggleCorrect = (qId: number, aId: number) => { setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.map((q) => q.id !== qId ? q : { ...q, answers: q.answers.map((a) => ({ ...a, isCorrect: a.id === aId })) }) })); };
  const handleRemoveAnswer = (qId: number, aId: number) => { setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.map((q) => q.id !== qId ? q : { ...q, answers: q.answers.filter((a) => a.id !== aId) }) })); };

  const sidebar = (
    <aside className="hidden border border-[#e5e3ee] bg-white px-5 py-6 lg:block lg:min-h-[calc(100vh-74px)]">
      <div className="flex h-full flex-col">
        <p className="text-[13px] font-semibold text-[#232530]">Rencanakan Modul anda</p>
        <nav className="mt-4 space-y-3 text-[13px]">
          <Link href="/modul-guru/tambah/profil" className="flex items-center gap-2 text-[#7a7e8a]"><FiFileText size={12}/>Profil Modul Anda</Link>
          <Link href="/modul-guru/tambah/harga" className="flex items-center gap-2 text-[#7a7e8a]"><FiDollarSign size={12}/>Penetapan Harga Modul</Link>
        </nav>
        <p className="mt-8 text-[13px] font-semibold text-[#232530]">Konten Modul Anda</p>
        <nav className="mt-4 space-y-3 text-[13px]">
          <Link href="/modul-guru/tambah/konten" className="flex items-center gap-2 text-[#7a7e8a]"><FiLayers size={12}/>Konten Modul</Link>
          <div className="flex items-center gap-2 text-[#7054dc]"><FiCheckSquare size={12}/><span className="font-semibold">Pree - Post Test Modul</span></div>
          <Link href="/modul-guru/tambah/sertifikat" className="flex items-center gap-2 text-[#7a7e8a]"><FiBookOpen size={12}/>Capaian Sertifikat</Link>
        </nav>
        <button type="button" className="mt-16 w-full cursor-pointer rounded-full bg-[#f39b39] px-4 py-2.5 text-[12px] font-semibold text-white">Terbitkan Modul</button>
      </div>
    </aside>
  );

  // Detail view for a specific bank soal
  if (activeBank) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
        <GuruHeader />
        <main className="w-full"><div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
          {sidebar}
          <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
            <button type="button" onClick={() => setActiveBankId(null)} className="mb-4 text-[12px] font-medium text-[#7054dc]">← Kembali ke Daftar Bank Soal</button>
            <h1 className="text-[18px] font-semibold text-[#232530]">Pree Test dan Post Tets Modul anda</h1>
            <p className="mt-2 max-w-[620px] text-[12px] leading-[1.6] text-[#7e8290]">Buatlah Pree test dan Post Test Modul anda. anda bisa menggunakan setiap Quis dari Topik yang anda buat di konten modul atau bisa membuat yang baru untuk soal ini.</p>
            <div className="mt-6">
              <p className="text-[14px] font-semibold text-[#232530]">Nama Bank Soal</p>
              <div className="mt-3 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-semibold text-[#232530]">{activeBank.name}</p>
                  <button type="button" onClick={() => setIsSettingsOpen(true)} className="cursor-pointer text-[#7a7e8a] hover:text-[#7054dc]"><FiSettings size={14}/></button>
                  <button type="button" onClick={() => { handleDeleteBank(activeBank.id); setActiveBankId(null); }} className="cursor-pointer text-[#7a7e8a] hover:text-[#e04e4e]"><FiTrash2 size={14}/></button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[14px] font-semibold text-[#232530]">Mulai Buat Soal Pree & Post Test Modul anda</p>
              <div className="mt-4 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                {activeBank.questions.map((question, idx) => (
                  <div key={question.id} className={idx > 0 ? 'mt-6' : ''}>
                    <div className="rounded-2xl border border-[#e5e3ee] px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-semibold text-[#232530]">Soal {idx + 1}:</span>
                          {editingSoalId === question.id ? (<><input type="text" value={editSoalTitle} onChange={(e) => setEditSoalTitle(e.target.value)} className="h-[30px] w-[200px] rounded-md border border-[#d9d7df] bg-white px-2 text-[12px] text-[#232530] outline-none focus:border-[#7054dc]"/><button type="button" onClick={() => { setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.map((q) => q.id === editingSoalId ? { ...q, title: editSoalTitle } : q) })); setEditingSoalId(null); }} className="text-[12px] font-semibold text-[#7054dc]">Simpan</button></>) : (<span className="text-[12px] font-semibold text-[#232530]">{question.title}</span>)}
                          {editingSoalId !== question.id && <button type="button" onClick={() => { setEditingSoalId(question.id); setEditSoalTitle(question.title); }} className="cursor-pointer text-[#7a7e8a]"><FiEdit2 size={14}/></button>}
                          <button type="button" onClick={() => handleDeleteQuestion(question.id)} className="cursor-pointer text-[#7a7e8a]"><FiTrash2 size={14}/></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.map((q) => q.id === question.id ? { ...q, isExpanded: !q.isExpanded } : q) }))} className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"><FiChevronDown size={16} className={`transition-transform ${question.isExpanded ? 'rotate-180' : ''}`}/></button>
                          <button type="button" className="inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[#7a7e8a] hover:bg-[#f5f4fb]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
                        </div>
                      </div>
                    </div>
                    {question.isExpanded && (
                      <div className="mt-3">
                        <p className="mb-2 text-[12px] font-semibold text-[#232530]">Soal</p>
                        <MiniEditor placeholder="Masukkan soal ..." />
                        <div className="mt-3 space-y-2">
                          {question.answers.map((ans, aIdx) => (
                            <div key={ans.id} className="flex items-center gap-2">
                              <button type="button" onClick={() => handleToggleCorrect(question.id, ans.id)} className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${ans.isCorrect ? 'border-[#7054dc] bg-[#7054dc]' : 'border-[#d9d7df] bg-white'}`}>{ans.isCorrect && <span className="h-2 w-2 rounded-full bg-white"/>}</button>
                              <input type="text" value={ans.text} onChange={(e) => { const v = e.target.value; setBanks((p) => p.map((b) => b.id !== activeBankId ? b : { ...b, questions: b.questions.map((q) => q.id !== question.id ? q : { ...q, answers: q.answers.map((a) => a.id === ans.id ? { ...a, text: v } : a) }) })); }} placeholder={aIdx < question.answers.length - 1 ? 'Masukkan Jawaban' : 'Tambah Opsi Jawaban'} className={`h-[36px] flex-1 rounded-lg border bg-white px-3 text-[12px] text-[#232530] outline-none focus:border-[#7054dc] ${ans.isCorrect ? 'border-[#7054dc]' : 'border-[#e5e3ee]'}`}/>
                              <button type="button" onClick={() => handleRemoveAnswer(question.id, ans.id)} className="text-[#7a7e8a] hover:text-[#e04e4e]"><FiX size={16}/></button>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-[11px] text-[#7a7e8a]"><span className="font-semibold italic">Catatan:</span> Pilih salah satu opsi untuk jawaban yang benar.</p>
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddQuestion} className="mt-4 text-[12px] font-semibold text-[#f39b39]">Soal Pilihan ganda &nbsp;+</button>
              </div>
            </div>
          </section>
        </div></main>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setIsSettingsOpen(false)}>
            <div className="relative w-[460px] rounded-2xl bg-white px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between"><h3 className="text-[16px] font-semibold text-[#7054dc]">Pengaturan Bank Soal</h3><button type="button" onClick={() => setIsSettingsOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e3ee] text-[#7a7e8a] hover:bg-[#f5f4fb]"><FiX size={16}/></button></div>
              <div className="mt-5 flex items-center justify-between border-b border-[#f0eff5] pb-4"><div><p className="text-[13px] font-semibold text-[#232530]">Durasi Pengerjaan (Menit)</p><p className="mt-1 text-[11px] text-[#7a7e8a]">Batas waktu siswa untuk menyelesaikan kuis</p></div><div className="flex items-center gap-2"><input type="number" value={settingsDuration} onChange={(e) => setSettingsDuration(parseInt(e.target.value) || 0)} className="h-[32px] w-[60px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none"/><span className="text-[12px] text-[#7a7e8a]">Menit</span></div></div>
              <div className="mt-4 flex items-center justify-between border-b border-[#f0eff5] pb-4"><div><p className="text-[13px] font-semibold text-[#232530]">Jumlah Soal Tampil</p><p className="mt-1 text-[11px] text-[#7a7e8a]">Jumlah soal yang akan muncul secara acak dari bank soal</p></div><div className="flex items-center gap-2"><input type="number" value={settingsSoalTampil} onChange={(e) => setSettingsSoalTampil(parseInt(e.target.value) || 0)} className="h-[32px] w-[60px] rounded-lg border border-[#d9d7df] bg-white px-2 text-center text-[12px] text-[#232530] outline-none"/><span className="text-[12px] text-[#7a7e8a]">Soal</span></div></div>
              <div className="mt-4"><p className="text-[13px] font-semibold text-[#232530]">Atur Akses Materi Otomatis</p><div className="mt-3 rounded-xl border border-dashed border-[#8e7bff] bg-[#fbfaff] px-4 py-4">{aksesRules.map((rule) => (<div key={rule.id} className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[#d9d7df] bg-white px-3 py-2.5 last:mb-0"><span className="text-[12px] text-[#232530]">Jika nilai minimal</span><input type="number" value={rule.minScore} onChange={(e) => { const v = parseInt(e.target.value) || 0; setAksesRules((p) => p.map((r) => r.id === rule.id ? { ...r, minScore: v } : r)); }} className="h-[30px] w-[50px] rounded-lg border border-[#d9d7df] bg-white px-1 text-center text-[12px] text-[#232530] outline-none"/><span className="text-[12px] text-[#232530]">Buka akses</span><select value={rule.topik} onChange={(e) => { const v = e.target.value; setAksesRules((p) => p.map((r) => r.id === rule.id ? { ...r, topik: v } : r)); }} className="h-[30px] rounded-lg border border-[#d9d7df] bg-white px-2 text-[12px] text-[#7a7e8a] outline-none"><option value="">Pilih Topik</option><option value="topik1-2">Topik 1 -2</option><option value="topik3">Topik 3</option></select></div>))}<button type="button" onClick={() => setAksesRules((p) => [...p, { id: Date.now(), minScore: 30, topik: '' }])} className="mt-2 text-[12px] font-semibold text-[#7054dc]">Tambahkan aturan lain &nbsp;+</button></div></div>
              <div className="mt-5 flex items-center justify-end gap-3"><button type="button" onClick={() => setIsSettingsOpen(false)} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button><button type="button" onClick={() => setIsSettingsOpen(false)} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Simpan</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Cards view / initial view
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />
      <main className="w-full"><div className="grid w-full gap-8 lg:grid-cols-[260px_1fr]">
        {sidebar}
        <section className="px-4 pb-8 pt-6 sm:px-6 lg:pr-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[#232530]">Bank Soal Pree Test dan Post Tets Modul</h1>
            {banks.length > 0 && <button type="button" onClick={() => setIsSettingsOpen(true)} className="text-[#7a7e8a] hover:text-[#7054dc]"><FiSettings size={18}/></button>}
          </div>
          <p className="mt-2 max-w-[620px] text-[12px] leading-[1.6] text-[#7e8290]">Buatlah Pree test dan Post Test Modul anda. anda bisa menggunakan setiap Quis dari Topik yang anda buat di konten modul atau bisa membuat yang baru untuk soal ini.</p>

          {banks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {banks.map((bank) => (
                <div key={bank.id} onClick={() => setActiveBankId(bank.id)} className="group relative h-[130px] w-[170px] cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#c8b8f8] to-[#ddd4fa] p-4 transition-transform hover:scale-[1.03]">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#7054dc] text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                    <div className="relative">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === bank.id ? null : bank.id); }} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#7054dc] opacity-70 hover:bg-white/30 hover:opacity-100"><FiMoreVertical size={16}/></button>
                      {openMenuId === bank.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-[130px] rounded-xl border border-[#eceaf4] bg-white p-1.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => { setActiveBankId(bank.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#232530] hover:bg-[#f7f6ff]"><FiEdit2 size={13}/>Sunting</button>
                          <button type="button" onClick={() => handleDeleteBank(bank.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#e04e4e] hover:bg-[#fef2f2]"><FiTrash2 size={13}/>Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <svg className="absolute bottom-0 left-0 right-0 opacity-20" viewBox="0 0 170 50" fill="none"><path d="M0 30 Q40 10 85 25 T170 20 V50 H0Z" fill="#7054dc"/></svg>
                  <p className="absolute bottom-3 left-4 text-[13px] font-semibold text-white">{bank.name}</p>
                </div>
              ))}
            </div>
          )}

          {isCreating ? (
            <div className="mt-6 w-[400px] rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
              <p className="text-[13px] font-semibold text-[#232530]">Nama Bank Soal</p>
              <input type="text" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder={`Bank Soal ${banks.length + 1}`} className="mt-2 h-[36px] w-full rounded-lg border border-[#8e7bff] bg-white px-3 text-[12px] text-[#232530] outline-none" autoFocus />
              <div className="mt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setIsCreating(false); setNewBankName(''); }} className="text-[12px] font-semibold text-[#7a7e8a]">Batal</button>
                <button type="button" onClick={handleSaveNewBank} className="inline-flex h-[32px] items-center justify-center rounded-lg bg-[#7054dc] px-5 text-[12px] font-semibold text-white hover:bg-[#5f46cc]">Simpan</button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <button type="button" onClick={() => setIsCreating(true)} className="inline-flex h-[40px] w-[160px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8e7bff] bg-white text-[12px] font-semibold text-[#7054dc]">Bank Soal <FiPlus size={14}/></button>
            </div>
          )}
        </section>
      </div></main>
    </div>
  );
}
