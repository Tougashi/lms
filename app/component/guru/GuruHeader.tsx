'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { IoPersonCircle } from 'react-icons/io5';
import { MdLogout, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight, MdPerson } from 'react-icons/md';
import { RiCustomerService2Line } from 'react-icons/ri';

export default function GuruHeader() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex h-[74px] w-full max-w-[1260px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#21212b] sm:text-[30px]">
          NAMA WEB
        </Link>

        <nav className="hidden items-center gap-12 md:flex">
          <a href="#" className="text-[14px] text-[#787a85] transition-colors hover:text-[#21212b]">
            Beranda
          </a>
          <a href="#" className="text-[14px] text-[#787a85] transition-colors hover:text-[#21212b]">
            Modul Saya
          </a>
          <a href="#" className="text-[14px] text-[#787a85] transition-colors hover:text-[#21212b]">
            Tentang Kami
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#858891] transition-colors hover:bg-[#f5f4fb]"
            aria-label="Notifikasi"
          >
            <FaBell size={16} />
          </button>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#858891] transition-colors hover:bg-[#f5f4fb]"
            aria-label="Bantuan"
          >
            <RiCustomerService2Line size={18} />
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white p-1 pr-1.5 shadow-sm transition-colors hover:bg-[#f7f6ff]"
              aria-label="Buka menu profil"
            >
              <IoPersonCircle size={26} className="text-[#7557ea]" />
              <MdOutlineKeyboardArrowDown size={18} className="text-[#8a8a96]" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-3 w-[280px] overflow-hidden rounded-2xl border border-[#d7d9df] bg-[#fdfdff] shadow-[0_16px_32px_rgba(12,12,14,0.2)]">
                <div className="bg-[#f3f4f6] px-5 py-4">
                  <p className="text-[14px] font-semibold leading-tight text-[#5e6572]">
                    Budi Santoso, S.Pd., M.Si.
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium leading-tight text-[#5e6572]">
                    oliviolivrgio@gmail.com
                  </p>
                </div>

                <div className="space-y-1 px-4 py-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-1.5 py-2 text-[#6f7480] transition-colors hover:bg-[#f1f1fb]"
                  >
                    <span className="flex items-center gap-3">
                      <MdPerson size={18} />
                      <span className="text-[14px] font-medium leading-none">Lihat Profil</span>
                    </span>
                    <MdOutlineKeyboardArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-[#ff6b5d] transition-colors hover:bg-[#fff4f2]"
                  >
                    <MdLogout size={18} />
                    <span className="text-[14px] font-medium leading-none">Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
