"use server";

import { redirect } from "next/navigation";
import { revokeSession, signInWithPassword } from "@/lib/sign-in";
import { BAD_CREDENTIALS, validateLogin } from "../../validation";
import type { LoginState } from "../../login/actions";

export async function adminLogin(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { email, password, fieldErrors } = validateLogin(formData);
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors, email };
  }

  const result = await signInWithPassword(email, password);
  if (!result.ok) return { formError: BAD_CREDENTIALS, email };

  if (result.user.role !== "ADMIN") {
    // The password was right, so saying why is not an enumeration leak — but
    // the session must not survive: this door only admits administrators.
    await revokeSession(result.token);
    return {
      formError:
        "This account doesn't have admin access. Telepastors sign in at the main login.",
      email,
    };
  }

  redirect("/admin");
}
