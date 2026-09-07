import { createClient } from "npm:@supabase/supabase-js@2.112.3";
import { validateOrder, type SavedOrder } from "../_shared/order.ts";
import { resendProvider } from "../_shared/notification.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const provider = resendProvider(key => Deno.env.get(key));
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function notify(id: string) {
  const { data: claimed, error: claimError } = await db.rpc("claim_cake_notification", { p_id: id });
  if (claimError || !claimed) return;
  try {
    const { data: order, error } = await db.from("cake_order_requests").select("id,created_at,payload,items").eq("id", id).single();
    if (error || !order) throw new Error("ORDER_READ_FAILED");
    await provider.send(order as SavedOrder);
    const { error: updateError } = await db.from("cake_order_notifications").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null, locked_until: null }).eq("order_id", id);
    if (updateError) console.error("cake_notification_status_failed", id);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "EMAIL_FAILED";
    console.error("cake_notification_failed", id, reason);
    await db.from("cake_order_notifications").update({ status: "failed", last_error: reason, locked_until: null, next_attempt_at: new Date(Date.now() + 300000).toISOString() }).eq("order_id", id);
  }
}

Deno.serve(async request => {
  if (request.method !== "POST") return json({ message: "Method not allowed" }, 405);
  if (new URL(request.url).searchParams.has("retry")) {
    const secret = Deno.env.get("ORDER_RETRY_SECRET");
    const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
    if (!secret || token !== secret) {
      const { data: user } = await db.auth.getUser(token);
      if (!user.user?.email) return json({ message: "Unauthorized" }, 401);
      const { data: admin } = await db.from("admin_users").select("id").eq("email", user.user.email).eq("is_active", true).maybeSingle();
      if (!admin) return json({ message: "Unauthorized" }, 403);
    }
    const { data, error } = await db.from("cake_order_notifications").select("order_id").neq("status", "sent").lte("next_attempt_at", new Date().toISOString()).order("next_attempt_at").limit(20);
    if (error) return json({ message: "Retry unavailable" }, 503);
    for (const row of data ?? []) await notify(row.order_id);
    return json({ processed: data?.length ?? 0 });
  }
  try {
    const key = request.headers.get("Idempotency-Key") ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) return json({ message: "Vui lòng tải lại trang trước khi gửi." }, 400);
    const raw = await request.text();
    if (raw.length > 16000) return json({ message: "Yêu cầu quá dài." }, 413);
    let value: unknown;
    try { value = JSON.parse(raw); } catch { return json({ message: "Dữ liệu không hợp lệ." }, 400); }
    const { data, errors } = validateOrder(value);
    if (!data) return json({ errors }, 422);
    const { data: id, error } = await db.rpc("submit_cake_order", { p_key: key, p_payload: data });
    if (error) {
      if (error.message.includes("RATE_LIMIT")) return json({ message: "Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau một giờ hoặc gọi MYNORA." }, 429);
      if (error.message.includes("IDEMPOTENCY_CONFLICT")) return json({ message: "Yêu cầu trước đã được lưu. Vui lòng tải lại trang để tạo yêu cầu mới." }, 409);
      if (error.message.includes("PRODUCT_UNAVAILABLE")) return json({ errors: { items: "Có món vừa tạm ngừng nhận. Vui lòng kiểm tra lại menu." } }, 422);
      console.error("cake_order_save_failed", error.code);
      return json({ message: "Chưa thể lưu yêu cầu. Vui lòng thử lại." }, 503);
    }
    // Persisted before notification. Email failure never changes the saved response.
    await notify(String(id));
    return json({ requestId: `MYN-${id}`, status: "pending" }, 201);
  } catch {
    return json({ message: "Chưa thể gửi yêu cầu. Vui lòng thử lại." }, 503);
  }
});
