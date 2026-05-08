'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  FaBell,
  FaCheckSquare,
  FaFilter,
  FaRegSquare,
  FaSearch,
  FaTrash,
  FaEdit,
  FaBook,
} from 'react-icons/fa';
import { FaHeadset } from 'react-icons/fa6';
import { IoPersonCircle } from 'react-icons/io5';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdMoreVert,
  MdOutlineKeyboardArrowDown,
  MdPersonAddAlt1,
  MdSupervisorAccount,
  MdGroupAdd,
} from 'react-icons/md';
import AdminSidebar from '../components/AdminSidebar';

type ActiveTab = 'modul' | 'kuis';

type ModuleRow = {
  id: string;
  title: string;
  teacher: string;
  students: string;
};

const moduleRows: ModuleRow[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `module-${index + 1}`,
  title: index % 2 === 0 ? 'Biologi Terapan' : 'Matematika Dasar',
  teacher: index % 2 === 0 ? 'Aryanti Yusi S.Pd' : 'Yinar Susi S.Pd',
  students: index % 2 === 0 ? '67 Siswa' : '89 Siswa',
}));

const quizRows: ModuleRow[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `quiz-${index + 1}`,
  title: index % 2 === 0 ? 'Pre-Test Sel' : 'Latihan Kelipatan',
  teacher: index % 2 === 0 ? 'Aryanti Yusi S.Pd' : 'Yinar Susi S.Pd',
  students: index % 2 === 0 ? '67 Siswa' : '89 Siswa',
}));

const filterOptions = [
  { id: 'a-z', label: 'Urutkan A - Z' },
  { id: 'z-a', label: 'Urutkan Z - A' },
  { id: 'judul', label: 'Urutkan dengan Judul Modul' },
  { id: 'guru', label: 'Urutkan dengan Guru Modul' },
  { id: 'siswa', label: 'Urutkan dengan Jumlah Siswa' },
];

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'purple' | 'orange';
}) {
  const isPurple = accent === 'purple';

  return (
    <div
      className={`relative min-h-[110px] overflow-hidden rounded-[22px] p-4 shadow-sm ${
        isPurple ? 'bg-[#e9e2ff]' : 'bg-[#f9eddc]'
      }`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border bg-white ${
            isPurple ? 'border-[#7054dc] text-[#7054dc]' : 'border-[#f39b39] text-[#f39b39]'
          }`}
        >
          <FaBook size={13} />
        </div>
        <div className={`ml-auto -mt-1 text-4xl font-semibold leading-none ${isPurple ? 'text-[#7054dc]' : 'text-[#f39b39]'}`}>
          {value}
        </div>
        <p className="mt-auto max-w-[120px] pb-1 text-sm font-semibold text-[#202126]">{label}</p>
      </div>

      <div className="pointer-events-none absolute -bottom-6 -right-3 opacity-70">
        <Image
          src={isPurple ? '/assets/images/beranda-siswa/star-purple.png' : '/assets/images/beranda-siswa/star-orange.png'}
          alt="Decorative star"
          width={96}
          height={96}
        />
      </div>
    </div>
  );
}

function ActionMenu() {
  return (
    <div className="absolute right-0 top-9 z-30 w-[168px] rounded-2xl border border-[#e6e8ef] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f39b39] hover:bg-[#fff8ef]">
        <FaEdit size={13} />
        Edit
      </button>
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#7054dc] hover:bg-[#f7f6ff]">
        <MdSupervisorAccount size={14} />
        Management Siswa
      </button>
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#7054dc] hover:bg-[#f7f6ff]">
        <MdGroupAdd size={14} />
        Tambah Siswa
      </button>
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#f36e65] hover:bg-[#fff3f2]">
        <FaTrash size={13} />
        Hapus
      </button>
    </div>
  );
}

export default function ManajemenModulPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('modul');
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['a-z', 'judul']);

  const currentRows = activeTab === 'modul' ? moduleRows : quizRows;
  const currentRowIds = currentRows.map((row) => row.id);
  const allRowsSelected = currentRowIds.length > 0 && currentRowIds.every((id) => selectedRowIds[id]);

  const toggleSelectAll = () => {
    setSelectedRowIds((prev) => {
      const next = { ...prev };
      if (allRowsSelected) {
        currentRowIds.forEach((id) => {
          delete next[id];
        });
      } else {
        currentRowIds.forEach((id) => {
          next[id] = true;
        });
      }
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFilterOption = (id: string) => {
    setSelectedFilters((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f3f3f6]">
      <div className="grid h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <AdminSidebar active="modul" />

        <main className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#202126]">Selamat datang, Olivia</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#7054dc] sm:text-4xl lg:text-5xl">
                Management Modul
              </h1>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-[#dcd9e8] bg-white px-4 py-3 shadow-sm">
              <FaBell className="text-[#9396a3]" size={18} />
              <FaHeadset className="text-[#9396a3]" size={19} />
              <button className="inline-flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1 shadow-sm">
                <IoPersonCircle size={24} className="text-[#7054dc]" />
                <MdOutlineKeyboardArrowDown size={16} className="text-[#8a8a96]" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_420px] xl:items-start">
            <div className="flex items-center gap-2 px-2 pt-1 xl:pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('modul')}
                className={`rounded-full px-7 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'modul' ? 'bg-[#7054dc] text-white' : 'bg-[#ece7ff] text-[#7054dc]'
                }`}
              >
                Modul
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kuis')}
                className={`rounded-full px-7 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'kuis' ? 'bg-[#7054dc] text-white' : 'bg-[#ece7ff] text-[#7054dc]'
                }`}
              >
                Kuis
              </button>
            </div>

            <div className="grid w-full max-w-[420px] shrink-0 gap-3 sm:grid-cols-2 xl:ml-auto">
              <StatCard label="Modul" value={136} accent="purple" />
              <StatCard label="Kuis" value={354} accent="orange" />
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-[#e1dff0] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#f39b39] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  <MdPersonAddAlt1 size={14} />
                  Tambah Modul
                </button>
                <label className="flex h-8 w-full max-w-[340px] items-center gap-2 rounded-full border border-[#c8c9d0] bg-white px-3 text-sm text-[#8a8a96] sm:w-[320px]">
                  <FaSearch size={12} className="text-[#a0a3b0]" />
                  <input
                    type="text"
                    placeholder="Pencarian"
                    className="w-full bg-transparent text-sm text-[#202126] placeholder:text-[#a0a3b0] outline-none"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  >
                    <FaFilter size={12} />
                    Filter
                  </button>
                  {isFilterOpen && (
                    <div className="absolute right-0 top-11 z-30 w-[300px] rounded-2xl border border-[#7f67de] bg-white p-3 shadow-xl">
                      <p className="text-sm font-semibold text-[#7054dc]">Filter Urutkan Tampilan</p>
                      <div className="mt-2 h-px w-full bg-[#c7b9ff]" />
                      <div className="mt-2 space-y-2">
                        {filterOptions.map((option) => {
                          const isSelected = selectedFilters.includes(option.id);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => toggleFilterOption(option.id)}
                              className="flex items-center gap-2 text-left text-sm text-[#30323a]"
                            >
                              <span className={isSelected ? 'text-[#7054dc]' : 'text-[#a8adb8]'}>
                                {isSelected ? <FaCheckSquare size={15} /> : <FaRegSquare size={15} />}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button className="inline-flex items-center gap-2 rounded-full bg-[#f36e65] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  <FaTrash size={12} />
                  Hapus
                </button>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e9e8f0] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#ebebec] text-[13px] font-medium text-[#9a9ca7]">
                      <th className="w-[52px] px-4 py-3 text-left font-medium">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${
                            allRowsSelected ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#cfd3de] text-[#9aa0ab]'
                          }`}
                        >
                          <FaCheckSquare size={12} />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Judul Modul</th>
                      <th className="px-4 py-3 text-left font-medium">Guru Modul</th>
                      <th className="px-4 py-3 text-left font-medium">Jumlah Siswa</th>
                      <th className="px-4 py-3 text-left font-medium">Sunting Modul</th>
                      <th className="w-[48px] px-4 py-3 text-left font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row) => (
                      <tr key={row.id} className="border-t border-[#eef0f5] text-sm text-[#4d5260]">
                        <td className="px-4 py-3 align-middle">
                          <button
                            type="button"
                            onClick={() => toggleRow(row.id)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border ${
                              selectedRowIds[row.id]
                                ? 'border-[#7054dc] bg-[#7054dc] text-white'
                                : 'border-[#cfd3de] text-[#9aa0ab]'
                            }`}
                          >
                            <FaCheckSquare size={12} />
                          </button>
                        </td>
                        <td className="px-4 py-3 align-middle font-medium text-[#5a5f6a]">{row.title}</td>
                        <td className="px-4 py-3 align-middle">{row.teacher}</td>
                        <td className="px-4 py-3 align-middle">{row.students}</td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                            <button className="inline-flex items-center gap-1 text-[#f39b39]">
                              <FaEdit size={12} />
                              Edit
                            </button>
                            <button className="inline-flex items-center gap-1 text-[#7054dc]">
                              <MdSupervisorAccount size={13} />
                              Management Siswa
                            </button>
                            <button className="inline-flex items-center gap-1 text-[#7054dc]">
                              <MdGroupAdd size={13} />
                              Tambah Siswa
                            </button>
                            <button className="inline-flex items-center gap-1 text-[#f36e65]">
                              <FaTrash size={12} />
                              Hapus
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-right">
                          <div className="relative inline-flex">
                            <button
                              type="button"
                              onClick={() => setOpenActionMenuId((prev) => (prev === row.id ? null : row.id))}
                              className="text-[#8d909c] hover:text-[#7054dc]"
                            >
                              <MdMoreVert size={18} />
                            </button>
                            {openActionMenuId === row.id && <ActionMenu />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-1 text-[#b4b6bf]">
                  <button className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#c6c8d0]">
                    <MdKeyboardArrowLeft size={16} />
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                        page === 1 ? 'border-[#7054dc] bg-[#7054dc] text-white' : 'border-[#d4d7e2] text-[#818694]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#7054dc]">
                    <MdKeyboardArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
