"use client";

import { SearchX, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import type { AssignmentRow, AssignmentStatus } from "@/lib/types";
import { EmptyState } from "../page-container";
import { byUrgency, PersonRow } from "../person-row";

export type Tab = "all" | Exclude<AssignmentStatus, "CLOSED">;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "CALLBACK", label: "Callback" },
  { id: "CALLED", label: "Called" },
];

export function CallsView({
  visitors,
  initialTab = "all",
}: {
  visitors: AssignmentRow[];
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    const rows = !needle
      ? visitors
      : visitors.filter(
          (v) =>
            v.name.toLowerCase().includes(needle) ||
            (digits.length > 0 && v.phone.replace(/\D/g, "").includes(digits)),
        );
    return [...rows].sort(byUrgency);
  }, [visitors, query]);

  // Counts follow the search, so a tab never promises rows it can't show.
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: searched.length, PENDING: 0, CALLBACK: 0, CALLED: 0 };
    for (const v of searched) if (v.status !== "CLOSED") c[v.status] += 1;
    return c;
  }, [searched]);

  const visible = tab === "all" ? searched : searched.filter((v) => v.status === tab);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search by name or number</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or number"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-10 text-base text-slate-900 sm:text-sm shadow-xs outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>

        {/* Chips scroll sideways on narrow screens instead of wrapping into a grid. */}
        <div
          role="tablist"
          aria-label="Filter by call status"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
        >
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 ring-inset hover:bg-slate-50"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Card>
        {visible.length === 0 ? (
          visitors.length === 0 ? (
            <EmptyState
              icon={<Users aria-hidden />}
              message="Nobody is assigned to you yet"
              description="When an admin assigns members or visitors to you, they'll show up here."
            />
          ) : (
            <EmptyState
              icon={<SearchX aria-hidden />}
              message="No one matches"
              description={query ? `Nothing found for "${query}".` : "No one in this list right now."}
            />
          )
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
