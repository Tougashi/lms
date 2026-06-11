export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface UserSession {
  id: string;
  email: string;
  role: 'siswa' | 'tutor' | 'admin' | 'umum' | 'guru';
  nama_lengkap?: string;
  fullName?: string;
  jenjang?: string;
  kelas_sekolah?: string;
}

export interface LoginResponse {
  user: UserSession;
  role: 'siswa' | 'tutor' | 'admin' | 'guru';
  accessToken?: string;
  refreshToken?: string;
}

export interface SiswaRegisterPayload {
  role: 'siswa';
  nama_lengkap: string;
  email: string;
  password: string;
  jenjang: string;
  kelas_sekolah: string;
  profile_img?: string | null;
  push_notification_enabled?: boolean;
}

export interface TutorRegisterPayload {
  role: 'tutor';
  fullName: string;
  email: string;
  password: string;
  gender: string;
  pekerjaan: string;
  whatsappNumber: string;
  lastEducation: string;
  institution: string;
  prodi: string;
  cvPathUrl: string;
  biografi?: string | null;
  profileImg?: string | null;
}

export type RegisterPayload = SiswaRegisterPayload | TutorRegisterPayload;

export interface CursorPagination<T> {
  /** Actual field returned by the backend pagination utility */
  items: T[];
  next_cursor: string | null;
  /** Legacy aliases kept for backward-compatibility — may be undefined */
  data?: T[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface RatingItem {
  id: string;
  rating: number;
  komentar?: string | null;
  siswaId: string;
  modulId?: string | null;
  siswa?: {
    nama_lengkap: string;
    profile_img?: string | null;
  };
  modul?: {
    nama_modul: string;
  };
  createdAt?: string;
}
