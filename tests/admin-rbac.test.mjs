import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const migration = read("../supabase/migrations/20260921100000_owner_technical_admin_rbac.sql");
const admin = read("../lib/supabase/admin.ts");
const api = read("../app/api/admin/users/route.ts");
const page = read("../app/admin/[[...section]]/page.tsx");

test("roles are stored in the database and loaded during server authorization", () => {
  assert.match(migration, /add column if not exists role/);
  assert.match(migration, /role in \('owner', 'technical_admin'\)/);
  assert.match(admin, /select\("id,email,display_name,is_active,role"\)/);
  assert.doesNotMatch(admin, /mynorabaker@gmail\.com|nguyennhiphuong154@gmail\.com/);
});

test("owner and technical admin assignments preserve existing users", () => {
  assert.match(migration, /update public\.admin_users[\s\S]*nguyennhiphuong154@gmail\.com/);
  assert.match(migration, /insert into public\.admin_users[\s\S]*mynorabaker@gmail\.com/);
  assert.doesNotMatch(migration, /delete from|truncate|drop table/i);
});

test("technical admin cannot manage ownership or admin roles", () => {
  assert.match(api, /if \(!isOwner\(context\.admin\)\)/);
  assert.match(api, /status: 403/);
  assert.match(migration, /admin_users_owner_update/);
  assert.match(migration, /admin_users_owner_delete/);
  assert.match(migration, /MYNORA must always have an active Owner/);
});

test("admin UI identifies each role and protects the business email", () => {
  assert.match(page, /Chủ sở hữu/);
  assert.match(page, /Admin kỹ thuật/);
  assert.match(migration, /site_settings_protect_business_email/);
  assert.match(migration, /Only the Owner can change the business email/);
});
