"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FaBell,
  FaBookOpen,
  FaCheck,
  FaCheckSquare,
  FaRegSquare,
  FaDatabase,
  FaEllipsisV,
  FaRegEdit,
  FaFilter,
  FaHistory,
  FaPaperPlane,
  FaSearch,
  FaTrash,
  FaChartBar,
} from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";
import { IoPersonCircle } from "react-icons/io5";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight, MdPersonAddAlt1 } from "react-icons/md";
import AdminSidebar from "../components/AdminSidebar";

type AdminTab = "guru" | "siswa" | "modul" | "kuis";

const guruRows = Array.from({ length: 10 }).map((_, index) => ({
  id: `guru-${index + 1}`,
  name: "Yosida",
  phone: "0823 1234 1234",
  email: "Yosida@gmail.com",
}));

const siswaRows = Array.from({ length: 10 }).map((_, index) => ({
  id: `siswa-${index + 1}`,
  name: "Yosida",
  phone: "0823 1234 1234",
  email: "Yosida@gmail.com",
}));

const modulRows = Array.from({ length: 10 }).map((_, index) => ({
  id: `modul-${index + 1}`,
  moduleName: "Biologi Terapan",
  teacherName: "Budi Santoso",
  studentCount: 50,
}));

const kuisRows = Array.from({ length: 10 }).map((_, index) => ({
  id: `kuis-${index + 1}`,
  quizName: "Pre-Test Sel",
  moduleName: "Biologi",
  teacherName: "Budi Santoso",
}));

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "purple" | "orange";
}) {
  const isPurple = accent === "purple";
  return (
    <div className={`relative min-h-[128px] overflow-hidden rounded-[22px] p-4 shadow-sm ${isPurple ? "bg-[#e9e2ff]" : "bg-[#f9eddc]"}`}>
      <div className="relative z-10 flex h-full flex-col">
        <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border bg-white ${isPurple ? "border-[#7054dc]" : "border-[#f39b39]"}`}>
          <FaBookOpen size={16} className={isPurple ? "text-[#7054dc]" : "text-[#f39b39]"} />
        </div>
        <p className={`ml-auto -mt-1 text-4xl font-semibold leading-none ${isPurple ? "text-[#7054dc]" : "text-[#f39b39]"}`}>{value}</p>
        <p className="mt-auto max-w-[160px] pb-1 text-[1.02rem] font-semibold text-[#202126]">{label}</p>
      </div>
      <div className="pointer-events-none absolute -bottom-5 -right-4">
        <Image
          src={isPurple ? "/assets/images/beranda-siswa/star-purple.png" : "/assets/images/beranda-siswa/star-orange.png"}
          alt="Decorative star"
          width={110}
          height={110}
        />
      </div>
    </div>
  );
}

export default function BerandaAdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("siswa");
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["z-a", "nama-lengkap"]);

  const filterOptions = [
    { id: "a-z", label: "Urutkan A - Z" },
    { id: "z-a", label: "Urutkan Z - A" },
    { id: "nama-lengkap", label: "Urutkan dengan Nama Lengkap" },
    { id: "tingkat-pengajar", label: "Urutkan dengan Tingkat Pengajar" },
    { id: "bidang-pengajar", label: "Urutkan dengan Bidang Penagjar" },
    { id: "no-wa", label: "Urutkan dengan No WA Pengguna" },
    { id: "email", label: "Urutkan dengan Email Pengguna" },
  ];

  const toggleRow = (id: string) => {
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleActionMenu = (id: string) => {
    setOpenActionMenuId((prev) => (prev === id ? null : id));
  };

  const toggleFilterOption = (id: string) => {
    setSelectedFilters((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const currentRowIds =
    activeTab === "guru"
      ? guruRows.map((row) => row.id)
      : activeTab === "siswa"
        ? siswaRows.map((row) => row.id)
        : activeTab === "modul"
          ? modulRows.map((row) => row.id)
          : kuisRows.map((row) => row.id);

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

  return (
    <div className="h-screen overflow-hidden bg-[#f3f3f6]">
      <div className="grid h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <AdminSidebar active="dashboard" />

        <main className="mt-8 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#202126]">Selamat datang, Olivia</p>
              <h2 className="mt-1 text-5xl font-bold text-[#7054dc]">Dashboard</h2>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-[#dcd9e8] bg-white px-4 py-3 shadow-sm">
              <FaBell className="text-[#9396a3]" size={18} />
              <RiCustomerService2Line className="text-[#9396a3]" size={19} />
              <button className="inline-flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1">
                <IoPersonCircle size={24} className="text-[#7054dc]" />
                <MdOutlineKeyboardArrowDown size={16} className="text-[#8a8a96]" />
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
            <section>
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#7054dc] bg-white px-5 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#7054dc] text-[#7054dc]">
                      <FaHistory size={13} />
                    </span>
                    <p className="font-semibold text-[#202126]">Aktivitas Admin Terakhir</p>
                    <span className="text-sm text-[#202126]">4 jam lalu</span>
                  </div>
                  <div className="flex items-center gap-2 pl-1 text-sm text-[#202126]">
                    <FaPaperPlane size={11} />
                    <span>Draft Modul Biologi</span>
                  </div>
                </div>
                <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#f39b39]">
                  Lanjutkan
                  <MdOutlineKeyboardArrowRight size={15} />
                </button>
              </div>

              <div className="mb-3 grid w-full grid-cols-4 gap-2">
                {[
                  { id: "guru", label: "Guru" },
                  { id: "siswa", label: "Siswa" },
                  { id: "modul", label: "Modul" },
                  { id: "kuis", label: "Kuis" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#f39b39] text-white"
                        : "bg-[#ece7ff] text-[#7054dc] hover:bg-[#f39b39] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-[#dfdde8] bg-white p-3 shadow-sm">
                <div className="rounded-2xl border border-[#e4e2ec]">
                  <div className="flex items-center justify-end gap-2 border-b border-[#eceaf3] px-3 py-3">
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#7054dc] text-white">
                      <MdPersonAddAlt1 size={16} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setIsFilterOpen((prev) => !prev)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ece7ff] text-[#7054dc]"
                      >
                        <FaFilter size={11} />
                      </button>
                      {isFilterOpen && (
                        <div className="absolute right-0 top-9 z-30 w-[320px] rounded-2xl border-2 border-[#7f67de] bg-white p-3 shadow-xl">
                          <p className="text-sm font-semibold text-[#7054dc]">Filter Urutkan Tampilan</p>
                          <div className="mt-2 h-[1px] w-full bg-[#c7b9ff]" />
                          <div className="mt-2 space-y-2">
                            {filterOptions.map((option) => {
                              const isSelected = selectedFilters.includes(option.id);
                              return (
                                <button
                                  key={option.id}
                                  onClick={() => toggleFilterOption(option.id)}
                                  className="flex items-center gap-2 text-left text-sm text-[#30323a]"
                                >
                                  <span className={isSelected ? "text-[#7054dc]" : "text-[#a8adb8]"}>
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
                    <label className="flex h-8 w-[180px] items-center gap-2 rounded-full border border-[#c8c9d0] bg-white px-3 text-sm text-[#8a8a96]">
                      <FaSearch size={12} className="text-[#a0a3b0]" />
                      <input
                        type="text"
                        placeholder="Pencarian"
                        className="w-full bg-transparent text-sm text-[#202126] placeholder:text-[#a0a3b0] outline-none"
                      />
                    </label>
                  </div>

                  {(activeTab === "guru" || activeTab === "siswa") && (
                    <>
                      <div className="grid grid-cols-[44px_1.4fr_1fr_1.4fr_32px] items-center border-b border-[#e8e6ef] bg-[#f7f7fa] px-3 py-3 text-xs font-semibold text-[#8a8a96]">
                        <button
                          onClick={toggleSelectAll}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                            allRowsSelected ? "border-[#7054dc] bg-[#7054dc] text-white" : "border-[#d4d7e2] text-[#9a88e6]"
                          }`}
                        >
                          <FaCheck size={11} />
                        </button>
                        <p>Nama Lengkap</p>
                        <p>No Wa</p>
                        <p>Email</p>
                        <div />
                      </div>
                      {(activeTab === "guru" ? guruRows : siswaRows).map((row) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[44px_1.4fr_1fr_1.4fr_32px] items-center border-b border-[#f1f0f5] px-3 py-3 text-sm text-[#202126] last:border-b-0"
                        >
                          <button
                            onClick={() => toggleRow(row.id)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                              selectedRowIds[row.id]
                                ? "border-[#7054dc] bg-[#7054dc] text-white"
                                : "border-[#d4d7e2] text-[#9a88e6]"
                            }`}
                          >
                            <FaCheck size={11} />
                          </button>
                          {activeTab === "siswa" ? (
                            <Link href="/admin/nilai-siswa" className="truncate hover:text-[#7054dc] hover:underline transition-colors">
                              {row.name}
                            </Link>
                          ) : (
                            <p className="truncate">{row.name}</p>
                          )}
                          <p className="text-[#6d7280]">{row.phone}</p>
                          <p className="truncate text-[#6d7280]">{row.email}</p>
                          <div className="relative justify-self-end">
                            <button onClick={() => toggleActionMenu(row.id)} className="text-[#8f95a3]">
                              <FaEllipsisV size={12} />
                            </button>
                            {openActionMenuId === row.id && (
                              <div className="absolute right-0 top-5 z-20 w-36 rounded-xl border border-[#e4e2ec] bg-white p-1.5 shadow-lg">
                                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#7054dc] hover:bg-[#f5f1ff]">
                                  <FaRegEdit size={12} />
                                  Edit
                                </button>
                                {activeTab === "siswa" && (
                                  <Link
                                    href="/admin/nilai-siswa"
                                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#f39b39] hover:bg-[#fff8ef]"
                                  >
                                    <FaChartBar size={12} />
                                    Lihat Nilai
                                  </Link>
                                )}
                                <button className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]">
                                  <FaDatabase size={12} />
                                  Nonaktifkan
                                </button>
                                <button className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]">
                                  <FaTrash size={12} />
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === "modul" && (
                    <>
                      <div className="grid grid-cols-[44px_1.3fr_1.1fr_1fr_32px] items-center border-b border-[#e8e6ef] bg-[#f7f7fa] px-3 py-3 text-xs font-semibold text-[#8a8a96]">
                        <button
                          onClick={toggleSelectAll}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                            allRowsSelected ? "border-[#7054dc] bg-[#7054dc] text-white" : "border-[#d4d7e2] text-[#9a88e6]"
                          }`}
                        >
                          <FaCheck size={11} />
                        </button>
                        <p>Nama Modul</p>
                        <p>Nama Guru</p>
                        <p>Jumlah Siswa</p>
                        <div />
                      </div>
                      {modulRows.map((row) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[44px_1.3fr_1.1fr_1fr_32px] items-center border-b border-[#f1f0f5] px-3 py-3 text-sm text-[#202126] last:border-b-0"
                        >
                          <button
                            onClick={() => toggleRow(row.id)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                              selectedRowIds[row.id]
                                ? "border-[#7054dc] bg-[#7054dc] text-white"
                                : "border-[#d4d7e2] text-[#9a88e6]"
                            }`}
                          >
                            <FaCheck size={11} />
                          </button>
                          <p className="truncate">{row.moduleName}</p>
                          <p className="truncate text-[#6d7280]">{row.teacherName}</p>
                          <p className="text-[#6d7280]">{row.studentCount}</p>
                          <div className="relative justify-self-end">
                            <button onClick={() => toggleActionMenu(row.id)} className="text-[#8f95a3]">
                              <FaEllipsisV size={12} />
                            </button>
                            {openActionMenuId === row.id && (
                              <div className="absolute right-0 top-5 z-20 w-36 rounded-xl border border-[#e4e2ec] bg-white p-1.5 shadow-lg">
                                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#7054dc] hover:bg-[#f5f1ff]">
                                  <FaRegEdit size={12} />
                                  Edit
                                </button>
                                <button className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]">
                                  <FaDatabase size={12} />
                                  Nonaktifkan
                                </button>
                                <button className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]">
                                  <FaTrash size={12} />
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === "kuis" && (
                    <>
                      <div className="grid grid-cols-[44px_1.2fr_1fr_1.1fr_32px] items-center border-b border-[#e8e6ef] bg-[#f7f7fa] px-3 py-3 text-xs font-semibold text-[#8a8a96]">
                        <button
                          onClick={toggleSelectAll}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                            allRowsSelected ? "border-[#7054dc] bg-[#7054dc] text-white" : "border-[#d4d7e2] text-[#9a88e6]"
                          }`}
                        >
                          <FaCheck size={11} />
                        </button>
                        <p>Nama Kuis</p>
                        <p>Modul</p>
                        <p>Nama Guru</p>
                        <div />
                      </div>
                      {kuisRows.map((row) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[44px_1.2fr_1fr_1.1fr_32px] items-center border-b border-[#f1f0f5] px-3 py-3 text-sm text-[#202126] last:border-b-0"
                        >
                          <button
                            onClick={() => toggleRow(row.id)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                              selectedRowIds[row.id]
                                ? "border-[#7054dc] bg-[#7054dc] text-white"
                                : "border-[#d4d7e2] text-[#9a88e6]"
                            }`}
                          >
                            <FaCheck size={11} />
                          </button>
                          <p className="truncate">{row.quizName}</p>
                          <p className="truncate text-[#6d7280]">{row.moduleName}</p>
                          <p className="truncate text-[#6d7280]">{row.teacherName}</p>
                          <div className="relative justify-self-end">
                            <button onClick={() => toggleActionMenu(row.id)} className="text-[#8f95a3]">
                              <FaEllipsisV size={12} />
                            </button>
                            {openActionMenuId === row.id && (
                              <div className="absolute right-0 top-5 z-20 w-36 rounded-xl border border-[#e4e2ec] bg-white p-1.5 shadow-lg">
                                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#7054dc] hover:bg-[#f5f1ff]">
                                  <FaRegEdit size={12} />
                                  Edit
                                </button>
                                <button className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]">
                                  <FaDatabase size={12} />
                                  Nonaktifkan
                                </button>
                                <button className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#5f6472] hover:bg-[#f5f5f8]">
                                  <FaTrash size={12} />
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-2 text-xs text-[#8f95a3]">
                      <button className="inline-flex items-center rounded-md px-1 py-1 font-medium text-[#7054dc] hover:bg-[#f1edff]">
                        <MdKeyboardArrowLeft size={18} />
                      </button>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#7054dc] text-[11px] font-medium leading-none text-white">
                        1
                      </span>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d5d7df] text-[11px] font-medium leading-none">2</span>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d5d7df] text-[11px] font-medium leading-none">3</span>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d5d7df] text-[11px] font-medium leading-none">4</span>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d5d7df] text-[11px] font-medium leading-none">5</span>
                      <button className="inline-flex items-center rounded-md px-1 py-1 font-medium text-[#7054dc] hover:bg-[#f1edff]">
                        <MdKeyboardArrowRight size={18} />
                      </button>
                    </div>
                    <button className="text-sm font-medium text-[#f39b39]">Lebih Lengkap</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Pengguna Aktif" value={651} accent="purple" />
                <StatCard label="Kelas Aktif" value={65} accent="orange" />
                <StatCard label="Guru" value={98} accent="purple" />
                <StatCard label="Siswa" value={421} accent="orange" />
                <StatCard label="Modul" value={136} accent="purple" />
                <StatCard label="Kuis" value={354} accent="orange" />
              </div>

              <div className="rounded-2xl border border-[#f39b39] bg-white p-4">
                <h3 className="text-center text-2xl font-semibold text-[#202126]">Statistik Penggunaan Sistem</h3>
                <div className="relative mx-auto mt-4 h-[250px] w-[250px]">
                  <svg className="h-full w-full" viewBox="0 0 220 220" aria-label="Diagram penggunaan sistem">
                    <circle cx="110" cy="110" r="74" fill="none" stroke="#f1f0f6" strokeWidth="34" />
                    <circle
                      cx="110"
                      cy="110"
                      r="74"
                      fill="none"
                      stroke="#f39b39"
                      strokeWidth="34"
                      strokeDasharray="116.2 464.8"
                      strokeDashoffset="0"
                      transform="rotate(-90 110 110)"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r="74"
                      fill="none"
                      stroke="#7054dc"
                      strokeWidth="34"
                      strokeDasharray="348.6 464.8"
                      strokeDashoffset="-116.2"
                      transform="rotate(-90 110 110)"
                    />
                  </svg>
                  <div className="absolute -left-3 bottom-14 h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-white/35 blur-md" />
                    <div className="absolute inset-0 rounded-full bg-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#7054dc] shadow-[0_8px_18px_rgba(112,84,220,0.12)]">
                        75%
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-2 top-4 h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-white/35 blur-md" />
                    <div className="absolute inset-0 rounded-full bg-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#f39b39] shadow-[0_8px_18px_rgba(243,155,57,0.12)]">
                        25%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-5 text-sm font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7054dc]" />
                    Aktif
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f39b39]" />
                    Non-Aktif
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

    </div>
  );
}

