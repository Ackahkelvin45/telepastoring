"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type ImportState = {
  formError?: string;
  /** Success summary, e.g. "12 assigned, 2 skipped". */
  result?: string;
  /** Row-level problems, shown so the admin can fix the sheet. */
  rowIssues?: string[];
};

type Row = {
  memberName?: string;
  phone?: string;
  area?: string;
  telepastorEmail?: string;
};

function cell(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return null;
  // Ghanaian local format 0XXXXXXXXX → +233XXXXXXXXX.
  if (/^0\d{9}$/.test(digits)) return `+233${digits.slice(1)}`;
  if (/^\+?\d{10,15}$/.test(digits)) return digits.startsWith("+") ? digits : `+${digits}`;
  return null;
}


/**
 * Bulk assignment: an admin uploads an Excel sheet of church members. Only
 * "Member Name" and "Phone" are required; an optional "Telepastor Email"
 * column overrides the telepastor chosen in the form. Members are created on
 * first sight; assignments are de-duplicated by (member, telepastor) so
 * re-uploading the same sheet is safe.
 */
export async function importAssignments(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const admin = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { formError: "Choose an Excel file to upload." };
  }

  // The telepastor picked in the form applies to every row that does not
  // name one explicitly in its "Telepastor Email" column.
  const selectedTelepastorId = String(formData.get("telepastorId") ?? "");
  if (!selectedTelepastorId) {
    return { formError: "Select the telepastor to assign these members to." };
  }

  let rows: Row[];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    // Sheets is keyed by sheet NAME ("Sheet1"), not by index — the first
    // sheet must be looked up through SheetNames.
    const firstSheetName = workbook.SheetNames[0];
    const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
    if (!sheet) return { formError: "The file has no sheets." };
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet).map((r) => ({
      memberName: cell(r, ["member name", "membername", "name", "full name", "member"]),
      phone: cell(r, ["phone number", "phone", "mobile", "telephone", "number"]),
      area: cell(r, ["area", "location", "residence", "community"]),
      telepastorEmail: cell(r, ["telepastor email", "email", "telepastor", "assigned to"]),
    }));
  } catch {
    return { formError: "Could not read that file. Is it a valid Excel/CSV file?" };
  }

  if (rows.length === 0) {
    return { formError: "The sheet has no data rows." };
  }

  // Only needed when a row overrides the form selection.
  const telepastors = await db.user.findMany({
    where: { role: { in: ["TELEPASTOR", "TEAM_LEAD"] }, active: true },
    select: { id: true, email: true },
  });
  const byEmail = new Map(telepastors.map((t) => [t.email.toLowerCase(), t.id]));

  const rowIssues: string[] = [];
  let assigned = 0;
  let skipped = 0;

  // Cache members per phone so duplicate rows in one sheet collapse.
  const memberCache = new Map<string, string>();

  for (const [index, row] of rows.entries()) {
    const label = `Row ${index + 2}`; // +2: 1-based + header row
    const name = row.memberName ?? "";
    const rawPhone = row.phone ?? "";
    const phone = normalisePhone(rawPhone);

    if (!name) {
      rowIssues.push(`${label}: Member Name is required.`);
      skipped++;
      continue;
    }
    if (!rawPhone) {
      rowIssues.push(`${label}: Phone Number is required.`);
      skipped++;
      continue;
    }
    if (!phone) {
      rowIssues.push(
        `${label}: "${rawPhone}" is not a valid phone number. Use a Ghanaian number like 0241234567 or +233241234567.`,
      );
      skipped++;
      continue;
    }

    // Per-row override wins; otherwise the telepastor chosen in the form.
    const overrideId = byEmail.get((row.telepastorEmail ?? "").toLowerCase());
    const telepastorId = overrideId ?? selectedTelepastorId;

    let memberId = memberCache.get(phone);
    if (!memberId) {
      const member = await db.visitor.upsert({
        where: { phone },
        update: { fullName: name, ...(row.area ? { area: row.area } : {}) },
        create: {
          fullName: name,
          phone,
          ...(row.area ? { area: row.area } : {}),
          firstVisitAt: new Date(),
          createdById: admin.id,
        },
      });
      memberId = member.id;
      memberCache.set(phone, memberId);
    }

    const existing = await db.assignment.findFirst({
      where: { visitorId: memberId, telepastorId },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await db.assignment.create({
      data: {
        visitorId: memberId,
        telepastorId,
        assignedById: admin.id,
        // 48 hours to make first contact, same promise as the seed data.
        dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
    assigned++;
  }

  revalidatePath("/admin/assign");
  revalidatePath("/admin");

  const result = `${assigned} assignment${assigned === 1 ? "" : "s"} created, ${skipped} skipped.`;
  if (rowIssues.length > 0) {
    return { result, rowIssues };
  }
  redirect("/admin/assign?done=" + encodeURIComponent(result));
}

/** The searchable telepastor picker needs the list of active telepastors. */
export async function getTelepastorOptions() {
  await requireAdmin();
  const rows = await db.user.findMany({
    where: { role: { in: ["TELEPASTOR", "TEAM_LEAD"] }, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role === "TEAM_LEAD" ? "Team Lead" : "Telepastor",
  }));
}
