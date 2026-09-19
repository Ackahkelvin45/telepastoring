import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { adminSignInWithGoogle } from "../../google-actions";
import { GoogleButton, OrDivider } from "../../google-button";
import { FormError } from "../../text-field";
import { googleErrorMessage } from "../../validation";
import { LoginForm } from "../../login/login-form";
import { adminLogin } from "./actions";

export const metadata: Metadata = {
  title: "Admin sign in | First Love Telepastoring",
  description:
    "Sign in to manage telepastors, assignments and reports.",
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN" && user.active) redirect("/admin");

  const { error } = await searchParams;
  const googleError = googleErrorMessage(
    typeof error === "string" ? error : undefined,
  );

  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        <ShieldCheck className="size-3.5" aria-hidden />
        Admin portal
      </span>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">
        Sign in as an administrator
      </h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Manage telepastors, assign members and visitors for follow-up, and see
        how pastoral care is going across the church.
      </p>

      <div className="mt-8">
        {googleError && (
          <div className="mb-5">
            <FormError message={googleError} />
          </div>
        )}
        <GoogleButton action={adminSignInWithGoogle} label="Sign in with Google" />
        <OrDivider />
        <LoginForm action={adminLogin} submitLabel="Sign in to admin" />
      </div>

      {/* No self-registration here: admin accounts are created by an admin. */}
      <p className="mt-8 text-center text-sm text-slate-600">
        Are you a telepastor?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
