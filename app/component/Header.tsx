"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { label: "Beranda", href: "/" },
  { label: "Eksplor Modul", href: "#" },
  { label: "Tentang Kami", href: "/tentang-kami" },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
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

  return (
    <header
         className={`fixed top-0 z-50 w-full bg-[#FFFFFF] shadow-md shadow-[#1f1f2e1a] shadow-[inset_0_-1px_0_#dcdbe4] transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex min-h-[80px] w-full max-w-[1360px] flex-wrap items-center justify-center gap-3 px-4 py-3 md:flex-nowrap md:justify-between md:gap-6 md:px-7 md:py-0">
        <Link href="/" className="whitespace-nowrap text-2xl font-bold tracking-wide text-[#202126] md:text-3xl">
          NAMA WEB
        </Link>

        <nav
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-9"
          aria-label="Navigasi utama"
        >
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors md:text-base ${
                item.href !== "#" && pathname === item.href
                  ? "text-[#7054dc]"
                  : "text-[#21212b] hover:text-[#7054dc]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-9">
          <a
            href="/daftar-tutor"
            className="text-sm font-medium text-[#21212b] transition-colors hover:text-[#7054dc] md:text-base"
          >
            Daftar Tutor
          </a>
          <a
            href="/login"
            className="text-sm font-semibold text-[#7054dc] transition-opacity hover:opacity-80 md:text-base"
          >
            Login
          </a>
          <a
            href="/daftar"
            className="rounded-full bg-[#7054dc] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:text-base"
          >
            Register
          </a>
        </div>
      </div>
    </header>
  );
}