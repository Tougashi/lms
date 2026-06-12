'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '../lib/api';
import type { UserSession, LoginResponse, RegisterPayload } from '../lib/types/umum';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: UserSession | null;
  role: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<UserSession>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const PUBLIC_PATHS = ['/', '/login', '/daftar', '/daftar-tutor', '/tentang-kami', '/eksplor-modul'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ── Bootstrap: check localStorage for cached session ──────────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');

      if (storedUser && storedRole) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  // ── Redirect unauthenticated from protected pages ─────────────────────
  useEffect(() => {
    if (isLoading) return;

    if (!user && !isPublicPath(pathname)) {
      router.replace('/login');
    }
  }, [user, isLoading, pathname, router]);

  // ── Auto-logout on session expiry (token + refresh both expired) ──────
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setRole(null);
      router.replace('/login');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [router]);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);

      // Persist session info for UI (auth is via HTTP-only cookies through proxy)
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.role);

      setUser(data.user);
      setRole(data.role);

      // Redirect based on role
      switch (data.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'tutor':
        case 'guru':
          router.push('/beranda-guru');
          break;
        case 'siswa':
        default:
          router.push('/beranda-siswa');
          break;
      }

      return data;
    },
    [router]
  );

  // ── Register ──────────────────────────────────────────────────────────
  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authApi.register(payload);
      router.push('/login');
      return data;
    },
    [router]
  );

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore server errors on logout
    }

    localStorage.removeItem('user');
    localStorage.removeItem('role');

    setUser(null);
    setRole(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, role, isLoading, login, register, logout }),
    [user, role, isLoading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
