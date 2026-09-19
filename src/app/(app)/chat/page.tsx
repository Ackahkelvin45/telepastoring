import type { Metadata } from "next";
import { getTeamMembers } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { ChatView } from "./chat-view";

export const metadata: Metadata = {
  title: "Chat | First Love Telepastoring",
  description: "Message the telepastoring team.",
};

export default async function ChatPage() {
  const user = await requireUser();
  const members = await getTeamMembers(user);

  return <ChatView members={members} />;
}
