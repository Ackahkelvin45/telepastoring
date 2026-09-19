"use client";

import { useEffect } from "react";

/**
 * Registers the service worker once, on the client. Kept out of the root
 * layout's server code: `navigator` does not exist during SSR.
 *
 * Production only. In `next dev`, chunk URLs are not unique per build, so the
 * worker's cache-first handling of /_next/static would keep serving old CSS and
 * JS after every edit. In development it instead removes any worker a previous
 * session installed, along with its caches.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((r) => r.unregister())),
        )
        .then(() => caches.keys())
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Best effort: nothing to clean up is the common case.
        });
      return;
    }

    // Register after load so it never competes with the initial render.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // A failed registration just means no offline support — never fatal.
      });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
