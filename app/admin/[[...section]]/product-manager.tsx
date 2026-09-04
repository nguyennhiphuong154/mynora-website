"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./admin.module.css";

export type ProductRecord = {
  id: number;
  slug: string;
  category_id: number;
  name: string;
  display_name: string;
  standard_name: string;
  description: string;
  story: string;
  image_path: string;
  requirements: string[];
  content_status: "verified" | "safe_draft" | "needs_confirmation" | "hidden";
  order_status: "coming_soon" | "available" | "paused" | "sold_out";
  sort_order: number;
  is_featured: boolean;
};

type Category = { id: number; name: string };
type Draft = Omit<ProductRecord, "id">;

const emptyDraft = (categoryId: number, sortOrder: number): Draft => ({
  slug: "",
  category_id: categoryId,
  name: "",
  display_name: "",
  standard_name: "",
  description: "",
  story: "",
  image_path: "",
  requirements: [],
  content_status: "safe_draft",
  order_status: "coming_soon",
  sort_order: sortOrder,
  is_featured: true,
});

export default function ProductManager({ initialProducts, categories, editable }: { initialProducts: ProductRecord[]; categories: Category[]; editable: boolean }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(categories[0]?.id ?? 0, initialProducts.length + 1));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const selected = useMemo(() => typeof selectedId === "number" ? products.find((product) => product.id === selectedId) : null, [products, selectedId]);

  function edit(product: ProductRecord) {
    setSelectedId(product.id);
    const nextDraft = Object.fromEntries(Object.entries(product).filter(([key]) => key !== "id")) as Draft;
    setDraft(nextDraft);
    setMessage("");
  }

  function createNew() {
    setSelectedId("new");
    setDraft(emptyDraft(categories[0]?.id ?? 0, products.length + 1));
    setMessage("");
  }

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editable) return;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
      setMessage("Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.");
      return;
    }
    if (!draft.display_name.trim() || !draft.name.trim() || !draft.standard_name.trim() || !draft.image_path.trim()) {
      setMessage("Vui lòng điền đủ tên sản phẩm và đường dẫn hình ảnh.");
      return;
    }

    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const payload = { ...draft, updated_at: new Date().toISOString() };
    const query = selectedId === "new"
      ? supabase.from("products").insert(payload).select("*").single()
      : supabase.from("products").update(payload).eq("id", selectedId).select("*").single();
    const { data, error } = await query;
    setSaving(false);

    if (error || !data) {
      setMessage(error?.code === "23505" ? "Slug này đã được sử dụng." : "Chưa thể lưu. Hãy kiểm tra đăng nhập và thử lại.");
      return;
    }

    const saved = data as ProductRecord;
    setProducts((current) => selectedId === "new" ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
    setSelectedId(saved.id);
    setMessage("Đã lưu sản phẩm vào Supabase.");
  }

  return <div className={styles.productManager}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>CATALOG / SUPABASE</p><h2>{products.length} sản phẩm MYNORA</h2></div><button className={styles.primaryAction} type="button" onClick={createNew} disabled={!editable}>Thêm sản phẩm</button></div>
      {!editable && <p className={styles.previewNotice}>Đây là chế độ xem trước cục bộ. Đăng nhập Supabase để thêm hoặc chỉnh sửa dữ liệu.</p>}
      <div className={styles.productList}>{products.map((product) => <button className={selectedId === product.id ? styles.selectedProduct : ""} type="button" key={product.id} onClick={() => edit(product)}>
        <span>{String(product.sort_order).padStart(2, "0")}</span><strong>{product.display_name}</strong><small>{product.slug}</small><em>{product.order_status === "available" ? "Đang mở bán" : "Chưa mở bán"}</em>
      </button>)}</div>
    </section>

    {selectedId && <section className={styles.editorPanel}>
      <div className={styles.panelHeading}><div><p>{selectedId === "new" ? "SẢN PHẨM MỚI" : `CHỈNH SỬA / ${selected?.slug ?? ""}`}</p><h2>{selectedId === "new" ? "Thêm sản phẩm" : draft.display_name}</h2></div><button className={styles.closeEditor} type="button" onClick={() => setSelectedId(null)}>Đóng</button></div>
      <form className={styles.productForm} onSubmit={save}>
        <label><span>Tên hiển thị</span><input value={draft.display_name} onChange={(event) => setField("display_name", event.target.value)} required disabled={!editable} /></label>
        <label><span>Slug</span><input value={draft.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase())} required disabled={!editable} /></label>
        <label><span>Tên ngắn</span><input value={draft.name} onChange={(event) => setField("name", event.target.value)} required disabled={!editable} /></label>
        <label><span>Tên chuẩn</span><input value={draft.standard_name} onChange={(event) => setField("standard_name", event.target.value)} required disabled={!editable} /></label>
        <label><span>Danh mục</span><select value={draft.category_id} onChange={(event) => setField("category_id", Number(event.target.value))} disabled={!editable}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label><span>Đường dẫn hình ảnh</span><input value={draft.image_path} onChange={(event) => setField("image_path", event.target.value)} required disabled={!editable} /></label>
        <label className={styles.fullField}><span>Mô tả</span><textarea rows={4} value={draft.description} onChange={(event) => setField("description", event.target.value)} disabled={!editable} /></label>
        <label className={styles.fullField}><span>Câu chuyện sản phẩm</span><textarea rows={4} value={draft.story} onChange={(event) => setField("story", event.target.value)} disabled={!editable} /></label>
        <label><span>Trạng thái nội dung</span><select value={draft.content_status} onChange={(event) => setField("content_status", event.target.value as Draft["content_status"])} disabled={!editable}><option value="safe_draft">Bản nháp an toàn</option><option value="needs_confirmation">Cần xác nhận</option><option value="verified">Đã xác nhận</option><option value="hidden">Đang ẩn</option></select></label>
        <label><span>Trạng thái mở bán</span><select value={draft.order_status} onChange={(event) => setField("order_status", event.target.value as Draft["order_status"])} disabled={!editable}><option value="coming_soon">Chưa mở bán</option><option value="available">Đang mở bán</option><option value="paused">Tạm dừng</option><option value="sold_out">Hết hàng</option></select></label>
        <label><span>Thứ tự</span><input type="number" min="0" value={draft.sort_order} onChange={(event) => setField("sort_order", Number(event.target.value))} disabled={!editable} /></label>
        <label className={styles.checkboxField}><input type="checkbox" checked={draft.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} disabled={!editable} /><span>Hiển thị trong mục nổi bật</span></label>
        <div className={styles.formActions}><button className={styles.primaryAction} type="submit" disabled={!editable || saving}>{saving ? "Đang lưu…" : "Lưu vào Supabase"}</button>{message && <p aria-live="polite">{message}</p>}</div>
      </form>
    </section>}
  </div>;
}
