import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Next reloads modules on every edit in dev, which would otherwise open a new
 * pool per reload until Postgres refuses connections. Cache the client on
 * globalThis so every import shares one.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Locally, copy .env.example to .env; on Vercel, add it under Settings → Environment Variables.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function client() {
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}

/**
 * Connects on first use, not on import. `next build` imports every route's
 * modules to collect page data; connecting at import made the build itself
 * require a database URL, so a deploy failed before the app ever ran.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = client();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
