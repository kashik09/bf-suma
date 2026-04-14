export default function StorefrontLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-24 w-full rounded-2xl bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </main>
  );
}
