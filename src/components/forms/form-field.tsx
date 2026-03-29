export function FormField({
  label,
  htmlFor,
  children,
  error
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
