import type { MetadataRoute } from "next";

/**
 * Web app manifest, served at /manifest.webmanifest (Next links it from every
 * page automatically). Typed, so an invalid field fails the build instead of
 * silently breaking installation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "First Love Telepastoring",
    short_name: "Telepastoring",
    description:
      "Phone follow-up and pastoral care for the members and visitors of First Love Church.",
    lang: "en",
    dir: "ltr",
    // "/" routes by role: admins to /admin, telepastors to /dashboard,
    // signed-out users to /login.
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // White to match the app's own header, so the phone's status bar and the
    // top of the app read as one surface, like a native app.
    theme_color: "#ffffff",
    background_color: "#ffffff",
    categories: ["productivity", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Full-bleed, glyph inside the safe zone: the launcher applies its own
      // circle / squircle / rounded-square mask.
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Long-press the home-screen icon.
    shortcuts: [
      {
        name: "My Calls",
        short_name: "Calls",
        description: "The people waiting on a call from you",
        url: "/my-calls",
        icons: [{ src: "/icons/shortcut-calls.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Call History",
        short_name: "History",
        description: "Calls you have logged",
        url: "/call-history",
        icons: [{ src: "/icons/shortcut-history.png", sizes: "96x96", type: "image/png" }],
      },
    ],
    // Shown in Android's app-store-style install sheet (and desktop Chrome's).
    screenshots: [
      {
        src: "/screenshots/home-narrow.png",
        sizes: "780x1688",
        type: "image/png",
        form_factor: "narrow",
        label: "Home: who to call next",
      },
      {
        src: "/screenshots/calls-narrow.png",
        sizes: "780x1688",
        type: "image/png",
        form_factor: "narrow",
        label: "My Calls: everyone assigned to you, most urgent first",
      },
      {
        src: "/screenshots/reports-narrow.png",
        sizes: "780x1688",
        type: "image/png",
        form_factor: "narrow",
        label: "Reports: how your follow-up is going",
      },
      {
        src: "/screenshots/home-wide.png",
        sizes: "1440x900",
        type: "image/png",
        form_factor: "wide",
        label: "Home on desktop",
      },
    ],
  };
}
