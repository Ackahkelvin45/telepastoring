import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import type { Role } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  teamId: string | null;
};

/**
 * Per-request memo: a page and its children can each ask for the user without
 * re-hitting the session store.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const user = session.user as typeof session.user & {
    role?: Role;
    active?: boolean;
    teamId?: string | null;
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "TELEPASTOR",
    active: user.active ?? false,
    teamId: user.teamId ?? null,
  };
});

/**
 * The authorization chokepoint. Every Server Action and every page that reads
 * visitor data calls this — Prisma connects as the database owner, so nothing
 * below this line is enforced by the database itself.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.active) redirect("/pending-approval");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

/**
 * Guard for the admin portal. Signed-out visitors go to the admin login, not the
 * telepastor one; signed-in non-admins go back to their own dashboard.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  if (!user.active) redirect("/pending-approval");
  return user;
}

export function canSeeAllVisitors(user: SessionUser) {
  return user.role === "ADMIN" || user.role === "TEAM_LEAD";
}
