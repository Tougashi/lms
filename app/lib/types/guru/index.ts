import type { RatingItem } from "../umum";
import type { ModuleItem } from "../modul";

export type ModulContentType = "MATERI_IMAGE" | "MATERI_VIDEO";

export interface TutorDashboard {
    countPublishedModules: number;
    countDraftModules: number;
    countRegisteredSiswa: number;
    countSiswaLulus: number;
    nominatedModules: ModuleItem[];
    getDraftModules: ModuleItem[];
    getRatingsFromSiswa: RatingItem[];
}

export interface GuruModuleItem {
    id: string;
    moduleName: string;
    subtitle?: string;
    description?: string;
    targetTime?: number;
    difficulty?: string;
    isPaid?: boolean;
    modulPrice?: number | null;
    level?: string | null;
    class?: string | null;
    modulType?: string;
    tutorId?: string;
    isDraft?: boolean;
    moduleImgUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
    progress?: any[];
    totalSiswa?: number;
}

export interface GuruModuleListResponse {
    items: GuruModuleItem[];
    next_cursor: string | null;
}

export interface GuruModuleCreatePayload {
    moduleName: string;
    subtitle: string;
    description: string;
    targetTime: number;
    difficulty: string;
    isPaid?: boolean;
    modulPrice?: number | null;
    level?: string;
    class?: string;
    modulType?: string;
    tutorId: string;
    moduleImgUrl?: string;
}

export interface GuruModuleUpdatePayload {
    moduleName?: string;
    subtitle?: string;
    description?: string;
    targetTime?: number;
    difficulty?: string;
    isPaid?: boolean;
    modulPrice?: number | null;
    level?: string;
    class?: string;
    modulType?: string;
    isDraft?: boolean;
    moduleImgUrl?: string;
}

export interface GuruMateriItem {
    id: string;
    topik_id: string;
    is_video: boolean;
    video_url?: string | null;
    article?: string | null;
    createdAt?: string;
    updatedAt?: string;
    tutorId?: string;
    topikId: string;
    isVideo: boolean;
    videoUrl?: string | null;
    submateris?: GuruSubmateriItem[];
}

export interface GuruMateriCreatePayload {
    topik_id: string;
    is_video?: boolean;
    video_url?: string | null;
    article?: string | null;
}

export interface GuruMateriUpdatePayload {
    is_video?: boolean;
    video_url?: string | null;
    article?: string | null;
}

// ---------------------------------------------------------------------------
// Submateri
// ---------------------------------------------------------------------------

export interface GuruSubmateriItem {
    id: string;
    materiId: string;
    judul: string;
    konten: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruSubmateriCreatePayload {
    materi_id: string;
    judul: string;
    konten: string;
}

export interface GuruSubmateriUpdatePayload {
    judul?: string;
    konten?: string;
}

// ---------------------------------------------------------------------------
// Topik
// ---------------------------------------------------------------------------

export interface GuruTopikItem {
    id: string;
    nama: string;
    modulId: string;
    isComputationalThinking?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruTopikWithMateri extends GuruTopikItem {
    materis: GuruMateriItem[];
}

// ---------------------------------------------------------------------------
// Pretest
// ---------------------------------------------------------------------------

export interface GuruPretestQuestion {
    id: string;
    pretestId: string;
    pertanyaan: string;
    correctAnswer: string;
    skor: number;
    answerOptions?: { id: string; option: string }[];
}

export interface GuruPretestSetting {
    id: string;
    pretestId: string;
    duration: number;
    countShownQuestions: number;
    createdAt?: string;
}

export interface GuruPretestSettingsPayload {
    duration: number;
    countShownQuestions: number;
}

export interface GuruPretestItem {
    id: string;
    pretestName?: string;
    modulId?: string;
    pretestQuestions: GuruPretestQuestion[];
    pretestSettings?: GuruPretestSetting[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruPretestSoalPayload {
    pretest_id: string;
    pertanyaan: string;
    pilihan: string[];
    jawaban_benar: string;
    skor?: number;
}

export interface GuruPretestSoalUpdatePayload {
    pertanyaan?: string;
    pilihan?: string[];
    jawaban_benar?: string;
    skor?: number;
}

// ---------------------------------------------------------------------------
// Posttest
// ---------------------------------------------------------------------------

export interface GuruPosttestQuestion {
    id: string;
    posttestId: string;
    question: string;
    pilihan: string[];
    correctAnswer: string;
    skor: number;
}

export interface GuruPosttestItem {
    id: string;
    modulId?: string;
    soals: GuruPosttestQuestion[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruPosttestSoalPayload {
    posttest_id: string;
    pertanyaan: string;
    pilihan: string[];
    jawaban_benar: string;
    skor?: number;
}

export interface GuruPosttestSoalUpdatePayload {
    pertanyaan?: string;
    pilihan?: string[];
    jawaban_benar?: string;
    skor?: number;
}

// ---------------------------------------------------------------------------
// Kuis (created via admin endpoint but used by tutor)
// ---------------------------------------------------------------------------

export interface GuruKuisAnswerOption {
    id?: string;
    quizId?: string;
    option: string;
    createdAt?: string;
}

export interface GuruKuisSetting {
    quizId?: string;
    timeLimit?: number | null;
    allowMultipleAttempts?: boolean;
    isComputationalThinkingEnabled?: boolean;
    minScoreTreshold?: number | null;
    standardScorePerQuestion?: number;
}

export interface GuruKuisItem {
    id: string;
    materiId: string;
    question: string;
    correctAnswer: string;
    skor: number;
    quizImgQuestionUrl?: string | null;
    quizAnswerOptions?: GuruKuisAnswerOption[];
    quizSetting?: GuruKuisSetting | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruKuisCreatePayload {
    quiz: {
        materiId: string;
        quizImgQuestionUrl?: string | null;
        question: string;
        correctAnswer: string;
        skor?: number;
    };
    answerOptions: { option: string }[];
    setting: {
        quizId?: string;
        timeLimit?: number | null;
        allowMultipleAttempts?: boolean;
        isComputationalThinkingEnabled?: boolean;
        minScoreTreshold?: number | null;
        standardScorePerQuestion?: number;
    };
}

export interface GuruKuisUpdatePayload {
    quizImgQuestionUrl?: string | null;
    question?: string;
    correctAnswer?: string;
    skor?: number;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export interface UploadResponse {
    message: string;
    url: string;
    fileName: string;
}

// ---------------------------------------------------------------------------
// Tutor Profile
// ---------------------------------------------------------------------------

export interface TutorProfile {
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
    role: string;
    socialMedias?: { platform: string; url: string }[];
    signatures?: { fileUrl: string }[];
}

// ---------------------------------------------------------------------------
// Tutor Progress
// ---------------------------------------------------------------------------

export interface TutorProgressItem {
    id: string;
    siswaId: string;
    modulId: string;
    pretestScore?: number | null;
    posttestScore?: number | null;
    finalScore?: number | null;
    status: string;
    isGraduated: boolean;
    progressPercentage: number;
    completionRate: number;
}

export interface TutorProgressByStudent {
    siswaId: string;
    siswaName: string;
    email: string;
    progress: TutorProgressItem[];
}

export interface TutorProgressPaginatedResponse {
    items: TutorProgressByStudent[];
    next_cursor: string | null;
}
