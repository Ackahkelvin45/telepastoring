import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata: Metadata = {
  title: "Complete your profile | First Love Telepastoring",
  description: "Tell us a bit about yourself to finish setting up.",
};

export default async function CompleteProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Already filled in — skip straight to the app.
  if (user.name && !user.name.includes("@")) redirect("/dashboard");

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Complete your profile
      </h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Tell us a bit about yourself to finish setting up your account.
      </p>

      <div className="mt-8">
        <CompleteProfileForm />
      </div>
    </div>
  );
}
