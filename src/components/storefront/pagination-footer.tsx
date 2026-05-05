"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  preserveParams?: string[];
}

export function PaginationFooter({
  currentPage,
  totalPages,
  baseUrl,
  preserveParams = []
}: PaginationFooterProps) {
  const searchParams = useSearchParams();

  const buildPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      for (const key of preserveParams) {
        const value = searchParams.get(key);
        if (value) params.set(key, value);
      }
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      return query ? `${baseUrl}?${query}` : baseUrl;
    },
    [baseUrl, preserveParams, searchParams]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (totalPages <= 1) return null;

  // Calculate visible page numbers (current ± 2)
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  const showStart = currentPage > 3;
  const showEnd = currentPage < totalPages - 2;

  if (showStart) {
    pages.push(1);
    if (currentPage > 4) pages.push("ellipsis-start");
  }

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (showEnd) {
    if (currentPage < totalPages - 3) pages.push("ellipsis-end");
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  const buttonBase =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition sm:h-10 sm:w-10";
  const buttonActive = "bg-brand-600 border-brand-600 text-white";
  const buttonInactive = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
  const buttonDisabled = "bg-white border-slate-200 text-slate-300 cursor-not-allowed opacity-40";

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {/* Page indicator */}
      <p className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </p>

      {/* Navigation buttons */}
      <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2" aria-label="Pagination">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className={`${buttonBase} ${buttonInactive}`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${buttonBase} ${buttonDisabled}`} aria-disabled="true">
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {/* Page numbers */}
        {pages.map((page) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span key={page} className="px-1 text-slate-400">
                ...
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={`${buttonBase} ${isActive ? buttonActive : buttonInactive}`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Link>
          );
        })}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className={`${buttonBase} ${buttonInactive}`}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${buttonBase} ${buttonDisabled}`} aria-disabled="true">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        <ChevronsUp className="h-4 w-4" />
        Back to top
      </button>
    </div>
  );
}
