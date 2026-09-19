/**
 * Part-to-whole across the three follow-up states. Each segment's count and
 * share sit beside a matching swatch, so identity never rests on colour alone.
 */
type Segment = "called" | "callback" | "pending";

const SEGMENTS: { status: Segment; label: string; color: string }[] = [
  { status: "called", label: "Called", color: "bg-emerald-600" },
  { status: "callback", label: "Callback", color: "bg-sky-600" },
  { status: "pending", label: "Pending", color: "bg-amber-600" },
];

export function CallPerformance({ counts }: { counts: Record<Segment, number> }) {
  const total = SEGMENTS.reduce((sum, s) => sum + counts[s.status], 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Nothing to report yet. This fills in as people are assigned to you.
      </p>
    );
  }

  return (
    <div>
      {/* 2px surface gaps between segments keep adjacent fills distinct. */}
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {SEGMENTS.map(({ status, color }) =>
          counts[status] === 0 ? null : (
            <div
              key={status}
              className={color}
              style={{ width: `${(counts[status] / total) * 100}%` }}
            />
          ),
        )}
      </div>

      <ul className="mt-5 divide-y divide-slate-100">
        {SEGMENTS.map(({ status, label, color }) => {
          const count = counts[status];
          return (
            <li key={status} className="flex items-center gap-3 py-2.5 text-sm">
              <span className={`size-2.5 shrink-0 rounded-full ${color}`} aria-hidden />
              <span className="flex-1 text-slate-700">{label}</span>
              <span className="font-medium text-slate-900 tabular-nums">{count}</span>
              <span className="w-11 text-right text-slate-500 tabular-nums">
                {Math.round((count / total) * 100)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
