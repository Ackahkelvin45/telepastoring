import type { Metadata } from "next";
import { AlarmClock, UserCheck, UserPlus, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { getAdminDashboard } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";
import { AdminCallsChart } from "./admin-calls-chart";
import { AdminRecentCalls } from "./admin-recent-calls";
import { AdminTelepastors } from "./admin-telepastors";

export const metadata: Metadata = {
  title: "Admin | First Love Telepastoring",
  description: "Church-wide view of telepastors and follow-up.",
};

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const { overview, dailyCalls, recentCalls, telepastors } =
    await getAdminDashboard(admin);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Follow-up and pastoral care across the church.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Telepastors"
          value={overview.activeTelepastors}
          icon={UserCheck}
          tone="violet"
        />
        <StatCard
          label="Awaiting approval"
          value={overview.awaitingApproval}
          icon={UserPlus}
          tone="blue"
        />
        <StatCard
          label="Members & visitors"
          value={overview.visitors}
          icon={Users}
          tone="green"
        />
        <StatCard
          label="Overdue"
          value={overview.overdue}
          icon={AlarmClock}
          tone="amber"
        />
      </div>

      <AdminCallsChart data={dailyCalls} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminRecentCalls calls={recentCalls} />
        <AdminTelepastors telepastors={telepastors} />
      </div>
    </div>
  );
}
