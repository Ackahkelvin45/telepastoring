"use client";

import { useActionState } from "react";
import { FormError, SubmitButton, TextField } from "../text-field";
import { completeProfile, type CompleteProfileState } from "./actions";

const initialState: CompleteProfileState = {};

export function CompleteProfileForm() {
  const [state, formAction, pending] = useActionState(
    completeProfile,
    initialState,
  );
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.formError && <FormError message={state.formError} />}

      <TextField
        label="First name"
        name="firstName"
        autoComplete="given-name"
        placeholder="Kwame"
        defaultValue={state.values?.firstName}
        error={errors?.firstName}
      />

      <TextField
        label="Last name"
        name="lastName"
        autoComplete="family-name"
        placeholder="Mensah"
        defaultValue={state.values?.lastName}
        error={errors?.lastName}
      />

      <TextField
        label="Date of birth"
        name="dateOfBirth"
        type="date"
        autoComplete="bday"
        error={errors?.dateOfBirth}
      />

      <TextField
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="0241234567"
        defaultValue={state.values?.phone}
        error={errors?.phone}
      />

      <SubmitButton pending={pending} pendingLabel="Saving…">
        Complete sign up
      </SubmitButton>
    </form>
  );
}
