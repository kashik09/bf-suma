export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      <span>{label}</span>
    </div>
  );
}
