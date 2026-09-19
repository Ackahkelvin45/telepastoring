"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError, SubmitButton, TextField } from "../text-field";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.sent) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800"
        >
          <p className="font-medium">Check your email</p>
          <p className="mt-1">
            If an account exists for{" "}
            <span className="font-medium">{state.email}</span>, we&apos;ve sent
            a link to reset your password. The link expires in 30 minutes.
          </p>
        </div>

        <p className="text-sm text-slate-600">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            try another address
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.formError && <FormError message={state.formError} />}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@firstlovechurch.org"
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />

      <SubmitButton pending={pending} pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
