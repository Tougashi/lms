'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaBell } from 'react-icons/fa';
import { RiCustomerService2Line, RiHome5Fill } from 'react-icons/ri';
import { IoPersonCircle } from 'react-icons/io5';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FiArrowLeft } from 'react-icons/fi';
import { FaHandsClapping } from 'react-icons/fa6';
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi2';

/* ───────────────── data types ───────────────── */

type CTSkill = {
  label: string;
  fullLabel: string;
  score: number;
  total: number;
  status: string;
  statusColor: string;
  dotColor: string;
};

type QuizRow = {
  topik: string;
  kategori: string;
  kategoriLabel: string;
  aktivitas: string;
  nilai: number;
  status: 'tuntas' | 'di-bawah';
};

/* ───────────────── static data ───────────────── */

const ctSkills: CTSkill[] = [
  {
    label: 'Decomposition',
    fullLabel: 'Memecah Masalah (Decomposition)',
    score: 80,
    total: 100,
    status: 'Baik',
    statusColor: '#5bb8e8',
    dotColor: '#5bb8e8',
  },
  {
    label: 'Pattern Recognition',
    fullLabel: 'Mengenali Pola (Pattern Recognition)',
    score: 70,
    total: 100,
    status: 'Perlu Penguatan',
    statusColor: '#e85d9e',
    dotColor: '#e85d9e',
  },
  {
    label: 'Abstraction',
    fullLabel: 'Menyaring Informasi (Abstraction)',
    score: 100,
    total: 100,
    status: 'Sangat Baik',
    statusColor: '#7c5cf7',
    dotColor: '#7c5cf7',
  },
  {
    label: 'Algorithm',
    fullLabel: 'Menyusun Langkah (Algorithm)',
    score: 50,
    total: 100,
    status: 'Butuh Intervensi',
    statusColor: '#f5a545',
    dotColor: '#f5a545',
  },
];

const quizRows: QuizRow[] = [
  {
    topik: 'Set Unit Terkecil Kehidupan',
    kategori: 'Mode CT',
    kategoriLabel: 'Mode CT',
    aktivitas: 'Kuis',
    nilai: 100,
    status: 'tuntas',
  },
  {
    topik: 'Bioproses pada Tumbuhan',
    kategori: 'Mode CT',
    kategoriLabel: 'Mode CT',
    aktivitas: 'Kuis',
    nilai: 65,
    status: 'di-bawah',
  },
  {
    topik: 'Sistem Pertukaran Zat',
    kategori: '-',
    kategoriLabel: '-',
    aktivitas: 'Kuis',
    nilai: 70,
    status: 'di-bawah',
  },
  {
    topik: 'Koordinasi dan Reproduksi',
    kategori: '-',
    kategoriLabel: '-',
    aktivitas: 'Kuis',
    nilai: 90,
    status: 'tuntas',
  },
];

/* ───────────────── pie chart data ───────────────── */

// Segments clockwise from top: Decomposition(80), Algorithm(50), PatternRecognition(70), Abstraction(100)
const PIE_SEGMENTS = [
  { value: 80,  label: '80%',  color: '#5bb8e8' }, // Decomposition — sky blue
  { value: 50,  label: '50%',  color: '#f5a545' }, // Algorithm — orange
  { value: 70,  label: '70%',  color: '#e85d9e' }, // Pattern Recognition — pink/magenta
  { value: 100, label: '100%', color: '#7c5cf7' }, // Abstraction — purple
];
const PIE_TOTAL = PIE_SEGMENTS.reduce((a, s) => a + s.value, 0);

/* ───────────────── sub-components ───────────────── */

function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-[#21212b]">
          NAMA WEB
        </Link>

        <nav className="hidden gap-10 sm:flex">
          <Link href="/beranda-siswa" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Beranda
          </Link>
          <Link href="/eksplor-modul" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Modul Saya
          </Link>
          <Link href="/tentang-kami" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Tentang Kami
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full p-2 hover:bg-[#f7f6ff]" aria-label="Notifikasi">
            <FaBell size={20} className="text-[#21212b]" />
          </button>
          <button type="button" className="hidden rounded-full p-2 hover:bg-[#f7f6ff] sm:inline-flex" aria-label="Bantuan">
            <RiCustomerService2Line size={22} className="text-[#21212b]" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1 shadow-sm transition-colors hover:bg-[#f7f6ff]"
            aria-label="Buka menu profil"
          >
            <IoPersonCircle size={28} className="text-[#7054dc]" />
            <MdOutlineKeyboardArrowDown size={18} className="text-[#8a8a96]" />
          </button>
        </div>
      </div>
    </header>
  );
}

function PieChart() {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 105;

  let cumulativeAngle = -90; // start from top (12 o'clock)

  const slices = PIE_SEGMENTS.map((seg, index) => {
    const angle = (seg.value / PIE_TOTAL) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    // Label position at ~60% radius
    const midAngle = (startAngle + endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = radius * 0.6;
    const labelX = cx + labelRadius * Math.cos(midRad);
    const labelY = cy + labelRadius * Math.sin(midRad);

    return (
      <g key={index}>
        <path
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={seg.color}
          stroke="white"
          strokeWidth="3"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="15"
          fontWeight="700"
        >
          {seg.label}
        </text>
      </g>
    );
  });

  return (
    <div className="relative">
      {/* 3D shadow effect below the pie */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -8,
          width: size * 0.85,
          height: 18,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
        }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
      </svg>
    </div>
  );
}

function StudentProfileCard({ view }: { view: 'ct' | 'kuis' }) {
  return (
    <div className="flex flex-col items-center">
      {/* avatar */}
      <div className="relative h-[140px] w-[140px]">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#d8b4fe]" />
        <div className="absolute inset-[6px] overflow-hidden rounded-full bg-[#f3f4f8]">
          <Image
            src="/assets/images/beranda-siswa/modul.png"
            alt="Olivia Rodrigo"
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <h3 className="mt-5 text-[18px] font-semibold text-[#232530]">Olivia Rodrigo</h3>
      <p className="mt-1 text-[13px] text-[#8a8d98]">oliviolivrgio@gmail.com</p>

      {/* bottom card */}
      <div className="mt-6 w-full rounded-2xl border border-[#e8e6f0] bg-[#fafafe] px-5 py-5 text-center">
        {view === 'ct' ? (
          <p className="text-[13px] leading-[1.7] text-[#555968]">
            Analisis Computational Thinking pada Kuis Topik Sel Unit Terkecil Kehidupan
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-center gap-2">
              <FaHandsClapping size={18} className="text-[#f39b39]" />
              <span className="text-[14px] font-semibold text-[#f39b39]">Perlu Penguatan</span>
            </div>
            <p className="text-[13px] leading-[1.7] text-[#555968]">
              Siswa menunjukkan pemahaman yang baik pada sebagian besar topik, namun perlu mengulas kembali Topik 2 karena skor kuis di bawah ambang batas.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────── main page ───────────────── */

function NilaiSiswaContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeView, setActiveView] = useState<'ct' | 'kuis'>(tabParam === 'kuis' ? 'kuis' : 'ct');

  const backLabel = activeView === 'ct' ? 'Kembali ke Nilai Siswa' : 'Kembali ke Daftar Siswa';

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#232530]">
      <AdminHeader />

      <main className="mx-auto w-full max-w-[1260px] px-4 pb-10 pt-6 sm:px-6">
        {/* Dashboard Admin badge — own line */}
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#f39b39] bg-[#fff8ef] px-4 py-2 text-[13px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e0]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f39b39] text-white"><RiHome5Fill size={14} /></span>
            Dashboard Admin
          </Link>
        </div>

        {/* Back link — own line below badge */}
        <div className="mt-2">
          <Link
            href="/admin/manajemen-pengguna"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530] transition-colors hover:text-[#7054dc]"
          >
            <FiArrowLeft size={15} />
            {backLabel}
          </Link>
        </div>

        {/* Two-column layout: left content + right profile */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Module info */}
            <div className="flex items-center gap-4">
              <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-2xl bg-[#f3f4f8]">
                <Image
                  src="/assets/images/beranda-siswa/matapelajaran.png"
                  alt="Biologi"
                  width={60}
                  height={60}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-[17px] font-bold text-[#232530]">Biologi</h1>
                <p className="text-[13px] text-[#8a8d98]">Jenjang SMA | Kelas 11</p>
              </div>
            </div>

            {/* Scores row */}
            <div className="mt-5 flex flex-wrap items-stretch gap-4">
              {/* Pre-Test */}
              <div className="flex items-center gap-3 rounded-2xl border border-[#f0e6d3] bg-[#fffaf2] px-5 py-3.5">
                <span className="text-[34px] font-semibold leading-none text-[#f39b39]">70</span>
                <span className="text-[13px] font-medium text-[#555968]">Nilai Pre-Test</span>
              </div>

              {/* Post-Test */}
              <div className="flex items-center gap-3 rounded-2xl border border-[#d8d3f0] bg-[#f5f2ff] px-5 py-3.5">
                <span className="text-[34px] font-semibold leading-none text-[#7054dc]">100</span>
                <span className="text-[13px] font-medium text-[#555968]">Nilai Post-Test</span>
              </div>

              {/* Progress */}
              <div className="flex min-w-[240px] flex-1 items-center gap-4 rounded-2xl border border-[#e8e6f0] bg-white px-5 py-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eceaf4]">
                      <div className="h-full rounded-full bg-[#7054dc]" style={{ width: '100%' }} />
                    </div>
                    <span className="text-[14px] font-semibold text-[#232530]">100%</span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-[#555968]">10 dari 10 Materi Selesai</p>
                </div>
              </div>
            </div>

            {/* Section heading (not a tab, just the title of the active section) */}
            <h2 className="mt-7 text-[16px] font-bold text-[#232530]">
              {activeView === 'ct' ? 'Analisis Computational Thinking' : 'Rincian Nilai Kuis'}
            </h2>

            {/* CT Analysis View */}
            {activeView === 'ct' && (
              <div className="mt-5 flex flex-col items-center gap-10 md:flex-row md:items-start">
                {/* Pie Chart */}
                <div className="shrink-0">
                  <PieChart />
                </div>

                {/* CT Skills list */}
                <div className="flex-1 space-y-5 pt-1">
                  {ctSkills.map((skill) => (
                    <div key={skill.label} className="flex items-start gap-3">
                      <span
                        className="mt-[7px] h-[10px] w-[10px] shrink-0 rounded-full"
                        style={{ backgroundColor: skill.dotColor }}
                      />
                      <div>
                        <p className="text-[13px] font-medium text-[#555968]">{skill.fullLabel}</p>
                        <p className="mt-0.5 text-[20px] font-bold leading-tight text-[#232530]">
                          {skill.score}/{skill.total}
                        </p>
                        <p className="mt-0.5 text-[13px] font-semibold italic" style={{ color: skill.statusColor }}>
                          {skill.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Details View */}
            {activeView === 'kuis' && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e6f0] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-[#fafafe] text-left text-[13px] font-medium text-[#8a8d98]">
                        <th className="px-5 py-4 font-medium">Topik</th>
                        <th className="px-5 py-4 font-medium">Kategori</th>
                        <th className="px-5 py-4 font-medium">Aktivitas</th>
                        <th className="px-5 py-4 font-medium">Nilai</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizRows.map((row, index) => (
                        <tr
                          key={index}
                          className="border-t border-[#f0eef6] text-[13px] text-[#232530]"
                        >
                          <td className="px-5 py-4">{row.topik}</td>
                          <td className="px-5 py-4">
                            {row.kategori === 'Mode CT' ? (
                              <span className="text-[13px] font-medium text-[#7054dc]">Mode CT</span>
                            ) : (
                              <span className="text-[#8a8d98]">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-[#555968]">{row.aktivitas}</td>
                          <td className="px-5 py-4 font-semibold">{row.nilai}</td>
                          <td className="px-5 py-4">
                            {row.status === 'tuntas' ? (
                              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#22c55e]">
                                <HiCheckCircle size={16} />
                                Tuntas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#f36e65]">
                                <HiExclamationCircle size={16} />
                                Di bawah nilai minimal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Student profile ── */}
          <aside className="hidden lg:block">
            <StudentProfileCard view={activeView} />

            {/* View switcher buttons at the bottom */}
            <div className="mt-8 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveView('ct')}
                className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  activeView === 'ct'
                    ? 'bg-[#7054dc] text-white'
                    : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'
                }`}
              >
                Analisis CT
              </button>
              <button
                type="button"
                onClick={() => setActiveView('kuis')}
                className={`w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  activeView === 'kuis'
                    ? 'bg-[#7054dc] text-white'
                    : 'border border-[#d8d3f0] bg-white text-[#7054dc] hover:bg-[#f5f2ff]'
                }`}
              >
                Rincian Nilai Kuis
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function NilaiSiswaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f4f7]" />}>
      <NilaiSiswaContent />
    </Suspense>
  );
}
