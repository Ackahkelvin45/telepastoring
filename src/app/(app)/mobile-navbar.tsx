"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";

/**
 * Mobile bottom tab bar, like a native app. Hidden on desktop where the
 * sidebar takes over.
 */
export function MobileNavbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="group flex flex-col items-center gap-1 px-1 pb-2 pt-2.5"
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition group-active:scale-90 ${
                    active
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-violet-700" : "text-slate-500"
                  }`}
                >
                  {label === "Call History" ? "History" : label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
