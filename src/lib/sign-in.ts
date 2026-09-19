import "server-only";

import { APIError } from "better-auth/api";
import { cookies, headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import type { Role } from "@/generated/prisma/enums";

type SignedIn = {
  ok: true;
  token: string;
  user: { id: string; role: Role; active: boolean };
};

type SignInFailed = { ok: false };

/**
 * Verifies the password and issues a session cookie. Callers decide afterwards
 * whether this door is the right one for the account's role.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignedIn | SignInFailed> {
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    const user = result.user as typeof result.user & {
      role?: Role;
      active?: boolean;
    };
    return {
      ok: true,
      token: result.token,
      user: {
        id: user.id,
        role: user.role ?? "TELEPASTOR",
        active: user.active ?? false,
      },
    };
  } catch (error) {
    if (error instanceof APIError) return { ok: false };
    throw error;
  }
}

/**
 * Undoes a sign-in that succeeded at the wrong door. Deleting the row is what
 * matters — it kills the session server-side even if the cookie lingers.
 */
export async function revokeSession(token: string) {
  await db.session.deleteMany({ where: { token } });
  const jar = await cookies();
  for (const cookie of jar.getAll()) {
    if (cookie.name.endsWith("better-auth.session_token")) {
      jar.delete(cookie.name);
    }
  }
}
