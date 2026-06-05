'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';

  useEffect(() => {
    // Redirect to the correct management siswa page with the modul id
    router.replace(`/admin/manajemen-modul/siswa${id ? `?id=${id}` : ''}`);
  }, [router, id]);

  return <div className="min-h-screen bg-[#f7f6fb]" />;
}

export default function EditModulSiswaRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f6fb]" />}>
      <RedirectContent />
    </Suspense>
  );
}
