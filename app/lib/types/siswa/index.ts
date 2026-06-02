import type { ModuleItem, TopikItem, MateriItem } from '../modul';
import type { RatingItem } from '../umum';

export interface SiswaDashboard {
  latestProgress: ProgressItem[];
  certificateData: CertificateItem[];
  accessibleModules: ModuleItem[];
  lastActivity: ProgressItem | null;
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

export interface SoalItem {
  id: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban?: string;
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

export interface SiswaModuleItem {
  id: string;
  moduleName: string;
  subtitle: string;
  description: string;
  targetTime: number;
  difficulty: string;
  isPaid: boolean;
  modulPrice: number | null;
  level: string;
  class: string;
  modulType: string;
  tutorId: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiswaModuleListResponse {
  items: SiswaModuleItem[];
  next_cursor: string | null;
}

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
