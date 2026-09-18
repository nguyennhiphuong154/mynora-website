import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("content migration seeds FAQ and guide pages in public site settings", async () => {
  const sql = await read("supabase/migrations/20260918120000_seed_admin_managed_content.sql");
  assert.match(sql, /'content'/);
  assert.match(sql, /"faq"/);
  assert.match(sql, /"guides"/);
  assert.match(sql, /on conflict \(key\) do nothing/i);
});

test("admin content manager saves one authoritative content setting", async () => {
  const source = await read("app/admin/[[...section]]/content-manager.tsx");
  assert.match(source, /from\("site_settings"\)\.update\(\{ value: content \}\)\.eq\("key", "content"\)/);
  assert.match(source, /Thêm câu hỏi/);
  assert.match(source, /Lưu và cập nhật website/);
  assert.match(source, /không cần deploy lại/);
});

test("public FAQ and guides read uncached content from Supabase", async () => {
  const dataSource = await read("app/lib/content.ts");
  const pageSource = await read("app/[slug]/page.tsx");
  assert.match(dataSource, /cache: "no-store"/);
  assert.match(dataSource, /eq\("key", "content"\)/);
  assert.match(pageSource, /getPublicContent\(\)/);
  assert.match(pageSource, /content\.faq\.items/);
  assert.match(pageSource, /InfoCards items=\{content\.guides\.pages\}/);
});
