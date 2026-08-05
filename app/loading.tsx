import SiteHeader from "@/components/site/site-header";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main id="konten-utama" className="min-h-screen bg-slate-50 px-4 py-8 md:px-5">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="page-intro-surface rounded-[1.75rem] border border-slate-200 p-7 md:p-10">
            <div className="h-3 w-32 rounded bg-slate-200" />
            <div className="mt-4 h-10 w-4/5 max-w-2xl rounded-xl bg-slate-200" />
            <div className="mt-4 h-5 w-3/5 max-w-xl rounded bg-slate-100" />
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <div className="aspect-[16/10] rounded-2xl bg-slate-100" />
                <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
