import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password | First Love Telepastoring",
  description:
    "Request a link to reset your First Love Telepastoring password.",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Reset your password
      </h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Enter the email address on your account and we&apos;ll send you a link
        to set a new password.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
