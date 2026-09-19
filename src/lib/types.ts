/**
 * Shapes the client components render. They mirror what `queries.ts` returns,
 * deliberately flattened and serialised (dates as ISO strings) so they can
 * cross the server/client boundary.
 */
import type { AssignmentStatus, CallOutcome } from "@/generated/prisma/enums";

export type { AssignmentStatus, CallOutcome };

export type AssignmentRow = {
  id: string;
  name: string;
  phone: string;
  status: AssignmentStatus;
  dueAt: string;
  /** "Due tomorrow", "Overdue by 2 days" — pending only. */
  dueLabel?: string;
  overdue: boolean;
};

export type CallHistoryRow = {
  id: string;
  visitorName: string;
  phone: string;
  outcome: CallOutcome;
  calledAt: string;
  durationSeconds: number;
  notes?: string;
};

export type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  online: boolean;
};

export type DailyProgressPoint = {
  /** ISO date. */
  date: string;
  calls: number;
};
