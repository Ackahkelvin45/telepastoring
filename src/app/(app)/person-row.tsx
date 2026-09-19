import { Phone } from "lucide-react";
import { Avatar, Badge, type BadgeTone } from "@/components/ui";
import { formatPhone, telHref } from "@/lib/format";
import type { AssignmentRow, AssignmentStatus } from "@/lib/types";

export const STATUS: Record<AssignmentStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: "Pending", tone: "amber" },
  CALLBACK: { label: "Callback", tone: "blue" },
  CALLED: { label: "Called", tone: "green" },
  CLOSED: { label: "Closed", tone: "slate" },
};

/** Overdue first, then pending, then callbacks, then people already reached. */
function urgency(row: AssignmentRow) {
  if (row.overdue) return 0;
  return { PENDING: 1, CALLBACK: 2, CALLED: 3, CLOSED: 4 }[row.status];
}

export function byUrgency(a: AssignmentRow, b: AssignmentRow) {
  return urgency(a) - urgency(b) || a.dueAt.localeCompare(b.dueAt);
}

/** One assigned person: who, how to reach them, and where the follow-up stands. */
export function PersonRow({ person }: { person: AssignmentRow }) {
  const status = STATUS[person.status];

  return (
    <li className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:gap-4 sm:px-5">
      <Avatar name={person.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{person.name}</p>
        <p className="truncate text-sm text-slate-500 tabular-nums">
          {formatPhone(person.phone)}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">
          <PersonBadges person={person} status={status} />
        </div>
      </div>
      <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
        <PersonBadges person={person} status={status} />
      </div>
      <a
        href={telHref(person.phone)}
        aria-label={`Call ${person.name}`}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-600 text-white shadow-sm shadow-violet-600/30 transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        <Phone className="size-[18px]" aria-hidden />
      </a>
    </li>
  );
}

function PersonBadges({
  person,
  status,
}: {
  person: AssignmentRow;
  status: (typeof STATUS)[AssignmentStatus];
}) {
  return (
    <>
      {person.dueLabel && (
        <Badge tone={person.overdue ? "red" : "slate"}>{person.dueLabel}</Badge>
      )}
      <Badge tone={status.tone}>{status.label}</Badge>
    </>
  );
}
