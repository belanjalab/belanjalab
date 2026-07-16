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
  contactUrl: string;
  careersUrl: string;
  privacyUrl: string;
  termsUrl: string;
  disclaimerUrl: string;
};

const fallbackFooter: SiteFooter = {
  id: "fallback",
  companyDescription:
    "Membantu masyarakat Indonesia memilih produk dengan lebih cerdas.",
  contactUrl: "/contact",
  careersUrl: "/careers",
  privacyUrl: "/privacy",
  termsUrl: "/terms",
  disclaimerUrl: "/disclaimer",
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
    companyDescription: footer.company_description,
    contactUrl: footer.contact_url ?? fallbackFooter.contactUrl,
    careersUrl: footer.careers_url ?? fallbackFooter.careersUrl,
    privacyUrl: footer.privacy_url ?? fallbackFooter.privacyUrl,
    termsUrl: footer.terms_url ?? fallbackFooter.termsUrl,
    disclaimerUrl: footer.disclaimer_url ?? fallbackFooter.disclaimerUrl,
  };
}
