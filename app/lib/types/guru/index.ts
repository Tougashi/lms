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
    hasCertificate?: boolean;
    isTestComputationalThinking?: boolean;
    level?: string | null;
    class?: string | null;
    modulType?: string;
    tutorId?: string;
    isDraft?: boolean;
    moduleImgUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
    pretestPostTestEnabled?: boolean;
    pretest?: { id: string; pretestName?: string } | null;
    posttest?: { id: string } | null;
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
    hasCertificate?: boolean;
    isTestComputationalThinking?: boolean;
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
    hasCertificate?: boolean;
    isTestComputationalThinking?: boolean;
    level?: string;
    class?: string;
    modulType?: string;
    isDraft?: boolean;
    moduleImgUrl?: string;
}

export interface GuruMateriItem {
    id: string;
    topik_id: string;
    judul: string;
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
    judul: string;
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

export interface GuruRangkumanItem {
    id: string;
    judul: string;
    konten: string | null;
    topikId: string;
}

export interface GuruRangkumanCreatePayload {
    topik_id: string;
    judul: string;
    konten?: string | null;
}

export interface GuruRangkumanUpdatePayload {
    judul?: string;
    konten?: string | null;
}

export interface GuruTopikWithMateri extends GuruTopikItem {
    materis: GuruMateriItem[];
    quizzes: GuruTopikQuizItem[];
    rangkumans: GuruRangkumanItem[];
}

export interface GuruTopikQuizItem {
    id: string;
    topikId: string;
    quizType: "REGULER" | "COMPUTATIONAL_THINKING";
    judul?: string;
    question: string;
    correctAnswer: string;
    skor: number;
    quizImgQuestionUrl?: string | null;
    ctGroupId?: string | null;
    ctStory?: string | null;
    ctAspect?: string | null;
    quizAnswerOptions: { id: string; quizId: string; option: string; createdAt?: string }[];
    quizSettings: {
        id: string;
        quizId: string;
        timeLimit: number | null;
        allowMultipleAttempts: boolean;
        isComputationalThinkingEnabled: boolean;
        minScoreTreshold: number | null;
        standardScorePerQuestion: number;
        createdAt?: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
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
    ctGroupId?: string | null;
    ctStory?: string | null;
    ctAspect?: string | null;
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

export interface GuruAccessRule {
    id: string;
    pretestId: string;
    materiId: string;
    minScore: number;
    selectedTopicIds?: string[];
    materi?: { id: string; judul: string };
    selectedTopics?: { id: string; nama: string }[];
}

export interface GuruPretestItem {
    id: string;
    pretestName?: string;
    modulId?: string;
    pretestQuestions: GuruPretestQuestion[];
    pretestSettings?: GuruPretestSetting[];
    automaticAccessMateries?: GuruAccessRule[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruPretestSoalPayload {
    pretest_id: string;
    pertanyaan: string;
    pilihan: string[];
    jawaban_benar: string;
    skor?: number;
    ctGroupId?: string;
    ctStory?: string;
    ctAspect?: string;
}

export interface GuruPretestSoalUpdatePayload {
    pertanyaan?: string;
    pilihan?: string[];
    jawaban_benar?: string;
    skor?: number;
    ctGroupId?: string;
    ctStory?: string;
    ctAspect?: string;
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
    ctGroupId?: string | null;
    ctStory?: string | null;
    ctAspect?: string | null;
}

export interface GuruPosttestSetting {
    id: string;
    posttestId: string;
    duration: number;
    countShownQuestions?: number;
    createdAt?: string;
}

export interface GuruPosttestSettingsPayload {
    duration: number;
    countShownQuestions?: number;
}

export interface GuruPosttestItem {
    id: string;
    modulId?: string;
    soals: GuruPosttestQuestion[];
    posttestSettings?: GuruPosttestSetting[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruPosttestSoalPayload {
    posttest_id: string;
    pertanyaan: string;
    pilihan: string[];
    jawaban_benar: string;
    skor?: number;
    ctGroupId?: string;
    ctStory?: string;
    ctAspect?: string;
}

export interface GuruPosttestSoalUpdatePayload {
    pertanyaan?: string;
    pilihan?: string[];
    jawaban_benar?: string;
    skor?: number;
    ctGroupId?: string;
    ctStory?: string;
    ctAspect?: string;
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
    topikId: string;
    quizType: "REGULER" | "COMPUTATIONAL_THINKING";
    question: string;
    correctAnswer: string;
    skor: number;
    quizImgQuestionUrl?: string | null;
    quizAnswerOptions?: GuruKuisAnswerOption[];
    quizSetting?: GuruKuisSetting | null;
    quizGroupId?: string | null;
    judul?: string | null;
    ctGroupId?: string | null;
    ctStory?: string | null;
    ctAspect?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruKuisCreatePayload {
    quiz: {
        topikId: string;
        quizType: "REGULER" | "COMPUTATIONAL_THINKING";
        quizImgQuestionUrl?: string | null;
        judul?: string | null;
        question: string;
        correctAnswer: string;
        skor?: number;
        ctGroupId?: string | null;
        ctStory?: string | null;
        ctAspect?: string | null;
        quizGroupId?: string | null;
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
    question?: string;
    correctAnswer?: string;
    skor?: number;
    judul?: string | null;
    quizType?: "REGULER" | "COMPUTATIONAL_THINKING";
    quizImgQuestionUrl?: string | null;
    ctGroupId?: string | null;
    ctStory?: string | null;
    ctAspect?: string | null;
    quizGroupId?: string | null;
    answerOptions?: { option: string }[];
    setting?: {
        timeLimit?: number | null;
        allowMultipleAttempts?: boolean;
        isComputationalThinkingEnabled?: boolean;
        minScoreTreshold?: number | null;
        standardScorePerQuestion?: number;
    };
}

export interface GuruQuizGroupItem {
    id: string;
    topikId: string;
    nama: string;
    quizType: "REGULER" | "COMPUTATIONAL_THINKING";
    quizzes?: GuruKuisItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GuruQuizGroupCreatePayload {
    topikId: string;
    nama: string;
    quizType?: "REGULER" | "COMPUTATIONAL_THINKING";
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
    signatureUrl?: string | null;
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
    averageQuizScore: number;
    status: string;
    isGraduated: boolean;
    progressPercentage: number;
    completionRate: number;
    recommendation: string;
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

export interface GuruModuleProgressItem {
    siswaId: string;
    siswaName: string;
    email: string;
    profileImage?: string | null;
    pretestScore?: number | null;
    posttestScore?: number | null;
    averageQuizScore: number;
    progressPercentage: number;
    status: string;
    isGraduated: boolean;
    recommendation: string;
}

export interface CTAnalysisResponse {
    studentInfo: { fullName: string; email: string; avatarUrl: string | null };
    moduleProgress: {
        moduleId: string;
        moduleName: string;
        level?: string | null;
        class?: string | null;
        moduleImgUrl?: string | null;
        isTestComputationalThinking?: boolean;
        pretestScore?: number | null;
        posttestScore?: number | null;
        progressPercentage: number;
        totalMateri: number;
        completedMateri: number;
    } | null;
    computationalThinking: {
        decomposition:      { score: number; label: string; preTest: number; postTest: number };
        patternRecognition: { score: number; label: string; preTest: number; postTest: number };
        abstraction:        { score: number; label: string; preTest: number; postTest: number };
        algorithm:          { score: number; label: string; preTest: number; postTest: number };
    };
    quizRecords: Array<{
        topik: string;
        quizType: 'REGULER' | 'COMPUTATIONAL_THINKING';
        score: number;
        minScoreTreshold: number | null;
        status: 'tuntas' | 'di-bawah';
    }>;
    recommendation: string;
}