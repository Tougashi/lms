"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdClose, MdMenu } from "react-icons/md";

const menuItems = [
  { label: "Beranda", href: "/" },
  { label: "Eksplor Modul", href: "/eksplor-modul" },
  { label: "Tentang Kami", href: "/tentang-kami" },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

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

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full bg-[#FFFFFF] shadow-md shadow-[#1f1f2e1a] shadow-[inset_0_-1px_0_#dcdbe4] transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative mx-auto flex min-h-[80px] w-full max-w-[1360px] items-center justify-between px-4 py-3 md:px-7 md:py-0">
          <Link href="/" className="whitespace-nowrap text-2xl font-bold tracking-wide text-[#202126] md:text-3xl">
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
                  pathname === item.href ? "text-[#7054dc]" : "text-[#21212b] hover:text-[#7054dc]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
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
          </div>
        </div>
      </aside>
    </>
  );
}