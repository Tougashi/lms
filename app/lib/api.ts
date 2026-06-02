// Use the Next.js rewrite proxy so all API calls are same-origin.
// This ensures HTTP-only cookies are sent/received correctly.
const API_BASE =
  typeof window !== 'undefined'
    ? '/api-backend' // browser → same-origin proxy
    : (process.env.NEXT_PUBLIC_API_URL || ''); // server-side → direct

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

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send cookies (same-origin via proxy)
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
  role: 'siswa' | 'tutor' | 'admin' | 'umum';
  nama_lengkap?: string;
  fullName?: string;
  jenjang?: string;
  kelas_sekolah?: string;
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
  modul?: ModuleItem;
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
// Siswa – Modul types
// ---------------------------------------------------------------------------

export interface EnrolledModuleItem extends ModuleItem {
  progress?: ProgressItem;
  progressPercentage?: number;
  pretestScore?: number | null;
  status?: string;
  isGraduated?: boolean;
}

export interface ModuleDetail extends ModuleItem {
  topik?: TopikItem[];
  materi?: MateriItem[];
}

// ---------------------------------------------------------------------------
// Siswa – Topik, Materi, Submateri types
// ---------------------------------------------------------------------------

export interface TopikItem {
  id: string;
  modulId: string;
  nama_topik: string;
  urutan: number;
  materi?: MateriItem[];
}

export interface MateriItem {
  id: string;
  topikId: string;
  nama_materi: string;
  urutan: number;
  submateri?: SubmateriItem[];
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

// ---------------------------------------------------------------------------
// Siswa – Pretest / Posttest types
// ---------------------------------------------------------------------------

export interface SoalItem {
  id: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban?: string; // may not be returned by API
  gambar_url?: string | null;
}

export interface PretestResponse {
  id: string;
  modulId: string;
  soal: SoalItem[];
}

export interface PosttestResponse {
  id: string;
  modulId: string;
  soal: SoalItem[];
}

export interface TestSubmitPayload {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export interface TestSubmitResult {
  score: number;
  totalBenar?: number;
  totalSalah?: number;
  message?: string;
  certificate?: CertificateItem | null;
}

// ---------------------------------------------------------------------------
// Siswa – Progress types (detailed)
// ---------------------------------------------------------------------------

export interface ProgressDetail {
  id: string;
  siswaId: string;
  modulId: string;
  pretestScore?: number | null;
  posttestScore?: number | null;
  finalScore?: number | null;
  status: string;
  isGraduated: boolean;
  progressPercentage: number;
  completedSubmateri?: string[];
  modul?: ModuleItem;
}

export interface CursorPagination<T> {
  data: T[];
  nextCursor?: string | null;
  hasMore?: boolean;
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

  /** PUT /auth/update — update current user profile */
  update(payload: Partial<RegisterPayload>) {
    return apiFetch<UserSession>('/auth/update', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /** POST /auth/forgot-password — request password reset */
  forgotPassword(email: string) {
    return apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /** POST /auth/reset-password — reset password with token */
  resetPassword(token: string, password: string) {
    return apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
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

// ---------------------------------------------------------------------------
// Siswa – Modul endpoints
// ---------------------------------------------------------------------------

export const siswaModulApi = {
  /** GET /siswa/modul — semua modul yang bisa diakses */
  getAll(params?: { cursor?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<CursorPagination<ModuleItem>>(`/siswa/modul${qs ? `?${qs}` : ''}`);
  },

  /** GET /siswa/modul/enrolled — modul yang sudah didaftarkan + progress */
  getEnrolled(params?: { cursor?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<CursorPagination<EnrolledModuleItem>>(`/siswa/modul/enrolled${qs ? `?${qs}` : ''}`);
  },

  /** GET /siswa/modul/{id} — detail modul */
  getById(id: string) {
    return apiFetch<ModuleItem>(`/siswa/modul/${id}`);
  },

  /** POST /siswa/modul/{id}/enroll — daftar modul */
  enroll(id: string) {
    return apiFetch<{ message: string }>(`/siswa/modul/${id}/enroll`, {
      method: 'POST',
    });
  },
};

// ---------------------------------------------------------------------------
// Siswa – Topik endpoints
// ---------------------------------------------------------------------------

export const siswaTopikApi = {
  /** GET /siswa/topik/{modulId} — topik berdasarkan modul */
  getByModul(modulId: string) {
    return apiFetch<TopikItem[]>(`/siswa/topik/${modulId}`);
  },
};

// ---------------------------------------------------------------------------
// Siswa – Materi endpoints
// ---------------------------------------------------------------------------

export const siswaMateriApi = {
  /** GET /siswa/materi/{modulId} — materi berdasarkan modul */
  getByModul(modulId: string) {
    return apiFetch<MateriItem[]>(`/siswa/materi/${modulId}`);
  },
};

// ---------------------------------------------------------------------------
// Siswa – Submateri endpoints
// ---------------------------------------------------------------------------

export const siswaSubmateriApi = {
  /** GET /siswa/submateri/materi/{materiId} — submateri berdasarkan materi */
  getByMateri(materiId: string) {
    return apiFetch<SubmateriItem[]>(`/siswa/submateri/materi/${materiId}`);
  },

  /** GET /siswa/submateri/{id} — detail submateri */
  getById(id: string) {
    return apiFetch<SubmateriItem>(`/siswa/submateri/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Siswa – Progress endpoints
// ---------------------------------------------------------------------------

export const siswaProgressApi = {
  /** GET /siswa/progress — semua progress dengan cursor pagination */
  getAll(params?: { cursor?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<CursorPagination<ProgressDetail>>(`/siswa/progress${qs ? `?${qs}` : ''}`);
  },

  /** GET /siswa/progress/{modulId} — progress berdasarkan modul */
  getByModul(modulId: string) {
    return apiFetch<ProgressDetail>(`/siswa/progress/${modulId}`);
  },

  /** POST /siswa/progress/submateri/{submateriId}/complete — tandai submateri selesai */
  completeSubmateri(submateriId: string) {
    return apiFetch<{ message: string }>(
      `/siswa/progress/submateri/${submateriId}/complete`,
      { method: 'POST' }
    );
  },
};

// ---------------------------------------------------------------------------
// Siswa – Pretest endpoints
// ---------------------------------------------------------------------------

export const siswaPretestApi = {
  /** GET /siswa/pretest/{modulId} — soal pretest berdasarkan modul */
  getByModul(modulId: string) {
    return apiFetch<PretestResponse>(`/siswa/pretest/${modulId}`);
  },

  /** POST /siswa/pretest/{modulId}/submit — kirim jawaban pretest */
  submit(modulId: string, payload: TestSubmitPayload) {
    return apiFetch<TestSubmitResult>(`/siswa/pretest/${modulId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// Siswa – Posttest endpoints
// ---------------------------------------------------------------------------

export const siswaPosttestApi = {
  /** GET /siswa/posttest/{modulId} — soal posttest berdasarkan modul */
  getByModul(modulId: string) {
    return apiFetch<PosttestResponse>(`/siswa/posttest/${modulId}`);
  },

  /** POST /siswa/posttest/{modulId}/submit — kirim jawaban posttest */
  submit(modulId: string, payload: TestSubmitPayload) {
    return apiFetch<TestSubmitResult>(`/siswa/posttest/${modulId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// Siswa – Rating endpoints
// ---------------------------------------------------------------------------

export const siswaRatingApi = {
  /** POST /siswa/rating/{id} — beri rating modul */
  rate(modulId: string, payload: { rating: number; komentar?: string }) {
    return apiFetch<{ message: string }>(`/siswa/rating/${modulId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// Siswa – Certificates endpoints
// ---------------------------------------------------------------------------

export const siswaCertificateApi = {
  /** GET /siswa/certificates — semua sertifikat dengan cursor pagination */
  getAll(params?: { cursor?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<CursorPagination<CertificateItem>>(`/siswa/certificates${qs ? `?${qs}` : ''}`);
  },

  /** GET /siswa/certificates/{id} — sertifikat berdasarkan ID */
  getById(id: string) {
    return apiFetch<CertificateItem>(`/siswa/certificates/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Siswa – Profile endpoints
// ---------------------------------------------------------------------------

export interface SiswaProfile {
  id: string;
  nama_lengkap: string;
  email: string;
  jenjang: string;
  kelas_sekolah: string;
  profileImage?: string | null;
  role: string;
  studentType?: string;
  createdAt?: string;
}

export const siswaProfileApi = {
  /** GET /siswa/profile — get student profile */
  get() {
    return apiFetch<SiswaProfile>('/siswa/profile');
  },
};

// ---------------------------------------------------------------------------
// Siswa – Kuis endpoints
// ---------------------------------------------------------------------------

export interface QuizItem {
  id: string;
  materiId: string;
  question: string;
  correctAnswer: string;
  skor: number;
  quizImgQuestionUrl?: string | null;
  quizAnswerOptions?: QuizAnswerOption[];
  quizSetting?: QuizSetting | null;
}

export interface QuizAnswerOption {
  id: string;
  quizId: string;
  option: string;
}

export interface QuizSetting {
  quizId?: string;
  timeLimit?: number | null;
  allowMultipleAttempts?: boolean;
  isComputationalThinkingEnabled?: boolean;
  minScoreTreshold?: number | null;
  standardScorePerQuestion?: number;
}

export interface QuizSubmitPayload {
  quizId: string;
  answer: string;
  knowledgeComponentId: string;
}

export interface QuizSubmitResult {
  message: string;
  isCorrect: boolean;
  quizId: string;
}

export const siswaKuisApi = {
  /** GET /siswa/kuis/materi/{materiId} — get quizzes by material */
  getByMateri(materiId: string) {
    return apiFetch<QuizItem[]>(`/siswa/kuis/materi/${materiId}`);
  },

  /** POST /siswa/kuis/submit — submit quiz answer */
  submit(payload: QuizSubmitPayload) {
    return apiFetch<QuizSubmitResult>('/siswa/kuis/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// Notification endpoints (shared across roles)
// ---------------------------------------------------------------------------

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  /** GET /notifications — get notifications with cursor pagination */
  getAll(params?: { cursor?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<CursorPagination<NotificationItem>>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  /** GET /notifications/unread-count — get unread count */
  getUnreadCount() {
    return apiFetch<{ unreadCount: number }>('/notifications/unread-count');
  },

  /** PATCH /notifications — mark all as read */
  markAllRead() {
    return apiFetch<{ message: string }>('/notifications', { method: 'PATCH' });
  },

  /** PATCH /notifications/{id}/read — mark single as read */
  markRead(id: string) {
    return apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' });
  },
};

