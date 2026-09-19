import type { Metadata } from "next";
import { Award, PhoneCall, UserCheck, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { getAdminReports } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Reports | First Love Telepastoring",
  description: "Church-wide follow-up performance.",
};

const OUTCOME_LABEL: Record<string, string> = {
  ANSWERED: "Answered",
  NO_ANSWER: "No answer",
  CALLBACK: "Callback",
  WRONG_NUMBER: "Wrong number",
};

const OUTCOME_CLASS: Record<string, string> = {
  ANSWERED: "bg-emerald-100 text-emerald-700",
  NO_ANSWER: "bg-slate-100 text-slate-600",
  CALLBACK: "bg-sky-100 text-sky-700",
  WRONG_NUMBER: "bg-rose-100 text-rose-700",
};

/** The visitor journey, in the order a person moves through it. */
const STAGE_ORDER = [
  "NEW",
  "CONTACTED",
  "ATTENDING",
  "IN_GROUP",
  "MEMBER",
  "UNREACHABLE",
] as const;

const STAGE_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  ATTENDING: "Attending",
  IN_GROUP: "In group",
  MEMBER: "Member",
  UNREACHABLE: "Unreachable",
};

export default async function AdminReportsPage() {
  await requireAdmin();
  const { outcomes, stages, leaderboard, totals } = await getAdminReports();
  const maxCalls = Math.max(1, ...leaderboard.map((p) => p.calls));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          How pastoral follow-up is going across the church.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Assignments" value={totals.assignments} icon={UserCheck} tone="violet" />
        <StatCard label="Calls logged" value={totals.calls} icon={PhoneCall} tone="green" />
        <StatCard label="People" value={totals.visitors} icon={Users} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Call outcomes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Call outcomes
          </h2>
          <ul className="mt-4 space-y-3">
            {Object.entries(OUTCOME_LABEL).map(([key, label]) => {
              const count = outcomes[key] ?? 0;
              const share =
                totals.calls === 0 ? 0 : Math.round((count / totals.calls) * 100);
              return (
                <li key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-500">
                      {count} · {share}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${OUTCOME_CLASS[key].split(" ")[0]}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Visitor stage funnel */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Visitor journey
          </h2>
          <ol className="mt-4 space-y-2.5">
            {STAGE_ORDER.map((stage) => {
              const count = stages[stage] ?? 0;
              return (
                <li
                  key={stage}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {STAGE_LABEL[stage]}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {count}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {/* Telepastor leaderboard */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Award className="size-5 text-violet-600" aria-hidden />
          Telepastor leaderboard
        </h2>
        {leaderboard.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No telepastors yet.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {leaderboard.map((person, index) => (
              <li key={person.id} className="flex items-center gap-3">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {person.name}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {person.teamName ?? "No team"}
                      </span>
                    </p>
                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {person.calls} calls
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${(person.calls / maxCalls) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
