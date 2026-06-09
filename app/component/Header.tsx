"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import { MdClose, MdLogout, MdMenu, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import SiswaHeader from "./siswa/SiswaHeader";
import GuruHeader from "./guru/GuruHeader";

const guestMenuItems = [
  { label: "Beranda", href: "/" },
  { label: "Eksplor Modul", href: "/eksplor-modul" },
  { label: "Tentang Kami", href: "/tentang-kami" },
];

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const isLoggedIn = Boolean(user);
  const [isVisible, setIsVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const menuItems = isLoggedIn
    ? [
        { label: "Beranda", href: "/beranda-siswa" },
        { label: "Eksplor Modul", href: "/eksplor-modul" },
        { label: "Tentang Kami", href: "/tentang-kami" },
      ]
    : guestMenuItems;

  const isActiveMenu = (href: string) => {
    if (href === "/beranda-siswa") {
      return pathname === "/beranda-siswa";
    }

    if (href === "/eksplor-modul") {
      return pathname === "/eksplor-modul" || pathname.startsWith("/modul");
    }

    return pathname === href;
  };

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 12) {
        setIsVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setIsVisible(false);
      } else if (currentY < lastScrollY.current - 8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoading && isLoggedIn) {
    if (user?.role === 'tutor' || user?.role === 'guru') {
      return <GuruHeader />;
    }
    return <SiswaHeader />;
  }

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full bg-[#FFFFFF] shadow-md shadow-[#1f1f2e1a] shadow-[inset_0_-1px_0_#dcdbe4] transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative mx-auto flex min-h-[80px] w-full max-w-[1360px] items-center justify-between px-4 py-3 md:px-7 md:py-0">
          <Link href="/" className="whitespace-nowrap text-xl font-bold tracking-wide text-[#202126] md:text-2xl">
            NAMA WEB
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex"
            aria-label="Navigasi utama"
          >
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActiveMenu(item.href) ? "text-[#7054dc]" : "text-[#21212b] hover:text-[#7054dc]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {!isLoading &&
              (isLoggedIn ? (
                <>
                  <button type="button" className="rounded-full p-2 hover:bg-[#f7f6ff]" aria-label="Notifikasi">
                    <FaBell size={20} className="text-[#21212b]" />
                  </button>

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
                      <div className="absolute right-0 top-full z-50 mt-3 w-[220px] overflow-hidden rounded-[18px] border border-[#d7d9df] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                        <div className="px-3 py-3">
                          <p className="text-xs font-semibold text-[#6f7482]">{user?.nama_lengkap || user?.fullName || "User"}</p>
                          <p className="mt-1 text-[11px] text-[#8a8a96]">{user?.email || ""}</p>
                        </div>

                        <div className="border-t border-[#eceaf4] p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              void logout();
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[#ff7268] transition-colors hover:bg-[#fff6f5]"
                          >
                            <MdLogout size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/daftar-tutor"
                    className="rounded-xl px-4 py-2 text-sm font-medium text-[#21212b] transition-colors hover:bg-[#f7f6ff] hover:text-[#7054dc]"
                  >
                    Daftar Tutor
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl border border-[#d8d2ef] px-4 py-2 text-sm font-semibold text-[#7054dc] transition-colors hover:bg-[#f7f6ff]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/daftar"
                    className="rounded-xl bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Register
                  </Link>
                </>
              ))}
          </div>

          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfdceb] text-[#202126] transition-colors hover:bg-[#f5f3ff] lg:hidden"
          >
            <MdMenu size={26} />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-[#12141d]/45 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] h-full w-[86vw] max-w-[360px] border-l border-[#e8e5f2] bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Sidebar navigasi"
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-bold text-[#202126]">Menu</p>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsSidebarOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e3e0ee] text-[#202126] transition-colors hover:bg-[#f5f3ff]"
          >
            <MdClose size={22} />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Navigasi utama">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                item.href !== "#" && pathname === item.href
                  ? "bg-[#f1ecff] text-[#7054dc]"
                  : "text-[#21212b] hover:bg-[#f7f6ff] hover:text-[#7054dc]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-[#eceaf4] pt-6">
          <div className="space-y-3">
            {!isLoading &&
              (isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    void logout();
                  }}
                  className="block w-full rounded-xl bg-[#7054dc] px-3 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/daftar-tutor"
                    onClick={() => setIsSidebarOpen(false)}
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-[#21212b] transition-colors hover:bg-[#f7f6ff] hover:text-[#7054dc]"
                  >
                    Daftar Tutor
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsSidebarOpen(false)}
                    className="block rounded-xl border border-[#d8d2ef] px-3 py-3 text-center text-sm font-semibold text-[#7054dc] transition-colors hover:bg-[#f7f6ff]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/daftar"
                    onClick={() => setIsSidebarOpen(false)}
                    className="block rounded-xl bg-[#7054dc] px-3 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Register
                  </Link>
                </>
              ))}
          </div>
        </div>
      </aside>
    </>
  );
}