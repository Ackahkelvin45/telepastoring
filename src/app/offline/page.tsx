import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline | First Love Telepastoring",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-slate-200 text-slate-500">
        <WifiOff className="size-7" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold text-slate-900">You&apos;re offline</h1>
      <p className="max-w-sm text-slate-600">
        Check your connection and try again. Calls you&apos;ve already logged
        are safe — nothing was lost.
      </p>
    </div>
  );
}
