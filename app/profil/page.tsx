"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SiswaHeader from "../component/siswa/SiswaHeader";
import { FaBell, FaEyeSlash, FaFileAlt, FaLock, FaRegEdit, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}

const profileMenu = [
  { id: "profil", label: "Profil Saya", icon: FaUser, danger: false },
  { id: "sertifikat", label: "Sertifikat", icon: FaFileAlt, danger: false },
  { id: "notifikasi", label: "Notifikasi", icon: FaBell, danger: false },
  { id: "password", label: "Ubah Password", icon: FaLock, danger: false },
  { id: "logout", label: "Keluar Akun", icon: FaSignOutAlt, danger: true },
];

export default function ProfilPage() {
  const [activeMenu, setActiveMenu] = useState("profil");
  const [isNotificationSoundEnabled, setIsNotificationSoundEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#202126]">
      <SiswaHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-lg font-bold text-[#202126]">Profil</h1>

        <section className="rounded-2xl border border-[#e4e2eb] bg-white p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:gap-0">
            <aside className="rounded-xl bg-white p-4 lg:rounded-none lg:border-r lg:border-[#e4e2eb] lg:pr-5 lg:pl-2">
              <nav className="space-y-2">
                {profileMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => !item.danger && setActiveMenu(item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                        item.danger
                          ? "mt-6 border-t border-[#e6e3ee] pt-4 text-[#f36e65] hover:bg-[#fff3f2]"
                          : isActive
                            ? "bg-[#f1ecff] font-semibold text-[#7054dc]"
                            : "text-[#4e5362] hover:bg-[#f7f6ff]"
                      }`}
                    >
                      <Icon size={12} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="min-h-[560px] rounded-xl bg-white p-4 sm:p-5 lg:rounded-none lg:pl-6">
              {activeMenu === "profil" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Profil Saya</h2>

                  <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={getAvatarUrl("olivia-rodrigo")}
                          alt="Foto profil Olivia Rodrigo"
                          className="h-14 w-14 rounded-full border border-[#e9e7f2] bg-[#f4f2ff]"
                        />
                        <button
                          type="button"
                          aria-label="Edit foto profil"
                          className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#dfdbef] bg-white text-[#7054dc] shadow-sm transition-colors hover:bg-[#f7f6ff]"
                        >
                          <FaRegEdit size={12} />
                        </button>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#202126]">Olivia Rodrigo</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6d7383]">
                          <MdVerified className="text-[#7054dc]" size={15} />
                          oliviolivrgio@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-[#202126]">Informasi Personal</h3>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dedbf0] bg-[#ffffff] px-4 py-1.5 text-base font-medium text-[#7054dc]"
                      >
                        Edit <FaRegEdit size={14} />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-[#7d8291]">Nama Lengkap</p>
                        <p className="mt-1 font-medium text-[#202126]">Olivia Rodrigo</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#7d8291]">Email</p>
                        <p className="mt-1 font-medium text-[#202126]">oliviolivrgio@gmail.com</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#7d8291]">Jenjang</p>
                        <p className="mt-1 font-medium text-[#202126]">SMA</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#7d8291]">Tingkat Kelas</p>
                        <p className="mt-1 font-medium text-[#202126]">Kelas 11</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeMenu === "sertifikat" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Sertifikat</h2>
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((item) => (
                      <Link
                        key={`sertifikat-${item}`}
                        href="/sertifikat"
                        className="group flex items-center gap-4 rounded-lg border-b border-[#e5e4ec] px-2 py-2 transition-colors hover:bg-[#f3efff] last:border-b-0"
                      >
                        <Image
                          src="/assets/images/beranda-siswa/sertifikat.png"
                          alt="Thumbnail sertifikat"
                          width={92}
                          height={52}
                          className="rounded-lg border border-[#e4e2eb]"
                        />
                        <div>
                          <p className="text-xs text-[#7d8291]">Modul Pembelajaran 6 Bulan</p>
                          <p className="mt-1 text-lg font-semibold text-[#202126] transition-colors group-hover:text-[#7054dc]">
                            Kimia - Kelas 11 Kurikulum Merdeka
                          </p>
                          <p className="mt-1 text-sm text-[#5e6270]">Selesai Februari 2026</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {activeMenu === "notifikasi" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Notifikasi</h2>
                  <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#202126]">Bunyi Notifikasi</h3>
                        <p className="mt-1 text-sm text-[#4f5565]">
                          Aktifkan bunyi notifikasi untuk setiap pemberitahuan yang masuk.
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isNotificationSoundEnabled}
                        aria-label="Toggle bunyi notifikasi"
                        onClick={() => setIsNotificationSoundEnabled((prev) => !prev)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                          isNotificationSoundEnabled ? "bg-[#7054dc]" : "bg-[#d9d7df]"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            isNotificationSoundEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeMenu === "password" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Ubah Password</h2>
                  <div className="mt-4 max-w-[460px] rounded-xl border border-[#e4e2eb] bg-white p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm text-[#6b7080]">Kata Sandi Lama</label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                          />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]">
                            <FaEyeSlash size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm text-[#6b7080]">Kata Sandi Baru</label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                          />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]">
                            <FaEyeSlash size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm text-[#6b7080]">Konfirmasi Kata Sandi Baru</label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                          />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]">
                            <FaEyeSlash size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full rounded-lg bg-[#7054dc] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
