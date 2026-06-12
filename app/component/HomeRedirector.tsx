'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * Client component rendered on the landing page (`/`).
 * If a user is already logged in, immediately redirect them
 * to their role-specific beranda instead of showing the
 * public landing page.
 */
export default function HomeRedirector() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !role) return;

    const normalizedRole = role === 'guru' ? 'tutor' : role;

    switch (normalizedRole) {
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
  }, [user, role, isLoading, router]);

  // This component renders nothing — it only performs the redirect
  return null;
}
