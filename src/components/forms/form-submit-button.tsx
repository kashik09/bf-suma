"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface FormSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel?: string;
  children: ReactNode;
}

export function FormSubmitButton({
  className,
  pendingLabel = "Saving...",
  children,
  disabled,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  return (
    <button
      {...props}
      aria-disabled={isDisabled}
      className={cn("disabled:cursor-not-allowed disabled:opacity-60", className)}
      disabled={isDisabled}
      type={props.type || "submit"}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
