import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account pending approval | First Love Telepastoring",
};

export default function PendingApprovalPage() {
  // Accounts are active immediately now, so this page is only reachable for
  // legacy accounts created before auto-approval. It stays as a safe landing
  // spot for them.
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Your account is awaiting approval
      </h2>
      <p className="mt-3 text-slate-600">
        An administrator reviews every new telepastor before anyone is
        assigned to them. You&apos;ll be able to sign in as soon as your account is
        activated.
      </p>
      <p className="mt-8 text-center text-sm text-slate-600">
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
