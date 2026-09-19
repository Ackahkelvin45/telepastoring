"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { field, validateEmail, validatePassword } from "../validation";

export type RegisterState = {
  formError?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  // Echoed back so the email is not cleared on a failed submit. Never the password.
  email?: string;
};

/** Step 1 of sign-up: just the credentials. Profile details come next. */
export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = field(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: NonNullable<RegisterState["fieldErrors"]> = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (!fieldErrors.password && confirmPassword !== password) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, email };
  }

  try {
    await auth.api.signUpEmail({
      // The placeholder name is replaced on the profile step.
      body: { name: email.split("@")[0], email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        formError:
          error.body?.message ??
          "We could not create that account. Try again.",
        email,
      };
    }
    throw error;
  }

  // Signed in already (autoSignIn) — now collect the profile details.
  redirect("/complete-profile");
}
