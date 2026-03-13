"use client";

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-card">
      {message}
    </div>
  );
}
