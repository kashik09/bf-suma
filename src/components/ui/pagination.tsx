import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button onClick={onPrevious} variant="secondary" disabled={page <= 1}>
          Previous
        </Button>
        <Button onClick={onNext} variant="secondary" disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
