"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const SEEN_KEY = "install-banner-dismissed";

/**
 * Prompts the user to install the app once, shortly after they sign in.
 * Uses the browser's native install flow (`beforeinstallprompt`); on iOS
 * Safari, which has no such event, it shows manual "Add to Home Screen"
 * instructions instead. Dismissal is remembered so it never nags again.
 */
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only ever shown once per device, and never on the same visit as dismissal.
    if (localStorage.getItem(SEEN_KEY)) return;

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setVisible(true);
    };

    const timer = setTimeout(() => {
      // iOS Safari never fires beforeinstallprompt — detect it and instruct.
      const nav = navigator as Navigator & { standalone?: boolean };
      const isIos =
        /iphone|ipad|ipod/i.test(navigator.userAgent) && !nav.standalone;
      if (isIos) {
        setShowIosHint(true);
        setVisible(true);
      }
    }, 1500);

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    }
    localStorage.setItem(SEEN_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 border-b border-indigo-100 bg-indigo-50 px-5 py-3.5 text-indigo-900">
      <Download className="mt-0.5 size-5 shrink-0 text-indigo-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install the telepastoring app</p>
        <p className="mt-0.5 text-sm text-indigo-700">
          {showIosHint ? (
            <>
              Tap <span className="font-medium">Share</span>, then{" "}
              <span className="font-medium">Add to Home Screen</span>.
            </>
          ) : (
            "Add it to your home screen for quick access and offline support."
          )}
        </p>
      </div>
      {!showIosHint && (
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 rounded-lg p-2 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-700"
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>
  );
}
