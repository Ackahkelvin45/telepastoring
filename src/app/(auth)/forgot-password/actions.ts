"use server";

import { field, validateEmail } from "../validation";

export type ForgotPasswordState = {
  sent?: boolean;
  formError?: string;
  fieldErrors?: {
    email?: string;
  };
  email?: string;
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = field(formData.get("email"));
  const emailError = validateEmail(email);

  if (emailError) {
    return { fieldErrors: { email: emailError }, email };
  }

  // TODO: look up the account, mint a single-use expiring reset token and email
  // the reset link. NOTE: no email is actually sent yet.
  //
  // The response below is deliberately the same whether or not the address is
  // registered, so the form cannot be used to enumerate accounts. Keep it that
  // way once the lookup is real.
  return { sent: true, email };
}
