import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-brand-500 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
