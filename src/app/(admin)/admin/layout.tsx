import { LogOut, ShieldCheck } from "lucide-react";
import { adminSignOut } from "@/app/actions/sign-out";
import { requireAdmin } from "@/lib/session";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // For the header only. Layouts don't re-run on every navigation, so each
  // admin page still calls requireAdmin() itself before reading data.
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile top bar: the sidebar collapses to a horizontal strip. */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-violet-600 text-white">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <span className="text-sm font-bold text-slate-900">
          Telepastoring Admin
        </span>
        <form action={adminSignOut} className="ml-auto">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </header>

      <AdminSidebar adminName={admin.name} />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
