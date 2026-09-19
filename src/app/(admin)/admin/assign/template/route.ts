import * as XLSX from "xlsx";
import { requireAdmin } from "@/lib/session";

/**
 * Generates the assignment template as a real .xlsx download: one header row
 * matching what the importer expects, plus two example rows the admin can
 * overwrite. Admin-only so the endpoint can't be crawled.
 */
export async function GET() {
  await requireAdmin();

  const rows = [
    { "Member Name": "Akosua Boateng", "Phone Number": "0241234567", Area: "Adenta" },
    { "Member Name": "Kwame Asare", "Phone Number": "+233202220202", Area: "Tema" },
  ];
  const sheet = XLSX.utils.json_to_sheet(rows, {
    header: ["Member Name", "Phone Number", "Area"],
  });

  // Sensible column widths so the template opens readable.
  sheet["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Assignments");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="telepastoring-assignment-template.xlsx"',
    },
  });
}