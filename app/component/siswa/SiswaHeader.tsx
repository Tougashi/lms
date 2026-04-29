'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdDone, MdLogout, MdMenu, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { FaBell } from 'react-icons/fa';
import { RiCustomerService2Line } from 'react-icons/ri';
import { IoPersonCircle } from 'react-icons/io5';

export default function SiswaHeader() {
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const notifications = [
    {
      title: 'Materi Baru Terbuka!',
      message: 'Selamat! Kamu sekarang bisa mengakses Biologi. Yuk, lanjut belajar!',
      date: '2026-04-15',
      highlighted: true,
    },
    {
      title: 'Hasil Kuis Keluar ✨',
      message: 'Kamu mendapatkan skor 100 di kuis Jaringan dan Sel. Pertahankan nilaiimu!',
      date: '2026-04-10',
    },
    {
      title: 'Sertifikat Siap Diunduh!',
      message: 'Keren! Kamu telah menyelesaikan modul Matematika. Ambil sertifikat kelulusanmu di sini.',
      date: '2026-03-08',
    },
    {
      title: 'Pesan Baru dari Tutor 💬',
      message: 'Tutor matematika mengirimkan catatan untuk hasil kuis kamu. Yuk, dicek!',
      date: '2026-02-29',
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setIsNotificationMenuOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isBerandaActive = pathname === '/beranda-siswa';
  const isEksplorActive = pathname === '/eksplor-modul' || pathname.startsWith('/modul');
  const isModuleMateri = pathname.startsWith('/modul/') && pathname.endsWith('/materi');

  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-[#21212b] ml-0 sm:-ml-2">
          NAMA WEB
        </Link>

        <nav className="hidden flex-1 justify-center gap-16 sm:flex">
          <Link
            href="/beranda-siswa"
            className={`text-sm hover:text-[#7054dc] ${isBerandaActive ? 'font-medium text-[#7054dc]' : 'text-[#21212b]'}`}
          >
            Beranda
          </Link>
          <Link
            href="/eksplor-modul"
            className={`text-sm hover:text-[#7054dc] ${isEksplorActive ? 'font-medium text-[#7054dc]' : 'text-[#21212b]'}`}
          >
            Eksplor Modul
          </Link>
          <Link href="/tentang-kami" className="text-sm text-[#21212b] hover:text-[#7054dc]">
            Tentang Kami
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isModuleMateri && (
            <button
              type="button"
              aria-label="Buka sidebar Konten Kelas"
              onClick={() => window.dispatchEvent(new Event('toggle-module-sidebar'))}
              className="inline-flex rounded-full p-2 hover:bg-[#f7f6ff] lg:hidden"
            >
              <MdMenu size={22} className="text-[#21212b]" />
            </button>
          )}
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={() => setIsNotificationMenuOpen((prev) => !prev)}
              className="rounded-full p-2 hover:bg-[#f7f6ff]"
            >
              <FaBell size={20} className="text-[#21212b]" />
            </button>

            {isNotificationMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[380px] overflow-hidden rounded-[22px] border border-[#d7d9df] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between border-b border-[#d7d9df] px-4 py-3">
                  <h3 className="text-[1.05rem] font-bold text-[#202126]">Pemberitahuan</h3>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[0.82rem] font-medium text-[#7054dc] transition-opacity hover:opacity-80"
                  >
                    <MdDone size={17} />
                    Tandai telah dibaca
                  </button>
                </div>

                <div className="max-h-[430px] overflow-y-auto">
                  {notifications.map((item, index) => (
                    <div
                      key={`${item.title}-${item.date}`}
                      className={`px-4 py-3 ${item.highlighted ? 'bg-[#f1ecff]' : 'bg-white'}`}
                    >
                      <h4 className="text-[0.95rem] font-bold text-[#202126]">{item.title}</h4>
                      <p className="mt-1.5 text-[0.88rem] leading-6 text-[#202126]">{item.message}</p>
                      <p className="mt-1.5 text-[0.82rem] text-[#8a8a96]">{item.date}</p>
                      {index !== notifications.length - 1 && !item.highlighted && (
                        <div className="mt-3 border-t border-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-[#eceaf4] bg-white px-1.5 py-1 shadow-sm transition-colors hover:bg-[#f7f6ff]"
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
                      <p className="text-[1rem] font-bold leading-tight text-[#7b7f8b]">Olivia Rodrigo</p>
                      <p className="mt-1 text-[0.78rem] font-semibold leading-tight text-[#7b7f8b]">
                        oliviolivrgio@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#d7d9df] bg-white px-2 py-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-[#7b7f8b] transition-colors hover:bg-[#f7f6ff]"
                  >
                    <RiCustomerService2Line size={16} />
                    <span className="text-[0.78rem] font-medium leading-none">Customer Service</span>
                  </button>

                  <Link
                    href="/profil"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-lg px-1.5 py-1.5 text-[#7b7f8b] transition-colors hover:bg-[#f7f6ff]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center text-[#7b7f8b]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
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
