import axios, { type AxiosRequestConfig } from "axios";
import { ApiError } from "./types/umum";

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
    TestSubmitPayload,
    TestSubmitResult,
} from "./types/siswa";
import type {
    TutorDashboard,
    GuruModuleListResponse,
    GuruModuleItem,
    GuruModuleCreatePayload,
    GuruModuleUpdatePayload,
    GuruMateriItem,
    GuruMateriCreatePayload,
    GuruMateriUpdatePayload,
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

apiClient.interceptors.response.use(
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
                return apiClient(originalRequest);
            } catch {
                // fall through to the original 401 error
            }
        }

        const msg =
            error.response?.data?.message ?? "Terjadi kesalahan pada server";

        throw new ApiError(
            String(msg),
            error.response?.status ?? 500,
            error.response?.data,
        );
    },
);

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
        return apiFetch<ModuleItem>(`/siswa/modul/${id}`);
    },

    enroll(id: string) {
        return apiFetch<{ message: string }>(`/siswa/modul/${id}/enroll`, {
            method: "POST",
        });
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

    completeSubmateri(submateriId: string) {
        return apiFetch<{ message: string }>(
            `/siswa/progress/submateri/${submateriId}/complete`,
            { method: "POST" },
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
        return apiFetch<GuruMateriItem[]>(`/tutor/materi/${modulId}`);
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
        return apiFetch<{ message: string }>("/admin/modul/unassign", {
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
    getAll() {
        return apiFetch<AdminSiswaItem[]>("/admin/siswa");
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
