import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

async function updatePassword(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(
    formData.get("confirmPassword") ?? "",
  );

  if (password.length < 8) {
    redirect(
      `/admin/update-password?error=${encodeURIComponent(
        "Password minimal 8 karakter.",
      )}`,
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/admin/update-password?error=${encodeURIComponent(
        "Konfirmasi password tidak cocok.",
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Sesi reset password tidak valid atau sudah kedaluwarsa.",
      )}`,
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(
      `/admin/update-password?error=${encodeURIComponent(
        "Password gagal diperbarui. Silakan minta link reset baru.",
      )}`,
    );
  }

  await supabase.auth.signOut();

  redirect(
    `/admin/login?message=${encodeURIComponent(
      "Password berhasil diperbarui. Silakan login dengan password baru.",
    )}`,
  );
}

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const params = await searchParams;

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
            Pemulihan Akun
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Buat password baru
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gunakan minimal delapan karakter dan jangan memakai password
            lama.
          </p>
        </div>

        {params.error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {params.error}
          </div>
        )}

        <form action={updatePassword} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-slate-700"
            >
              Password baru
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Minimal 8 karakter"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-bold text-slate-700"
            >
              Ulangi password baru
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Ketik ulang password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Simpan Password Baru
          </button>
        </form>

        <Link
          href="/admin/login"
          className="mt-6 block text-center text-sm font-bold text-orange-500 hover:text-orange-600"
        >
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
