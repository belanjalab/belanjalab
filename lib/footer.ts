import { sanitizePublicUrl } from "./site-config";
import { getSupabaseClient } from "./supabase";

type SiteFooterRow = {
  id: string;
  company_description: string;
  contact_url: string | null;
  careers_url: string | null;
  privacy_url: string | null;
  terms_url: string | null;
  disclaimer_url: string | null;
};

export type SiteFooter = {
  id: string;
  companyDescription: string;
  contactUrl: string | null;
  careersUrl: string | null;
  privacyUrl: string | null;
  termsUrl: string | null;
  disclaimerUrl: string | null;
};

const fallbackFooter: SiteFooter = {
  id: "fallback",
  companyDescription:
    "Membantu masyarakat Indonesia memilih produk dengan lebih cerdas.",
  contactUrl: null,
  careersUrl: null,
  privacyUrl: null,
  termsUrl: null,
  disclaimerUrl: null,
};

export async function getActiveSiteFooter(): Promise<SiteFooter> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("site_footer")
    .select(`
      id,
      company_description,
      contact_url,
      careers_url,
      privacy_url,
      terms_url,
      disclaimer_url
    `)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil Footer Homepage:", error.message);
    return fallbackFooter;
  }

  if (!data) {
    return fallbackFooter;
  }

  const footer = data as SiteFooterRow;

  return {
    id: footer.id,
    companyDescription:
      footer.company_description?.trim() ||
      fallbackFooter.companyDescription,
    contactUrl: sanitizePublicUrl(footer.contact_url, {
      allowMailto: true,
    }),
    careersUrl: sanitizePublicUrl(footer.careers_url),
    privacyUrl: sanitizePublicUrl(footer.privacy_url),
    termsUrl: sanitizePublicUrl(footer.terms_url),
    disclaimerUrl: sanitizePublicUrl(footer.disclaimer_url),
  };
}
