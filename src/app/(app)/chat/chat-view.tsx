"use client";

import { ChevronLeft, MessagesSquare, Search, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui";
import type { TeamMemberRow } from "@/lib/types";

export function ChatView({ members }: { members: TeamMemberRow[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(needle) || m.role.toLowerCase().includes(needle),
    );
  }, [members, query]);

  const selected = members.find((m) => m.id === selectedId) ?? null;
  const firstName = selected?.name.split(/\s+/)[0];

  return (
    <div className="flex min-h-0 flex-1">
      {/* On small screens the list gives way to the open conversation. */}
      <aside
        className={`w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:w-80 ${
          selected ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="px-4 pt-5 pb-3 sm:px-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Messages</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {members.length} {members.length === 1 ? "person" : "people"} on your team
          </p>

          <label className="relative mt-4 block">
            <span className="sr-only">Search team members</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or role"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 pl-9 text-base text-slate-900 sm:text-sm outline-none placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-100 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </label>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {visible.map((member) => {
            const active = member.id === selectedId;
            return (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(member.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active ? "bg-violet-50 ring-1 ring-violet-200 ring-inset" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={member.name} online={member.online} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">
                      {member.name}
                    </span>
                    <span className="block truncate text-sm text-slate-500">
                      {member.online ? "Online" : member.role}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-slate-500">
              {members.length === 0
                ? "No teammates yet."
                : `No one matches "${query}".`}
            </li>
          )}
        </ul>
      </aside>

      <section
        className={`min-w-0 flex-1 flex-col bg-slate-50 ${selected ? "flex" : "hidden lg:flex"}`}
      >
        {selected ? (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Back to team list"
                className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <Avatar name={selected.name} size="sm" online={selected.online} />
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{selected.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {selected.online ? "Online" : selected.role}
                </p>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <Avatar name={selected.name} />
              <p className="text-sm text-slate-500">
                This is the start of your conversation with {firstName}.
              </p>
            </div>

            {/* Messages aren't stored yet, so the composer says so rather than
                accepting text that silently disappears. */}
            <form
              className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 sm:px-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                disabled
                placeholder="Messaging isn't available yet"
                aria-label={`Message ${selected.name}`}
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled
                aria-label="Send message"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-600 text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-4" aria-hidden />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-white text-violet-600 shadow-xs ring-1 ring-slate-200">
              <MessagesSquare className="size-8" aria-hidden />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-slate-900">Team chat</h2>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Pick a teammate on the left to open your conversation.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
