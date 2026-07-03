"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaBell, FaEye, FaEyeSlash, FaFileAlt, FaLock, FaRegEdit, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import SiswaHeader from "../component/siswa/SiswaHeader";
import GuruHeader from "../component/guru/GuruHeader";
import { useRoleGuard } from "../lib/hooks/useRoleGuard";
import { siswaProfileApi, siswaCertificateApi, authApi, guruProfileApi, guruSignatureApi, uploadApi } from "../lib/api";
import type { SiswaProfile, CertificateItem } from "../lib/types/siswa";
import type { TutorProfile } from "../lib/types/guru";

function extractArray<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if ("items" in obj && Array.isArray(obj.items)) return obj.items as T[];
    if ("data" in obj && Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

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
  const { isAuthorized } = useRoleGuard(["siswa", "tutor"]);
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState("profil");
  const [isNotificationSoundEnabled, setIsNotificationSoundEnabled] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<SiswaProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editJenjang, setEditJenjang] = useState("");
  const [editKelas, setEditKelas] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Tutor signature state
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigPreview, setSigPreview] = useState('');
  const [isSigUploading, setIsSigUploading] = useState(false);
  const [sigMsg, setSigMsg] = useState('');
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Profile photo upload state
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [profileUploadMsg, setProfileUploadMsg] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Certificate state
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isCertLoading, setIsCertLoading] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", isError: false });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    
    // Set profile data directly from user session
    // (This avoids the broken GET /siswa/profile API endpoint that returns 404)
    setProfile({
      id: user.id,
      nama_lengkap: user.nama_lengkap || user.fullName || "User",
      email: user.email,
      jenjang: user.jenjang || "-",
      kelas_sekolah: user.kelas_sekolah || "-",
      role: user.role,
      profileImage: ('profileImage' in user ? (user as { profileImage?: string | null }).profileImage : null) || null,
    });
    setEditName(user.nama_lengkap || user.fullName || "");
    setEditJenjang(user.jenjang || "");
    setEditKelas(user.kelas_sekolah || "");
    
    setIsProfileLoading(false);
  }, [user]);

  // Load tutor profile + existing signature
  useEffect(() => {
    if (user?.role !== 'tutor') return;
    let isMounted = true;
    guruProfileApi.get()
      .then((p) => {
        if (!isMounted) return;
        setTutorProfile(p);
        if (p.signatureUrl) setSigPreview(p.signatureUrl);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [user?.role]);

  // Fetch certificates when tab switches
  useEffect(() => {
    if (activeMenu !== "sertifikat" || !user) return;
    let isMounted = true;
    setIsCertLoading(true);
    siswaCertificateApi.getAll({ limit: 20 })
      .then((res) => { if (isMounted) setCertificates(extractArray<CertificateItem>(res)); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (isMounted) setIsCertLoading(false); });
    return () => { isMounted = false; };
  }, [activeMenu, user]);

  const handleSigFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.includes('png')) { setSigMsg('Hanya file .PNG yang diizinkan.'); return; }
    if (file.size > 2 * 1024 * 1024) { setSigMsg('Ukuran file melebihi 2MB.'); return; }
    setSigMsg('');
    setSigFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') setSigPreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSigUpload = useCallback(async () => {
    if (!sigFile) return;
    setIsSigUploading(true);
    setSigMsg('');
    try {
      const res = await guruSignatureApi.upload(sigFile);
      setSigPreview(res.signatureUrl);
      setSigFile(null);
      setSigMsg('Tanda tangan berhasil disimpan!');
      setTutorProfile((prev) => prev ? { ...prev, signatureUrl: res.signatureUrl } : prev);
    } catch (err: unknown) {
      setSigMsg(err instanceof Error ? err.message : 'Gagal mengunggah tanda tangan.');
    } finally {
      setIsSigUploading(false);
    }
  }, [sigFile]);

  const handleProfileFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setProfileUploadMsg("Hanya file gambar yang diizinkan."); return; }
    if (file.size > 5 * 1024 * 1024) { setProfileUploadMsg("Ukuran file melebihi 5MB."); return; }
    setProfileUploadMsg("");
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') setProfilePreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProfileUpload = useCallback(async () => {
    if (!profileFile) return;
    setIsProfileUploading(true);
    setProfileUploadMsg("");
    try {
      const res = await uploadApi.upload(profileFile, "PROFILE_IMAGE");
      await (authApi.update as (p: Record<string, unknown>) => Promise<unknown>)({
        role: (user?.role as "siswa" | "tutor") || "siswa",
        nama_lengkap: editName,
        jenjang: editJenjang,
        kelas_sekolah: editKelas,
        email: profile?.email || "",
        password: "",
        profileImage: res.url,
      });
      setProfile((prev) => prev ? { ...prev, profileImage: res.url } : prev);
      setProfileFile(null);
      setProfilePreview("");
      setProfileUploadMsg("Foto profil berhasil diperbarui!");
    } catch (err: unknown) {
      setProfileUploadMsg(err instanceof Error ? err.message : "Gagal mengunggah foto profil.");
    } finally {
      setIsProfileUploading(false);
    }
  }, [profileFile, user, editName, editJenjang, editKelas, profile]);

  const handleSaveProfile = useCallback(async () => {
    if (!profile) return;
    if (!editKelas.trim()) { setSaveMsg("Pilih tingkat kelas terlebih dahulu"); return; }
    setIsSaving(true);
    setSaveMsg("");
    try {
      const isTutor = user?.role === "tutor";
      await authApi.update({
        role: (user?.role as "siswa" | "tutor") || "siswa",
        nama_lengkap: editName,
        ...(isTutor ? {} : { jenjang: editJenjang, kelas_sekolah: editKelas }),
        email: profile.email,
        password: "",
      });
      setProfile((prev) => prev ? { ...prev, nama_lengkap: editName, ...(isTutor ? {} : { jenjang: editJenjang, kelas_sekolah: editKelas }) } : prev);
      setSaveMsg("Profil berhasil disimpan!");
      setIsEditing(false);
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  }, [editJenjang, editKelas, editName, profile, user]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Konfirmasi password tidak cocok", isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: "Password baru minimal 6 karakter", isError: true });
      return;
    }
    setIsPasswordSaving(true);
    setPasswordMsg({ text: "", isError: false });
    try {
      await authApi.update({
        role: (user?.role as "siswa" | "tutor") || "siswa",
        nama_lengkap: profile?.nama_lengkap || "",
        email: profile?.email || "",
        password: oldPassword,
        newPassword: newPassword,
        jenjang: profile?.jenjang || "",
        kelas_sekolah: profile?.kelas_sekolah || "",
      });
      setPasswordMsg({ text: "Password berhasil diubah!", isError: false });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMsg({ text: err instanceof Error ? err.message : "Gagal mengubah password", isError: true });
    } finally {
      setIsPasswordSaving(false);
    }
  }, [confirmPassword, newPassword, profile, user]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f7f6fb] text-[#202126]">
        {user?.role === "tutor" ? <GuruHeader /> : <SiswaHeader />}
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent"></div>
            <p className="text-sm text-[#8a8d98]">Memeriksa otorisasi...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.nama_lengkap || user?.nama_lengkap || user?.fullName || "User";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <div className="min-h-screen bg-[#f7f6fb] text-[#202126]">
      {user?.role === "tutor" ? <GuruHeader /> : <SiswaHeader />}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-lg font-bold text-[#202126]">Profil</h1>

        <section className="rounded-2xl border border-[#e4e2eb] bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr] md:gap-0">
            <aside className="rounded-xl bg-white p-4 md:rounded-none md:border-r md:border-[#e4e2eb] md:pr-5 md:pl-2">
              <nav className="space-y-2">
                {profileMenu
                  .filter((item) => !(user?.role === "tutor" && item.id === "sertifikat"))
                  .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.id === "logout") { logout(); return; }
                        setActiveMenu(item.id);
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

            <div className="min-h-[560px] rounded-xl bg-white p-4 sm:p-5 md:rounded-none md:pl-6">
              {/* Profil Saya */}
              {activeMenu === "profil" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Profil Saya</h2>

                  {isProfileLoading ? (
                    <div className="mt-6 animate-pulse space-y-4">
                      <div className="h-16 w-full rounded-xl bg-[#f0eeff]" />
                      <div className="h-40 w-full rounded-xl bg-[#f5f5f5]" />
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={profilePreview || profile?.profileImage || getAvatarUrl(displayName)}
                              alt={`Foto profil ${displayName}`}
                              className="h-14 w-14 rounded-full border border-[#e9e7f2] bg-[#f4f2ff] object-cover"
                            />
                            <button
                              type="button"
                              aria-label="Edit foto profil"
                              onClick={() => profileInputRef.current?.click()}
                              className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#dfdbef] bg-white text-[#7054dc] shadow-sm transition-colors hover:bg-[#f7f6ff]"
                            >
                              <FaRegEdit size={12} />
                            </button>
                            <input
                              ref={profileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleProfileFileSelect(e.target.files?.[0] ?? null)}
                            />
                          </div>
                          {profileUploadMsg && (
                            <p className={`mt-2 text-xs ${profileUploadMsg.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>
                              {profileUploadMsg}
                            </p>
                          )}
                          {profileFile && (
                            <button
                              type="button"
                              disabled={isProfileUploading}
                              onClick={handleProfileUpload}
                              className="rounded-lg bg-[#7054dc] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                              {isProfileUploading ? "Mengunggah..." : "Simpan Foto"}
                            </button>
                          )}
                          <div>
                            <p className="text-base font-semibold text-[#202126]">{displayName}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6d7383]">
                              <MdVerified className="text-[#7054dc]" size={15} />
                              {displayEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[#202126]">Informasi Personal</h3>
                          <button
                            type="button"
                            onClick={() => { setIsEditing(!isEditing); setSaveMsg(""); }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#dedbf0] bg-[#ffffff] px-4 py-1.5 text-base font-medium text-[#7054dc]"
                          >
                            {isEditing ? "Batal" : "Edit"} <FaRegEdit size={14} />
                          </button>
                        </div>

                        {saveMsg && (
                          <p className={`mt-2 text-sm ${saveMsg.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>{saveMsg}</p>
                        )}

                        {isEditing ? (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="mb-1.5 block text-xs text-[#7d8291]">Nama Lengkap</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                              />
                            </div>
                            {user?.role === "siswa" && (
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1.5 block text-xs text-[#7d8291]">Jenjang</label>
                                  <select
                                    value={editJenjang}
                                    onChange={(e) => setEditJenjang(e.target.value)}
                                    className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                                  >
                                    <option value="SD">SD</option>
                                    <option value="SMP">SMP</option>
                                    <option value="SMK">SMK</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-xs text-[#7d8291]">Tingkat Kelas</label>
                                  <select
                                    value={editKelas}
                                    onChange={(e) => setEditKelas(e.target.value)}
                                    className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                                  >
                                    <option value="">Pilih Tingkat Kelas</option>
                                    <optgroup label="SD">
                                      <option value="1">Kelas 1</option>
                                      <option value="2">Kelas 2</option>
                                      <option value="3">Kelas 3</option>
                                      <option value="4">Kelas 4</option>
                                      <option value="5">Kelas 5</option>
                                      <option value="6">Kelas 6</option>
                                    </optgroup>
                                    <optgroup label="SMP">
                                      <option value="7">Kelas 7</option>
                                      <option value="8">Kelas 8</option>
                                      <option value="9">Kelas 9</option>
                                    </optgroup>
                                    <optgroup label="SMA/SMK">
                                      <option value="10">Kelas 10</option>
                                      <option value="11">Kelas 11</option>
                                      <option value="12">Kelas 12</option>
                                    </optgroup>
                                  </select>
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              className="rounded-lg bg-[#7054dc] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                              {isSaving ? "Menyimpan..." : "Simpan"}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-[#7d8291]">Nama Lengkap</p>
                              <p className="mt-1 font-medium text-[#202126]">{profile?.nama_lengkap ?? "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#7d8291]">Email</p>
                              <p className="mt-1 font-medium text-[#202126]">{profile?.email ?? "-"}</p>
                            </div>
                            {user?.role === "tutor" ? (
                              <>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Jenis Kelamin</p>
                                  <p className="mt-1 font-medium text-[#202126]">{tutorProfile?.gender ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Pekerjaan</p>
                                  <p className="mt-1 font-medium text-[#202126]">{tutorProfile?.pekerjaan ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Institusi</p>
                                  <p className="mt-1 font-medium text-[#202126]">{tutorProfile?.institution ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Program Studi</p>
                                  <p className="mt-1 font-medium text-[#202126]">{tutorProfile?.prodi ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Pendidikan Terakhir</p>
                                  <p className="mt-1 font-medium text-[#202126]">{tutorProfile?.lastEducation ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#7d8291]">No. WhatsApp</p>
                                  <p className="mt-1 font-medium text-[#202126]">{tutorProfile?.whatsappNumber ?? "-"}</p>
                                </div>
                                  {tutorProfile?.biografi && (
                                    <div className="sm:col-span-2">
                                      <p className="text-xs text-[#7d8291]">Biografi</p>
                                      <p className="mt-1 font-medium text-[#202126]">{tutorProfile.biografi}</p>
                                    </div>
                                  )}
                                  {tutorProfile?.cvPathUrl && (
                                    <div className="sm:col-span-2">
                                      <p className="text-xs text-[#7d8291]">CV / Curriculum Vitae</p>
                                      <a href={tutorProfile.cvPathUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[#7054dc] underline text-sm">
                                        Lihat CV
                                      </a>
                                    </div>
                                  )}
                                </>
                            ) : (
                              <>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Jenjang</p>
                                  <p className="mt-1 font-medium text-[#202126]">{profile?.jenjang ?? "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#7d8291]">Tingkat Kelas</p>
                                  <p className="mt-1 font-medium text-[#202126]">Kelas {profile?.kelas_sekolah ?? "-"}</p>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tutor Signature Upload */}
                      {user?.role === "tutor" && (
                        <div className="mt-4 rounded-xl border border-[#e4e2eb] bg-white p-4">
                          <h3 className="text-sm font-semibold text-[#202126]">Tanda Tangan</h3>
                          <p className="mt-1 text-xs text-[#7d8291]">
                            Tanda tangan ditampilkan pada sertifikat kelulusan siswa. Format .PNG, latar transparan.
                          </p>

                          {sigMsg && (
                            <p className={`mt-2 text-xs ${sigMsg.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>
                              {sigMsg}
                            </p>
                          )}

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => sigInputRef.current?.click()}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") sigInputRef.current?.click(); }}
                            className="mt-3 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border border-[#e4e2eb] bg-[#fbfaff] px-4 py-5 transition-colors hover:border-[#b8adee]"
                          >
                            {sigPreview ? (
                              <div className="flex flex-col items-center gap-2">
                                <img src={sigPreview} alt="Pratinjau tanda tangan" className="max-h-[80px] object-contain" />
                                <span className="text-[11px] text-[#7054dc]">Klik untuk mengganti</span>
                              </div>
                            ) : (
                              <p className="text-center text-xs text-[#9aa0ad]">
                                Klik untuk unggah tanda tangan<br />(Format .PNG, maks. 2MB)
                              </p>
                            )}
                            <input
                              ref={sigInputRef}
                              type="file"
                              accept=".png,image/png"
                              className="hidden"
                              onChange={(e) => handleSigFileSelect(e.target.files?.[0] ?? null)}
                            />
                          </div>

                          {sigFile && (
                            <button
                              type="button"
                              disabled={isSigUploading}
                              onClick={handleSigUpload}
                              className="mt-3 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                              {isSigUploading ? "Menyimpan..." : "Simpan Tanda Tangan"}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Sertifikat (siswa only) */}
              {activeMenu === "sertifikat" && user?.role !== "tutor" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Sertifikat</h2>
                  {isCertLoading ? (
                    <div className="mt-4 animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-full rounded-lg bg-[#f0eeff]" />
                      ))}
                    </div>
                  ) : certificates.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {certificates.map((cert) => (
                        <Link
                          key={cert.id}
                          href={`/modul/${cert.modulId}/sertifikat`}
                          className="group flex items-center gap-4 rounded-lg border-b border-[#e5e4ec] px-2 py-2 transition-colors hover:bg-[#f3efff] last:border-b-0"
                        >
                          <Image
                            src="/assets/images/beranda-siswa/sertifikat.png"
                            alt="Thumbnail sertifikat"
                            width={92}
                            height={52}
                            className="rounded-lg border border-[#e4e2eb]"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-[#7d8291]">
                              {cert.modul?.moduleName || "Modul Pembelajaran"}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-[#202126] transition-colors group-hover:text-[#7054dc]">
                              {cert.kode_sertif}
                            </p>
                            <p className="mt-1 text-sm text-[#5e6270]">
                              Selesai{" "}
                              {new Date(cert.issued_at).toLocaleDateString("id-ID", {
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg border border-[#7054dc] px-3 py-1.5 text-xs font-semibold text-[#7054dc] transition-colors group-hover:bg-[#7054dc] group-hover:text-white">
                            Lihat
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 text-center text-sm text-[#8a8a96]">
                      <p>Belum ada sertifikat</p>
                      <p className="mt-1 text-xs">Selesaikan modul dan post-test untuk mendapatkan sertifikat.</p>
                    </div>
                  )}
                </>
              )}

              {/* Notifikasi */}
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

              {/* Ubah Password */}
              {activeMenu === "password" && (
                <>
                  <h2 className="text-base font-bold text-[#202126]">Ubah Password</h2>
                  <div className="mt-4 w-full max-w-[460px] rounded-xl border border-[#e4e2eb] bg-white p-4">
                    {passwordMsg.text && (
                      <p className={`mb-3 text-sm ${passwordMsg.isError ? "text-red-500" : "text-green-600"}`}>{passwordMsg.text}</p>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm text-[#6b7080]">Kata Sandi Lama</label>
                        <div className="relative">
                          <input
                            type={showOld ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                          />
                          <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]">
                            {showOld ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm text-[#6b7080]">Kata Sandi Baru</label>
                        <div className="relative">
                          <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                          />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]">
                            {showNew ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm text-[#6b7080]">Konfirmasi Kata Sandi Baru</label>
                        <div className="relative">
                          <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-[#d9d7df] bg-white px-3 py-2.5 pr-10 text-sm text-[#202126] focus:border-[#7054dc] focus:outline-none"
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ead]">
                            {showConfirm ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isPasswordSaving || !newPassword || !confirmPassword}
                        className="w-full rounded-lg bg-[#7054dc] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {isPasswordSaving ? "Menyimpan..." : "Simpan"}
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
