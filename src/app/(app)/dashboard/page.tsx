import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";
import { Card, CardHeader } from "@/components/ui";
import { getDashboardSummary, getMyAssignments } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { EmptyState, PageContainer } from "../page-container";
import { byUrgency, PersonRow } from "../person-row";
import { Greeting } from "./greeting";

export const metadata: Metadata = {
  title: "Home | First Love Telepastoring",
  description: "The people assigned to you, calls made and follow-ups due.",
};

const UP_NEXT_LIMIT = 5;

export default async function DashboardPage() {
  const user = await requireUser();
  const [summary, assignments] = await Promise.all([
    getDashboardSummary(user),
    getMyAssignments(user),
  ]);

  const { assigned, called } = summary;
  const progress = assigned === 0 ? 0 : Math.round((called / assigned) * 100);
  const toCall = assignments
    .filter((a) => a.status === "PENDING" || a.status === "CALLBACK")
    .sort(byUrgency);
  const overdue = toCall.filter((a) => a.overdue).length;

  const stats = [
    { label: "Assigned", value: summary.assigned },
    { label: "Called", value: summary.called },
    { label: "Pending", value: summary.pending },
    { label: "Callbacks", value: summary.callbacks },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-lg shadow-violet-700/20 sm:p-8">
          {/* Soft light in the corner so the gradient doesn't read as flat. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative">
            <Greeting name={user.name} />
            {overdue > 0 && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                <span className="size-2 rounded-full bg-amber-300" aria-hidden />
                {overdue} {overdue === 1 ? "person is" : "people are"} overdue for a call
              </p>
            )}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 ring-inset"
                >
                  <dt className="text-xs font-medium text-white/75">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Up next"
              description={
                toCall.length === 0
                  ? "Nobody is waiting on a call from you."
                  : `${toCall.length} ${toCall.length === 1 ? "person" : "people"} to call, most urgent first.`
              }
              action={
                <Link
                  href="/my-calls"
                  className="flex shrink-0 items-center gap-1 text-sm font-medium text-violet-700 hover:text-violet-600"
                >
                  View all
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            />
            {toCall.length === 0 ? (
              <EmptyState
                icon={<PartyPopper aria-hidden />}
                message="You're all caught up"
                description="New people will appear here as soon as they're assigned to you."
              />
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                {toCall.slice(0, UP_NEXT_LIMIT).map((person) => (
                  <PersonRow key={person.id} person={person} />
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Follow-up progress"
              description="Share of the people assigned to you who have been reached."
            />
            <div className="flex flex-col items-center px-5 pt-5 pb-6 sm:px-6">
              <div
                role="img"
                aria-label={`${progress}% called`}
                className="relative grid size-36 place-items-center"
              >
                <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-violet-100" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="stroke-violet-600 transition-[stroke-dashoffset] duration-700"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                    {progress}%
                  </p>
                  <p className="text-xs text-slate-500">called</p>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-slate-600">
                <span className="font-medium text-slate-900">{called}</span> of{" "}
                <span className="font-medium text-slate-900">{assigned}</span>{" "}
                {assigned === 1 ? "person" : "people"} reached
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
