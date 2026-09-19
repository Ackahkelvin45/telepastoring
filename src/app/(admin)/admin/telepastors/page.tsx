import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { getAdminTelepastorRoster } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Telepastors | First Love Telepastoring",
  description: "Every telepastor and team lead, active or not.",
};

const ROLE_LABEL: Record<string, string> = {
  TELEPASTOR: "Telepastor",
  TEAM_LEAD: "Team Lead",
};

export default async function AdminTelepastorsPage() {
  await requireAdmin();
  const roster = await getAdminTelepastorRoster();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Telepastors</h1>
        <p className="mt-1 text-sm text-slate-500">
          {roster.filter((r) => r.active).length} active of {roster.length}{" "}
          registered.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table on desktop, stacked cards on mobile. */}
        <table className="hidden w-full text-left text-sm sm:table">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Team</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 text-center font-semibold">Assigned</th>
              <th className="px-5 py-3 text-center font-semibold">Calls</th>
              <th className="px-5 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {person.name}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {ROLE_LABEL[person.role] ?? person.role}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {person.teamName ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-500">
                  <span className="block">{person.email}</span>
                  <span className="block text-xs">{person.phone ?? ""}</span>
                </td>
                <td className="px-5 py-3.5 text-center font-semibold text-slate-900">
                  {person.assignments}
                </td>
                <td className="px-5 py-3.5 text-center font-semibold text-slate-900">
                  {person.calls}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {person.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="size-3" aria-hidden />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      <XCircle className="size-3" aria-hidden />
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-slate-100 sm:hidden">
          {roster.map((person) => (
            <li key={person.id} className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {person.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ROLE_LABEL[person.role] ?? person.role}
                    {person.teamName ? ` · ${person.teamName}` : ""}
                  </p>
                </div>
                {person.active ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {person.assignments} assigned · {person.calls} calls ·{" "}
                {person.email}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
