'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiArrowLeft,
  FiFileText,
  FiLayers,
  FiCheckSquare,
  FiUsers,
} from 'react-icons/fi';

type Props = {
  /** Root path for this modul flow, e.g. '/admin/tambah-modul' or '/admin/manajemen-modul/edit' */
  basePath: string;
  /** Module ID — when provided, appended as ?id=xxx to every link (used on edit modul) */
  modulId?: string;
  title?: string;
  /** Show the "Management Siswa" item — only for edit modul (default false) */
  showSiswaTab?: boolean;
};

const BASE_NAV_SECTIONS = [
  {
    group: 'Rencanakan Modul',
    items: [
      { label: 'Profil Modul', Icon: FiFileText, sub: '' },
    ],
  },
  {
    group: 'Konten Modul',
    items: [
      { label: 'Konten Modul', Icon: FiLayers, sub: '/konten' },
      { label: 'Pre - Post Test', Icon: FiCheckSquare, sub: '/prepost' },
    ],
  },
];

const SISWA_SECTION = {
  group: 'Management Pengguna',
  items: [
    { label: 'Management Siswa', Icon: FiUsers, sub: '/siswa' },
  ],
};

export default function AdminModuleSidebar({
  basePath,
  modulId,
  title = 'Tambah Modul',
  showSiswaTab = false,
}: Props) {
  const pathname = usePathname();
  const qs = modulId ? `?id=${modulId}` : '';

  const navSections = showSiswaTab
    ? [...BASE_NAV_SECTIONS, SISWA_SECTION]
    : BASE_NAV_SECTIONS;

  const isActive = (sub: string) => {
    if (sub === '') {
      return pathname === basePath;
    }
    return pathname.startsWith(basePath + sub);
  };

  const buildHref = (sub: string) => basePath + sub + qs;

  return (
    <aside
      className="
        sticky top-[74px]
        hidden h-[calc(100vh-74px)] w-[240px] shrink-0
        flex-col overflow-y-auto
        border-r border-[#e5e3ee] bg-white
        px-5 py-5
        lg:flex
      "
    >
      {/* Back link */}
      <Link
        href="/admin/manajemen-modul"
        className="mt-2 mb-4 inline-flex w-fit items-center gap-1.5 text-[11px] font-medium text-[#6e7280] transition-colors hover:text-[#7054dc]"
      >
        <FiArrowLeft size={11} />
        Manajemen Modul
      </Link>

      {/* Section title */}
      <p className="text-[12px] font-bold text-[#232530]">{title}</p>

      {/* Nav */}
      <div className="mt-4 flex flex-col gap-5">
        {navSections.map((section) => (
          <div key={section.group}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a0a3b0]">
              {section.group}
            </p>
            <nav className="flex flex-col gap-0.5">
              {section.items.map(({ label, Icon, sub }) => {
                const active = isActive(sub);
                return (
                  <Link
                    key={label}
                    href={buildHref(sub)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-colors ${
                      active
                        ? 'bg-[#ece7ff] font-semibold text-[#7054dc]'
                        : 'text-[#7a7e8a] hover:bg-[#f5f2ff] hover:text-[#7054dc]'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}