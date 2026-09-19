import type { ReactNode } from "react";
import { initials } from "@/lib/format";

/* Small presentational primitives shared across the dashboard. No hooks, so
   they work in both Server and Client Components. */

const AVATAR_SIZE = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
} as const;

export function Avatar({
  name,
  size = "md",
  online,
}: {
  name: string;
  size?: keyof typeof AVATAR_SIZE;
  online?: boolean;
}) {
  return (
    <span className="relative shrink-0">
      <span
        className={`grid place-items-center rounded-full bg-violet-100 font-semibold text-violet-700 ${AVATAR_SIZE[size]}`}
        aria-hidden
      >
        {initials(name)}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </span>
  );
}

export type BadgeTone = "green" | "amber" | "blue" | "red" | "slate";

const BADGE_TONE: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  slate: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
