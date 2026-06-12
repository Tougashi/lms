import type { ModuleItem, TopikItem as ModulTopikItem, MateriItem } from '../modul';
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
  completionRate?: number;
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
  completionRate?: number;
  pretestScore?: number | null;
  status?: string;
  isGraduated?: boolean;
}

export interface ModuleDetail extends ModuleItem {
  topik?: ModulTopikItem[];
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
  knowledgeComponentId?: string;
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
  timeSpent?: number;
}

export interface TestSubmitResult {
  score: number;
  unlocked_count?: number;
  total_submodules?: number;
  totalBenar?: number;
  totalSalah?: number;
  message?: string;
  isGraduated?: boolean;
  certificate?: CertificateItem | null;
}

export interface ProgressDetail {
  id: string;
  siswaId: string;
  modulId: string;
  pretestScore?: number | null;
  pretestCorrectCount?: number | null;
  pretestWrongCount?: number | null;
  pretestTimeSpent?: number | null;
  posttestScore?: number | null;
  posttestCorrectCount?: number | null;
  posttestWrongCount?: number | null;
  posttestTimeSpent?: number | null;
  finalScore?: number | null;
  status: string;
  isGraduated: boolean;
  progressPercentage: number;
  completionRate?: number;
  completedSubmateri?: string[];
  completedContentItems?: string[];
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
  timeSpent?: number;
}

export interface QuizSubmitResult {
  message: string;
  isCorrect: boolean;
  quizId: string;
}

// ─────────────────────────────────────────────────────────────────
// Centralized Module Detail — matches the backend Prisma response
// ─────────────────────────────────────────────────────────────────

export interface QuizAnswerOptionDetail {
  id: string;
  quizId: string;
  option: string;
}

export interface QuizSettingDetail {
  id: string;
  quizId: string;
  timeLimit: number | null;
  allowMultipleAttempts: boolean;
  isComputationalThinkingEnabled: boolean;
  minScoreTreshold: number | null;
  standardScorePerQuestion: number;
}

export interface QuizDetail {
  id: string;
  materiId: string;
  question: string;
  correctAnswer: string;
  skor: number;
  quizImgQuestionUrl: string | null;
  createdAt: string;
  updatedAt: string;
  quizAnswerOptions: QuizAnswerOptionDetail[];
  quizSettings: QuizSettingDetail[];
}

export interface SubmateriDetail {
  id: string;
  materiId: string;
  judul: string;
  konten: string;
  createdAt: string;
  updatedAt: string;
}

export interface MateriDetail {
  id: string;
  tutorId: string;
  judul: string;
  isVideo: boolean;
  videoUrl: string | null;
  article: string | null;
  topikId: string;
  createdAt: string;
  updatedAt: string;
  submateris: SubmateriDetail[];
  quizzes: QuizDetail[];
}

export interface TopikItemDetail {
  id: string;
  topikId: string;
  itemId: string;
  orderNumber: number;
  itemType: "ARTICLE" | "QUIZ";
}

export interface TopikDetail {
  id: string;
  nama: string;
  modulId: string;
  isComputationalThinking: boolean;
  createdAt: string;
  updatedAt: string;
  materis: MateriDetail[];
  topikItems: TopikItemDetail[];
}

export interface ComputationalThinkingDetail {
  id: string;
  modulId: string;
  aspek: string;
  deskripsi: string | null;
}

export interface PretestInfo {
  id: string;
  pretestName?: string;
}

export interface PosttestInfo {
  id: string;
}

export interface ModuleDetailResponse {
  id: string;
  moduleName: string;
  subtitle: string;
  description: string;
  targetTime: number;
  difficulty: string;
  isPaid: boolean;
  modulPrice: number | null;
  level: string | null;
  class: string | null;
  pretestPostTestEnabled: boolean;
  hasStudyGroup: boolean;
  hasCertificate: boolean;
  moduleImgUrl: string | null;
  modulType: string;
  tutorId: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  tutor: {
    fullName: string;
    profileImg: string | null;
  } | null;
  pretest: PretestInfo | null;
  posttest: PosttestInfo | null;
  topiks: TopikDetail[];
  computationalThinkings: ComputationalThinkingDetail[];
  progress: ProgressDetail | null;
}

// ─────────────────────────────────────────────────────────────────
// Study Room — consolidated endpoint response
// ─────────────────────────────────────────────────────────────────

export interface StudyRoomQuestion {
  id: string;
  text: string;
  options: Array<{ key: string; label: string }>;
}

export interface StudyRoomAssessment {
  id: string;
  title: string;
  questions: StudyRoomQuestion[];
  timeLimit: number | null;
}

export interface StudyRoomMateri {
  id: string;
  itemType: 'MATERI';
  judul: string;
  isVideo: boolean;
  videoUrl: string | null;
  article: string | null;
}

export interface StudyRoomItem {
  id: string;
  itemType: 'MATERI' | 'QUIZ' | 'RANGKUMAN_TOPIK';
  judul: string;
  isVideo?: boolean;
  videoUrl?: string | null;
  article?: string | null;
  question?: string;
  correctAnswer?: string;
  skor?: number;
  quizImgQuestionUrl?: string | null;
  quizAnswerOptions?: { id: string; option: string }[];
  timeLimit?: number | null;
}

export interface StudyRoomTopik {
  id: string;
  nama: string;
  rangkumanTopik: string | null;
  items: StudyRoomItem[];
}

export interface StudyRoomCurriculum {
  pretest: StudyRoomAssessment | null;
  topiks: StudyRoomTopik[];
  rangkumanAkhir: {
    itemId: string;
    title: string;
    content: string | null;
  } | null;
  posttest: StudyRoomAssessment | null;
}

export interface StudyRoomProgress {
  id: string;
  siswaId: string;
  modulId: string;
  completedContentItems: string[];
  progressPercentage: number;
  pretestScore: number | null;
  pretestCorrectCount: number | null;
  pretestWrongCount: number | null;
  pretestTimeSpent: number | null;
  posttestScore: number | null;
  posttestCorrectCount: number | null;
  posttestWrongCount: number | null;
  posttestTimeSpent: number | null;
  finalScore: number | null;
  status: string;
  isGraduated: boolean;
}

export interface StudyRoomCertificate {
  id: string;
  certificateUrl: string;
  kode_sertif: string;
  issued_at: string;
  moduleName?: string;
  tutorName?: string;
  tutorSignatureUrl?: string | null;
}

export interface StudyRoomResponse {
  modulId: string;
  moduleName: string;
  hasCertificate: boolean;
  progress: StudyRoomProgress | null;
  certificate: StudyRoomCertificate | null;
  curriculum: StudyRoomCurriculum;
}

// ─────────────────────────────────────────────────────────────────
// Curriculum discriminated unions — used by sidebar & content switcher
// ─────────────────────────────────────────────────────────────────

export interface TopikItemMateri {
  type: "MATERI";
  sequence: number;
  id: string;
  judul: string;
  isVideo: boolean;
  videoUrl: string | null;
  article: string | null;
}

export interface TopikItemQuiz {
  type: "QUIZ";
  sequence: number;
  id: string;
  judul: string;
  question: string;
  correctAnswer: string;
  skor: number;
  quizImgQuestionUrl: string | null;
  quizAnswerOptions: Array<{ id: string; option: string }>;
}

/** Discriminated union — every consumer must handle both "MATERI" and "QUIZ" branches. */
export type TopikItem = TopikItemMateri | TopikItemQuiz;

export interface Topik {
  id: string;
  nama: string;
  topikItems: TopikItem[];
  rangkumanTopik: string | null;
}
