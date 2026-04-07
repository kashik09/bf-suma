"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}

export function PasswordInput({
  id,
  name,
  autoComplete = "current-password",
  required = false,
  placeholder
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        autoComplete={autoComplete}
        className="h-10 w-full rounded-md border border-slate-300 px-3 pr-10 text-sm"
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        type={showPassword ? "text" : "password"}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
