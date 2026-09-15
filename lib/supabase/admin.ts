import { createClient } from "./server";

export async function getAdminContext() {
  const db = await createClient();
  const { data: auth } = await db.auth.getUser();
  const email = auth.user?.email?.trim().toLowerCase();
  if (!email) return { db, user: null, admin: null };
  const { data: admin } = await db.from("admin_users").select("id,email,display_name,is_active").ilike("email", email).eq("is_active", true).maybeSingle();
  return { db, user: auth.user, admin };
}
