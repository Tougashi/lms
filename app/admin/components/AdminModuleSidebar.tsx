'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { RiHome5Fill } from 'react-icons/ri';
import { FiArrowLeft, FiFileText, FiDollarSign, FiLayers, FiCheckSquare, FiUsers } from 'react-icons/fi';

export type ModulSidebarActiveSection =
  | 'profil'
  | 'harga'
  | 'konten'
  | 'prepost'
  | 'siswa';

type AdminModuleSidebarProps = {
  /** 'Tambah Modul' | 'Edit Modul' */
  title: string;
  /** active section to highlight */
  activeSection?: ModulSidebarActiveSection;
  /** link for Management Siswa (pass modul id after creation, or undefined to disable) */
  managementSiswaHref?: string;
  /** primary CTA label */
  primaryLabel: string;
  onPrimaryAction: () => void;
  isPrimaryLoading?: boolean;
  /** optional second CTA (e.g. 'Aktifkan Modul' / 'Jadikan Draft') */
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
};

type NavItem = {
  label: string;
  icon: ReactNode;
  section: ModulSidebarActiveSection;
  href?: string;
};

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Rencanakan Modul',
    items: [
      { label: 'Profil Modul', icon: <FiFileText size={13} />, section: 'profil' },
      { label: 'Penetapan Harga', icon: <FiDollarSign size={13} />, section: 'harga' },
    ],
  },
  {
    title: 'Konten Modul',
    items: [
      { label: 'Konten Modul', icon: <FiLayers size={13} />, section: 'konten' },
      { label: 'Pre - Post Test', icon: <FiCheckSquare size={13} />, section: 'prepost' },
    ],
  },
  {
    title: 'Management Pengguna',
    items: [
      { label: 'Management Siswa', icon: <FiUsers size={13} />, section: 'siswa' },
    ],
  },
];

export default function AdminModuleSidebar({
  title,
  activeSection = 'profil',
  managementSiswaHref,
  primaryLabel,
  onPrimaryAction,
  isPrimaryLoading = false,
  secondaryLabel,
  onSecondaryAction,
}: AdminModuleSidebarProps) {
  return (
    <aside className="hidden border-r border-[#e5e3ee] bg-white px-5 py-5 lg:flex lg:min-h-[calc(100vh-74px)] lg:flex-col lg:w-[240px]">
      {/* Top nav */}
      <Link
        href="/admin/dashboard"
        className="mb-1 inline-flex w-fit items-center gap-2 rounded-xl border border-[#f39b39] bg-[#fff8ef] px-3 py-1.5 text-[11px] font-semibold text-[#f39b39] transition-colors hover:bg-[#fff3e0]"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#f39b39] text-white">
          <RiHome5Fill size={11} />
        </span>
        Dashboard Admin
      </Link>

      <Link
        href="/admin/manajemen-modul"
        className="mt-2 mb-4 inline-flex w-fit items-center gap-1.5 text-[11px] font-medium text-[#6e7280] transition-colors hover:text-[#7054dc]"
      >
        <FiArrowLeft size={11} />
        Manajemen Modul
      </Link>

      <p className="text-[12px] font-bold text-[#232530]">{title}</p>

      <div className="mt-3 space-y-5">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a0a3b0]">
              {sec.title}
            </p>
            <nav className="space-y-1">
              {sec.items.map((item) => {
                const isActive = item.section === activeSection;
                const isSiswa = item.section === 'siswa';
                const cls = `flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors ${
                  isActive
                    ? 'bg-[#ece7ff] font-semibold text-[#7054dc]'
                    : isSiswa && !managementSiswaHref
                    ? 'cursor-not-allowed text-[#c0c3cc]'
                    : 'text-[#7a7e8a] hover:bg-[#f5f2ff] hover:text-[#7054dc]'
                }`;

                if (isSiswa && managementSiswaHref) {
                  return (
                    <Link key={item.label} href={managementSiswaHref} className={cls}>
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button key={item.label} type="button" disabled={isSiswa && !managementSiswaHref} className={cls}>
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="mt-auto space-y-2 pt-6">
        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={isPrimaryLoading}
          className="w-full rounded-full bg-[#7054dc] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc] disabled:opacity-60"
        >
          {isPrimaryLoading ? 'Menyimpan...' : primaryLabel}
        </button>
        {secondaryLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full rounded-full border border-[#d8d3f0] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#7054dc] transition-colors hover:bg-[#f5f2ff]"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </aside>
  );
}