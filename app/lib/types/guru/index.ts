import type { RatingItem } from '../umum';
import type { ModuleItem } from '../modul';

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
  thumbnail?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuruModuleListResponse {
  items: GuruModuleItem[];
  next_cursor: string | null;
}
