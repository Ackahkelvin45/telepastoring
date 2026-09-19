import type { DailyProgressPoint } from "@/lib/types";

/**
 * Calls per day, single series. Built from HTML rather than a scaled SVG so
 * labels keep a readable size at phone widths instead of shrinking with the
 * chart. Marks follow the dashboard's chart conventions: one hue, 4px rounded
 * data ends on the baseline, recessive grid, per-bar tooltip, and a table view.
 */

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = value <= 10 ? 2 : 5;
  return Math.ceil(value / step) * step;
}

function weekday(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short" });
}

export function DailyProgressChart({ data }: { data: DailyProgressPoint[] }) {
  const max = niceMax(Math.max(0, ...data.map((d) => d.calls)));
  const ticks = [max, max / 2, 0];
  const total = data.reduce((sum, d) => sum + d.calls, 0);
  const lastIndex = data.length - 1;

  return (
    <div>
      <div
        role="img"
        aria-label={`Calls logged per day over the last ${data.length} days, ${total} in total.`}
        className="flex gap-3"
      >
        {/* Y axis: each label is pinned to the same height as its gridline. */}
        <div className="relative h-44 w-4 shrink-0 text-right text-xs text-slate-400 tabular-nums">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-44">
            {ticks.map((tick) => (
              <div
                key={tick}
                aria-hidden
                className={`absolute inset-x-0 border-t ${tick === 0 ? "border-slate-300" : "border-dashed border-slate-200"}`}
                style={{ bottom: `${(tick / max) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-3">
              {data.map((point) => (
                <div
                  key={point.date}
                  tabIndex={0}
                  aria-label={`${weekday(point.date)}: ${point.calls} ${point.calls === 1 ? "call" : "calls"}`}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute z-10 rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ bottom: `calc(${(point.calls / max) * 100}% + 8px)` }}
                  >
                    {point.calls} {point.calls === 1 ? "call" : "calls"}
                  </span>
                  <div
                    className="w-full max-w-9 rounded-t-[4px] bg-violet-600 transition-colors group-hover:bg-violet-700 group-focus-visible:bg-violet-700"
                    style={{ height: `${(point.calls / max) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-1.5 sm:gap-3" aria-hidden>
            {data.map((point, index) => (
              <span
                key={point.date}
                className={`flex-1 text-center text-xs ${
                  index === lastIndex ? "font-semibold text-slate-900" : "text-slate-500"
                }`}
              >
                {index === lastIndex ? "Today" : weekday(point.date)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
          Show as table
        </summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-slate-500">
              <th scope="col" className="py-1.5 font-medium">Day</th>
              <th scope="col" className="py-1.5 text-right font-medium">Calls</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {data.map((point) => (
              <tr key={point.date} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-700">{weekday(point.date)}</td>
                <td className="py-1.5 text-right text-slate-700">{point.calls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
