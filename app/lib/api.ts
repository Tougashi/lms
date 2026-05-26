const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach bearer token from localStorage when available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send cookies cross-origin
  });

  // Attempt to parse JSON body (some endpoints may return empty)
  let data: T;
  try {
    data = await res.json();
  } catch {
    data = {} as T;
  }

  if (!res.ok) {
    const msg =
      (data as Record<string, unknown>)?.message ??
      'Terjadi kesalahan pada server';
    throw new ApiError(String(msg), res.status, data);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Auth API types
// ---------------------------------------------------------------------------

export interface UserSession {
  id: string;
  email: string;
  role: 'siswa' | 'tutor' | 'admin';
  nama_lengkap?: string;
  fullName?: string;
}

export interface LoginResponse {
  user: UserSession;
  role: 'siswa' | 'tutor' | 'admin';
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

// ---------------------------------------------------------------------------
// Dashboard types
// ---------------------------------------------------------------------------

export interface SiswaDashboard {
  latestProgress: ProgressItem[];
  certificateData: CertificateItem[];
  accessibleModules: ModuleItem[];
  lastActivity: ProgressItem | null;
}

export interface TutorDashboard {
  countPublishedModules: number;
  countDraftModules: number;
  countRegisteredSiswa: number;
  countSiswaLulus: number;
  nominatedModules: ModuleItem[];
  getDraftModules: ModuleItem[];
  getRatingsFromSiswa: RatingItem[];
}

export interface ProgressItem {
  id: string;
  siswaId: string;
  modulId: string;
  pretestScore?: number | null;
  posttestScore?: number | null;
  finalScore?: number | null;
  status: string;
  isGraduated: boolean;
  progressPercentage: number;
  modul?: ModuleItem;
}

export interface CertificateItem {
  id: string;
  siswaId: string;
  modulId: string;
  kode_sertif: string;
  issued_at: string;
  certificateUrl: string;
}

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

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(payload: RegisterPayload) {
    return apiFetch<UserSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
  },

  refresh() {
    return apiFetch<{ message: string }>('/auth/refresh', { method: 'POST' });
  },

  getMe() {
    return apiFetch<UserSession>('/auth/me');
  },
};

// ---------------------------------------------------------------------------
// Dashboard endpoints
// ---------------------------------------------------------------------------

export const dashboardApi = {
  siswa() {
    return apiFetch<SiswaDashboard>('/siswa/dashboard');
  },

  tutor() {
    return apiFetch<TutorDashboard>('/tutor/dashboard');
  },
};
