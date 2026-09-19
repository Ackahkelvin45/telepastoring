"use client";

import { useSyncExternalStore } from "react";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const subscribe = () => () => {};
const isClient = () => true;
const isServer = () => false;

/**
 * The greeting and date follow the viewer's own clock, so they can only be
 * resolved after hydration — rendering them during SSR would bake in the
 * server's timezone. The first paint reserves the same height to avoid a
 * layout shift once the real values land.
 */
export function Greeting({ name }: { name: string }) {
  const mounted = useSyncExternalStore(subscribe, isClient, isServer);
  const now = mounted ? new Date() : null;

  const firstName = name.split(/\s+/)[0] ?? name;

  return (
    <header>
      {/* Sits on the dashboard's gradient hero, so the text is light-on-dark. */}
      <p className="text-sm font-medium text-white/75">
        {now
          ? now.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
          : "\u00a0"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {/* The name renders on the server; only the time-of-day word waits for
            the viewer's clock, so nothing shifts when it arrives. */}
        {now ? greetingFor(now.getHours()) : "Welcome"}, {firstName}{" "}
        <span aria-hidden>👋</span>
      </h1>
    </header>
  );
}
