import { createClient } from "../../../../lib/supabase/server";
import { getSupabaseConfig } from "../../../../lib/supabase/config";
export async function POST() {
  const db = await createClient();
  const { data: user } = await db.auth.getUser();
  if (!user.user) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  const { data: session } = await db.auth.getSession();
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/mynora-order-requests?retry=1`, { method: "POST", headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${session.session?.access_token}` }, signal: AbortSignal.timeout(25000) });
    return new Response(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
  } catch { return Response.json({ message: "Chưa thể xử lý email. Vui lòng thử lại." }, { status: 503 }); }
}
