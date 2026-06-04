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
