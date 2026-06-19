'use client';

import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

interface CursorPaginationProps {
  /** Current 1-based page number */
  currentPage: number;
  /** Total number of pages (estimated). If unknown, pass undefined and only prev/next will show */
  totalPages?: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
  /** Callback for navigating to next page */
  onNext: () => void;
  /** Callback for navigating to previous page */
  onPrev: () => void;
  /** Optional: callback for jumping to a specific page number */
  onPageClick?: (page: number) => void;
  /** Whether pagination is in a loading state */
  isLoading?: boolean;
  /** Max visible page buttons (default: 5) */
  maxVisible?: number;
}

export default function CursorPagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  onPageClick,
  isLoading = false,
  maxVisible = 5,
}: CursorPaginationProps) {
  // Calculate visible page numbers
  const getVisiblePages = (): number[] => {
    if (!totalPages || totalPages <= 0) return [currentPage];
    const pages: number[] = [];
    const total = Math.max(1, totalPages);
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(total, start + maxVisible - 1);

    // Adjust start if end is capped
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-4 flex items-center justify-center gap-1.5 select-none">
      {/* Previous button */}
      <button
        type="button"
        disabled={!hasPrev || isLoading}
        onClick={onPrev}
        aria-label="Halaman sebelumnya"
        className={`inline-flex h-[32px] w-[32px] items-center justify-center rounded-lg text-[14px] transition-all duration-200 ${
          hasPrev && !isLoading
            ? 'text-[#555968] hover:bg-[#f0ecff] hover:text-[#7054dc] cursor-pointer'
            : 'text-[#c6c8d0] cursor-not-allowed'
        }`}
      >
        <MdKeyboardArrowLeft size={20} />
      </button>

      {/* Page numbers */}
      {totalPages && totalPages > 0 && visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          disabled={isLoading}
          onClick={() => {
            if (page !== currentPage && onPageClick) {
              onPageClick(page);
            }
          }}
          className={`inline-flex h-[32px] min-w-[32px] items-center justify-center rounded-lg px-1 text-[13px] font-semibold transition-all duration-200 ${
            page === currentPage
              ? 'bg-[#7054dc] text-white shadow-[0_2px_8px_rgba(112,84,220,0.3)]'
              : isLoading
                ? 'text-[#c6c8d0] cursor-not-allowed'
                : 'text-[#555968] hover:bg-[#f0ecff] hover:text-[#7054dc] cursor-pointer'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        type="button"
        disabled={!hasNext || isLoading}
        onClick={onNext}
        aria-label="Halaman selanjutnya"
        className={`inline-flex h-[32px] w-[32px] items-center justify-center rounded-lg text-[14px] transition-all duration-200 ${
          hasNext && !isLoading
            ? 'text-[#555968] hover:bg-[#f0ecff] hover:text-[#7054dc] cursor-pointer'
            : 'text-[#c6c8d0] cursor-not-allowed'
        }`}
      >
        <MdKeyboardArrowRight size={20} />
      </button>
    </div>
  );
}
