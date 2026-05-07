'use client';

import Image from 'next/image';
import Link from 'next/link';

import GuruHeader from '../../../../component/guru/GuruHeader';

const ctData = [
  { label: 'Memecah Masalah (Decomposition)', score: 80, grade: 'Baik', color: '#5bb3f0', gradeColor: '#2a9d5c' },
  { label: 'Mengenali Pola (Pattern Recognition)', score: 70, grade: 'Perlu Penguatan', color: '#c565d4', gradeColor: '#e8963a' },
  { label: 'Menyaring Informasi (Abstraction)', score: 100, grade: 'Sangat Baik', color: '#4b7bf5', gradeColor: '#2a9d5c' },
  { label: 'Menyusun Langkah (Algorithm)', score: 50, grade: 'Butuh Intervensi', color: '#f5a623', gradeColor: '#d63c3c' },
];

const total = ctData.reduce((s, d) => s + d.score, 0);

function PieChart() {
  const values = ctData.map((d) => d.score);
  const sum = values.reduce((a, b) => a + b, 0);
  let cumulative = 0;

  const slices = ctData.map((d, i) => {
    const startAngle = (cumulative / sum) * 360;
    cumulative += d.score;
    const endAngle = (cumulative / sum) * 360;
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
    const labelR = 62;
    const labelX = 120 + Math.cos(midAngle) * labelR;
    const labelY = 120 + Math.sin(midAngle) * labelR;

    const r = 100;
    const cx = 120;
    const cy = 120;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return (
      <g key={i}>
        <path
          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
          fill={d.color}
        />
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="700">
          {d.score}%
        </text>
      </g>
    );
  });

  return (
    <svg viewBox="0 0 240 240" className="h-[220px] w-[220px] shrink-0">
      {slices}
    </svg>
  );
}

export default function CTDetailPage() {
  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#232530]">
      <GuruHeader />

      <main className="mx-auto w-full max-w-[1060px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Link href="/modul-guru/manajemen/siswa" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#232530]">
          <span>←</span> Kembali ke Nilai Siswa
        </Link>

        <div className="mt-4 flex flex-col gap-6 sm:mt-6 lg:flex-row lg:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-xl bg-[#d4f0f7]">
                <Image src="/assets/images/beranda-siswa/matapelajaran.png" alt="Biologi" width={50} height={50} className="h-full w-full object-cover" />
              </div>
              <div>
                <h1 className="text-[16px] font-bold text-[#232530]">Biologi</h1>
                <p className="text-[12px] text-[#7a7e8a]">Jenjang SMA | Kelas 11</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-stretch gap-3 sm:mt-6 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f8e8f0] to-[#fdf4f8] px-5 py-4">
                <span className="text-[28px] font-bold text-[#e85d8a]">70</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Nilai Pre-Test</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                <span className="text-[28px] font-bold text-[#7054dc]">100</span>
                <span className="text-[12px] font-medium text-[#7a7e8a]">Nilai Post-Test</span>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2 rounded-2xl border border-[#e5e3ee] bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-[#e7e2f6]">
                    <div className="h-full rounded-full bg-[#7054dc]" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[12px] font-semibold text-[#232530]">100%</span>
                </div>
                <p className="text-[11px] text-[#7a7e8a]">10 dari 10 Materi Selesai</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-[14px] font-semibold text-[#232530]">Analisis Computational Thinking</h2>
              <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
                <PieChart />
                <div className="flex-1 space-y-5 pt-2">
                  {ctData.map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <div>
                        <p className="text-[12px] font-medium text-[#232530]">{d.label}</p>
                        <p className="text-[16px] font-bold text-[#232530]">{d.score}/100</p>
                        <p className="text-[11px] font-semibold" style={{ color: d.gradeColor }}>{d.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[220px]">
            <div className="flex flex-col items-center">
              <div className="h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-[#e5e3ee] bg-[#f0eff5]">
                <Image src="/assets/images/beranda-siswa/belum-ada.png" alt="Olivia Rodrigo" width={120} height={120} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#232530]">Olivia Rodrigo</h3>
              <p className="mt-1 text-[12px] text-[#7a7e8a]">oliviolivrgio@gmail.com</p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e5e3ee] bg-white px-4 py-5">
              <p className="text-center text-[12px] leading-[1.7] text-[#5a5d6a]">
                Analisis Computational Thinking pada Kuis Topik Sel Unit Terkecil Kehidupan
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
