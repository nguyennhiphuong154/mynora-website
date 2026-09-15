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
  short_description: string;
  story: string;
  image_path: string;
  requirements: string[];
  content_status: "verified" | "safe_draft" | "needs_confirmation" | "hidden";
  order_status: "coming_soon" | "available" | "paused" | "sold_out";
  sort_order: number;
  is_featured: boolean;
  base_price: number | null;
  compare_price: number | null;
  preparation_time_days: number | null;
  minimum_order: number;
  serving_size: string;
  storage_instruction: string;
  allergen_info: string;
  is_archived: boolean;
  product_variants: VariantRecord[];
};

export type VariantRecord = { id: number; product_id: number; name: string; sku: string | null; price: number | null; compare_price: number | null; preparation_time_days: number | null; minimum_order: number; serving_size: string; stock_quantity: number | null; is_active: boolean; sort_order: number };

type Category = { id: number; name: string };
type Draft = Omit<ProductRecord, "id" | "product_variants">;

const emptyDraft = (categoryId: number, sortOrder: number): Draft => ({
  slug: "",
  category_id: categoryId,
  name: "",
  display_name: "",
  standard_name: "",
  description: "",
  short_description: "",
  story: "",
  image_path: "",
  requirements: [],
  content_status: "safe_draft",
  order_status: "coming_soon",
  sort_order: sortOrder,
  is_featured: true,
  base_price: null,
  compare_price: null,
  preparation_time_days: null,
  minimum_order: 1,
  serving_size: "",
  storage_instruction: "",
  allergen_info: "",
  is_archived: false,
});

export default function ProductManager({ initialProducts, categories, editable }: { initialProducts: ProductRecord[]; categories: Category[]; editable: boolean }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(categories[0]?.id ?? 0, initialProducts.length + 1));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState<VariantRecord[]>([]);
  const selected = useMemo(() => typeof selectedId === "number" ? products.find((product) => product.id === selectedId) : null, [products, selectedId]);

  function edit(product: ProductRecord) {
    setSelectedId(product.id);
    const nextDraft = Object.fromEntries(Object.entries(product).filter(([key]) => key !== "id" && key !== "product_variants")) as Draft;
    setDraft(nextDraft);
    setVariants(product.product_variants ?? []);
    setMessage("");
  }

  function createNew() {
    setSelectedId("new");
    setDraft(emptyDraft(categories[0]?.id ?? 0, products.length + 1));
    setVariants([]);
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
    saved.product_variants = variants;
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
        <label className={styles.fullField}><span>Mô tả ngắn</span><textarea rows={2} value={draft.short_description} onChange={(event) => setField("short_description", event.target.value)} disabled={!editable} /></label>
        <label className={styles.fullField}><span>Câu chuyện sản phẩm</span><textarea rows={4} value={draft.story} onChange={(event) => setField("story", event.target.value)} disabled={!editable} /></label>
        <label><span>Trạng thái nội dung</span><select value={draft.content_status} onChange={(event) => setField("content_status", event.target.value as Draft["content_status"])} disabled={!editable}><option value="safe_draft">Bản nháp an toàn</option><option value="needs_confirmation">Cần xác nhận</option><option value="verified">Đã xác nhận</option><option value="hidden">Đang ẩn</option></select></label>
        <label><span>Trạng thái mở bán</span><select value={draft.order_status} onChange={(event) => setField("order_status", event.target.value as Draft["order_status"])} disabled={!editable}><option value="coming_soon">Chưa mở bán</option><option value="available">Đang mở bán</option><option value="paused">Tạm dừng</option><option value="sold_out">Hết hàng</option></select></label>
        <label><span>Thứ tự</span><input type="number" min="0" value={draft.sort_order} onChange={(event) => setField("sort_order", Number(event.target.value))} disabled={!editable} /></label>
        <label><span>Giá cơ bản (để trống nếu chưa chốt)</span><input type="number" min="0" value={draft.base_price ?? ""} onChange={(event) => setField("base_price", event.target.value === "" ? null : Number(event.target.value))} disabled={!editable} /></label>
        <label><span>Giá so sánh</span><input type="number" min="0" value={draft.compare_price ?? ""} onChange={(event) => setField("compare_price", event.target.value === "" ? null : Number(event.target.value))} disabled={!editable} /></label>
        <label><span>Thời gian chuẩn bị (ngày)</span><input type="number" min="0" max="90" value={draft.preparation_time_days ?? ""} onChange={(event) => setField("preparation_time_days", event.target.value === "" ? null : Number(event.target.value))} disabled={!editable} /></label>
        <label><span>Số lượng tối thiểu</span><input type="number" min="1" max="99" value={draft.minimum_order} onChange={(event) => setField("minimum_order", Number(event.target.value))} disabled={!editable} /></label>
        <label><span>Quy cách / khẩu phần</span><input value={draft.serving_size} onChange={(event) => setField("serving_size", event.target.value)} disabled={!editable} /></label>
        <label className={styles.fullField}><span>Bảo quản</span><textarea rows={2} value={draft.storage_instruction} onChange={(event) => setField("storage_instruction", event.target.value)} disabled={!editable} /></label>
        <label className={styles.fullField}><span>Thông tin dị ứng</span><textarea rows={2} value={draft.allergen_info} onChange={(event) => setField("allergen_info", event.target.value)} disabled={!editable} /></label>
        <label className={styles.checkboxField}><input type="checkbox" checked={draft.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} disabled={!editable} /><span>Hiển thị trong mục nổi bật</span></label>
        <label className={styles.checkboxField}><input type="checkbox" checked={draft.is_archived} onChange={(event) => setField("is_archived", event.target.checked)} disabled={!editable} /><span>Lưu trữ sản phẩm</span></label>
        <div className={styles.formActions}><button className={styles.primaryAction} type="submit" disabled={!editable || saving}>{saving ? "Đang lưu…" : "Lưu vào Supabase"}</button>{message && <p aria-live="polite">{message}</p>}</div>
      </form>
      {typeof selectedId === "number" && <VariantManager key={selectedId} productId={selectedId} initialVariants={variants} onChange={setVariants} editable={editable} />}
    </section>}
  </div>;
}

function VariantManager({ productId, initialVariants, onChange, editable }: { productId: number; initialVariants: VariantRecord[]; onChange: (rows: VariantRecord[]) => void; editable: boolean }) {
  const [rows, setRows] = useState(initialVariants);
  const [message, setMessage] = useState("");
  const update = (id: number, patch: Partial<VariantRecord>) => setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row));
  async function save(row: VariantRecord) {
    if (!editable) return;
    if (!row.name.trim()) { setMessage("Variant cần có tên."); return; }
    const db = createClient();
    const payload = { product_id: productId, name: row.name.trim(), sku: row.sku?.trim() || null, price: row.price, compare_price: row.compare_price, preparation_time_days: row.preparation_time_days, minimum_order: row.minimum_order, serving_size: row.serving_size.trim(), stock_quantity: row.stock_quantity, is_active: row.is_active, sort_order: row.sort_order };
    const result = row.id < 0 ? await db.from("product_variants").insert(payload).select("*").single() : await db.from("product_variants").update(payload).eq("id", row.id).select("*").single();
    if (result.error || !result.data) { setMessage(result.error?.code === "23505" ? "SKU đã được sử dụng." : "Chưa thể lưu variant."); return; }
    const saved = result.data as VariantRecord;
    const next = rows.map(item => item.id === row.id ? saved : item);
    setRows(next); onChange(next); setMessage("Đã lưu variant.");
  }
  function add() { if (editable) setRows(current => [...current, { id: -Date.now(), product_id: productId, name: "", sku: null, price: null, compare_price: null, preparation_time_days: null, minimum_order: 1, serving_size: "", stock_quantity: null, is_active: false, sort_order: current.length + 1 }]); }
  return <section className={styles.variantSection}><div className={styles.panelHeading}><div><p>PRODUCT VARIANTS</p><h2>Quy cách và giá</h2></div><button className={styles.closeEditor} type="button" onClick={add} disabled={!editable}>Thêm variant</button></div>
    {rows.length === 0 ? <p className={styles.previewNotice}>Chưa có variant. Không cần tạo nếu sản phẩm chỉ có một quy cách.</p> : rows.map(row => <article className={styles.variantRow} key={row.id}>
      <label><span>Tên variant</span><input value={row.name} onChange={event => update(row.id, { name: event.target.value })} disabled={!editable} /></label>
      <label><span>SKU</span><input value={row.sku ?? ""} onChange={event => update(row.id, { sku: event.target.value || null })} disabled={!editable} /></label>
      <label><span>Giá</span><input type="number" min="0" value={row.price ?? ""} onChange={event => update(row.id, { price: event.target.value === "" ? null : Number(event.target.value) })} disabled={!editable} /></label>
      <label><span>Giá so sánh</span><input type="number" min="0" value={row.compare_price ?? ""} onChange={event => update(row.id, { compare_price: event.target.value === "" ? null : Number(event.target.value) })} disabled={!editable} /></label>
      <label><span>Chuẩn bị (ngày)</span><input type="number" min="0" max="90" value={row.preparation_time_days ?? ""} onChange={event => update(row.id, { preparation_time_days: event.target.value === "" ? null : Number(event.target.value) })} disabled={!editable} /></label>
      <label><span>Số lượng tối thiểu</span><input type="number" min="1" max="99" value={row.minimum_order} onChange={event => update(row.id, { minimum_order: Number(event.target.value) })} disabled={!editable} /></label>
      <label><span>Quy cách / khẩu phần</span><input value={row.serving_size} onChange={event => update(row.id, { serving_size: event.target.value })} disabled={!editable} /></label>
      <label><span>Tồn kho (để trống nếu không theo dõi)</span><input type="number" min="0" value={row.stock_quantity ?? ""} onChange={event => update(row.id, { stock_quantity: event.target.value === "" ? null : Number(event.target.value) })} disabled={!editable} /></label>
      <label><span>Thứ tự</span><input type="number" min="0" value={row.sort_order} onChange={event => update(row.id, { sort_order: Number(event.target.value) })} disabled={!editable} /></label>
      <label className={styles.checkboxField}><input type="checkbox" checked={row.is_active} onChange={event => update(row.id, { is_active: event.target.checked })} disabled={!editable} /><span>Đang hoạt động</span></label>
      <button className={styles.primaryAction} type="button" onClick={() => save(row)} disabled={!editable}>Lưu variant</button>
    </article>)}
    {message && <p className={styles.formMessage} aria-live="polite">{message}</p>}
  </section>;
}
