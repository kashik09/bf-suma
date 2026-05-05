"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  /** Filter params to preserve when changing page (e.g. { category: "health", sort: "price_asc" }) */
  preserveParams?: Record<string, string>;
}

export function PaginationFooter({
  currentPage,
  totalPages,
  baseUrl,
  preserveParams = {}
}: PaginationFooterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    // Preserve provided filter params
    for (const [key, value] of Object.entries(preserveParams)) {
      if (value) params.set(key, value);
    }
    // Only add page param if > 1
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  const navigateToPage = (page: number) => {
    startTransition(() => {
      router.push(buildPageUrl(page));
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (totalPages <= 1) return null;

  // Calculate visible page numbers (current ± 2 with ellipsis)
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  const showStartEllipsis = currentPage > 3;
  const showEndEllipsis = currentPage < totalPages - 2;

  // Always show page 1 if we're far from it
  if (showStartEllipsis) {
    pages.push(1);
    if (currentPage > 4) pages.push("ellipsis-start");
  }

  // Show current ± 2
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  // Always show last page if we're far from it
  if (showEndEllipsis) {
    if (currentPage < totalPages - 3) pages.push("ellipsis-end");
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  const buttonBase =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition sm:h-10 sm:w-10";
  const buttonActive = "bg-brand-600 border-brand-600 text-white";
  const buttonInactive = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
  const buttonDisabled = "bg-white border-slate-200 text-slate-300 cursor-not-allowed opacity-40";

  return (
    <div className={cn("mt-8 flex flex-col items-center gap-4", isPending && "opacity-60")}>
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
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(currentPage - 1);
            }}
            className={`${buttonBase} ${buttonInactive}`}
            aria-label="Previous page"
            prefetch
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
                …
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={buildPageUrl(page)}
              onClick={(e) => {
                e.preventDefault();
                navigateToPage(page);
              }}
              className={`${buttonBase} ${isActive ? buttonActive : buttonInactive}`}
              aria-current={isActive ? "page" : undefined}
              prefetch
            >
              {page}
            </Link>
          );
        })}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(currentPage + 1);
            }}
            className={`${buttonBase} ${buttonInactive}`}
            aria-label="Next page"
            prefetch
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
