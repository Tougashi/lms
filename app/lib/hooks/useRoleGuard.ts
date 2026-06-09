'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

/**
 * Role-based route guard hook.
 *
 * Checks the user's role against the allowed roles for the current page.
 * If the user's role doesn't match, they are redirected to their role's
 * home page automatically.
 *
 * @param allowedRoles - Array of roles that can access this page (e.g. ['tutor'], ['siswa'], ['admin'])
 * @returns { isAuthorized, isLoading, user, role }
 */
export function useRoleGuard(allowedRoles: string[]) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  const normalizedRole = role === 'guru' ? 'tutor' : role;
  const isAuthorized = !isLoading && !!user && !!role && (allowedRoles.includes(role) || allowedRoles.includes(normalizedRole));

  useEffect(() => {
    if (isLoading) return;

    // Not logged in — AuthContext already handles redirect to /login
    if (!user || !role) return;

    // Handle alias guru <-> tutor
    const currentNormalizedRole = role === 'guru' ? 'tutor' : role;
    const isAllowed = allowedRoles.includes(role) || allowedRoles.includes(currentNormalizedRole);

    // Logged in but wrong role — redirect to their home page
    if (!isAllowed) {
      switch (currentNormalizedRole) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'tutor':
          router.replace('/beranda-guru');
          break;
        case 'siswa':
        default:
          router.replace('/beranda-siswa');
          break;
      }
    }
  }, [isLoading, user, role, allowedRoles, router]);

  return { isAuthorized, isLoading, user, role };
}
