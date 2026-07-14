import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam =
    requestUrl.searchParams.get("next") ?? "/admin/update-password";

  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/admin/update-password";

  if (!code) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set(
      "error",
      "Link reset password tidak valid atau sudah kedaluwarsa.",
    );

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set(
      "error",
      "Link reset password tidak valid atau sudah kedaluwarsa.",
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
