import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const migration = read("../supabase/migrations/20260915170000_ecommerce_foundation.sql");
const catalog = read("../app/lib/catalog.ts");
const login = read("../app/admin/login/login-form.tsx");
const admin = read("../lib/supabase/admin.ts");
const orderEdge = read("../supabase/functions/mynora-order-requests/index.ts");

test("foundation schema extends catalog without inventing commerce data", () => {
  for (const name of ["product_variants", "product_images", "site_settings", "preparation_time_days", "base_price", "is_archived"]) assert.match(migration, new RegExp(name));
  assert.match(migration, /price numeric\(12,0\)/);
  assert.match(migration, /is_active boolean not null default false/);
  assert.doesNotMatch(migration, /insert into public\.product_variants/i);
});

test("public catalog reads categories, variants, images and settings from Supabase", () => {
  for (const name of ["product_variants", "product_images", "site_settings", "getPublicCategories", "getPublicSiteSettings"]) assert.match(catalog, new RegExp(name));
  assert.match(catalog, /eq\("is_archived", false\)/);
});

test("admin authorization is server-backed and login has no hard-coded owner email", () => {
  assert.match(admin, /auth\.getUser\(\)/);
  assert.match(admin, /from\("admin_users"\)/);
  assert.doesNotMatch(login, /ADMIN_EMAIL|nguyennhiphuong154@gmail\.com/);
});

test("order validation reads the preorder rule from database settings", () => {
  assert.match(orderEdge, /from\("site_settings"\)/);
  assert.match(orderEdge, /minimumPreorderDays/);
  assert.match(orderEdge, /validateOrder\(value, minimumDate\(new Date\(\), leadDays\), leadDays\)/);
});

test("new catalog tables protect writes with admin RLS", () => {
  for (const table of ["product_variants", "product_images", "site_settings"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(migration, new RegExp(`${table}_admin_update`));
  }
  assert.match(migration, /revoke all on public\.product_variants, public\.product_images, public\.site_settings from anon, authenticated/);
});
