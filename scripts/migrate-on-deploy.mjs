/**
 * Runs before `next build`. On Vercel *production* deploys it applies any
 * pending migrations, so a schema change ships with the code that needs it and
 * a fresh database gets its tables on the first deploy.
 *
 * Everywhere else it does nothing: local builds and preview deploys must not
 * need, or touch, the production database.
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

// Resolve the project's own Prisma CLI instead of trusting PATH: `pnpm run`
// adds node_modules/.bin, but plain `node scripts/…` does not.
const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");

if (process.env.VERCEL_ENV === "production") {
  console.log("Production deploy: applying database migrations…");
  // Throws on failure, which fails the build. Better a failed deploy than new
  // code running against old tables.
  execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], { stdio: "inherit" });
} else {
  console.log(`Skipping migrations (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}).`);
}
