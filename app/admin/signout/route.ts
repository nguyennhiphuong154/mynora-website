import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

// GET must never revoke a session: browsers and Next.js can prefetch links.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403 });
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) return new Response("Chưa thể đăng xuất. Vui lòng thử lại.", { status: 503 });
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
