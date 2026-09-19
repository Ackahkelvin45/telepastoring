/**
 * Grants admin access to an email address, creating the account if needed.
 *
 *   pnpm user:make-admin you@gmail.com "Your Name"
 *
 * Run it BEFORE your first Google sign-in: it marks the email as verified, which
 * is what lets the Google login attach to this account instead of creating a
 * second, inactive one. Only run it for an address you actually control —
 * that's the check a verification email would otherwise do.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const [, , rawEmail, name] = process.argv;
const email = rawEmail?.trim().toLowerCase();

if (!email || !email.includes("@")) {
  console.error('Usage: pnpm user:make-admin you@gmail.com "Your Name"');
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const user = await db.user.upsert({
    where: { email: email! },
    update: { role: "ADMIN", active: true, emailVerified: true },
    create: {
      email: email!,
      name: name ?? email!.split("@")[0],
      role: "ADMIN",
      active: true,
      emailVerified: true,
    },
  });

  console.log(`${user.email} is now an active ADMIN.`);
  console.log("Sign in at /admin/login with Google (or set a password later).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
