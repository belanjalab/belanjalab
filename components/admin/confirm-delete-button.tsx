"use client";

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
      onClick={(event) => {
        const confirmed = window.confirm(message);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
    >
      {label}
    </button>
  );
}
