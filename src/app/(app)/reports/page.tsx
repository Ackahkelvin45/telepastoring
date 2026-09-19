import type { Metadata } from "next";
import { CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardHeader } from "@/components/ui";
import { getDailyProgress, getDashboardSummary } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { PageContainer, PageHeading } from "../page-container";
import { CallPerformance } from "./call-performance";
import { DailyProgressChart } from "./daily-progress-chart";

export const metadata: Metadata = {
  title: "My Reports | First Love Telepastoring",
  description: "How your follow-up calls are tracking this week.",
};

export default async function ReportsPage() {
  const user = await requireUser();
  const [summary, daily] = await Promise.all([
    getDashboardSummary(user),
    getDailyProgress(user),
  ]);

  const counts = {
    called: summary.called,
    callback: summary.callbacks,
    pending: summary.pending,
  };
  const assigned = summary.assigned;
  const completion = assigned === 0 ? 0 : Math.round((counts.called / assigned) * 100);
  const callsThisWeek = daily.reduce((sum, d) => sum + d.calls, 0);

  return (
    <PageContainer>
      <PageHeading title="Reports" subtitle="How your follow-up is going." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Assigned" value={assigned} icon={Users} tone="violet" hint="people in your care" />
        <StatCard label="Called" value={counts.called} icon={CheckCircle2} tone="green" hint="reached so far" />
        <StatCard
          label="Waiting"
          value={counts.pending + counts.callback}
          icon={Clock}
          tone="amber"
          hint={`${counts.pending} pending · ${counts.callback} callback`}
        />
        <StatCard label="Completion" value={`${completion}%`} icon={TrendingUp} tone="blue" hint="of assigned called" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Where things stand"
            description={`Follow-up status for the ${assigned} ${assigned === 1 ? "person" : "people"} assigned to you.`}
          />
          <div className="px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
            <CallPerformance counts={counts} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Calls this week"
            description={`${callsThisWeek} ${callsThisWeek === 1 ? "call" : "calls"} logged in the last seven days.`}
          />
          <div className="px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
            <DailyProgressChart data={daily} />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
