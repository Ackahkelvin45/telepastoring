import Image from "next/image";
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative hidden bg-indigo-700 px-12 py-16 text-white lg:flex lg:w-[45%] lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_55%)]"
        />
        <div className="relative">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-indigo-200">
            First Love
          </span>
          <h1 className="mt-3 text-3xl font-semibold">Telepastoring Manager</h1>
        </div>

        <div className="relative max-w-md">
          <p className="text-2xl leading-snug font-medium">
            Every member and visitor cared for, every call accounted for.
          </p>
          <p className="mt-4 text-indigo-100">
            Telepastors reach out by phone and log each call and prayer
            request, so leaders can see who has been followed up and who still
            needs a call.
          </p>
        </div>

        <p className="relative text-sm text-indigo-200">
          &copy; {new Date().getFullYear()} First Love Church
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Phones (and the installed app) have no side panel, so the app
              introduces itself here, the way a native sign-in screen does. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-2xl shadow-md shadow-violet-600/20"
              priority
            />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-violet-600 uppercase">
                First Love
              </p>
              <p className="text-lg leading-tight font-semibold text-slate-900">
                Telepastoring
              </p>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
