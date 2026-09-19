"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Sheet,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { adminSignOut } from "@/app/actions/sign-out";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for /admin itself). */
  exact?: boolean;
};

/**
 * Active state is prefix-based so /admin/telepastors matches while /admin
 * itself only matches exactly.
 */
const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/assign", label: "Assign", icon: Sheet },
  { href: "/admin/telepastors", label: "Telepastors", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const initials = adminName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <aside className="flex shrink-0 flex-row items-center gap-1 border-b border-slate-200 bg-white p-3 lg:w-72 lg:flex-col lg:items-stretch lg:gap-1.5 lg:border-r lg:border-b-0 lg:p-5">
      {/* Brand */}
      <Link
        href="/admin"
        className="mr-2 flex items-center gap-3 lg:mb-6 lg:mr-0 lg:px-2"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <span className="hidden lg:block">
          <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-violet-600">
            First Love
          </span>
          <span className="block text-sm font-bold text-slate-900">
            Telepastoring Admin
          </span>
        </span>
      </Link>

      <nav aria-label="Admin" className="flex gap-1 lg:flex-col lg:gap-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex shrink-0 items-center gap-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-600/25 lg:text-base"
                  : "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:text-base"
              }
            >
              <Icon
                className={`size-5 shrink-0 ${active ? "text-white" : "text-slate-400"}`}
                aria-hidden
              />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin identity card pinned to the bottom on desktop. */}
      <div className="ml-auto flex items-center gap-2 lg:mt-auto lg:ml-0 lg:w-full lg:flex-col lg:items-stretch lg:gap-3 lg:border-t lg:border-slate-100 lg:pt-4">
        <div className="hidden items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 lg:flex">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {initials || "?"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {adminName}
            </span>
            <span className="block text-xs text-slate-500">Administrator</span>
          </span>
        </div>
        <form action={adminSignOut} className="hidden lg:block">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
