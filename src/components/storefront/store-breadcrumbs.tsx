import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreBreadcrumbItem {
  label: string;
  href?: string;
}

// Favicon brand colors for chevron alternation
const CHEVRON_COLORS = [
  "text-[#50B748]", // Green
  "text-[#F4813D]", // Orange
  "text-[#EC297B]", // Pink
  "text-[#00AADB]", // Blue
  "text-[#F9A533]"  // Yellow
];

export function StoreBreadcrumbs({
  items,
  className
}: {
  items: StoreBreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const chevronColor = CHEVRON_COLORS[(index - 1) % CHEVRON_COLORS.length];
        return (
          <div className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 ? <ChevronRight className={cn("h-3.5 w-3.5", chevronColor)} /> : null}
            {item.href && !isLast ? (
              <Link className="text-slate-600 transition hover:text-slate-900" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-slate-900" : "text-slate-600"}>{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
