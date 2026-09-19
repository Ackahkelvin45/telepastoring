"use server";

import { redirect } from "next/navigation";
import { signInWithPassword } from "@/lib/sign-in";
import { BAD_CREDENTIALS, validateLogin } from "../validation";

export type LoginState = {
  formError?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  // Echoed back so the field is not cleared on a failed submit. Never the password.
  email?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { email, password, fieldErrors } = validateLogin(formData);
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors, email };
  }

  const result = await signInWithPassword(email, password);
  if (!result.ok) return { formError: BAD_CREDENTIALS, email };

  // An admin who used the telepastor door has still proven who they are, so
  // send them where they belong rather than making them sign in twice.
  if (result.user.role === "ADMIN") redirect("/admin");
  if (!result.user.active) redirect("/pending-approval");
  redirect("/dashboard");
}
