"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./admin.module.css";

export type CategoryRecord = { id: number; slug: string; name: string; description: string; sort_order: number; is_active: boolean };
type Draft = Omit<CategoryRecord, "id">;
const empty = (sortOrder: number): Draft => ({ slug: "", name: "", description: "", sort_order: sortOrder, is_active: true });

export default function CategoryManager({ initialCategories }: { initialCategories: CategoryRecord[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(() => empty(initialCategories.length + 1));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const selected = useMemo(() => typeof selectedId === "number" ? categories.find(row => row.id === selectedId) : null, [categories, selectedId]);
  const choose = (row: CategoryRecord) => { setSelectedId(row.id); setDraft({ slug: row.slug, name: row.name, description: row.description, sort_order: row.sort_order, is_active: row.is_active }); setMessage(""); };
  const field = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) || !draft.name.trim()) { setMessage("Vui lòng nhập tên và slug hợp lệ."); return; }
    setSaving(true); setMessage("");
    const db = createClient();
    const payload = { ...draft, name: draft.name.trim(), description: draft.description.trim() };
    const result = selectedId === "new" ? await db.from("categories").insert(payload).select("*").single() : await db.from("categories").update(payload).eq("id", selectedId).select("*").single();
    setSaving(false);
    if (result.error || !result.data) { setMessage(result.error?.code === "23505" ? "Slug này đã được sử dụng." : "Chưa thể lưu danh mục."); return; }
    const saved = result.data as CategoryRecord;
    setCategories(current => selectedId === "new" ? [...current, saved] : current.map(row => row.id === saved.id ? saved : row));
    setSelectedId(saved.id); setMessage("Đã lưu danh mục. Menu công khai sẽ dùng dữ liệu này.");
  }

  return <div className={styles.productManager}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>CATALOG / SUPABASE</p><h2>{categories.length} danh mục</h2></div><button className={styles.primaryAction} type="button" onClick={() => { setSelectedId("new"); setDraft(empty(categories.length + 1)); setMessage(""); }}>Thêm danh mục</button></div>
      <div className={styles.categoryGrid}>{categories.map(row => <button className={selectedId === row.id ? styles.selectedCategory : ""} type="button" key={row.id} onClick={() => choose(row)}><span>{row.is_active ? "Đang hiển thị" : "Đã ẩn"}</span><h2>{row.name}</h2><p>{row.description}</p><small>{row.slug}</small></button>)}</div>
    </section>
    {selectedId && <section className={styles.editorPanel}>
      <div className={styles.panelHeading}><div><p>{selectedId === "new" ? "DANH MỤC MỚI" : `CHỈNH SỬA / ${selected?.slug ?? ""}`}</p><h2>{selectedId === "new" ? "Thêm danh mục" : draft.name}</h2></div><button className={styles.closeEditor} type="button" onClick={() => setSelectedId(null)}>Đóng</button></div>
      <form className={styles.productForm} onSubmit={save}>
        <label><span>Tên danh mục</span><input required value={draft.name} onChange={event => field("name", event.target.value)} /></label>
        <label><span>Slug</span><input required value={draft.slug} onChange={event => field("slug", event.target.value.toLowerCase())} /></label>
        <label className={styles.fullField}><span>Mô tả</span><textarea rows={4} value={draft.description} onChange={event => field("description", event.target.value)} /></label>
        <label><span>Thứ tự</span><input type="number" min="0" value={draft.sort_order} onChange={event => field("sort_order", Number(event.target.value))} /></label>
        <label className={styles.checkboxField}><input type="checkbox" checked={draft.is_active} onChange={event => field("is_active", event.target.checked)} /><span>Hiển thị công khai</span></label>
        <div className={styles.formActions}><button className={styles.primaryAction} type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu danh mục"}</button>{message && <p aria-live="polite">{message}</p>}</div>
      </form>
    </section>}
  </div>;
}
