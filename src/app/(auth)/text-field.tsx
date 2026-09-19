"use client";

import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const BASE_FIELD_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-200";

type TextFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "password" | "date";
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  /** Renders a Show/Hide toggle. Only meaningful for password fields. */
  revealable?: boolean;
  /** Rendered to the right of the label, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
};

export function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
  error,
  revealable = false,
  labelAction,
}: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={revealable && revealed ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={revealable ? `${BASE_FIELD_CLASS} pr-16` : BASE_FIELD_CLASS}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  // The error arrives as a ?error= query param, so a plain refresh would show
  // it forever. Dismissing clears it from the URL too, so back/forward and
  // reloads stay clean.
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <p>{message}</p>
      <button
        type="button"
        aria-label="Dismiss error"
        onClick={() => {
          setDismissed(true);
          const params = new URLSearchParams(window.location.search);
          params.delete("error");
          const qs = params.toString();
          router.replace(qs ? `?${qs}` : window.location.pathname, {
            scroll: false,
          });
        }}
        className="shrink-0 rounded p-0.5 text-red-400 hover:text-red-600"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
