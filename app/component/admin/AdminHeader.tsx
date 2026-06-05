'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { IoPersonCircle } from 'react-icons/io5';
import {
  MdDashboard,
  MdDone,
  MdLogout,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowRight,
  MdPerson,
} from 'react-icons/md';
import { FaBell, FaBook, FaUsers } from 'react-icons/fa';
import { RiCustomerService2Line } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../lib/api';
import type { NotificationItem } from '../../lib/types/umum';

function extractNotifications(res: unknown): NotificationItem[] {
  if (Array.isArray(res)) return res as NotificationItem[];
  if (res && typeof res === 'object' && 'items' in res && Array.isArray((res as Record<string, unknown>).items)) {
    return (res as Record<string, unknown>).items as NotificationItem[];
  }
  if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as Record<string, unknown>).data)) {
    return (res as Record<string, unknown>).data as NotificationItem[];
  }
  return [];
}

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fetch unread count on mount
  useEffect(() => {
    if (!user) return;
    notificationApi.getUnreadCount()
      .then((res) => setUnreadCount(res.unreadCount ?? 0))
      .catch(() => { /* ignore */ });
  }, [user]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!isNotificationMenuOpen || !user) return;
    notificationApi.getAll({ limit: 10 })
      .then((res) => {
        setNotifications(extractNotifications(res));
      })
      .catch(() => { /* ignore */ });
  }, [isNotificationMenuOpen, user]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const handleMarkOneRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Close profile & notification dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setIsNotificationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDashboardActive = pathname === '/admin/dashboard' || pathname === '/admin';
  const isPenggunaActive = pathname.startsWith('/admin/manajemen-pengguna');
  const isModulActive =
    pathname.startsWith('/admin/manajemen-modul') || pathname.startsWith('/admin/tambah-modul');
  const isNilaiActive = pathname.startsWith('/admin/nilai-siswa');
  const isSettingActive = pathname.startsWith('/admin/setting') || pathname.startsWith('/admin/pengaturan');

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: MdDashboard,
      active: isDashboardActive,
    },
    {
      label: 'Manejemen Pengguna',
      href: '/admin/manajemen-pengguna',
      icon: FaUsers,
      active: isPenggunaActive,
    },
    {
      label: 'Manajemen Modul',
      href: '/admin/manajemen-modul',
      icon: FaBook,
      active: isModulActive,
    },

  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#eceaf4] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/admin/dashboard" className="text-xl font-bold text-[#21212b]">
          NAMA WEB
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[#f0ecff] hover:text-[#7054dc] ${
                  item.active
                    ? 'bg-[#f0ecff] text-[#7054dc]'
                    : 'text-[#21212b]'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Notification + CS + Profile + Mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={() => setIsNotificationMenuOpen((prev) => !prev)}
              className="relative rounded-full p-2 hover:bg-[#f7f6ff]"
              aria-label="Notifikasi"
            >
              <FaBell size={20} className="text-[#21212b]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#e35f5f] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[380px] overflow-hidden rounded-[22px] border border-[#d7d9df] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between border-b border-[#d7d9df] px-4 py-3">
                  <h3 className="text-[1.05rem] font-bold text-[#202126]">Pemberitahuan</h3>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-[0.82rem] font-medium text-[#7054dc] transition-opacity hover:opacity-80"
                  >
                    <MdDone size={17} />
                    Tandai telah dibaca
                  </button>
                </div>

                <div className="max-h-[430px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                      <div
                        key={item.id}
                        className={`cursor-pointer px-4 py-3 transition-colors hover:bg-[#f7f6ff] ${!item.read ? 'bg-[#f1ecff]' : 'bg-white'}`}
                        onClick={() => { if (!item.read) handleMarkOneRead(item.id); }}
                      >
                        <h4 className="text-[0.95rem] font-bold text-[#202126]">{item.title}</h4>
                        <p className="mt-1.5 text-[0.88rem] leading-6 text-[#202126]">{item.message}</p>
                        <p className="mt-1.5 text-[0.82rem] text-[#8a8a96]">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {index !== notifications.length - 1 && (
                          <div className="mt-3 border-t border-[#eceaf4]" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-[#8a8a96]">
                      Belum ada notifikasi
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customer Service */}
          <button
            type="button"
            aria-label="Customer Service"
            className="rounded-full p-2 hover:bg-[#f7f6ff]"
          >
            <RiCustomerService2Line size={20} className="text-[#21212b]" />
          </button>

          {/* Profile dropdown */}
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
                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#8a8a96]">
                    Admin
                  </p>
                  <div className="mt-1.5 space-y-2">
                    <div>
                      <p className="text-[1rem] font-bold leading-tight text-[#7b7f8b]">
                        {user?.fullName || user?.nama_lengkap || 'Admin'}
                      </p>
                      <p className="mt-1 text-[0.78rem] font-semibold leading-tight text-[#7b7f8b]">
                        {user?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#d7d9df] bg-white px-2 py-2">
                  <Link
                    href="/admin/setting"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex w-full items-center justify-between rounded-lg px-1.5 py-1.5 text-[#7b7f8b] transition-colors hover:bg-[#f7f6ff]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center text-[#7b7f8b]">
                        <MdPerson size={16} />
                      </span>
                      <span className="text-[0.78rem] font-medium leading-none text-[#7b7f8b]">
                        Profil Admin
                      </span>
                    </div>
                    <span className="text-[#7b7f8b]">
                      <MdOutlineKeyboardArrowRight size={15} />
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-[#ff7268] transition-colors hover:bg-[#fff6f5]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-[#ff7268]">
                      <MdLogout size={15} />
                    </span>
                    <span className="text-[0.78rem] font-medium leading-none text-[#ff7268]">
                      Keluar Akun
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((p) => !p)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#232530] hover:bg-[#f5f4fb] sm:hidden"
            aria-label="Menu"
          >
            {isMobileNavOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="border-t border-[#eceaf4] bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1 text-[14px]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                    item.active
                      ? 'bg-[#f0ecff] text-[#7054dc]'
                      : 'text-[#21212b] hover:bg-[#f7f6ff]'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
