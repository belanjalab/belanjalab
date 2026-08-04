import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const PUBLIC_ADMIN_ROUTES = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/recovery-confirm",
  "/admin/update-password",
]);

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  if (!supabaseUrl || !supabasePublishableKey) {
    console.error(
      "Supabase environment variables belum tersedia di runtime Cloudflare.",
    );

    if (request.nextUrl.pathname.startsWith("/admin")) {
      return redirectTo(request, "/admin/login");
    }

    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.has(pathname);
  const isProtectedAdminRoute = isAdminRoute && !isPublicAdminRoute;

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  let isAdmin = false;

  if (userId && isAdminRoute) {
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminError) {
      console.error("Gagal memverifikasi akses admin:", adminError.message);
    }

    isAdmin = Boolean(adminRecord);
  }

  if (isProtectedAdminRoute && !userId) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedAdminRoute && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set(
      "error",
      "Akun ini tidak memiliki akses admin.",
    );
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/login" && userId && isAdmin) {
    return redirectTo(request, "/admin");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
