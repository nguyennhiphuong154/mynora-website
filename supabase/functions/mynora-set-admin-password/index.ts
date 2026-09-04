import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.3";

const allowedOrigins = new Set([
  "http://localhost:3000",
  "https://mynora-bakery.nguyennhiphuong154.chatgpt.site",
]);

function response(req: Request, body: Record<string, unknown>, status = 200) {
  const origin = req.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Headers": "apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function preflightResponse(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
  };
  if (allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response("ok", { status: 200, headers });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflightResponse(req);
  if (req.method !== "POST") return response(req, { error: "Phương thức không hợp lệ." }, 405);

  const origin = req.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return response(req, { error: "Nguồn truy cập không hợp lệ." }, 403);

  let payload: { token?: unknown; password?: unknown };
  try {
    payload = await req.json();
  } catch {
    return response(req, { error: "Dữ liệu không hợp lệ." }, 400);
  }

  const token = typeof payload.token === "string" ? payload.token : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token) || password.length < 12 || password.length > 72) {
    return response(req, { error: "Mã bảo mật hoặc mật khẩu không hợp lệ." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<string, string>;
  const adminKey = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !adminKey) return response(req, { error: "Máy chủ chưa được cấu hình." }, 500);

  const admin = createClient(supabaseUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const tokenHash = await sha256(token);
  const now = new Date().toISOString();

  const { data: claimed, error: claimError } = await admin
    .from("admin_password_setup_tokens")
    .update({ used_at: now })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", now)
    .select("id,user_id")
    .maybeSingle();

  if (claimError) return response(req, { error: "Chưa thể xác minh mã bảo mật." }, 500);
  if (!claimed) return response(req, { error: "Liên kết đã hết hạn hoặc đã được sử dụng." }, 410);

  const { error: updateError } = await admin.auth.admin.updateUserById(claimed.user_id, { password });
  if (updateError) return response(req, { error: "Chưa thể cập nhật mật khẩu." }, 500);

  return response(req, { ok: true });
});
