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
import type { TutorDashboard } from "./types/guru";
import type {
    MateriItem,
    ModuleItem,
    SubmateriItem,
    TopikItem,
} from "./types/modul";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

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
        });
    },

    markRead(id: string) {
        return apiFetch<{ message: string }>(`/notifications/${id}/read`, {
            method: "PATCH",
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
