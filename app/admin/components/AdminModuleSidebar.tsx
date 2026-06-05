'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiUsers,
} from 'react-icons/fi';

type SidebarLinkItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
};

type AdminModuleSidebarProps = {
  title: string;
  backHref: string;
  backLabel: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  showSecondaryAction?: boolean;
  managementHref?: string;
};

const sidebarSections: { title: string; items: SidebarLinkItem[] }[] = [
  {
    title: 'Rencanakan Modul anda',
    items: [
      { label: 'Profil Modul Anda', icon: <FiFileText size={13} />, active: true },
      { label: 'Penetapan Harga Modul', icon: <FiDollarSign size={13} /> },
    ],
  },
  {
    title: 'Konten Modul Anda',
    items: [
      { label: 'Konten Modul', icon: <FiLayers size={13} /> },
      { label: 'Pre - Post Test Modul', icon: <FiCheckSquare size={13} /> },
    ],
  },
  {
    title: 'Management Penguna',
    items: [
      { label: 'Management Siswa', icon: <FiUsers size={13} />, href: '/admin/tambah-modul/siswa' },
    ],
  },
];

export default function AdminModuleSidebar({
  title,
  backHref,
  backLabel,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
  showSecondaryAction = true,
  managementHref = '/admin/tambah-modul/siswa',
}: AdminModuleSidebarProps) {
  return (
    <aside className="hidden border-r border-[#e5e3ee] bg-white px-5 py-6 lg:flex lg:min-h-[calc(100vh-74px)] lg:flex-col">
      <Link
        href={backHref}
        className="mb-5 inline-flex w-fit items-center gap-2 text-[12px] font-medium text-[#6e7280] transition-colors hover:text-[#7054dc]"
      >
        {backLabel}
      </Link>

      <p className="text-[13px] font-bold text-[#232530]">{title}</p>

      {sidebarSections.map((section, sIdx) => (
        <div key={section.title} className={sIdx > 0 ? 'mt-7' : 'mt-3'}>
          <p className="text-[13px] font-bold text-[#232530]">{section.title}</p>
          <nav className="mt-3 space-y-3 text-[13px]">
            {section.items.map((item) => {
              const cls = `flex w-full items-center gap-2 text-left transition-colors ${
                item.active ? 'font-semibold text-[#7054dc]' : 'text-[#7a7e8a] hover:text-[#7054dc]'
              }`;

              if (item.href) {
                const href = item.href === '/admin/tambah-modul/siswa' ? managementHref : item.href;
                return (
                  <Link key={item.label} href={href} className={cls}>
                    {item.icon}
                    {item.label}
                  </Link>
                );
              }

              return (
                <button key={item.label} type="button" className={cls}>
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="mt-auto space-y-2.5 pt-8">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="w-full rounded-full bg-[#7054dc] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(112,84,220,0.3)] transition-colors hover:bg-[#5f46cc]"
        >
          {primaryLabel}
        </button>
        {showSecondaryAction && secondaryLabel && onSecondaryAction && (
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