"use client";

import { useState, useEffect, useRef } from "react";
import { FaBell, FaEyeSlash, FaLock, FaSignOutAlt, FaRegEdit, FaUser, FaSpinner } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import AdminHeader from "../../component/admin/AdminHeader";
import { adminProfileApi, uploadApi, authApi } from "../../lib/api";
import type { AdminProfile } from "../../lib/types/admin";
import { AdminToastContainer, useAdminToast } from "../components/AdminToast";
import Image from "next/image";
import { useRouter } from "next/navigation";

const adminSettingMenu = [
  { id: "profil", label: "Profil Saya", icon: FaUser, danger: false },
  { id: "notifikasi", label: "Notifikasi", icon: FaBell, danger: false },
  { id: "password", label: "Ubah Password", icon: FaLock, danger: false },
  { id: "logout", label: "Keluar Akun", icon: FaSignOutAlt, danger: true },
];

export default function AdminSettingPage() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useAdminToast();
  
  const [activeMenu, setActiveMenu] = useState("profil");
  const [isNotificationSoundEnabled, setIsNotificationSoundEnabled] = useState(false);
  
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  
  // Forms
  const [personalForm, setPersonalForm] = useState({ fullName: "", email: "", gender: "", whatsappNumber: "" });
  const [accountForm, setAccountForm] = useState({ username: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await adminProfileApi.get();
      setProfile(res);
      const rawGender = (res.gender || "").toLowerCase();
      const mappedGender = (rawGender.startsWith("p") && rawGender !== "pria") || rawGender === "wanita" || rawGender === "perempuan" ? "P" : "L";
      
      setPersonalForm({
        fullName: res.fullName || "",
        email: res.email || "",
        gender: mappedGender,
        whatsappNumber: res.whatsappNumber || "",
      });
      setAccountForm({
        username: res.username || "",
      });
    } catch (error) {
      showToast("error", "Gagal memuat profil admin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePersonal = async () => {
    if (!profile) return;
    setIsSavingPersonal(true);
    try {
      await adminProfileApi.update({
        fullName: personalForm.fullName,
        email: personalForm.email,
        gender: personalForm.gender,
        whatsappNumber: personalForm.whatsappNumber,
      });
      showToast("success", "Informasi personal berhasil diperbarui.");
      setIsEditingPersonal(false);
      fetchProfile();
    } catch (error: any) {
      showToast("error", error.message || "Gagal memperbarui informasi personal.");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleUpdateAccount = async () => {
    if (!profile) return;
    setIsSavingAccount(true);
    try {
      await adminProfileApi.update({
        username: accountForm.username,
      });
      showToast("success", "Informasi akun berhasil diperbarui.");
      setIsEditingAccount(false);
      fetchProfile();
    } catch (error: any) {
      showToast("error", error.message || "Gagal memperbarui informasi akun.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.oldPassword) return showToast("error", "Kata sandi lama wajib diisi.");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast("error", "Konfirmasi kata sandi baru tidak cocok.");
    }
    if (passwordForm.newPassword.length < 6) {
      return showToast("error", "Kata sandi baru minimal 6 karakter.");
    }
    setIsSavingPassword(true);
    try {
      await adminProfileApi.update({
        password: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("success", "Kata sandi berhasil diperbarui.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      showToast("error", error.message || "Gagal memperbarui kata sandi.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const uploadRes = await uploadApi.upload(file);
      await adminProfileApi.update({ profileImg: uploadRes.url });
      showToast("success", "Foto profil berhasil diperbarui.");
      fetchProfile();
    } catch (error: any) {
      showToast("error", "Gagal mengunggah foto profil.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push("/admin/login");
    } catch (error) {
      showToast("error", "Gagal logout.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6fb]">
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <p className="text-sm font-semibold text-[#202126]">
          Selamat datang, {profile?.fullName || "Admin"}
        </p>
        <h1 className="mt-1 text-lg font-bold text-[#202126]">Pengaturan Admin</h1>

        <section className="mt-4 rounded-2xl border border-[#e4e2eb] bg-white p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:gap-0">
            <aside className="rounded-xl bg-white p-4 lg:rounded-none lg:border-r lg:border-[#e4e2eb] lg:pr-5 lg:pl-2">
              <nav className="space-y-2">
                {adminSettingMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.danger && item.id === "logout") {
                          handleLogout();
                        } else if (!item.danger) {
                          setActiveMenu(item.id);
                        }
                      }}
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
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <FaSpinner className="animate-spin text-[#7054dc]" size={24} />
                </div>
              ) : (
                <>
                  {activeMenu === "profil" && profile && (
                    <>
                      <h2 className="text-base font-bold text-[#202126]">Profil Saya</h2>

                      <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#e9e7f2] bg-[#d6d8df]">
                              {profile.profileImg ? (
                                <Image src={profile.profileImg} alt="Profile" fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-white">
                                  <FaUser size={20} />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              disabled={isUploadingPhoto}
                              onClick={() => fileInputRef.current?.click()}
                              aria-label="Edit foto profil"
                              className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#dfdbef] bg-white text-[#7054dc] shadow-sm transition-colors hover:bg-[#f7f6ff] disabled:opacity-50"
                            >
                              {isUploadingPhoto ? <FaSpinner className="animate-spin" size={10} /> : <FaRegEdit size={12} />}
                            </button>
                          </div>
                          <div>
                            <p className="text-base font-semibold text-[#202126]">{profile.username || "Admin"}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6d7383]">
                              <MdVerified className="text-[#7054dc]" size={15} />
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[#202126]">Informasi Personal</h3>
                          {!isEditingPersonal ? (
                            <button
                              type="button"
                              onClick={() => setIsEditingPersonal(true)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#dedbf0] bg-[#ffffff] px-4 py-1.5 text-base font-medium text-[#7054dc] hover:bg-[#f7f6ff]"
                            >
                              Edit <FaRegEdit size={14} />
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingPersonal(false);
                                  setPersonalForm({
                                    fullName: profile.fullName || "",
                                    email: profile.email || "",
                                    gender: profile.gender || "L",
                                    whatsappNumber: profile.whatsappNumber || "",
                                  });
                                }}
                                className="rounded-full border border-[#dedbf0] px-4 py-1.5 text-sm font-medium text-[#4e5362] hover:bg-[#f7f6ff]"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                disabled={isSavingPersonal}
                                onClick={handleUpdatePersonal}
                                className="rounded-full bg-[#7054dc] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                              >
                                {isSavingPersonal ? "Menyimpan..." : "Simpan"}
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditingPersonal ? (
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-[#7d8291]">Nama Lengkap</p>
                              <p className="mt-1 font-medium text-[#202126]">{profile.fullName || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#7d8291]">Email</p>
                              <p className="mt-1 font-medium text-[#202126]">{profile.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#7d8291]">Jenis Kelamin</p>
                              <p className="mt-1 font-medium text-[#202126]">
                                {profile.gender === "L" || profile.gender?.toLowerCase() === "laki-laki" || profile.gender?.toLowerCase() === "pria" ? "Laki-laki" : profile.gender === "P" || profile.gender?.toLowerCase() === "perempuan" || profile.gender?.toLowerCase() === "wanita" ? "Perempuan" : profile.gender || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#7d8291]">Nomor WhatsApp</p>
                              <p className="mt-1 font-medium text-[#202126]">{profile.whatsappNumber || "-"}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs text-[#7d8291]">Nama Lengkap</label>
                              <input
                                type="text"
                                value={personalForm.fullName}
                                onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] px-3 py-2 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs text-[#7d8291]">Email</label>
                              <input
                                type="email"
                                value={personalForm.email}
                                onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs text-[#7d8291]">Jenis Kelamin</label>
                              <select
                                value={personalForm.gender}
                                onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                              </select>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs text-[#7d8291]">Nomor WhatsApp</label>
                              <input
                                type="text"
                                value={personalForm.whatsappNumber}
                                onChange={(e) => setPersonalForm({ ...personalForm, whatsappNumber: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] px-3 py-2 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[#202126]">Informasi Akun</h3>
                          {!isEditingAccount ? (
                            <button
                              type="button"
                              onClick={() => setIsEditingAccount(true)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#dedbf0] bg-[#ffffff] px-4 py-1.5 text-base font-medium text-[#7054dc] hover:bg-[#f7f6ff]"
                            >
                              Edit <FaRegEdit size={14} />
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingAccount(false);
                                  setAccountForm({ username: profile.username || "" });
                                }}
                                className="rounded-full border border-[#dedbf0] px-4 py-1.5 text-sm font-medium text-[#4e5362] hover:bg-[#f7f6ff]"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                disabled={isSavingAccount}
                                onClick={handleUpdateAccount}
                                className="rounded-full bg-[#7054dc] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                              >
                                {isSavingAccount ? "Menyimpan..." : "Simpan"}
                              </button>
                            </div>
                          )}
                        </div>

                        {!isEditingAccount ? (
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-[#7d8291]">Username</p>
                              <p className="mt-1 font-medium text-[#202126]">{profile.username || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#7d8291]">Role</p>
                              <p className="mt-1 font-medium text-[#202126] capitalize">{profile.role}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs text-[#7d8291]">Username</label>
                              <input
                                type="text"
                                value={accountForm.username}
                                onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] px-3 py-2 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
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
                                type={showPassword.old ? "text" : "password"}
                                value={passwordForm.oldPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]"
                              >
                                <FaEyeSlash size={14} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm text-[#6b7080]">Kata Sandi Baru</label>
                            <div className="relative">
                              <input
                                type={showPassword.new ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]"
                              >
                                <FaEyeSlash size={14} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm text-[#6b7080]">Konfirmasi Kata Sandi Baru</label>
                            <div className="relative">
                              <input
                                type={showPassword.confirm ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]"
                              >
                                <FaEyeSlash size={14} />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleUpdatePassword}
                            disabled={isSavingPassword}
                            className="w-full rounded-lg bg-[#7054dc] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {isSavingPassword ? "Menyimpan..." : "Simpan"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
