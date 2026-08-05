"use client";

import type { MouseEvent } from "react";

type ConfirmDeleteButtonProps = {
  label: string;
  message: string;
};

export default function ConfirmDeleteButton({
  label,
  message,
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        const confirmed = window.confirm(message);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"
    >
      {label}
    </button>
  );
}
