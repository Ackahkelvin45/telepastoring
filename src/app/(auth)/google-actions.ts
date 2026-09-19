"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, isGoogleEnabled } from "@/lib/auth";

async function startGoogle({
  callbackURL,
  errorCallbackURL,
  signUp = false,
}: {
  callbackURL: string;
  errorCallbackURL: string;
  signUp?: boolean;
}) {
  // The buttons render even before credentials exist, so say so plainly
  // rather than failing inside the OAuth flow.
  if (!isGoogleEnabled) redirect(`${errorCallbackURL}?error=google_not_configured`);

  const { url } = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL,
      errorCallbackURL,
      // New accounts are active immediately, so they go straight to the app.
      newUserCallbackURL: callbackURL,
      // Only the register page may create accounts through Google.
      requestSignUp: signUp,
      disableRedirect: true,
    },
    headers: await headers(),
  });

  if (!url) redirect(`${errorCallbackURL}?error=google_unavailable`);
  redirect(url);
}

// Fixed destinations per page rather than one action taking a URL: a
// client-supplied redirect target is an open redirect.
export async function signInWithGoogle() {
  // If no account exists for this Google address, create one first and then
  // sign the person in — same flow, no separate registration step. New
  // accounts are active immediately and land on the dashboard.
  await startGoogle({
    callbackURL: "/dashboard",
    errorCallbackURL: "/login",
    signUp: true,
  });
}

/**
 * Non-admins who come through this door still end up signed in as themselves;
 * `requireAdmin()` on /admin then sends them to their own dashboard.
 */
export async function adminSignInWithGoogle() {
  await startGoogle({ callbackURL: "/admin", errorCallbackURL: "/admin/login" });
}

export async function signUpWithGoogle() {
  await startGoogle({
    callbackURL: "/dashboard",
    errorCallbackURL: "/register",
    signUp: true,
  });
}
