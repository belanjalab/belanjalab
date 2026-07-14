import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

async function sendResetEmail(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(
      `/admin/forgot-password?error=${encodeURIComponent(
        "Email wajib diisi.",
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      "https://belanjalab.dik-julyan.workers.dev/auth/callback?next=/admin/update-password",
  });

  if (error) {
    redirect(
      `/admin/forgot-password?error=${encodeURIComponent(
        "Gagal mengirim email reset password.",
      )}`,
    );
  }

  redirect(
    `/admin/forgot-password?message=${encodeURIComponent(
      "Link reset password sudah dikirim. Silakan cek inbox atau folder spam.",
    )}`,
  );
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
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
            Pemulihan Akun
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Lupa password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Masukkan email admin. Kami akan mengirimkan link untuk membuat
            password baru.
          </p>
        </div>

        {params.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {params.error}
          </div>
        )}

        {params.message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {params.message}
          </div>
        )}

        <form action={sendResetEmail} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-slate-700"
            >
              Email admin
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@belanjalab.com"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            Kirim Link Reset
          </button>
        </form>

        <Link
          href="/admin/login"
          className="mt-6 block text-center text-sm font-bold text-orange-500"
        >
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
