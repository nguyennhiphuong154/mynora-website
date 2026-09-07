import { getSupabaseConfig } from "../../../lib/supabase/config";
export async function POST(request: Request) {
  try {
    const body = await request.text();
    if (body.length > 16000) return Response.json({ message: "Yêu cầu quá dài." }, { status: 413 });
    const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
    const response = await fetch(`${supabaseUrl}/functions/v1/mynora-order-requests`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: supabasePublishableKey, "Idempotency-Key": request.headers.get("Idempotency-Key") ?? "" }, body,
      signal: AbortSignal.timeout(25000),
    });
    return new Response(await response.text(), { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ message: "Chưa thể kết nối. Thông tin của bạn vẫn được giữ lại, vui lòng thử gửi lại." }, { status: 503 });
  }
}
