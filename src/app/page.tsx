import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * Entry point: signed-in users go to their app, everyone else to sign-in.
 * The real session check lives here rather than the proxy, which only sees
 * whether a cookie exists.
 */
export default async function Home() {
  const user = await getCurrentUser();
  if (user?.active) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  redirect("/login");
}
