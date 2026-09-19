import type { Metadata } from "next";
import { History, PhoneCall, PhoneForwarded, PhoneMissed, PhoneOff } from "lucide-react";
import { Avatar, Badge, Card, type BadgeTone } from "@/components/ui";
import { dayHeading, formatDuration, formatPhone, formatTime } from "@/lib/format";
import { getCallHistory } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import type { CallHistoryRow, CallOutcome } from "@/lib/types";
import { EmptyState, PageContainer, PageHeading } from "../page-container";

export const metadata: Metadata = {
  title: "Call History | First Love Telepastoring",
  description: "Every call you have logged, most recent first.",
};

const OUTCOME: Record<CallOutcome, { label: string; icon: typeof PhoneCall; tone: BadgeTone }> = {
  ANSWERED: { label: "Answered", icon: PhoneCall, tone: "green" },
  CALLBACK: { label: "Call back", icon: PhoneForwarded, tone: "blue" },
  NO_ANSWER: { label: "No answer", icon: PhoneMissed, tone: "slate" },
  WRONG_NUMBER: { label: "Wrong number", icon: PhoneOff, tone: "red" },
};

function OutcomeBadge({ outcome }: { outcome: CallOutcome }) {
  const { label, icon: Icon, tone } = OUTCOME[outcome];
  return (
    <Badge tone={tone}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}

/** "Thu 17 Sept · 11:00", with Today / Yesterday for recent calls. */
function When({ entry, now }: { entry: CallHistoryRow; now: Date }) {
  const at = new Date(entry.calledAt);
  return (
    <time dateTime={entry.calledAt}>
      <span className="text-slate-900">{dayHeading(at, now)}</span>
      <span className="text-slate-500"> · {formatTime(at)}</span>
    </time>
  );
}

const TH = "px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase first:pl-5 last:pr-5";
const TD = "px-4 py-4 align-top first:pl-5 last:pr-5";

export default async function CallHistoryPage() {
  const user = await requireUser();
  const entries = await getCallHistory(user);
  const now = new Date();

  return (
    <PageContainer>
      <PageHeading
        title="Call History"
        subtitle={
          entries.length === 0
            ? "Every call you log will be kept here."
            : `${entries.length} ${entries.length === 1 ? "call" : "calls"} logged, most recent first.`
        }
      />

      <Card className="overflow-hidden">
        {entries.length === 0 ? (
          <EmptyState
            icon={<History aria-hidden />}
            message="No calls logged yet"
            description="After each call, its outcome and notes will appear here."
          />
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Calls you have logged, most recent first</caption>
            {/* One lone "Person" heading over a single column reads oddly on a
                phone, so the header row is visually hidden there but kept for
                screen readers. */}
            <thead className="border-b border-slate-200 bg-slate-50/80 max-md:sr-only">
              <tr>
                <th scope="col" className={TH}>Person</th>
                {/* Detail columns appear from tablet width; on phones the same
                    details stack under the name so nothing scrolls sideways. */}
                <th scope="col" className={`${TH} hidden md:table-cell`}>Outcome</th>
                <th scope="col" className={`${TH} hidden md:table-cell`}>Date</th>
                <th scope="col" className={`${TH} hidden text-right! lg:table-cell`}>Duration</th>
                <th scope="col" className={`${TH} hidden md:table-cell`}>Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const duration = formatDuration(entry.durationSeconds);
                return (
                  <tr key={entry.id} className="transition-colors hover:bg-slate-50/60">
                    <td className={TD}>
                      <div className="flex items-start gap-3">
                        <Avatar name={entry.visitorName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{entry.visitorName}</p>
                          <p className="text-slate-500 tabular-nums">{formatPhone(entry.phone)}</p>

                          {/* Phone layout: the hidden columns, stacked. */}
                          <div className="mt-2 space-y-2 md:hidden">
                            <div className="flex flex-wrap items-center gap-2">
                              <OutcomeBadge outcome={entry.outcome} />
                              <span className="tabular-nums">
                                <When entry={entry} now={now} />
                                {duration && <span className="text-slate-400"> · {duration}</span>}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="rounded-lg bg-slate-50 px-3 py-2 leading-relaxed text-slate-700">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${TD} hidden md:table-cell`}>
                      <OutcomeBadge outcome={entry.outcome} />
                    </td>
                    <td className={`${TD} hidden whitespace-nowrap tabular-nums md:table-cell`}>
                      <When entry={entry} now={now} />
                    </td>
                    <td className={`${TD} hidden text-right whitespace-nowrap text-slate-600 tabular-nums lg:table-cell`}>
                      {duration ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className={`${TD} hidden max-w-xs leading-relaxed text-slate-600 md:table-cell`}>
                      {entry.notes ?? <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
