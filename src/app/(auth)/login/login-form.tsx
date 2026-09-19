"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError, SubmitButton, TextField } from "../text-field";
import type { LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({
  action,
  submitLabel = "Sign in",
}: {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

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

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={state.fieldErrors?.password}
        revealable
        labelAction={
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        }
      />

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          name="remember"
          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Keep me signed in
      </label>

      <SubmitButton pending={pending} pendingLabel="Signing in…">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
