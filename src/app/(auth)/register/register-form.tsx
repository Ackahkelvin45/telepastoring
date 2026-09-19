"use client";

import { useActionState } from "react";
import { FormError, SubmitButton, TextField } from "../text-field";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);
  const errors = state.fieldErrors;

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
        error={errors?.email}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors?.password}
        revealable
      />

      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={errors?.confirmPassword}
        revealable
      />

      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>

      <p className="text-center text-xs text-slate-500">
        Next, we&apos;ll ask for your name, birthday and phone number.
      </p>
    </form>
  );
}
