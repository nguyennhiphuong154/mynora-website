import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const migration = read("../supabase/migrations/20260914143000_admin_order_request_history.sql");
const defaultMigration = read("../supabase/migrations/20260914150000_default_new_order_status.sql");
const page = read("../app/admin/[[...section]]/page.tsx");
const manager = read("../app/admin/[[...section]]/order-requests.tsx");
const api = read("../app/api/admin/order-requests/[id]/route.ts");
const adminAuth = read("../lib/supabase/admin.ts");
const edge = read("../supabase/functions/mynora-order-requests/index.ts");

test("order history schema preserves snapshots and records workflow changes", () => {
  assert.match(migration, /admin_note text not null default ''/);
  assert.match(migration, /cake_order_request_events/);
  assert.match(migration, /status_changed/);
  assert.match(migration, /on delete restrict/);
  assert.match(migration, /revoke all on public\.cake_order_request_events from anon, authenticated/);
  assert.match(defaultMigration, /status set default 'new'/);
});

test("admin list searches, filters and paginates on the server", () => {
  assert.match(page, /customer_phone\.ilike/);
  assert.match(page, /query\.range\(\(page - 1\) \* 20, page \* 20 - 1\)/);
  assert.match(page, /\.eq\("status", filters\.status\)/);
  assert.match(page, /\.gte\("created_at", since\)/);
  assert.match(page, /\.order\("requested_date"/);
});

test("admin API requires a real admin and limits editable fields", () => {
  assert.match(api, /getAdminContext\(\)/);
  assert.match(adminAuth, /db\.auth\.getUser\(\)/);
  assert.match(adminAuth, /from\("admin_users"\)/);
  assert.match(api, /new URL\(origin\)\.host !== new URL\(request\.url\)\.host/);
  assert.match(api, /update\(updates\)/);
  assert.doesNotMatch(api, /service_role/i);
});

test("admin UI renders saved item snapshots, internal notes and status history", () => {
  assert.match(manager, /item\.productNameSnapshot/);
  assert.match(manager, /Ghi chú nội bộ — chỉ Admin nhìn thấy/);
  assert.match(manager, /Trạng thái đổi:/);
  assert.match(manager, /selected\.request_code/);
  assert.match(edge, /status: "new"/);
  assert.match(edge, /saved\?\.request_code/);
});
