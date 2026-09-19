import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { signInWithGoogle } from "../google-actions";
import { GoogleButton, OrDivider } from "../google-button";
import { FormError } from "../text-field";
import { googleErrorMessage } from "../validation";
import { login } from "./actions";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | First Love Telepastoring",
  description:
    "Sign in to see the people assigned to you and log your calls.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // Checked here rather than in the proxy: only the server can tell a live
  // session from an expired cookie, and guessing wrong causes a redirect loop.
  const user = await getCurrentUser();
  if (user?.active) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");

  const { error } = await searchParams;
  const googleError = googleErrorMessage(
    typeof error === "string" ? error : undefined,
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Sign in to your account
      </h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Welcome back. Pick up where you left off with the people assigned to
        you.
      </p>

      <div className="mt-8">
        {googleError && (
          <div className="mb-5">
            <FormError message={googleError} />
          </div>
        )}
        <GoogleButton action={signInWithGoogle} label="Sign in with Google" />
        <OrDivider />
        <LoginForm action={login} />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        New telepastor?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
