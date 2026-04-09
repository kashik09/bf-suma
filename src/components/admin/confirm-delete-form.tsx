"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { FormSubmitButton } from "@/components/forms";

interface ConfirmDeleteFormProps {
  action: (formData: FormData) => void | Promise<void>;
  triggerLabel: string;
  title: string;
  message: string;
}

export function ConfirmDeleteForm({
  action,
  triggerLabel,
  title,
  message
}: ConfirmDeleteFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-rose-300 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        onClick={() => setOpen(true)}
        type="button"
      >
        {triggerLabel}
      </button>

      <Modal open={open} title={title} onClose={() => setOpen(false)}>
        <p className="text-sm text-slate-700">{message}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => setOpen(false)}
            type="button"
          >
            Cancel
          </button>
          <form action={action}>
            <FormSubmitButton
              className="inline-flex h-10 items-center justify-center rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700"
              pendingLabel="Deleting..."
            >
              Delete
            </FormSubmitButton>
          </form>
        </div>
      </Modal>
    </>
  );
}
