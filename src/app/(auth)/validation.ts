// Shared field validation. Kept out of the "use server" files, which may only
// export async functions.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): string | undefined {
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Enter your password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
}

export function validatePhone(phone: string): string | undefined {
  if (!phone) return "Enter your phone number.";
  if (!PHONE_PATTERN.test(phone)) return "Enter a valid phone number.";
}

export function field(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/** Shared by both sign-in doors: field checks before anything touches auth. */
export function validateLogin(formData: FormData) {
  const email = field(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  return {
    email,
    password,
    fieldErrors: {
      email: validateEmail(email),
      password: validatePassword(password),
    },
  };
}

// Deliberately the same message for "no such account" and "wrong password" —
// the difference would tell an attacker which emails are real.
export const BAD_CREDENTIALS = "That email and password don't match an account.";

/**
 * better-auth sends OAuth failures back to the login page as `?error=<code>`.
 * Only known codes get a specific message; anything else gets the generic one,
 * so the page never echoes arbitrary query text back to the user.
 */
export function googleErrorMessage(code: string | undefined) {
  if (!code) return undefined;
  switch (code) {
    case "account_not_linked":
      return "An account with this email already exists. Sign in with your password instead.";
    case "signup_disabled":
      return "There's no account for this Google address yet. Create one first, then sign in.";
    case "access_denied":
      return "Google sign-in was cancelled.";
    case "google_not_configured":
      return "Google sign-in isn't set up yet. Use your email and password.";
    default:
      return "Google sign-in didn't work. Try again, or use your email and password.";
  }
}
