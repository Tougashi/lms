import axios, { type AxiosRequestConfig } from "axios";
import { ApiError } from "./types/umum";
import type { ModulContentType } from "./types/guru";

import type {
    CursorPagination,
    NotificationItem,
    RatingItem,
    UserSession,
    LoginResponse,
    RegisterPayload,
} from "./types/umum";
import type {
    CertificateItem,
    EnrolledModuleItem,
    ModuleDetail,
    ModuleDetailResponse,
    PretestResponse,
    PosttestResponse,
    ProgressDetail,
    ProgressItem,
    QuizItem,
    QuizSubmitPayload,
    QuizSubmitResult,
    SiswaDashboard,
    SiswaModuleItem,
    SiswaModuleListResponse,
    SiswaProfile,
    SoalItem,
    StudyRoomCertificate,
    StudyRoomResponse,
    TestSubmitPayload,
    TestSubmitResult,
} from "./types/siswa";
import type {
    TutorDashboard,
    GuruModuleListResponse,
    GuruTopikWithMateri,
    GuruModuleItem,
    GuruModuleCreatePayload,
    GuruModuleUpdatePayload,
    GuruMateriItem,
    GuruMateriCreatePayload,
    GuruMateriUpdatePayload,
    GuruSubmateriItem,
    GuruSubmateriCreatePayload,
    GuruSubmateriUpdatePayload,
    GuruPretestItem,
    GuruPretestSoalPayload,
    GuruPretestSoalUpdatePayload,
    GuruPretestSettingsPayload,
    GuruPosttestItem,
    GuruPosttestSoalPayload,
    GuruPosttestSoalUpdatePayload,
    GuruKuisItem,
    GuruKuisCreatePayload,
    GuruKuisUpdatePayload,
    UploadResponse,
    TutorProfile,
    TutorProgressByStudent,
    TutorProgressPaginatedResponse,
} from "./types/guru";
import type {
    MateriItem,
    ModuleItem,
    SubmateriItem,
    TopikItem,
} from "./types/modul";
import type {
    AdminDashboardStats,
    AdminModulItem,
    AdminModulCreatePayload,
    AdminModulUpdatePayload,
    AdminAssignPayload,
    AdminEnrollmentItem,
    AdminModulSiswaItem,
    AdminTopikItem,
    AdminTopikCreatePayload,
    AdminTopikUpdatePayload,
    AdminMateriItem,
    AdminMateriCreatePayload,
    AdminMateriUpdatePayload,
    AdminKuisItem,
    AdminKuisCreatePayload,
    AdminKuisUpdatePayload,
    AdminSiswaItem,
    AdminSiswaCreatePayload,
    AdminSiswaUpdatePayload,
    AdminTutorItem,
    AdminTutorCreatePayload,
    AdminTutorUpdatePayload,
    AdminProgressItem,
    AdminCTAnalysis,
    AdminProfile,
} from "./types/admin";

const API_BASE =
    typeof window !== "undefined"
        ? "/api-backend"
        : process.env.NEXT_PUBLIC_API_URL || "";

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

const uploadClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = authApi
            .refresh()
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

function createResponseInterceptor(client: typeof apiClient) {
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config as AxiosRequestConfig & {
                _retry?: boolean;
            };

            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes("/auth/login") &&
                !originalRequest.url?.includes("/auth/refresh")
            ) {
                originalRequest._retry = true;
                try {
                    await refreshAccessToken();
                    return client(originalRequest);
                } catch {
                    // fall through to the original 401 error
                }
            }

            const msg =
                error.response?.data?.message ??
                "Terjadi kesalahan pada server";

            throw new ApiError(
                String(msg),
                error.response?.status ?? 500,
                error.response?.data,
            );
        },
    );
}

createResponseInterceptor(apiClient);
createResponseInterceptor(uploadClient);

export async function apiFetch<T = unknown>(
    path: string,
    options: AxiosRequestConfig = {},
): Promise<T> {
    const response = await apiClient({
        url: path,
        method: options.method,
        data: options.data,
        headers: options.headers,
    });
    return response.data as T;
}

export async function apiUpload<T = unknown>(
    path: string,
    formData: FormData,
): Promise<T> {
    const response = await uploadClient({
        url: path,
        method: "POST",
        data: formData,
    });
    return response.data as T;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export const authApi = {
    login(email: string, password: string) {
        return apiFetch<LoginResponse>("/auth/login", {
            method: "POST",
            data: { email, password },
        });
    },

    register(payload: RegisterPayload) {
        return apiFetch<UserSession>("/auth/register", {
            method: "POST",
            data: payload,
        });
    },

    logout() {
        return apiFetch<{ message: string }>("/auth/logout", {
            method: "POST",
        });
    },

    refresh() {
        return apiFetch<{ message: string }>("/auth/refresh", {
            method: "POST",
        });
    },

    getMe() {
        return apiFetch<UserSession>("/auth/me");
    },

    update(payload: Partial<RegisterPayload>) {
        return apiFetch<UserSession>("/auth/update", {
            method: "PUT",
            data: payload,
        });
    },

    forgotPassword(email: string) {
        return apiFetch<{ message: string }>("/auth/forgot-password", {
            method: "POST",
            data: { email },
        });
    },

    resetPassword(token: string, password: string) {
        return apiFetch<{ message: string }>("/auth/reset-password", {
            method: "POST",
            data: { token, password },
        });
    },
};

// ---------------------------------------------------------------------------
// Dashboard endpoints
// ---------------------------------------------------------------------------

export const dashboardApi = {
    siswa() {
        return apiFetch<SiswaDashboard>("/siswa/dashboard");
    },

    tutor() {
        return apiFetch<TutorDashboard>("/tutor/dashboard");
    },
};

// ---------------------------------------------------------------------------
// Siswa – Modul endpoints
// ---------------------------------------------------------------------------

export const siswaModulApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<ModuleItem>>(
            `/siswa/modul${qs ? `?${qs}` : ""}`,
        );
    },

    getEnrolled(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<EnrolledModuleItem>>(
            `/siswa/modul/enrolled${qs ? `?${qs}` : ""}`,
        );
    },

    getById(id: string) {
        return apiFetch<ModuleDetailResponse>(`/siswa/modul/${id}`);
    },

    enroll(id: string) {
        return apiFetch<{ message: string }>(`/siswa/modul/${id}/enroll`, {
            method: "POST",
        });
    },
};

// ---------------------------------------------------------------------------
// Siswa – Study Room endpoints (consolidated module + questions + progress)
// ---------------------------------------------------------------------------

export const siswaStudyRoomApi = {
    getByModul(modulId: string) {
        return apiFetch<StudyRoomResponse>(`/siswa/study-room/${modulId}`);
    },
};

// ---------------------------------------------------------------------------
// Siswa – Topik endpoints
// ---------------------------------------------------------------------------

export const siswaTopikApi = {
    getByModul(modulId: string) {
        return apiFetch<TopikItem[]>(`/siswa/topik/${modulId}`);
    },
};

// ---------------------------------------------------------------------------
// Siswa – Materi endpoints
// ---------------------------------------------------------------------------

export const siswaMateriApi = {
    getByModul(modulId: string) {
        return apiFetch<MateriItem[]>(`/siswa/materi/${modulId}`);
    },
};

// ---------------------------------------------------------------------------
// Siswa – Submateri endpoints
// ---------------------------------------------------------------------------

export const siswaSubmateriApi = {
    getByMateri(materiId: string) {
        return apiFetch<SubmateriItem[]>(`/siswa/submateri/materi/${materiId}`);
    },

    getById(id: string) {
        return apiFetch<SubmateriItem>(`/siswa/submateri/${id}`);
    },
};

// ---------------------------------------------------------------------------
// Siswa – Progress endpoints
// ---------------------------------------------------------------------------

export const siswaProgressApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<ProgressDetail>>(
            `/siswa/progress${qs ? `?${qs}` : ""}`,
        );
    },

    getByModul(modulId: string) {
        return apiFetch<ProgressDetail>(`/siswa/progress/${modulId}`);
    },

    completeMateri(materiId: string) {
        return apiFetch<{ message: string }>(
            `/siswa/progress/materi/${materiId}/complete`,
            { method: "POST" },
        );
    },

    completeItem(itemId: string, itemType: string, modulId: string) {
        return apiFetch<{ message: string }>(
            `/siswa/progress/item/${itemId}/complete`,
            {
                method: "POST",
                data: { itemType, modulId },
            },
        );
    },
};

// ---------------------------------------------------------------------------
// Siswa – Pretest endpoints
// ---------------------------------------------------------------------------

export const siswaPretestApi = {
    getByModul(modulId: string) {
        return apiFetch<PretestResponse>(`/siswa/pretest/${modulId}`);
    },

    submit(modulId: string, payload: TestSubmitPayload) {
        return apiFetch<TestSubmitResult>(`/siswa/pretest/${modulId}/submit`, {
            method: "POST",
            data: payload,
        });
    },
};

// ---------------------------------------------------------------------------
// Siswa – Posttest endpoints
// ---------------------------------------------------------------------------

export const siswaPosttestApi = {
    getByModul(modulId: string) {
        return apiFetch<PosttestResponse>(`/siswa/posttest/${modulId}`);
    },

    submit(modulId: string, payload: TestSubmitPayload) {
        return apiFetch<TestSubmitResult>(`/siswa/posttest/${modulId}/submit`, {
            method: "POST",
            data: payload,
        });
    },
};

// ---------------------------------------------------------------------------
// Siswa – Rating endpoints
// ---------------------------------------------------------------------------

export const siswaRatingApi = {
    rate(modulId: string, payload: { rating: number; komentar?: string }) {
        return apiFetch<{ message: string }>(`/siswa/rating/${modulId}`, {
            method: "POST",
            data: payload,
        });
    },
};

// ---------------------------------------------------------------------------
// Siswa – Certificates endpoints
// ---------------------------------------------------------------------------

export const siswaCertificateApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<CertificateItem>>(
            `/siswa/certificates${qs ? `?${qs}` : ""}`,
        );
    },

    getById(id: string) {
        return apiFetch<CertificateItem>(`/siswa/certificates/${id}`);
    },

    claim(modulId: string) {
        return apiFetch<StudyRoomCertificate>("/siswa/certificates/claim", {
            method: "POST",
            data: { modulId },
        });
    },
};

// ---------------------------------------------------------------------------
// Siswa – Profile endpoints
// ---------------------------------------------------------------------------

export const siswaProfileApi = {
    get() {
        return apiFetch<SiswaProfile>("/siswa/profile");
    },
};

// ---------------------------------------------------------------------------
// Siswa – Kuis endpoints
// ---------------------------------------------------------------------------

export const siswaKuisApi = {
    getByMateri(materiId: string) {
        return apiFetch<QuizItem[]>(`/siswa/kuis/materi/${materiId}`);
    },

    submit(payload: QuizSubmitPayload) {
        return apiFetch<QuizSubmitResult>("/siswa/kuis/submit", {
            method: "POST",
            data: payload,
        });
    },
};

// ---------------------------------------------------------------------------
// Notification endpoints (shared across roles)
// ---------------------------------------------------------------------------

export const notificationApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<NotificationItem>>(
            `/notifications${qs ? `?${qs}` : ""}`,
        );
    },

    getUnreadCount() {
        return apiFetch<{ unreadCount: number }>("/notifications/unread-count");
    },

    markAllRead() {
        return apiFetch<{ message: string }>("/notifications", {
            method: "PATCH",
            data: {},
        });
    },

    markRead(id: string) {
        return apiFetch<{ message: string }>(`/notifications/${id}/read`, {
            method: "PATCH",
            data: {},
        });
    },
};

// ---------------------------------------------------------------------------
// Student module endpoints
// ---------------------------------------------------------------------------

export const moduleApi = {
    siswa: {
        list() {
            return apiFetch<SiswaModuleListResponse>("/siswa/modul");
        },

        detail(id: string) {
            return apiFetch<SiswaModuleItem>(`/siswa/modul/${id}`);
        },
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Dashboard endpoints
// ---------------------------------------------------------------------------

export const guruDashboardApi = {
    get() {
        return apiFetch<TutorDashboard>("/tutor/dashboard");
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Modul endpoints
// ---------------------------------------------------------------------------

export const guruModulApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<GuruModuleListResponse>(
            `/tutor/modul/my-modules${qs ? `?${qs}` : ""}`,
        );
    },

    create(payload: GuruModuleCreatePayload) {
        return apiFetch<GuruModuleItem>("/tutor/modul", {
            method: "POST",
            data: payload,
        });
    },

    detail(id: string) {
        return apiFetch<GuruModuleItem>(`/tutor/modul/${id}`);
    },

    update(id: string, payload: GuruModuleUpdatePayload) {
        return apiFetch<GuruModuleItem>(`/tutor/modul/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/modul/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Materi endpoints
// ---------------------------------------------------------------------------

export const guruMateriApi = {
    getByModul(modulId: string) {
        return apiFetch<GuruTopikWithMateri[]>(`/tutor/materi/${modulId}`);
    },

    create(payload: GuruMateriCreatePayload) {
        return apiFetch<GuruMateriItem>("/tutor/materi", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: GuruMateriUpdatePayload) {
        return apiFetch<GuruMateriItem>(`/tutor/materi/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/materi/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Topik endpoints
// ---------------------------------------------------------------------------

export const guruTopikApi = {
    getByModul(modulId: string) {
        return apiFetch<
            {
                id: string;
                nama: string;
                modulId: string;
                createdAt?: string;
                updatedAt?: string;
            }[]
        >(`/tutor/topik/${modulId}`);
    },

    create(payload: { modul_id: string; nama: string }) {
        return apiFetch<{ id: string; nama: string; modulId: string }>(
            "/tutor/topik",
            {
                method: "POST",
                data: payload,
            },
        );
    },

    update(id: string, payload: { nama: string }) {
        return apiFetch<{ id: string; nama: string; modulId: string }>(
            `/tutor/topik/${id}`,
            {
                method: "PUT",
                data: payload,
            },
        );
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/topik/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Submateri endpoints
// ---------------------------------------------------------------------------

export const guruSubmateriApi = {
    getByMateri(materiId: string) {
        return apiFetch<GuruSubmateriItem[]>(
            `/tutor/submateri/materi/${materiId}`,
        );
    },

    getById(id: string) {
        return apiFetch<GuruSubmateriItem>(`/tutor/submateri/${id}`);
    },

    create(payload: GuruSubmateriCreatePayload) {
        return apiFetch<GuruSubmateriItem>("/tutor/submateri", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: GuruSubmateriUpdatePayload) {
        return apiFetch<GuruSubmateriItem>(`/tutor/submateri/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/submateri/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Pretest endpoints
// ---------------------------------------------------------------------------

export const guruPretestApi = {
    getByModul(modulId: string) {
        return apiFetch<GuruPretestItem>(`/tutor/pretest/${modulId}`);
    },

    getDetail(pretestId: string) {
        return apiFetch<GuruPretestItem>(`/tutor/pretest/detail/${pretestId}`);
    },

    create(payload: { modul_id: string }) {
        return apiFetch<GuruPretestItem>("/tutor/pretest", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: Record<string, unknown>) {
        return apiFetch<GuruPretestItem>(`/tutor/pretest/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/pretest/${id}`, {
            method: "DELETE",
        });
    },

    addSoal(payload: GuruPretestSoalPayload) {
        return apiFetch<unknown>("/tutor/pretest/soal", {
            method: "POST",
            data: payload,
        });
    },

    updateSoal(soalId: string, payload: GuruPretestSoalUpdatePayload) {
        return apiFetch<unknown>(`/tutor/pretest/soal/${soalId}`, {
            method: "PUT",
            data: payload,
        });
    },

    deleteSoal(soalId: string) {
        return apiFetch<{ message: string }>(`/tutor/pretest/soal/${soalId}`, {
            method: "DELETE",
        });
    },

    updateSettings(pretestId: string, payload: GuruPretestSettingsPayload) {
        return apiFetch<unknown>(`/tutor/pretest/settings/${pretestId}`, {
            method: "PUT",
            data: payload,
        });
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Posttest endpoints
// ---------------------------------------------------------------------------

export const guruPosttestApi = {
    getByModul(modulId: string) {
        return apiFetch<GuruPosttestItem>(`/tutor/posttest/${modulId}`);
    },

    getDetail(posttestId: string) {
        return apiFetch<GuruPosttestItem>(
            `/tutor/posttest/detail/${posttestId}`,
        );
    },

    create(payload: { modul_id: string }) {
        return apiFetch<GuruPosttestItem>("/tutor/posttest", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: Record<string, unknown>) {
        return apiFetch<GuruPosttestItem>(`/tutor/posttest/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/posttest/${id}`, {
            method: "DELETE",
        });
    },

    addSoal(payload: GuruPosttestSoalPayload) {
        return apiFetch<unknown>("/tutor/posttest/soal", {
            method: "POST",
            data: payload,
        });
    },

    updateSoal(soalId: string, payload: GuruPosttestSoalUpdatePayload) {
        return apiFetch<unknown>(`/tutor/posttest/soal/${soalId}`, {
            method: "PUT",
            data: payload,
        });
    },

    deleteSoal(soalId: string) {
        return apiFetch<{ message: string }>(`/tutor/posttest/soal/${soalId}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Admin – Pretest & Posttest (alias ke endpoint tutor, admin memiliki akses sama)
// ---------------------------------------------------------------------------

export const adminPretestApi = guruPretestApi;
export const adminPosttestApi = guruPosttestApi;

// ---------------------------------------------------------------------------
// Guru / Tutor – Kuis endpoints
// ---------------------------------------------------------------------------

export const guruKuisApi = {
    create(payload: GuruKuisCreatePayload) {
        return apiFetch<GuruKuisItem>("/tutor/kuis", {
            method: "POST",
            data: payload,
        });
    },

    getAll(limit = 10, cursor?: string | null) {
        const params = new URLSearchParams({ limit: String(limit) });
        if (cursor) params.set("cursor", cursor);
        return apiFetch<{ items: GuruKuisItem[]; next_cursor: string | null }>(
            `/tutor/kuis?${params.toString()}`,
        );
    },

    getById(id: string) {
        return apiFetch<GuruKuisItem>(`/tutor/kuis/${id}`);
    },

    update(id: string, payload: GuruKuisUpdatePayload) {
        return apiFetch<GuruKuisItem>(`/tutor/kuis/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/tutor/kuis/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Upload endpoint
// ---------------------------------------------------------------------------

export const uploadApi = {
    upload(file: File, fileType?: string) {
        const type = fileType || "MODULE_IMAGE";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("fileType", type);
        return apiFetch<UploadResponse>("/upload", {
            method: "POST",
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Profile endpoint
// ---------------------------------------------------------------------------

export const guruProfileApi = {
    get() {
        return apiFetch<TutorProfile>("/tutor/profile");
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Signature endpoints
// ---------------------------------------------------------------------------

interface SignatureResponse {
    message: string;
    signatureUrl: string;
}

interface SignatureGetResponse {
    signatureUrl: string | null;
}

export const guruSignatureApi = {
    get() {
        return apiFetch<SignatureGetResponse>("/tutor/signature");
    },
    upload(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return apiUpload<SignatureResponse>("/tutor/signature", formData);
    },
};

// ---------------------------------------------------------------------------
// Guru / Tutor – Progress endpoints
// ---------------------------------------------------------------------------

export const guruProgressApi = {
    getAll(limit = 10, cursor?: string | null) {
        const params = new URLSearchParams({ limit: String(limit) });
        if (cursor) params.set("cursor", cursor);
        return apiFetch<TutorProgressPaginatedResponse>(
            `/tutor/progress?${params.toString()}`,
        );
    },

    getByStudent(studentId: string) {
        return apiFetch<TutorProgressByStudent>(`/tutor/progress/${studentId}`);
    },

    analyze(studentId: string) {
        return apiFetch<Record<string, unknown>[]>(
            `/tutor/progress/${studentId}/analyze`,
        );
    },
};

// ---------------------------------------------------------------------------
// Admin – Dashboard endpoints
// ---------------------------------------------------------------------------

export const adminDashboardApi = {
    get() {
        return apiFetch<AdminDashboardStats>("/admin/dashboard/");
    },
};

// ---------------------------------------------------------------------------
// Admin – Modul endpoints
// ---------------------------------------------------------------------------

export const adminModulApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<AdminModulItem>>(
            `/admin/modul${qs ? `?${qs}` : ""}`,
        );
    },

    getById(id: string) {
        return apiFetch<AdminModulItem>(`/admin/modul/${id}`);
    },

    create(payload: AdminModulCreatePayload) {
        return apiFetch<AdminModulItem>("/admin/modul", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: AdminModulUpdatePayload) {
        return apiFetch<AdminModulItem>(`/admin/modul/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string, tutorId?: string) {
        return apiFetch<{ message: string }>(`/admin/modul/${id}`, {
            method: "DELETE",
            data: tutorId ? { tutorId } : undefined,
        });
    },

    assign(payload: AdminAssignPayload) {
        return apiFetch<AdminEnrollmentItem>("/admin/modul/assign", {
            method: "POST",
            data: payload,
        });
    },

    unassign(payload: AdminAssignPayload) {
        return apiFetch<{ message: string }>("/admin/modul/assign", {
            method: "DELETE",
            data: payload,
        });
    },

    getAssigned(payload: AdminAssignPayload) {
        return apiFetch<AdminEnrollmentItem[]>("/admin/modul/assigned", {
            method: "GET",
            data: payload,
        });
    },

    getStudents(modulId: string, params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<AdminModulSiswaItem>>(
            `/admin/manage/module/${modulId}/siswa/all${qs ? `?${qs}` : ""}`,
        );
    },
};

// ---------------------------------------------------------------------------
// Admin – Topik endpoints
// ---------------------------------------------------------------------------

export const adminTopikApi = {
    getByModul(modulId: string) {
        return apiFetch<AdminTopikItem[]>(`/admin/topik/${modulId}`);
    },

    create(payload: AdminTopikCreatePayload) {
        return apiFetch<AdminTopikItem>("/admin/topik", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: AdminTopikUpdatePayload) {
        return apiFetch<AdminTopikItem>(`/admin/topik/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<AdminTopikItem>(`/admin/topik/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Admin – Materi endpoints
// ---------------------------------------------------------------------------

export const adminMateriApi = {
    getByModul(modulId: string) {
        return apiFetch<AdminMateriItem[]>(`/admin/materi/${modulId}`);
    },

    create(payload: AdminMateriCreatePayload) {
        return apiFetch<AdminMateriItem>("/admin/materi", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: AdminMateriUpdatePayload) {
        return apiFetch<AdminMateriItem>(`/admin/materi/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<AdminMateriItem>(`/admin/materi/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Admin – Kuis endpoints
// ---------------------------------------------------------------------------

export const adminKuisApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<AdminKuisItem>>(
            `/admin/kuis${qs ? `?${qs}` : ""}`,
        );
    },

    getById(id: string) {
        return apiFetch<AdminKuisItem>(`/admin/kuis/${id}`);
    },

    create(payload: AdminKuisCreatePayload) {
        return apiFetch<AdminKuisItem>("/admin/kuis", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: AdminKuisUpdatePayload) {
        return apiFetch<AdminKuisItem>(`/admin/kuis/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<AdminKuisItem>(`/admin/kuis/${id}`, {
            method: "DELETE",
        });
    },
};

// ---------------------------------------------------------------------------
// Admin – Siswa endpoints
// ---------------------------------------------------------------------------

export const adminSiswaApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<CursorPagination<AdminSiswaItem>>(
            `/admin/siswa${qs ? `?${qs}` : ""}`,
        );
    },

    search(q: string) {
        return apiFetch<AdminSiswaItem[]>(
            `/admin/siswa/search?q=${encodeURIComponent(q)}`,
        );
    },

    create(payload: AdminSiswaCreatePayload) {
        return apiFetch<AdminSiswaItem>("/admin/siswa", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: AdminSiswaUpdatePayload) {
        return apiFetch<AdminSiswaItem>(`/admin/siswa/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/admin/siswa/${id}`, {
            method: "DELETE",
        });
    },

    deactivate(id: string) {
        return apiFetch<AdminSiswaItem>(`/admin/siswa/${id}/deactivate`, {
            method: "PATCH",
        });
    },

    activate(id: string) {
        return apiFetch<AdminSiswaItem>(`/admin/siswa/${id}/activate`, {
            method: "PATCH",
        });
    },
};

// ---------------------------------------------------------------------------
// Admin – Tutor endpoints
// ---------------------------------------------------------------------------

export const adminTutorApi = {
    getAll() {
        return apiFetch<AdminTutorItem[]>("/admin/tutor");
    },

    search(q: string) {
        return apiFetch<AdminTutorItem[]>(
            `/admin/tutor/search?q=${encodeURIComponent(q)}`,
        );
    },

    create(payload: AdminTutorCreatePayload) {
        return apiFetch<AdminTutorItem>("/admin/tutor", {
            method: "POST",
            data: payload,
        });
    },

    update(id: string, payload: AdminTutorUpdatePayload) {
        return apiFetch<AdminTutorItem>(`/admin/tutor/${id}`, {
            method: "PUT",
            data: payload,
        });
    },

    delete(id: string) {
        return apiFetch<{ message: string }>(`/admin/tutor/${id}`, {
            method: "DELETE",
        });
    },

    deactivate(id: string) {
        return apiFetch<AdminTutorItem>(`/admin/tutor/${id}/deactivate`, {
            method: "PATCH",
        });
    },
};

// ---------------------------------------------------------------------------
// Admin – Progress endpoints
// ---------------------------------------------------------------------------

export const adminProgressApi = {
    getAll(params?: { cursor?: string; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.cursor) query.set("cursor", params.cursor);
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<AdminProgressItem[]>(
            `/admin/progress${qs ? `?${qs}` : ""}`,
        );
    },

    getById(studentId: string) {
        return apiFetch<AdminProgressItem>(`/admin/progress/${studentId}`);
    },

    analyze(studentId: string) {
        return apiFetch<AdminCTAnalysis>(
            `/admin/progress/${studentId}/analyze`,
        );
    },
};

// ---------------------------------------------------------------------------
// Admin – Profile endpoints
// ---------------------------------------------------------------------------

export const adminProfileApi = {
    get() {
        return apiFetch<AdminProfile>("/admin/profile/profile");
    },
};

// ---------------------------------------------------------------------------
// Upload endpoints (image → Cloudinary → URL)
// ---------------------------------------------------------------------------
