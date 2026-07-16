import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminFooterPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

type FooterRecord = {
  id: string;
  company_description: string;
  contact_url: string | null;
  careers_url: string | null;
  privacy_url: string | null;
  terms_url: string | null;
  disclaimer_url: string | null;
  is_active: boolean;
};

function normalizeInternalUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? "").trim();

  if (!url) {
    return null;
  }

  if (!url.startsWith("/") || url.startsWith("//")) {
    throw new Error("URL harus berupa path internal yang diawali /.");
  }

  return url;
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRecord) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        error?.message ?? "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  return supabase;
}

async function saveFooter(formData: FormData) {
  "use server";

  const footerId = String(formData.get("footer_id") ?? "").trim();
  const companyDescription = String(
    formData.get("company_description") ?? "",
  ).trim();

  if (companyDescription.length < 10 || companyDescription.length > 300) {
    redirect(
      `/admin/footer?error=${encodeURIComponent(
        "Deskripsi perusahaan harus 10-300 karakter.",
      )}`,
    );
  }

  let contactUrl: string | null;
  let careersUrl: string | null;
  let privacyUrl: string | null;
  let termsUrl: string | null;
  let disclaimerUrl: string | null;

  try {
    contactUrl = normalizeInternalUrl(formData.get("contact_url"));
    careersUrl = normalizeInternalUrl(formData.get("careers_url"));
    privacyUrl = normalizeInternalUrl(formData.get("privacy_url"));
    termsUrl = normalizeInternalUrl(formData.get("terms_url"));
    disclaimerUrl = normalizeInternalUrl(formData.get("disclaimer_url"));
  } catch (error) {
    redirect(
      `/admin/footer?error=${encodeURIComponent(
        error instanceof Error ? error.message : "URL tidak valid.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const payload = {
    company_description: companyDescription,
    contact_url: contactUrl,
    careers_url: careersUrl,
    privacy_url: privacyUrl,
    terms_url: termsUrl,
    disclaimer_url: disclaimerUrl,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { error } = footerId
    ? await supabase.from("site_footer").update(payload).eq("id", footerId)
    : await supabase.from("site_footer").insert(payload);

  if (error) {
    redirect(`/admin/footer?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/admin/footer?saved=${encodeURIComponent(
      footerId ? "Footer berhasil diperbarui." : "Footer berhasil dibuat.",
    )}`,
  );
}

export default async function AdminFooterPage({
  searchParams,
}: AdminFooterPageProps) {
  const params = await searchParams;
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("site_footer")
    .select(
      "id,company_description,contact_url,careers_url,privacy_url,terms_url,disclaimer_url,is_active",
    )
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil Footer CMS: ${error.message}`);
  }

  const footer = data as FooterRecord | null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Footer Homepage
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola deskripsi perusahaan dan tautan Footer.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {params.saved && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {params.saved}
          </div>
        )}

        {params.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <form action={saveFooter} className="grid gap-5">
            <input
              type="hidden"
              name="footer_id"
              value={footer?.id ?? ""}
            />

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Deskripsi perusahaan
              <textarea
                name="company_description"
                required
                minLength={10}
                maxLength={300}
                rows={4}
                defaultValue={
                  footer?.company_description ??
                  "Membantu masyarakat Indonesia memilih produk dengan lebih cerdas."
                }
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                URL Kontak
                <input
                  type="text"
                  name="contact_url"
                  defaultValue={footer?.contact_url ?? "/contact"}
                  placeholder="/contact"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                URL Karier
                <input
                  type="text"
                  name="careers_url"
                  defaultValue={footer?.careers_url ?? "/careers"}
                  placeholder="/careers"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                URL Kebijakan Privasi
                <input
                  type="text"
                  name="privacy_url"
                  defaultValue={footer?.privacy_url ?? "/privacy"}
                  placeholder="/privacy"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                URL Syarat Penggunaan
                <input
                  type="text"
                  name="terms_url"
                  defaultValue={footer?.terms_url ?? "/terms"}
                  placeholder="/terms"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
                URL Disclaimer
                <input
                  type="text"
                  name="disclaimer_url"
                  defaultValue={footer?.disclaimer_url ?? "/disclaimer"}
                  placeholder="/disclaimer"
                  className="rounded-xl border border-slate-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </label>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
              Gunakan path internal seperti <strong>/contact</strong>. Halaman
              tujuan harus dibuat agar tautan tidak menghasilkan 404.
            </div>

            <button
              type="submit"
              className="w-fit rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Simpan Footer
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
