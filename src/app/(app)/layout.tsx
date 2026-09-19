import { NotificationBanner } from "./notification-banner";
import { InstallBanner } from "./install-banner";
import { Sidebar } from "./sidebar";
import { MobileNavbar } from "./mobile-navbar";
import { MobileHeader } from "./mobile-header";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // For the sidebar's user card. Layouts don't re-run on every navigation, so
  // each page still calls requireUser() itself before reading data.
  const user = await requireUser();

  return (
    // On desktop the shell is exactly one viewport tall and only <main>
    // scrolls, so the sidebar always spans the full height with the user card
    // pinned to its foot. Mobile keeps normal page scrolling.
    <div className="flex min-h-screen flex-col bg-slate-50 lg:h-dvh lg:min-h-0">
      <InstallBanner />
      <NotificationBanner />
      {/* Mobile app header: brand + identity, sits above every page. */}
      <MobileHeader userName={user.name} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Sidebar is desktop-only; mobile uses the bottom tab bar. */}
        <div className="hidden lg:flex">
          <Sidebar userName={user.name} role={user.role} />
        </div>
        {/* No padding here: Chat fills the pane edge to edge. Every other
            screen wraps itself in <PageContainer>. */}
        <main className="flex min-h-0 flex-1 flex-col bg-slate-50 pb-20 lg:overflow-y-auto lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNavbar />
    </div>
  );
}
