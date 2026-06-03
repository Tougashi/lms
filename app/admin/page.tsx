import { redirect } from 'next/navigation';

/**
 * /admin → redirect to /admin/dashboard
 * This acts as a fallback so that accessing /admin always lands on the dashboard.
 */
export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
