import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Email dan password wajib diisi.",
      )}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Email atau password tidak valid.",
      )}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    await supabase.auth.signOut();

    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  const safeNextPath =
    nextPath.startsWith("/admin") && !nextPath.startsWith("//")
      ? nextPath
      : "/admin";

  redirect(safeNextPath);
}

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error;
  const nextPath = params.next ?? "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <img
            src="/images/logo-belanjalab.png"
            alt="BelanjaLab"
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="text-lg font-black">
              Belanja<span className="text-orange-500">Lab</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Admin
            </p>
          </div>
        </Link>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Area Terbatas
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Masuk ke CMS
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gunakan akun admin BelanjaLab untuk mengelola produk dan konten.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@belanjalab.com"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Masukkan password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
          Hanya akun yang terdaftar sebagai admin yang dapat mengakses CMS.
        </p>
      </section>
    </main>
  );
}
