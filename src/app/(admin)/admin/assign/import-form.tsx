"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Check,
  ChevronsUpDown,
  FileSpreadsheet,
  Search,
  Upload,
} from "lucide-react";
import { importAssignments, type ImportState } from "./actions";

const initialState: ImportState = {};

export type TelepastorOption = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/**
 * Searchable telepastor picker: a text input filters the list by name or
 * email; clicking an option selects it. Chosen over a native <select> because
 * the roster can grow past what a dropdown scrolls well.
 */
function TelepastorPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: TelepastorOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q),
    );
  }, [options, query]);

  const selected = options.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((shown) => !shown)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-slate-400"
      >
        {selected ? (
          <span>
            <span className="block text-sm font-medium text-slate-900">
              {selected.name}
            </span>
            <span className="block text-xs text-slate-500">
              {selected.role} · {selected.email}
            </span>
          </span>
        ) : (
          <span className="text-sm text-slate-500">Select a telepastor…</span>
        )}
        <ChevronsUpDown className="size-4 shrink-0 text-slate-400" aria-hidden />
      </button>
      {/* Hidden input carries the selection to the server action. */}
      <input type="hidden" name="telepastorId" value={selectedId ?? ""} />

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400">
                No telepastors match “{query}”.
              </li>
            )}
            {filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(option.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {option.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {option.role} · {option.email}
                    </span>
                  </span>
                  {option.id === selectedId && (
                    <Check
                      className="size-4 shrink-0 text-violet-600"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ImportForm({ options }: { options: TelepastorOption[] }) {
  const [state, formAction, pending] = useActionState(
    importAssignments,
    initialState,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-5">
      {state.formError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {state.formError}
        </p>
      )}

      {state.result && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
        >
          <p className="font-medium">{state.result}</p>
          {state.rowIssues && state.rowIssues.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-emerald-700">
              {state.rowIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Assign to
        </label>
        <TelepastorPicker
          options={options}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Every member in the sheet is assigned to this telepastor.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-violet-400 hover:bg-violet-50">
        <FileSpreadsheet className="size-10 text-violet-500" aria-hidden />
        <span className="text-sm font-medium text-slate-700">
          Choose an Excel or CSV file
        </span>
        <span className="text-xs text-slate-500">
          Member Name and Phone are required · .xlsx, .xls or .csv
        </span>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls,.csv"
          required
          className="sr-only"
        />
      </label>

      <button
        type="submit"
        disabled={pending || !selectedId}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload className="size-4" aria-hidden />
        {pending ? "Importing…" : "Upload and assign"}
      </button>
    </form>
  );
}
