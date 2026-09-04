"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  label,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between gap-4 pt-3">
      <p className="text-sm text-muted-foreground">
        {total} {label ?? "risultati"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
