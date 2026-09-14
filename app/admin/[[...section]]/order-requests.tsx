"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { SavedOrder } from "../../../supabase/functions/_shared/order";
import styles from "./admin.module.css";
import extras from "./admin-extras.module.css";

export type OrderStatus = "new" | "contacted" | "confirmed" | "completed" | "cancelled";
export type OrderEvent = { id: number; event_type: "created" | "status_changed"; from_status: OrderStatus | null; to_status: OrderStatus; created_at: string };
export type OrderRecord = SavedOrder & { request_code: string; updated_at: string; status: OrderStatus; admin_note: string; events: OrderEvent[]; cake_order_notifications: { status: string; attempts: number; last_error: string | null } | null };
export type OrderFilters = { query: string; status: string; period: string; sort: string };

const labels: Record<OrderStatus, string> = { new: "Mới", contacted: "Đã liên hệ", confirmed: "Đã xác nhận", completed: "Hoàn tất", cancelled: "Đã hủy" };
const contactLabels: Record<string, string> = { phone: "Điện thoại", facebook: "Facebook", instagram: "Instagram" };
const PAGE_SIZE = 20;
const formatDate = (value: string, withTime = false) => new Intl.DateTimeFormat("vi-VN", withTime ? { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" } : { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short" }).format(new Date(value));

function pageHref(page: number, filters: OrderFilters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.period !== "all") params.set("period", filters.period);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  return `/admin/yeu-cau-dat-banh${params.size ? `?${params}` : ""}`;
}

export default function OrderRequests({ initialOrders, total, page, filters, newCount }: { initialOrders: OrderRecord[]; total: number; page: number; filters: OrderFilters; newCount: number }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(initialOrders[0]?.id ?? null);
  const [saving, setSaving] = useState(false), [retrying, setRetrying] = useState(false), [message, setMessage] = useState("");
  const selected = useMemo(() => orders.find(order => order.id === selectedId) ?? null, [orders, selectedId]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function updateOrder(fields: { status?: OrderStatus; adminNote?: string }) {
    if (!selected) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/order-requests/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message);
      setOrders(current => current.map(order => order.id === body.id ? body as OrderRecord : order));
      setMessage("Đã lưu thay đổi."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa thể cập nhật yêu cầu."); }
    finally { setSaving(false); }
  }

  async function retryEmail() {
    setRetrying(true); setMessage("");
    try { const response = await fetch("/api/order-requests/retry", { method: "POST" }); setMessage(response.ok ? "Đã xử lý các email đến lượt gửi lại." : "Chưa thể gửi lại email."); router.refresh(); }
    catch { setMessage("Kết nối gián đoạn. Vui lòng thử lại."); }
    finally { setRetrying(false); }
  }

  return <div className={extras.orderWorkspace}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>YÊU CẦU KHÁCH HÀNG</p><h2>{total} yêu cầu · {newCount} mới</h2></div><button className={styles.primaryAction} type="button" disabled={retrying} onClick={retryEmail}>{retrying ? "Đang xử lý…" : "Gửi lại email"}</button></div>
      <form className={extras.orderFilters} method="get">
        <label className={extras.searchField}><span>Tìm khách hàng</span><input type="search" name="q" defaultValue={filters.query} placeholder="Tên, số điện thoại hoặc mã yêu cầu" /></label>
        <label><span>Trạng thái</span><select name="status" defaultValue={filters.status}><option value="all">Tất cả</option>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label><span>Thời gian gửi</span><select name="period" defaultValue={filters.period}><option value="all">Tất cả</option><option value="today">Hôm nay</option><option value="7d">7 ngày gần nhất</option><option value="30d">30 ngày gần nhất</option></select></label>
        <label><span>Sắp xếp</span><select name="sort" defaultValue={filters.sort}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="receipt">Ngày nhận gần nhất</option></select></label>
        <button className={styles.primaryAction} type="submit">Áp dụng</button>
        {(filters.query || filters.status !== "all" || filters.period !== "all" || filters.sort !== "newest") && <Link href="/admin/yeu-cau-dat-banh">Xóa bộ lọc</Link>}
      </form>
      {message && <p className={extras.adminMessage} role="status">{message}</p>}
      {orders.length === 0 ? <div className={extras.emptyState}><strong>Chưa có yêu cầu phù hợp</strong><span>Thử thay đổi từ khóa hoặc bộ lọc.</span></div> : <div className={extras.orderList}>{orders.map(order => <button className={selectedId === order.id ? extras.selected : ""} type="button" key={order.id} onClick={() => { setSelectedId(order.id); setMessage(""); }}>
        <span className={`${extras.contactStatus} ${extras[`order_${order.status}`]}`}>{labels[order.status]}</span><strong>{order.payload.customerName}</strong><small>{order.request_code} · {order.payload.phone}</small><span>{order.items.map(item => `${item.productNameSnapshot} × ${item.quantity}`).join(", ")}</span><time>{formatDate(order.created_at, true)}</time>
      </button>)}</div>}
      {pageCount > 1 && <nav className={extras.pagination} aria-label="Phân trang yêu cầu"><Link aria-disabled={page <= 1} href={pageHref(Math.max(1, page - 1), filters)}>← Trang trước</Link><span>Trang {page}/{pageCount}</span><Link aria-disabled={page >= pageCount} href={pageHref(Math.min(pageCount, page + 1), filters)}>Trang sau →</Link></nav>}
    </section>

    {selected && <section className={styles.editorPanel}>
      <div className={styles.panelHeading}><div><p>{selected.request_code}</p><h2>{selected.payload.customerName}</h2></div><span className={`${extras.contactStatus} ${extras[`order_${selected.status}`]}`}>{labels[selected.status]}</span></div>
      <div className={extras.orderDetails}>
        <section><h3>Thông tin khách hàng</h3><dl><div><dt>Họ tên</dt><dd>{selected.payload.customerName}</dd></div><div><dt>Số điện thoại</dt><dd><a href={`tel:${selected.payload.phone}`}>{selected.payload.phone}</a></dd></div><div><dt>Kênh liên hệ</dt><dd>{contactLabels[selected.payload.preferredContactChannel] ?? selected.payload.preferredContactChannel}</dd></div></dl></section>
        <section><h3>Bánh khách đặt</h3><div className={extras.orderItems}>{selected.items.map((item, index) => <article key={`${item.productId}-${index}`}><strong>{item.productNameSnapshot}</strong><span>{item.variantNameSnapshot || "Quy cách sẽ xác nhận"}</span><b>× {item.quantity}</b>{item.unitPriceSnapshot != null && <small>{item.unitPriceSnapshot.toLocaleString("vi-VN")}đ/phần</small>}</article>)}</div></section>
        <section><h3>Nhận bánh</h3><dl><div><dt>Ngày nhận</dt><dd>{new Intl.DateTimeFormat("vi-VN").format(new Date(`${selected.payload.requestedDate}T00:00:00+07:00`))}</dd></div><div><dt>Khung giờ</dt><dd>{selected.payload.requestedTimeSlot}</dd></div><div><dt>Hình thức</dt><dd>{selected.payload.fulfillmentType === "delivery" ? "Giao hàng" : "Tự đến nhận"}</dd></div>{selected.payload.fulfillmentType === "delivery" && <div><dt>Địa chỉ giao</dt><dd>{selected.payload.deliveryAddress}</dd></div>}{selected.payload.differentRecipient && <><div><dt>Người nhận</dt><dd>{selected.payload.recipientName}</dd></div><div><dt>Điện thoại người nhận</dt><dd>{selected.payload.recipientPhone}</dd></div></>}</dl></section>
        <section><h3>Ghi chú khách hàng</h3><p className={extras.customerNote}>{selected.payload.note || "Khách không để lại ghi chú."}</p></section>
        <section><h3>Xử lý nội bộ</h3><label><span>Trạng thái</span><select value={selected.status} disabled={saving} onChange={event => updateOrder({ status: event.target.value as OrderStatus })}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>Ghi chú nội bộ — chỉ Admin nhìn thấy</span><textarea rows={6} value={selected.admin_note} disabled={saving} maxLength={5000} onChange={event => setOrders(current => current.map(order => order.id === selected.id ? { ...order, admin_note: event.target.value } : order))} /></label><button className={styles.primaryAction} type="button" disabled={saving} onClick={() => updateOrder({ adminNote: selected.admin_note })}>{saving ? "Đang lưu…" : "Lưu ghi chú"}</button></section>
        <section><h3>Metadata</h3><dl><div><dt>Mã yêu cầu</dt><dd>{selected.request_code}</dd></div><div><dt>Gửi lúc</dt><dd>{formatDate(selected.created_at, true)}</dd></div><div><dt>Cập nhật</dt><dd>{formatDate(selected.updated_at, true)}</dd></div><div><dt>Email thông báo</dt><dd>{selected.cake_order_notifications?.status ?? "pending"} · {selected.cake_order_notifications?.attempts ?? 0} lần thử</dd></div></dl></section>
        <section><h3>Lịch sử xử lý</h3><ol className={extras.orderTimeline}>{[...selected.events].sort((a,b) => b.created_at.localeCompare(a.created_at)).map(event => <li key={event.id}><time>{formatDate(event.created_at, true)}</time><span>{event.event_type === "created" ? "Khách gửi yêu cầu" : `Trạng thái đổi: ${event.from_status ? labels[event.from_status] : "—"} → ${labels[event.to_status]}`}</span></li>)}</ol></section>
      </div>
    </section>}
  </div>;
}
