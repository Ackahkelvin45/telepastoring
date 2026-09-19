import { Users } from "lucide-react";

export type TelepastorRow = {
  id: string;
  name: string;
  role: string;
  assignments: number;
  calls: number;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminTelepastors({ telepastors }: { telepastors: TelepastorRow[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Telepastors</h2>
      {telepastors.length === 0 ? (
        <p className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-400">
          <Users className="size-6" aria-hidden />
          No telepastors yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {telepastors.map((person) => (
            <li key={person.id} className="flex items-center gap-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                {initials(person.name) || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {person.name}
                </p>
                <p className="text-xs text-slate-500">
                  {person.role === "TEAM_LEAD" ? "Team Lead" : "Telepastor"}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-slate-500">
                <p>
                  <span className="font-semibold text-slate-900">
                    {person.assignments}
                  </span>{" "}
                  assigned
                </p>
                <p>
                  <span className="font-semibold text-slate-900">
                    {person.calls}
                  </span>{" "}
                  calls
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
