import { PhoneCall } from "lucide-react";

const OUTCOME_BADGE: Record<string, { label: string; class: string }> = {
  ANSWERED: { label: "Answered", class: "bg-emerald-100 text-emerald-700" },
  NO_ANSWER: { label: "No answer", class: "bg-slate-100 text-slate-600" },
  CALLBACK: { label: "Callback", class: "bg-sky-100 text-sky-700" },
  WRONG_NUMBER: { label: "Wrong number", class: "bg-rose-100 text-rose-700" },
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  if (seconds === 0) return "—";
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

export type RecentCall = {
  id: string;
  visitorName: string;
  telepastorName: string;
  outcome: string;
  calledAt: string;
  durationSeconds: number;
};

export function AdminRecentCalls({ calls }: { calls: RecentCall[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Recent calls</h2>
      {calls.length === 0 ? (
        <p className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-400">
          <PhoneCall className="size-6" aria-hidden />
          No calls logged yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {calls.map((call) => {
            const badge = OUTCOME_BADGE[call.outcome] ?? OUTCOME_BADGE.NO_ANSWER;
            return (
              <li key={call.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {call.visitorName}
                  </p>
                  <p className="text-xs text-slate-500">
                    by {call.telepastorName} · {formatWhen(call.calledAt)}
                  </p>
                </div>
                <span
                  className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${badge.class}`}
                >
                  {badge.label}
                </span>
                <span className="w-14 shrink-0 text-right text-xs text-slate-500">
                  {formatDuration(call.durationSeconds)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
