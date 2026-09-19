"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

async function endSession() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // Already signed out or expired — the outcome the user wanted anyway.
  }
}

// Two fixed actions rather than one taking a destination: a client-supplied
// redirect target is an open redirect.
export async function signOut() {
  await endSession();
  redirect("/login");
}

export async function adminSignOut() {
  await endSession();
  redirect("/admin/login");
}
