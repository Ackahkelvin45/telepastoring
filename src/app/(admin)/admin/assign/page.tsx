import type { Metadata } from "next";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getTelepastorOptions } from "./actions";
import { ImportForm } from "./import-form";

export const metadata: Metadata = {
  title: "Assign people | First Love Telepastoring",
  description: "Upload an Excel sheet to assign church members to telepastors.",
};

const COLUMNS = [
  { name: "Member Name", example: "Akosua Boateng", required: true },
  { name: "Phone Number", example: "0241234567", required: true },
  { name: "Area", example: "Adenta", required: false },
];

export default async function AssignPage({
  searchParams,
}: PageProps<"/admin/assign">) {
  await requireAdmin();
  const [{ done }, options] = await Promise.all([
    searchParams,
    getTelepastorOptions(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Assign people</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload a spreadsheet of church members and each one is assigned to a
          telepastor to call.
        </p>
      </header>

      {typeof done === "string" && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {done}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <ImportForm options={options} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            How the sheet should look
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Column names are matched loosely — spaces and capitals don&apos;t
            matter.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  {COLUMNS.map((col) => (
                    <th key={col.name} className="px-3 py-2 font-semibold">
                      {col.name}
                      {col.required && (
                        <span className="ml-1 text-red-500" aria-hidden>
                          *
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-2">Akosua Boateng</td>
                  <td className="px-3 py-2">0241234567</td>
                  <td className="px-3 py-2">Adenta</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Kwame Asare</td>
                  <td className="px-3 py-2">+233202220202</td>
                  <td className="px-3 py-2">Tema</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-4 list-inside list-disc space-y-1.5 text-xs text-slate-500">
            <li>
              <span className="font-medium">Member Name</span> and
              <span className="font-medium"> Phone Number</span> are required;
              <span className="font-medium"> Area</span> is optional.
            </li>
            <li>
              Phone numbers are validated: Ghanaian local numbers like
              <code> 0241234567</code> become <code>+233241234567</code>.
            </li>
            <li>
              Members are assigned to the telepastor you select above.
            </li>
            <li>
              Re-uploading the same sheet is safe — existing assignments are
              skipped.
            </li>
          </ul>
          <a
            href="/admin/assign/template"
            className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
            download
          >
            <Download className="size-4" aria-hidden />
            Download the template (.xlsx)
          </a>
        </section>
      </div>
    </div>
  );
}
