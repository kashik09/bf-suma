import { cloneElement, isValidElement, type ReactElement } from "react";

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
  const errorId = error ? `${htmlFor}-error` : undefined;

  const enhancedChild = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean }>, {
        "aria-describedby": errorId,
        "aria-invalid": error ? true : undefined
      })
    : children;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={htmlFor}>
        {label}
      </label>
      {enhancedChild}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
