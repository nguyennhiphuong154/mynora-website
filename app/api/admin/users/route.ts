import { getAdminContext, isOwner, type AdminRole } from "../../../../lib/supabase/admin";

const roles: AdminRole[] = ["owner", "technical_admin"];

function cleanEmail(value: unknown) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? value.trim().toLowerCase()
    : null;
}

async function ownerContext() {
  const context = await getAdminContext();
  if (!context.user) return { response: Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 }) };
  if (!isOwner(context.admin)) return { response: Response.json({ message: "Chỉ Chủ sở hữu được quản lý tài khoản Admin." }, { status: 403 }) };
  return context;
}

export async function POST(request: Request) {
  const context = await ownerContext();
  if ("response" in context) return context.response;
  const input = await request.json().catch(() => null) as { email?: unknown; displayName?: unknown; role?: unknown } | null;
  const email = cleanEmail(input?.email);
  const role = input?.role;
  const displayName = typeof input?.displayName === "string" ? input.displayName.trim().slice(0, 120) : "";
  if (!email || !roles.includes(role as AdminRole)) return Response.json({ message: "Thông tin quản trị viên chưa hợp lệ." }, { status: 422 });
  const { error } = await context.db.from("admin_users").insert({ email, display_name: displayName || null, role, is_active: true });
  if (error) return Response.json({ message: error.code === "23505" ? "Email này đã có trong danh sách Admin." : "Không thể thêm quản trị viên." }, { status: 409 });
  return Response.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await ownerContext();
  if ("response" in context) return context.response;
  const input = await request.json().catch(() => null) as { id?: unknown; role?: unknown; isActive?: unknown } | null;
  const id = typeof input?.id === "number" && Number.isSafeInteger(input.id) ? input.id : null;
  const role = input?.role;
  if (!id || !roles.includes(role as AdminRole) || typeof input?.isActive !== "boolean") return Response.json({ message: "Thay đổi quyền chưa hợp lệ." }, { status: 422 });
  const { error } = await context.db.from("admin_users").update({ role, is_active: input.isActive }).eq("id", id);
  if (error) return Response.json({ message: "Không thể cập nhật quyền. Hệ thống phải luôn có ít nhất một Owner." }, { status: 409 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const context = await ownerContext();
  if ("response" in context) return context.response;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) return Response.json({ message: "Quản trị viên không hợp lệ." }, { status: 422 });
  const { error } = await context.db.from("admin_users").delete().eq("id", id);
  if (error) return Response.json({ message: "Không thể xóa Owner cuối cùng." }, { status: 409 });
  return Response.json({ ok: true });
}
