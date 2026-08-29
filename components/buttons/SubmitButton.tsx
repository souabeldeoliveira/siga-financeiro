"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = { children: React.ReactNode };

export function SubmitButton({ children }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-wait disabled:opacity-60">
      {pending ? "Salvando..." : children}
    </button>
  );
}
