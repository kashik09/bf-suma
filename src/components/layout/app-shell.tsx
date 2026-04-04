export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">{children}</div>;
}
