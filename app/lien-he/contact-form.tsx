"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { CatalogProduct } from "../data/site-data";
import { minimumDate, validateOrder, type OrderInput } from "../../supabase/functions/_shared/order";
import styles from "./contact-form.module.css";

const initial: OrderInput = { customerName: "", phone: "", preferredContactChannel: "phone", items: [{ productId: "", quantity: 1 }], requestedDate: "", requestedTimeSlot: "", fulfillmentType: "pickup", deliveryAddress: "", differentRecipient: false, recipientName: "", recipientPhone: "", note: "", consent: false, website: "" };
const statusLabels = { available: "", sold_out: " — Tạm hết bánh", paused: " — Tạm ngừng nhận", coming_soon: " — Chưa mở bán" };

export default function ContactForm({ products, facebookUrl, instagramUrl }: { products: CatalogProduct[]; facebookUrl?: string; instagramUrl?: string }) {
  const [form, setForm] = useState<OrderInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const busy = useRef(false);
  const submission = useRef<{ key: string; body: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const available = products.some(p => p.orderStatus === "available");
  const set = <K extends keyof OrderInput>(key: K, value: OrderInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const field = (name: string, title: string, control: ReactNode, full = false) => <div className={full ? styles.full : undefined}><label htmlFor={name}>{title}</label>{control}{errors[name] && <p className={styles.error} id={`${name}-error`}>{errors[name]}</p>}</div>;
  const attrs = (name: string) => ({ id: name, name, "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `${name}-error` : undefined });
  function showErrors(next: Record<string, string>) {
    setErrors(next);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const result = validateOrder(form);
    if (!result.data) { showErrors(result.errors); return; }
    const invalid = form.items.find(i => !products.some(p => p.id === i.productId && p.orderStatus === "available"));
    if (invalid) { showErrors({ items: "Vui lòng chọn món đang nhận yêu cầu." }); return; }
    busy.current = true; setSaving(true); setMessage(""); setErrors({});
    const body = JSON.stringify(result.data);
    if (!submission.current || submission.current.body !== body) submission.current = { key: crypto.randomUUID(), body };
    try {
      const response = await fetch("/api/order-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": submission.current.key }, body, signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) showErrors(result.errors);
        else setMessage(result.message || "Chưa thể gửi. Vui lòng thử lại.");
        return;
      }
      if (typeof result.requestId !== "string") throw new Error("Invalid response");
      setRequestId(result.requestId);
    } catch { setMessage("Kết nối bị gián đoạn. Thông tin vẫn được giữ lại; bạn có thể bấm gửi lại an toàn."); }
    finally { busy.current = false; setSaving(false); }
  }
  if (requestId) return <section className={`${styles.wrap} ${styles.success}`} role="status"><p className={styles.eyebrow}>MYNORA ĐÃ TIẾP NHẬN</p><h2>Yêu cầu của bạn đã được gửi</h2><p>Yêu cầu đặt bánh — chờ MYNORA xác nhận.</p><p>Chúng mình sẽ liên hệ lại để xác nhận bánh, thời gian nhận và các thông tin cần thiết.</p><p className={styles.reference}>Mã yêu cầu: {requestId}</p><button type="button" onClick={() => { setForm(initial); setRequestId(""); submission.current = null; }}>Gửi yêu cầu khác</button></section>;
  return <section className={styles.wrap} id="yeu-cau-dat-banh" aria-labelledby="order-title">
    <aside className={styles.heading}><p className={styles.eyebrow}>MỘT CHÚT NGỌT, CHUẨN BỊ RIÊNG CHO BẠN</p><h2 id="order-title">Chiếc bánh bạn mong chờ.</h2><p>Chọn món và để lại lời hẹn. MYNORA sẽ liên hệ để cùng bạn xác nhận từng chi tiết.</p><div className={styles.before}><h3>Trước khi gửi yêu cầu.</h3><nav aria-label="Mạng xã hội MYNORA">{instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}{facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer">Facebook ↗</a>}</nav><p>Đặt trước ít nhất 5 ngày. Ngày và khung giờ bạn chọn là mong muốn; MYNORA sẽ xác nhận theo lịch làm bánh.</p><p>Hiện MYNORA chưa nhận bánh sinh nhật, bánh sự kiện hoặc đơn số lượng lớn.</p></div></aside>
    <form className={styles.form} ref={formRef} onSubmit={submit} noValidate aria-busy={saving}>
      <fieldset disabled={saving}><legend><span>01</span> Thông tin của bạn</legend><div className={styles.grid}>
        {field("customerName", "Họ và tên *", <input {...attrs("customerName")} value={form.customerName} onChange={e => set("customerName", e.target.value)} autoComplete="name" placeholder="Nguyễn Văn A" required maxLength={120} />)}
        {field("phone", "Số điện thoại *", <input {...attrs("phone")} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} autoComplete="tel" placeholder="Số điện thoại liên hệ" required maxLength={25} />)}
        {field("preferredContactChannel", "Kênh liên hệ mong muốn", <select {...attrs("preferredContactChannel")} value={form.preferredContactChannel} onChange={e => set("preferredContactChannel", e.target.value)}><option value="phone">Điện thoại</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select>, true)}
      </div></fieldset>
      <fieldset disabled={saving}><legend><span>02</span> Bánh bạn muốn đặt</legend><p className={styles.hint}>Chọn một hoặc nhiều món. MYNORA sẽ tư vấn quy cách và báo giá khi xác nhận.</p>
        {!available && <p className={styles.notice}>Menu đang được chuẩn bị. Các món sẽ có thể chọn ngay khi MYNORA mở nhận yêu cầu. Bạn vẫn có thể liên hệ chúng mình qua <a href="tel:0763722023">0763722023</a>.</p>}
        {errors.items && <p role="alert" className={styles.error}>{errors.items}</p>}
        {form.items.map((item, i) => <div className={styles.item} key={i}>
          {field(`items.${i}.productId`, `Món bánh ${i + 1} *`, <select {...attrs(`items.${i}.productId`)} value={item.productId} onChange={e => set("items", form.items.map((row, n) => n === i ? { ...row, productId: e.target.value } : row))}><option value="">Chọn món từ menu</option>{products.map(p => <option key={p.id} value={p.id} disabled={p.orderStatus !== "available" || form.items.some((r, n) => n !== i && r.productId === p.id)}>{p.displayName}{statusLabels[p.orderStatus]}</option>)}</select>)}
          {field(`items.${i}.quantity`, "Số lượng *", <input {...attrs(`items.${i}.quantity`)} type="number" inputMode="numeric" min={1} max={99} value={Number.isNaN(item.quantity) ? "" : item.quantity} onChange={e => set("items", form.items.map((row, n) => n === i ? { ...row, quantity: e.target.valueAsNumber } : row))} />)}
          {form.items.length > 1 && <button className={styles.remove} type="button" aria-label={`Xóa món ${i + 1}`} onClick={() => set("items", form.items.filter((_, n) => n !== i))}>Xóa</button>}
        </div>)}
        <button className={styles.add} type="button" disabled={form.items.length >= Math.min(20, products.filter(p => p.orderStatus === "available").length)} onClick={() => set("items", [...form.items, { productId: "", quantity: 1 }])}>＋ Thêm món bánh</button>
      </fieldset>
      <fieldset disabled={saving}><legend><span>03</span> Lời hẹn nhận bánh</legend><div className={styles.grid}>
        {field("requestedDate", "Ngày muốn nhận *", <input {...attrs("requestedDate")} type="date" min={minimumDate()} required value={form.requestedDate} onChange={e => set("requestedDate", e.target.value)} />)}
        {field("requestedTimeSlot", "Khung giờ mong muốn *", <input {...attrs("requestedTimeSlot")} value={form.requestedTimeSlot} onChange={e => set("requestedTimeSlot", e.target.value)} placeholder="Ví dụ: 14:00–16:00" maxLength={120} required />)}
        {field("fulfillmentType", "Hình thức nhận bánh", <select {...attrs("fulfillmentType")} value={form.fulfillmentType} onChange={e => set("fulfillmentType", e.target.value)}><option value="pickup">Tự đến nhận</option><option value="delivery">Giao hàng</option></select>, true)}
        {form.fulfillmentType === "delivery" && field("deliveryAddress", "Địa chỉ giao bánh tại Đà Nẵng *", <textarea {...attrs("deliveryAddress")} value={form.deliveryAddress} onChange={e => set("deliveryAddress", e.target.value)} autoComplete="street-address" maxLength={500} rows={3} required />, true)}
        <label className={`${styles.check} ${styles.full}`}><input type="checkbox" checked={form.differentRecipient} onChange={e => set("differentRecipient", e.target.checked)} /><span>Người nhận bánh khác với người đặt</span></label>
        {form.differentRecipient && <>{field("recipientName", "Tên người nhận *", <input {...attrs("recipientName")} value={form.recipientName} onChange={e => set("recipientName", e.target.value)} maxLength={120} required />)}{field("recipientPhone", "Số điện thoại người nhận *", <input {...attrs("recipientPhone")} type="tel" value={form.recipientPhone} onChange={e => set("recipientPhone", e.target.value)} maxLength={25} required />)}</>}
      </div></fieldset>
      <fieldset disabled={saving}><legend><span>04</span> Gửi lời nhắn cho MYNORA</legend>
        {field("note", "Ghi chú (không bắt buộc)", <textarea {...attrs("note")} value={form.note} onChange={e => set("note", e.target.value)} rows={4} maxLength={5000} placeholder="Ví dụ: ghi chú về bánh, thời gian nhận hoặc yêu cầu cần MYNORA tư vấn thêm..." />)}
        <label className={styles.check}><input {...attrs("consent")} type="checkbox" checked={form.consent} onChange={e => set("consent", e.target.checked)} required /><span>Tôi đồng ý để MYNORA sử dụng thông tin này để liên hệ và xử lý yêu cầu đặt bánh. <Link href="/chinh-sach/quyen-rieng-tu">Quyền riêng tư</Link></span></label>{errors.consent && <p id="consent-error" className={styles.error}>{errors.consent}</p>}
        <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => set("website", e.target.value)} /></label>
      </fieldset>
      {message && <p className={styles.error} role="alert">{message}</p>}
      <button className={styles.submit} type="submit" disabled={saving || !available}>{saving ? "Đang gửi yêu cầu…" : "Gửi yêu cầu đặt bánh"}<span aria-hidden="true">↗</span></button><p className={styles.hint}>Yêu cầu đặt bánh — chờ MYNORA xác nhận.</p>
    </form>
  </section>;
}
