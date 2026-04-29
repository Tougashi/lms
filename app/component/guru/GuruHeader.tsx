'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { IoPersonCircle } from 'react-icons/io5';
import { MdLogout, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight, MdPerson } from 'react-icons/md';
import { RiCustomerService2Line } from 'react-icons/ri';

export default function GuruHeader() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  const isBerandaActive = pathname === '/beranda-guru';
  const isModulActive = pathname.startsWith('/modul-guru');

  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-[#21212b]">
          NAMA WEB
        </Link>

        <nav className="hidden gap-10 sm:flex">
          <Link
            href="/beranda-guru"
            className={`text-sm hover:text-[#7054dc] ${isBerandaActive ? 'font-medium text-[#7054dc]' : 'text-[#21212b]'}`}
          >
            Beranda
          </Link>
          <Link
            href="/modul-guru"
            className={`text-sm hover:text-[#7054dc] ${isModulActive ? 'font-medium text-[#7054dc]' : 'text-[#21212b]'}`}
          >
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

          <button type="button" className="rounded-full p-2 hover:bg-[#f7f6ff]" aria-label="Bantuan">
            <RiCustomerService2Line size={22} className="text-[#21212b]" />
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1 shadow-sm transition-colors hover:bg-[#f7f6ff]"
              aria-label="Buka menu profil"
            >
              <IoPersonCircle size={28} className="text-[#7054dc]" />
              <MdOutlineKeyboardArrowDown size={18} className="text-[#8a8a96]" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[220px] overflow-hidden rounded-[20px] border border-[#d7d9df] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                <div className="bg-[#ffffff] px-3 py-2.5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#8a8a96]">Profil</p>
                  <div className="mt-1.5 space-y-2">
                    <div>
                      <p className="text-[1rem] font-bold leading-tight text-[#7b7f8b]">Budi Santoso, S.Pd., M.Si.</p>
                      <p className="mt-1 text-[0.78rem] font-semibold leading-tight text-[#7b7f8b]">
                        oliviolivrgio@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#d7d9df] bg-white px-2 py-2">
                  <Link
                    href="/profil"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-lg px-1.5 py-1.5 text-[#7b7f8b] transition-colors hover:bg-[#f7f6ff]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center text-[#7b7f8b]">
                        <MdPerson size={16} />
                      </span>
                      <span className="text-[0.78rem] font-medium leading-none text-[#7b7f8b]">Lihat Profil</span>
                    </div>
                    <span className="text-[#7b7f8b]">
                      <MdOutlineKeyboardArrowRight size={15} />
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-[#ff7268] transition-colors hover:bg-[#fff6f5]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-[#ff7268]">
                      <MdLogout size={15} />
                    </span>
                    <span className="text-[0.78rem] font-medium leading-none text-[#ff7268]">Keluar Akun</span>
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
