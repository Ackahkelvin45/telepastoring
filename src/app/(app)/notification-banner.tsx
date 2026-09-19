"use client";

import { BellRing, X } from "lucide-react";
import { useSyncExternalStore } from "react";

const DISMISSED_KEY = "notify-banner-dismissed";

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Show only while the browser has never been asked and the user hasn't closed
 * the strip. Read through useSyncExternalStore so the server render (always
 * hidden) and the client agree without a setState-in-effect flash.
 */
function shouldShow() {
  try {
    if (localStorage.getItem(DISMISSED_KEY)) return false;
  } catch {
    return false;
  }
  return "Notification" in window && Notification.permission === "default";
}

function hide() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Private mode: it will simply show again next visit.
  }
  listeners.forEach((listener) => listener());
}

export function NotificationBanner() {
  const visible = useSyncExternalStore(subscribe, shouldShow, () => false);
  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 border-b border-violet-100 bg-violet-50 px-4 py-2.5 text-sm sm:px-6">
      <BellRing className="size-4 shrink-0 text-violet-600" aria-hidden />
      <p className="min-w-0 flex-1 text-slate-700">
        <span className="font-medium text-slate-900">Turn on notifications</span>
        <span className="hidden sm:inline">
          {" "}
          to hear when new people are assigned to you.
        </span>
      </p>
      <button
        type="button"
        onClick={async () => {
          await Notification.requestPermission();
          hide();
        }}
        className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
      >
        Enable
      </button>
      <button
        type="button"
        onClick={hide}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-100 hover:text-slate-700"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
