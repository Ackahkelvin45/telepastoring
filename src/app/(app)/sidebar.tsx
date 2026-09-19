"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PhoneCall } from "lucide-react";
import { signOut } from "@/app/actions/sign-out";
import { Avatar } from "@/components/ui";
import type { Role } from "@/generated/prisma/enums";
import { NAV_ITEMS } from "./nav";

const ROLE_LABEL: Record<Role, string> = {
  TELEPASTOR: "Telepastor",
  TEAM_LEAD: "Team Lead",
  ADMIN: "Administrator",
};

export function Sidebar({ userName, role }: { userName: string; role: Role }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex w-72 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-slate-200 bg-white p-5"
    >
      <Link href="/dashboard" className="mb-4 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20">
          <PhoneCall className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-violet-600">
            First Love
          </span>
          <span className="block text-sm font-bold text-slate-900">
            Telepastoring
          </span>
        </span>
      </Link>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex shrink-0 items-center gap-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-md shadow-violet-600/25"
                : "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            }
          >
            <Icon
              className={`size-5 shrink-0 ${active ? "text-white" : "text-slate-400"}`}
              aria-hidden
            />
            <span>{label}</span>
            {active && (
              <span
                className="ml-auto size-1.5 rounded-full bg-white/80"
                aria-hidden
              />
            )}
          </Link>
        );
      })}

      {/* User card + sign out, pinned to the foot of the column. */}
      <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <Avatar name={userName} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {userName}
            </span>
            <span className="block text-xs text-slate-500">{ROLE_LABEL[role]}</span>
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
