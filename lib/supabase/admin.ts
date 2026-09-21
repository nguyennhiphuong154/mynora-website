import { createClient } from "./server";

export type AdminRole = "owner" | "technical_admin";

export type AdminUser = {
  id: number;
  email: string;
  display_name: string | null;
  is_active: boolean;
  role: AdminRole;
};

export function isOwner(admin: AdminUser | null): admin is AdminUser & { role: "owner" } {
  return admin?.role === "owner";
}

export async function getAdminContext() {
  const db = await createClient();
  const { data: auth } = await db.auth.getUser();
  const email = auth.user?.email?.trim().toLowerCase();
  if (!email) return { db, user: null, admin: null };
  const { data: admin } = await db.from("admin_users").select("id,email,display_name,is_active,role").ilike("email", email).eq("is_active", true).maybeSingle();
  return { db, user: auth.user, admin: admin as AdminUser | null };
}
