"use client";

import { useRouter } from "next/navigation";
import { LogOut, PhoneCall } from "lucide-react";
import { signOut } from "@/app/actions/sign-out";
import { Avatar } from "@/components/ui";

/**
 * Mobile app header: brand on the left, avatar + sign-out on the right.
 * Desktop shows the full sidebar instead, so this is hidden above lg.
 */
export function MobileHeader({ userName }: { userName: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20">
        <PhoneCall className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-violet-600">
          First Love
        </span>
        <span className="block text-sm font-bold leading-tight text-slate-900">
          Telepastoring
        </span>
      </span>

      <span className="ml-auto">
        <Avatar name={userName} size="sm" />
      </span>
      <button
        type="button"
        aria-label="Sign out"
        onClick={async () => {
          await signOut();
          router.refresh();
        }}
        className="grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <LogOut className="size-5" aria-hidden />
      </button>
    </header>
  );
}
