/** Chat fills the pane edge to edge, so its skeleton does too. */
export default function Loading() {
  return (
    <div className="flex min-h-0 flex-1 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="w-full shrink-0 border-r border-slate-200 bg-white px-4 pt-5 lg:w-80">
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-40 rounded bg-slate-200/70" />
        <div className="mt-4 h-10 rounded-xl bg-slate-100" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-11 shrink-0 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden flex-1 bg-slate-50 lg:block" />
    </div>
  );
}
