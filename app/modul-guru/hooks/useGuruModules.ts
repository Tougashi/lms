'use client';

import { useState, useCallback } from 'react';
import { guruModulApi } from '@/app/lib/api';
import type { GuruModuleItem } from '@/app/lib/types/guru';

type PageCache = {
  cursor: string | null;
  items: GuruModuleItem[];
  nextCursor: string | null;
};

export function useGuruModules(pageSize = 10) {
  const [pages, setPages] = useState<PageCache[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await guruModulApi.getAll({ limit: pageSize });
      setPages([{
        cursor: null,
        items: res.items,
        nextCursor: res.next_cursor,
      }]);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const nextPage = useCallback(async () => {
    const currentPage = pages[currentIndex];
    if (!currentPage?.nextCursor || isLoading) return;

    if (currentIndex + 1 < pages.length) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setIsLoading(true);
    try {
      const res = await guruModulApi.getAll({
        cursor: currentPage.nextCursor,
        limit: pageSize,
      });
      setPages((prev) => [...prev, {
        cursor: currentPage.nextCursor,
        items: res.items,
        nextCursor: res.next_cursor,
      }]);
      setCurrentIndex((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [pages, currentIndex, isLoading, pageSize]);

  const prevPage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const currentPage = pages[currentIndex];
  const modules = currentPage?.items ?? [];
  const hasPrev = currentIndex > 0;
  const hasNext = currentPage?.nextCursor != null;
  const currentPageNumber = currentIndex + 1;

  return {
    modules,
    currentPageNumber,
    hasPrev,
    hasNext,
    isLoading,
    isEmpty: pages.length > 0 && modules.length === 0,
    loadModules,
    nextPage,
    prevPage,
  };
}
