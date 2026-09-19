import type { Metadata } from "next";
import { getMyAssignments } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { PageContainer, PageHeading } from "../page-container";
import { CallsView, type Tab } from "./calls-view";

export const metadata: Metadata = {
  title: "My Calls | First Love Telepastoring",
  description: "The people assigned to you and where each follow-up stands.",
};

const TAB_FROM_PARAM: Record<string, Tab> = {
  pending: "PENDING",
  callback: "CALLBACK",
  called: "CALLED",
};

export default async function MyCallsPage({ searchParams }: PageProps<"/my-calls">) {
  const user = await requireUser();
  const [assignments, { status }] = await Promise.all([
    getMyAssignments(user),
    searchParams,
  ]);
  const initialTab = (typeof status === "string" && TAB_FROM_PARAM[status]) || "all";

  return (
    <PageContainer>
      <PageHeading
        title="My Calls"
        subtitle="Everyone assigned to you, most urgent first."
      />
      <CallsView visitors={assignments} initialTab={initialTab} />
    </PageContainer>
  );
}
