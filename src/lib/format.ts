/**
 * Display formatting shared by server and client components. Pure functions:
 * anything time-relative takes `now` explicitly, so a server render and a
 * client render never disagree about "today".
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** +233274440404 → +233 27 444 0404. Anything else is returned as stored. */
export function formatPhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  const ghana = /^\+233(\d{2})(\d{3})(\d{4})$/.exec(digits);
  if (ghana) return `+233 ${ghana[1]} ${ghana[2]} ${ghana[3]}`;
  return phone;
}

/** Digits only, for `tel:` links. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole calendar days from `now` to `date` (negative = in the past). */
function dayDiff(date: Date, now: Date) {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );
}

export function dueLabel(dueAt: Date, now: Date) {
  const days = dayDiff(dueAt, now);
  if (days < -1) return `Overdue by ${-days} days`;
  if (days === -1) return "Overdue since yesterday";
  if (days === 0) return dueAt < now ? "Overdue today" : "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

/** Group heading for a day in a timeline: Today / Yesterday / Wed 16 Sept. */
export function dayHeading(date: Date, now: Date) {
  const days = dayDiff(date, now);
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(seconds: number) {
  if (seconds <= 0) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}s`;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest}s`;
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  );
}
