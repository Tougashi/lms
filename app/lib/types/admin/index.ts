// Admin-specific types based on DOKUMENTASI_API_ADMIN.md

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  activeStudents: number;
  activeQuizzes: number;
  activeTutors: number;
  activeModules: number;
  countAllUsers: number;
  activeClass: number;
  activeUserPercentage: number;
  inactiveUserPercentage: number;
}

// ── Admin Pengelola ──────────────────────────────────────────────────────────

export interface AdminUserItem {
  id: string;
  fullName: string;
  username: string;
  email: string;
  gender?: string;
  whatsappNumber?: string;
  profileImg?: string | null;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminUserCreatePayload {
  fullName: string;
  username?: string;
  email: string;
  password?: string;
  gender?: string;
  whatsappNumber?: string;
}

export interface AdminUserUpdatePayload {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  gender?: string;
  whatsappNumber?: string;
}


// ── Modul ────────────────────────────────────────────────────────────────────

export interface AdminModulItem {
  id: string;
  moduleName: string;
  subtitle?: string;
  targetTime?: number;
  difficulty?: string;
  isPaid?: boolean;
  modulPrice?: number | null;
  level?: string | null;
  class?: string | null;
  modulType?: "SISWA" | "UMUM" | string;
  isDraft: boolean;
  type?: "SISWA" | "UMUM" | string; // alias lama, tetap ada
  description?: string;
  tutorId?: string;
  tutor?: { fullName: string };
  moduleImgUrl?: string | null;
  pretestPostTestEnabled?: boolean;
  hasStudyGroup?: boolean;
  whatsappGroupUrl?: string | null;
  hasCertificate?: boolean;
  totalSiswa?: number;
}

export interface AdminModulCreatePayload {
  moduleName: string;
  subtitle: string;
  description?: string;
  targetTime: number;
  difficulty: string;
  isPaid?: boolean;
  modulPrice?: number | null;
  level?: string | null;
  class?: string | null;
  type?: string;
  isDraft?: boolean;
  tutorId?: string;
  modulType?: string;
  moduleImgUrl?: string | null;
  pretestPostTestEnabled?: boolean;
  hasStudyGroup?: boolean;
  whatsappGroupUrl?: string | null;
  hasCertificate?: boolean;
}

export interface AdminModulUpdatePayload {
  moduleName?: string;
  subtitle?: string;
  description?: string;
  targetTime?: number;
  difficulty?: string;
  isPaid?: boolean;
  modulPrice?: number | null;
  level?: string | null;
  class?: string | null;
  isDraft?: boolean;
  tutorId?: string;
  modulType?: string;
  moduleImgUrl?: string | null;
  pretestPostTestEnabled?: boolean;
  hasStudyGroup?: boolean;
  whatsappGroupUrl?: string | null;
  hasCertificate?: boolean;
}

export interface AdminAssignPayload {
  moduleId: string;
  studentId: string;
}

export interface AdminEnrollmentItem {
  id: string;
  moduleId: string;
  studentId: string;
  createdAt?: string;
}

export interface AdminModulSiswaItem {
  id: string;
  siswaId: string;
  nama_lengkap: string;
  email: string;
  jenjang: string;
  kelas_sekolah: string;
  profileImage?: string | null;
  isActive: boolean;
  progressPercentage: number;
  status: string;
  isGraduated: boolean;
  pretestScore?: number | null;
  posttestScore?: number | null;
  finalScore?: number | null;
  createdAt: string;
}

// ── Topik ────────────────────────────────────────────────────────────────────

export interface AdminTopikItem {
  id: string;
  name: string;
  modulId: string;
  order: number;
}

export interface AdminTopikCreatePayload {
  name: string;
  modulId: string;
  order?: number;
}

export interface AdminTopikUpdatePayload {
  name?: string;
  order?: number;
}

// ── Materi ───────────────────────────────────────────────────────────────────

export interface AdminMateriItem {
  id: string;
  title: string;
  topikId?: string;
  modulId: string;
  order: number;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
}

export interface AdminMateriCreatePayload {
  title: string;
  topikId?: string;
  modulId: string;
  order?: number;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
}

export interface AdminMateriUpdatePayload {
  title?: string;
  order?: number;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
}

// ── Kuis ─────────────────────────────────────────────────────────────────────

// AdminKuisItem = satu Modul yang dikembalikan oleh GET /admin/kuis
// Backend query ke tabel Modul dengan include topiks→materis→quizzes + tutor
export interface AdminKuizQuizEntry {
  id: string;
  question: string;
  correctAnswer: string;
}

export interface AdminKuisMateri {
  id: string;
  quizzes: AdminKuizQuizEntry[];
}

export interface AdminKuisTopik {
  id: string;
  nama: string;
  materis: AdminKuisMateri[];
  quizzes?: AdminKuizQuizEntry[];
}

export interface AdminKuisTutor {
  id: string;
  fullName: string;
}

export interface AdminKuisItem {
  id: string;
  moduleName: string;
  tutorId?: string;
  tutor?: AdminKuisTutor;
  isDraft?: boolean;
  topiks?: AdminKuisTopik[];
  createdAt?: string;
}

export interface AdminKuisCreatePayload {
  quiz: {
    topikId: string;
    quizType?: "REGULER" | "COMPUTATIONAL_THINKING";
    question: string;
    correctAnswer: string;
    skor?: number;
    quizImgQuestionUrl?: string | null;
  };
  answerOptions: { option: string }[];
  setting: {
    timeLimit?: number | null;
    allowMultipleAttempts?: boolean;
    isComputationalThinkingEnabled?: boolean;
    minScoreTreshold?: number | null;
    standardScorePerQuestion?: number;
  };
}

export interface AdminKuisUpdatePayload {
  question?: string;
  correctAnswer?: string;
  skor?: number;
  quizType?: "REGULER" | "COMPUTATIONAL_THINKING";
  quizImgQuestionUrl?: string | null;
  answerOptions?: { option: string }[];
  setting?: {
    timeLimit?: number | null;
    allowMultipleAttempts?: boolean;
    isComputationalThinkingEnabled?: boolean;
    minScoreTreshold?: number | null;
    standardScorePerQuestion?: number;
  };
}

// ── Siswa ────────────────────────────────────────────────────────────────────

export interface AdminSiswaItem {
  id: string;
  nama_lengkap: string;
  email: string;
  jenjang?: string;
  kelas_sekolah?: string;
  profileImage?: string | null;
  role?: string; // "siswa" | "umum" — pembeda siswa biasa vs umum
  studentType?: "SISWA" | "GURU" | string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminSiswaCreatePayload {
  nama_lengkap: string;
  email: string;
  password: string;
  jenjang?: string;
  kelas_sekolah?: string;
  role?: "siswa" | "umum";
  studentType?: "SISWA" | "GURU";
  profileImage?: string;
}

export interface AdminSiswaUpdatePayload {
  nama_lengkap?: string;
  email?: string;
  password?: string;
  kelas_sekolah?: string;
  jenjang?: string;
  role?: "siswa" | "umum";
  studentType?: "SISWA" | "GURU";
  profileImage?: string | null;
}

// ── Tutor ────────────────────────────────────────────────────────────────────

export interface AdminTutorItem {
  id: string;
  fullName: string;
  email: string;
  gender?: string;
  pekerjaan?: string;
  whatsappNumber?: string;
  lastEducation?: string;
  institution?: string;
  biografi?: string | null;
  prodi?: string;
  cvPathUrl?: string;
  profileImg?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminTutorCreatePayload {
  fullName: string;
  email: string;
  password: string;
  gender?: string;
  pekerjaan?: string;
  whatsappNumber?: string;
  lastEducation?: string;
  institution?: string;
  biografi?: string | null;
  prodi?: string;
  cvPathUrl?: string;
  profileImg?: string | null;
}

export interface AdminTutorUpdatePayload {
  fullName?: string;
  email?: string;
  password?: string;
  gender?: string;
  pekerjaan?: string;
  whatsappNumber?: string;
  lastEducation?: string;
  institution?: string;
  biografi?: string | null;
  prodi?: string;
  cvPathUrl?: string;
  profileImg?: string | null;
}

// ── Progress & Analisis Nilai Siswa ─────────────────────────────────────────

export interface AdminStudentInfo {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
}

export interface AdminModuleProgressItem {
    moduleId: string;
    moduleName: string;
    level?: string | null;
    class?: string | null;
    moduleImgUrl?: string | null;
    pretestScore?: number | null;
    posttestScore?: number | null;
    averageQuizScore: number;
    progressPercentage: number;
    totalMateri: number;
    completedMateri: number;
    isGraduated: boolean;
    recommendation: string;
    quizRecords: AdminQuizRecord[];
}

export interface AdminQuizRecord {
    topik: string;
    quizType: "REGULER" | "COMPUTATIONAL_THINKING";
    score: number;
    minScoreTreshold: number | null;
    status: "tuntas" | "di-bawah";
}

export interface AdminProgressDetail {
    studentInfo: AdminStudentInfo;
    modules: AdminModuleProgressItem[];
}

export interface AdminCTPillar {
    score: number;
    label: string;
}

export interface AdminCTAnalysisData {
    studentInfo: AdminStudentInfo;
    moduleProgress: AdminModuleProgressItem | null;
    computationalThinking: {
        decomposition: AdminCTPillar;
        patternRecognition: AdminCTPillar;
        abstraction: AdminCTPillar;
        algorithm: AdminCTPillar;
    };
    quizRecords: AdminQuizRecord[];
    recommendation: string;
}

// Legacy — keep for backward compat
export interface AdminProgressItem {
    studentId: string;
    moduleId?: string;
    [key: string]: unknown;
}

export interface AdminCTAnalysis {
    studentId: string;
    decomposition: number;
    abstraction: number;
    patternRecognition: number;
    algorithm: number;
    overall: number;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  gender?: "L" | "P" | string;
  whatsappNumber?: string;
  profileImg?: string;
  role: "admin";
}
