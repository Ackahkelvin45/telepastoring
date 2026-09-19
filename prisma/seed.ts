/**
 * Development seed. Creates one admin, one team lead, two telepastors and a
 * handful of visitors with assignments and calls.
 *
 * Run with: pnpm db:seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../src/lib/auth";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Role } from "../src/generated/prisma/enums";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PASSWORD = "password123";

async function createUser(
  name: string,
  email: string,
  role: Role,
  phone: string,
) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;

  // Goes through better-auth so the password is hashed the way sign-in expects.
  await auth.api.signUpEmail({
    body: { name, email, password: PASSWORD, phone },
  });

  return db.user.update({
    where: { email },
    data: { role, active: true, emailVerified: true },
  });
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const admin = await createUser(
    "Elias Kotey",
    "admin@firstlovechurch.org",
    "ADMIN",
    "+233200000001",
  );
  const lead = await createUser(
    "Priscilla Darko",
    "lead@firstlovechurch.org",
    "TEAM_LEAD",
    "+233200000002",
  );
  const grace = await createUser(
    "Grace Aidoo",
    "grace@firstlovechurch.org",
    "TELEPASTOR",
    "+233200000003",
  );
  const samuel = await createUser(
    "Samuel Tetteh",
    "samuel@firstlovechurch.org",
    "TELEPASTOR",
    "+233200000004",
  );

  const team = await db.team.upsert({
    where: { name: "Sunday First Contact" },
    update: {},
    create: { name: "Sunday First Contact", leaderId: lead.id },
  });

  await db.user.updateMany({
    where: { id: { in: [grace.id, samuel.id, lead.id] } },
    data: { teamId: team.id },
  });

  const visitors = [
    { fullName: "Akosua Boateng", phone: "+233241110101", area: "Adenta" },
    { fullName: "Kwame Asare", phone: "+233202220202", area: "Tema" },
    { fullName: "Efua Mensah", phone: "+233553330303", area: "Madina" },
    { fullName: "Yaw Owusu", phone: "+233274440404", area: "Spintex" },
    { fullName: "Adwoa Nyarko", phone: "+233265550505", area: "East Legon" },
  ];

  for (const [index, v] of visitors.entries()) {
    const visitor = await db.visitor.upsert({
      where: { phone: v.phone },
      update: {},
      create: {
        ...v,
        firstVisitAt: daysAgo(index + 2),
        createdById: admin.id,
      },
    });

    const telepastor = index % 2 === 0 ? grace : samuel;
    const assignedAt = daysAgo(index + 1);

    const assignment = await db.assignment.create({
      data: {
        visitorId: visitor.id,
        telepastorId: telepastor.id,
        assignedById: lead.id,
        assignedAt,
        dueAt: new Date(assignedAt.getTime() + 48 * 60 * 60 * 1000),
        status: index < 2 ? "CALLED" : index === 2 ? "CALLBACK" : "PENDING",
      },
    });

    if (index < 3) {
      await db.call.create({
        data: {
          assignmentId: assignment.id,
          visitorId: visitor.id,
          telepastorId: telepastor.id,
          outcome: index === 2 ? "CALLBACK" : "ANSWERED",
          calledAt: daysAgo(index),
          durationSeconds: 120 + index * 90,
          summary:
            index === 2
              ? "At work — asked me to ring back Thursday evening."
              : "Warm conversation, invited to Tuesday prayer meeting.",
        },
      });

      await db.visitor.update({
        where: { id: visitor.id },
        data: { stage: "CONTACTED" },
      });

      await db.note.create({
        data: {
          visitorId: visitor.id,
          authorId: telepastor.id,
          kind: index === 0 ? "PRAYER_REQUEST" : "GENERAL",
          body:
            index === 0
              ? "Prayer request for her mother's health."
              : "Wants details about the men's fellowship.",
        },
      });
    }
  }

  console.log("Seeded. Sign in with admin@firstlovechurch.org / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
