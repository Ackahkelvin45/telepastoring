import "server-only";

import { db } from "./db";
import { dueLabel } from "./format";
import { canSeeAllVisitors, type SessionUser } from "./session";

/**
 * Every query here narrows by the caller. Prisma connects as the database
 * owner, so this scoping *is* the access control — there is no RLS underneath
 * to catch a mistake.
 */
function assignmentScope(user: SessionUser) {
  if (user.role === "ADMIN") return {};
  if (user.role === "TEAM_LEAD" && user.teamId) {
    return { telepastor: { teamId: user.teamId } };
  }
  return { telepastorId: user.id };
}

export async function getDashboardSummary(user: SessionUser) {
  const where = assignmentScope(user);

  const [assigned, called, pending, callbacks] = await Promise.all([
    db.assignment.count({ where: { ...where, status: { not: "CLOSED" } } }),
    db.assignment.count({ where: { ...where, status: "CALLED" } }),
    db.assignment.count({ where: { ...where, status: "PENDING" } }),
    db.assignment.count({ where: { ...where, status: "CALLBACK" } }),
  ]);

  return { assigned, called, pending, callbacks };
}

export async function getMyAssignments(user: SessionUser) {
  const rows = await db.assignment.findMany({
    where: { ...assignmentScope(user), status: { not: "CLOSED" } },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    select: {
      id: true,
      status: true,
      assignedAt: true,
      dueAt: true,
      visitor: { select: { id: true, fullName: true, phone: true } },
    },
  });

  const now = new Date();
  return rows.map((row) => ({
    id: row.id,
    name: row.visitor.fullName,
    phone: row.visitor.phone,
    status: row.status,
    dueAt: row.dueAt.toISOString(),
    // Computed here, once, so server and client never disagree about "now".
    dueLabel: row.status === "PENDING" ? dueLabel(row.dueAt, now) : undefined,
    overdue: row.status === "PENDING" && row.dueAt < now,
  }));
}

export async function getCallHistory(user: SessionUser, take = 50) {
  const where =
    user.role === "ADMIN"
      ? {}
      : user.role === "TEAM_LEAD" && user.teamId
        ? { telepastor: { teamId: user.teamId } }
        : { telepastorId: user.id };

  const rows = await db.call.findMany({
    where,
    orderBy: { calledAt: "desc" },
    take,
    select: {
      id: true,
      outcome: true,
      calledAt: true,
      durationSeconds: true,
      summary: true,
      visitor: { select: { fullName: true, phone: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    visitorName: row.visitor.fullName,
    phone: row.visitor.phone,
    outcome: row.outcome,
    calledAt: row.calledAt.toISOString(),
    durationSeconds: row.durationSeconds,
    notes: row.summary ?? undefined,
  }));
}

/** Calls per day for the last seven days, zero-filled. */
export async function getDailyProgress(user: SessionUser) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const where =
    user.role === "ADMIN"
      ? {}
      : user.role === "TEAM_LEAD" && user.teamId
        ? { telepastor: { teamId: user.teamId } }
        : { telepastorId: user.id };

  const calls = await db.call.findMany({
    where: { ...where, calledAt: { gte: since } },
    select: { calledAt: true },
  });

  const counts = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    counts.set(day.toISOString().slice(0, 10), 0);
  }

  for (const call of calls) {
    const key = call.calledAt.toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].map(([date, callCount]) => ({
    date,
    calls: callCount,
  }));
}

/** Everyone the user may message. Telepastors see their own team only. */
export async function getTeamMembers(user: SessionUser) {
  const rows = await db.user.findMany({
    where: {
      active: true,
      id: { not: user.id },
      ...(canSeeAllVisitors(user) || !user.teamId ? {} : { teamId: user.teamId }),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true, teamId: true },
  });

  const ROLE_LABEL = {
    TELEPASTOR: "Telepastor",
    TEAM_LEAD: "Team Lead",
    ADMIN: "Administrator",
  } as const;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: ROLE_LABEL[row.role],
    // TODO: presence needs a realtime channel; nobody is "online" until then.
    online: false,
  }));
}

/** Church-wide figures for the admin portal. */
export async function getAdminOverview(user: SessionUser) {
  // Defence in depth: the page already called requireAdmin(), but this query
  // is unscoped, so it refuses to run for anyone else.
  if (user.role !== "ADMIN") throw new Error("Admin only");

  const [activeTelepastors, awaitingApproval, visitors, overdue] =
    await Promise.all([
      db.user.count({ where: { role: "TELEPASTOR", active: true } }),
      db.user.count({ where: { active: false } }),
      db.visitor.count(),
      db.assignment.count({
        where: { status: "PENDING", dueAt: { lt: new Date() } },
      }),
    ]);

  return { activeTelepastors, awaitingApproval, visitors, overdue };
}

/** Calls per day for the last N days, zero-filled — church-wide. */
async function getAdminDailyCalls(days: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const calls = await db.call.findMany({
    where: { calledAt: { gte: since } },
    select: { calledAt: true },
  });

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    counts.set(day.toISOString().slice(0, 10), 0);
  }
  for (const call of calls) {
    const key = call.calledAt.toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([date, callCount]) => ({
    date,
    calls: callCount,
  }));
}

/** Recent calls across the whole church, newest first. */
export async function getAdminRecentCalls(take = 8) {
  const rows = await db.call.findMany({
    orderBy: { calledAt: "desc" },
    take,
    select: {
      id: true,
      outcome: true,
      calledAt: true,
      durationSeconds: true,
      visitor: { select: { fullName: true } },
      telepastor: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    visitorName: row.visitor.fullName,
    telepastorName: row.telepastor.name,
    outcome: row.outcome,
    calledAt: row.calledAt.toISOString(),
    durationSeconds: row.durationSeconds,
  }));
}

/** Telepastors with their assignment counts, for the admin roster. */
export async function getAdminTelepastors() {
  const rows = await db.user.findMany({
    where: { role: { in: ["TELEPASTOR", "TEAM_LEAD"] }, active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
      _count: { select: { assignments: true, calls: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    assignments: row._count.assignments,
    calls: row._count.calls,
  }));
}

/** Everything the admin overview page renders, in one round of queries. */
export async function getAdminDashboard(user: SessionUser) {
  const [overview, dailyCalls, recentCalls, telepastors] = await Promise.all([
    getAdminOverview(user),
    getAdminDailyCalls(14),
    getAdminRecentCalls(),
    getAdminTelepastors(),
  ]);
  return { overview, dailyCalls, recentCalls, telepastors };
}

/** All telepastors and team leads, including inactive, with team names. */
export async function getAdminTelepastorRoster() {
  const rows = await db.user.findMany({
    where: { role: { in: ["TELEPASTOR", "TEAM_LEAD"] } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      createdAt: true,
      team: { select: { name: true } },
      _count: { select: { assignments: true, calls: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    active: row.active,
    joinedAt: row.createdAt.toISOString(),
    teamName: row.team?.name ?? null,
    assignments: row._count.assignments,
    calls: row._count.calls,
  }));
}

/** All visitors with their assignment status, newest first. */
export async function getAdminVisitors() {
  const rows = await db.visitor.findMany({
    orderBy: { firstVisitAt: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      area: true,
      stage: true,
      source: true,
      firstVisitAt: true,
      assignments: {
        orderBy: { assignedAt: "desc" },
        take: 1,
        select: { status: true, telepastor: { select: { name: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    area: row.area,
    stage: row.stage,
    source: row.source,
    firstVisitAt: row.firstVisitAt.toISOString(),
    assignmentStatus: row.assignments[0]?.status ?? null,
    telepastorName: row.assignments[0]?.telepastor.name ?? null,
  }));
}

/** Church-wide report figures: outcomes, stage funnel and team leaderboard. */
export async function getAdminReports() {
  const [outcomes, stages, perTelepastor, totals] = await Promise.all([
    db.call.groupBy({ by: ["outcome"], _count: { _all: true } }),
    db.visitor.groupBy({ by: ["stage"], _count: { _all: true } }),
    db.user.findMany({
      where: { role: { in: ["TELEPASTOR", "TEAM_LEAD"] }, active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        team: { select: { name: true } },
        _count: { select: { calls: true, assignments: true } },
      },
    }),
    Promise.all([
      db.assignment.count(),
      db.call.count(),
      db.visitor.count(),
    ]),
  ]);

  const [assignmentsTotal, callsTotal, visitorsTotal] = totals;

  return {
    outcomes: Object.fromEntries(
      outcomes.map((o) => [o.outcome, o._count._all]),
    ) as Record<string, number>,
    stages: Object.fromEntries(
      stages.map((s) => [s.stage, s._count._all]),
    ) as Record<string, number>,
    leaderboard: perTelepastor
      .map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        teamName: p.team?.name ?? null,
        calls: p._count.calls,
        assignments: p._count.assignments,
      }))
      .sort((a, b) => b.calls - a.calls),
    totals: { assignments: assignmentsTotal, calls: callsTotal, visitors: visitorsTotal },
  };
}
