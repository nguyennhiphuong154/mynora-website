import { createClient } from "../../../../../lib/supabase/server";

const statuses = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
type Status = typeof statuses[number];

async function authorizedClient() {
  const db = await createClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user?.email) return { response: Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 }) };
  const { data: admin } = await db.from("admin_users").select("id").eq("email", auth.user.email).eq("is_active", true).maybeSingle();
  if (!admin) return { response: Response.json({ message: "Bạn không có quyền quản trị." }, { status: 403 }) };
  return { db };
}

async function requestWithEvents(db: Awaited<ReturnType<typeof createClient>>, id: string) {
  const [requestResult, eventResult] = await Promise.all([
    db.from("cake_order_requests").select("id,request_code,created_at,updated_at,payload,items,status,admin_note,cake_order_notifications(status,attempts,last_error)").eq("id", id).single(),
    db.from("cake_order_request_events").select("id,event_type,from_status,to_status,created_at").eq("request_id", id).order("created_at", { ascending: false }),
  ]);
  if (requestResult.error || !requestResult.data) return null;
  return { ...requestResult.data, events: eventResult.data ?? [] };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizedClient();
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ message: "Mã yêu cầu không hợp lệ." }, { status: 400 });
  const order = await requestWithEvents(auth.db!, id);
  return order ? Response.json(order) : Response.json({ message: "Không tìm thấy yêu cầu." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== new URL(request.url).host) return Response.json({ message: "Yêu cầu không hợp lệ." }, { status: 403 });
  const auth = await authorizedClient();
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ message: "Mã yêu cầu không hợp lệ." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const updates: { status?: Status; admin_note?: string } = {};
  if (input.status !== undefined) {
    if (typeof input.status !== "string" || !statuses.includes(input.status as Status)) return Response.json({ message: "Trạng thái không hợp lệ." }, { status: 422 });
    updates.status = input.status as Status;
  }
  if (input.adminNote !== undefined) {
    if (typeof input.adminNote !== "string" || input.adminNote.trim().length > 5000) return Response.json({ message: "Ghi chú nội bộ tối đa 5.000 ký tự." }, { status: 422 });
    updates.admin_note = input.adminNote.trim();
  }
  if (!Object.keys(updates).length) return Response.json({ message: "Không có nội dung cần cập nhật." }, { status: 422 });
  const { error } = await auth.db!.from("cake_order_requests").update(updates).eq("id", id);
  if (error) return Response.json({ message: "Chưa thể cập nhật yêu cầu." }, { status: 503 });
  const order = await requestWithEvents(auth.db!, id);
  return order ? Response.json(order) : Response.json({ message: "Chưa thể tải lại yêu cầu." }, { status: 503 });
}
