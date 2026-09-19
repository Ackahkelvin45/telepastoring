import type { Metadata } from "next";
import Link from "next/link";
import { signUpWithGoogle } from "../google-actions";
import { GoogleButton, OrDivider } from "../google-button";
import { FormError } from "../text-field";
import { googleErrorMessage } from "../validation";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account | First Love Telepastoring",
  description:
    "Register as a telepastor to call and care for the members and visitors assigned to you.",
};

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { error } = await searchParams;
  const googleError = googleErrorMessage(
    typeof error === "string" ? error : undefined,
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Create your account
      </h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Join the telepastoring team and start calling the members and visitors
        assigned to you.
      </p>

      <div className="mt-8">
        {googleError && (
          <div className="mb-5">
            <FormError message={googleError} />
          </div>
        )}
        <GoogleButton action={signUpWithGoogle} label="Sign up with Google" />
        {/* Google sign-ups skip the form, so the confidentiality agreement is
            stated here, where the account is actually created. */}
        <p className="mt-3 text-center text-xs text-slate-500">
          By signing up with Google you agree to keep members&apos; and
          visitors&apos; information confidential and follow the ministry&apos;s
          pastoral care guidelines.
        </p>
        <OrDivider />
        <RegisterForm />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
