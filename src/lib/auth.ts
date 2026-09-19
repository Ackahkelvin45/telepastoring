// Note: no `server-only` import here — prisma/seed.ts runs this module outside
// the Next bundler. Nothing below is importable from a Client Component anyway,
// since it reaches for the database. `session.ts` carries the guard instead.
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** Whether Google credentials are present. The buttons always render; see google-actions. */
export const isGoogleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Accounts are active the moment they are created — no admin approval
    // step. See `active` on User.
    autoSignIn: true,
  },

  // Google creates accounts from any sign-in page: if no account exists for
  // the address, one is created and the person is signed in straight away.
  // New accounts are TELEPASTOR and active immediately — no approval step.
  // A Google login joins an existing account only when that account's email is
  // already verified — better-auth's default, which stops someone
  // pre-registering your address with their own password and waiting for you
  // to link into it.
  socialProviders: isGoogleEnabled
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
          // Always show the account chooser: telepastors often share a phone.
          prompt: "select_account",
          disableImplicitSignUp: true,
        },
      }
    : {},

  user: {
    additionalFields: {
      // input:false keeps these out of the public signup payload — otherwise
      // anyone could register themselves as an ADMIN.
      role: { type: "string", input: false, defaultValue: "TELEPASTOR" },
      active: { type: "boolean", input: false, defaultValue: true },
      phone: { type: "string", required: false, input: true },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  // Must stay last: it writes Set-Cookie for calls made inside Server Actions.
  plugins: [nextCookies()],
});
