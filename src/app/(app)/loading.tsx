import { PageContainer } from "./page-container";

/**
 * Instant feedback on tab switches while the page's data loads, like a native
 * app's skeleton screen. Shapes echo the real pages: a heading, a row of
 * stats, then a list.
 */
export default function Loading() {
  return (
    <PageContainer>
      <div className="animate-pulse" aria-busy="true" aria-label="Loading">
        <div className="h-8 w-44 rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-64 max-w-full rounded bg-slate-200/70" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-slate-200/80 bg-white" />
          ))}
        </div>

        <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="size-11 shrink-0 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 max-w-full rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-200/70" />
              </div>
              <div className="size-10 shrink-0 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
