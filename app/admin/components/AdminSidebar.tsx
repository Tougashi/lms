"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBook, FaCog, FaUsers } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { MdClose, MdMenu } from "react-icons/md";

type AdminSidebarProps = {
  active: "dashboard" | "pengguna" | "modul" | "setting";
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: FaBookOpen },
  { key: "pengguna", label: "Pengguna", href: "/admin/manajemen-pengguna", icon: FaUsers },
  { key: "modul", label: "Paket Modul", href: "/admin/manajemen-modul", icon: FaBook },
] as const;

export default function AdminSidebar({ active }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#7054dc] text-white shadow-lg lg:hidden"
        aria-label="Buka menu admin"
      >
        <MdMenu size={22} />
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            onClick={closeMobileSidebar}
            className="absolute inset-0 bg-black/40"
            aria-label="Tutup menu admin"
          />
          <aside className="relative h-full w-[260px] border-r border-[#ddd9ea] bg-[#dcd6ef] px-5 py-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#202126]">NAMA WEB</h1>
              <button
                onClick={closeMobileSidebar}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#7054dc]"
                aria-label="Tutup menu"
              >
                <MdClose size={20} />
              </button>
            </div>
            <nav className="space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                      isActive ? "bg-[#7054dc] text-white" : "text-[#7054dc]"
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/admin/setting"
              onClick={closeMobileSidebar}
              className={`mt-8 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                active === "setting" ? "bg-[#7054dc] text-white" : "text-[#7054dc]"
              }`}
            >
              <FaCog size={15} />
              Settings
            </Link>
          </aside>
        </div>
      )}

      <aside className="hidden h-screen border-r border-[#ddd9ea] bg-[#dcd6ef] px-5 py-8 lg:flex lg:flex-col">
        <h1 className="text-center text-xl font-bold text-[#202126]">NAMA WEB</h1>
        <nav className="mt-10 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                  isActive ? "bg-[#7054dc] text-white" : "text-[#7054dc]"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/admin/setting"
          className={`mt-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
            active === "setting" ? "bg-[#7054dc] text-white" : "text-[#7054dc]"
          }`}
        >
          <FaCog size={15} />
          Settings
        </Link>
      </aside>
    </>
  );
}

