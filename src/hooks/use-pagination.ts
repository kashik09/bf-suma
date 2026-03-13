"use client";

import { useMemo, useState } from "react";

export function usePagination(totalItems: number, pageSize: number = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  return {
    page,
    setPage,
    totalPages,
    pageSize,
    offset
  };
}
