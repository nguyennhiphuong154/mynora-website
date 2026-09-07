"use client";
import { useState } from "react";
import type { SavedOrder } from "../../../supabase/functions/_shared/order";
import styles from "./admin.module.css";
export type OrderRecord = SavedOrder & { status: string; cake_order_notifications: { status: string; attempts: number; last_error: string | null } | null };
export default function OrderRequests({ orders }: { orders: OrderRecord[] }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function retry() {
    setBusy(true);
    try { const r = await fetch("/api/order-requests/retry", { method: "POST" }); setMessage(r.ok ? "Đã xử lý các email đến lượt gửi lại. Tải lại trang để xem trạng thái mới." : "Chưa thể gửi lại. Kiểm tra cấu hình email hoặc đăng nhập."); }
    catch { setMessage("Kết nối gián đoạn. Vui lòng thử lại."); } finally { setBusy(false); }
  }
  return <section className={styles.panel}><div className={styles.panelHeading}><div><p>YÊU CẦU ĐẶT BÁNH</p><h2>{orders.length} yêu cầu gần nhất</h2></div><button className={styles.primaryAction} disabled={busy} onClick={retry}>{busy ? "Đang xử lý…" : "Gửi lại email đang chờ"}</button></div>{message && <p role="status">{message}</p>}{orders.length === 0 && <p>Chưa có yêu cầu đặt bánh.</p>}<div className={styles.faqList}>{orders.map(o => <article key={o.id}><div><h3>{o.payload.customerName} · {o.payload.phone}</h3><p style={{ overflowWrap: "anywhere" }}>MYN-{o.id} · {o.status === "pending" ? "Chờ xác nhận" : o.status}</p><p>{o.items.map(i => `${i.productNameSnapshot} × ${i.quantity}`).join(" · ")}</p><p>{o.payload.requestedDate} · {o.payload.requestedTimeSlot} · {o.payload.fulfillmentType === "delivery" ? `Giao hàng: ${o.payload.deliveryAddress}` : "Tự đến nhận"}</p><p>Kênh: {o.payload.preferredContactChannel}</p>{o.payload.differentRecipient && <p>Người nhận: {o.payload.recipientName} · {o.payload.recipientPhone}</p>}<p>Ghi chú: {o.payload.note || "Không có"}</p><p>Email: {o.cake_order_notifications?.status ?? "pending"} · {o.cake_order_notifications?.attempts ?? 0} lần thử{o.cake_order_notifications?.last_error === "EMAIL_NOT_CONFIGURED" ? " · Cần cấu hình dịch vụ email" : ""}</p></div></article>)}</div></section>;
}
