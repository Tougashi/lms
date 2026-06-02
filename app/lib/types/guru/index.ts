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
