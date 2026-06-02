export interface ModuleItem {
  id: string;
  moduleName?: string;
  nama_modul?: string;
  subtitle?: string;
  description?: string;
  deskripsi?: string;
  targetTime?: number;
  target_waktu?: number;
  difficulty?: string;
  tingkat_kesulitan?: string;
  isPaid?: boolean;
  modulPrice?: number | null;
  level?: string | null;
  class?: string | null;
  jenjang?: string;
  kelas_sekolah?: string;
  tutorId?: string;
  isDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tutor?: {
    fullName?: string;
    nama_lengkap?: string;
    profileImg?: string | null;
  };
  rating?: number;
  totalSiswa?: number;
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
}

export interface TopikItem {
  id: string;
  modulId: string;
  nama_topik?: string;
  nama?: string;
  urutan?: number;
  materi?: MateriItem[];
}

export interface MateriItem {
  id: string;
  topikId: string;
  nama_materi?: string;
  urutan?: number;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
  submateris?: SubmateriItem[];
  submateri?: SubmateriItem[];
  tutor?: {
    fullName?: string;
  };
}

export interface SubmateriItem {
  id: string;
  materiId: string;
  judul: string;
  konten?: string;
  video_url?: string | null;
  urutan: number;
  tipe?: 'video' | 'reading' | 'quiz';
  durasi?: string | null;
}
