export function AdminTopbar() {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-900">Operations Dashboard</h1>
        <p className="text-sm text-slate-500">Role: Operations</p>
      </div>
    </div>
  );
}
