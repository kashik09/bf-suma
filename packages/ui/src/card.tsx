import { cn } from "./utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200/90 bg-white p-4 shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
