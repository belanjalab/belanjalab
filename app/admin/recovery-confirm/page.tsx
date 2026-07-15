import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type RecoveryConfirmPageProps = {
  searchParams: Promise<{
    token_hash?: string;
    error?: string;
  }>;
};

async function confirmRecovery(formData: FormData) {
  "use server";

  const tokenHash = String(formData.get("token_hash") ?? "");

  if (!tokenHash) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Link reset password tidak valid.",
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error) {
    console.error("Recovery verification error:", error);

    redirect(
      `/admin/recovery-confirm?error=${encodeURIComponent(
        "Link reset tidak valid, sudah digunakan, atau kedaluwarsa. Minta link baru.",
      )}`,
    );
  }

  redirect("/admin/update-password");
}

export default async function RecoveryConfirmPage({
  searchParams,
}: RecoveryConfirmPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash ?? "";

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
            Konfirmasi Pemulihan
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Lanjut reset password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tekan tombol di bawah untuk memverifikasi link dan membuat
            password baru. Link belum digunakan sampai tombol ditekan.
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

        {tokenHash ? (
          <form action={confirmRecovery} className="mt-6">
            <input
              type="hidden"
              name="token_hash"
              value={tokenHash}
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Verifikasi dan Lanjutkan
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Token pemulihan tidak ditemukan. Silakan minta link reset baru.
          </div>
        )}

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
