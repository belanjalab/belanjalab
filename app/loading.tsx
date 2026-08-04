export default function Loading() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-10 w-44 rounded-xl bg-slate-200" />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-slate-100" />
          <div className="space-y-5 py-6">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-12 w-4/5 rounded-xl bg-slate-200" />
            <div className="h-5 w-full rounded bg-slate-100" />
            <div className="h-5 w-3/4 rounded bg-slate-100" />
            <div className="h-12 w-40 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
