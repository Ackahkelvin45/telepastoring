"use client";

import { useState } from "react";

export type DailyCallPoint = { date: string; calls: number };

/**
 * Zero-dependency bar chart of calls per day. Bars scale to the tallest day;
 * hovering a bar reveals its exact count via a native tooltip on the label.
 */
export function AdminCallsChart({ data }: { data: DailyCallPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.calls));

  const label = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Calls — last 14 days
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Church-wide calls logged per day
          </p>
        </div>
        {hovered !== null && (
          <p className="text-sm font-semibold text-violet-600">
            {data[hovered].calls} on {label(data[hovered].date)}
          </p>
        )}
      </div>

      <div className="mt-6 flex h-44 items-end gap-1.5 sm:gap-2.5">
        {data.map((point, index) => {
          const height = (point.calls / max) * 100;
          const active = hovered === index;
          return (
            <button
              key={point.date}
              type="button"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              aria-label={`${point.calls} calls on ${label(point.date)}`}
              className="group flex h-full flex-1 cursor-default flex-col justify-end rounded-t-md outline-none"
            >
              <div
                className={`w-full rounded-t-md transition-colors ${
                  active
                    ? "bg-violet-700"
                    : point.calls === 0
                      ? "bg-slate-100"
                      : "bg-violet-500 group-hover:bg-violet-600"
                }`}
                style={{ height: `${Math.max(height, point.calls === 0 ? 2 : 6)}%` }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5">
        {data.map((point, index) => (
          <span
            key={point.date}
            className={`flex-1 text-center text-[10px] ${
              hovered === index ? "font-semibold text-violet-600" : "text-slate-400"
            }`}
          >
            {index % 2 === 0 ? new Date(`${point.date}T00:00:00`).getDate() : ""}
          </span>
        ))}
      </div>
    </section>
  );
}
