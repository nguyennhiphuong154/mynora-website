"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./admin.module.css";

export type OperationsSettings = {
  contact: { phone: string; email: string; contactHours: string; phoneHasZalo?: boolean };
  order: { minimumPreorderDays: number; expectedReplyMinutes: number; receivingWindowNoticeDays: number; urgentOrdersAccepted?: boolean };
  delivery: { enabled: boolean; areaLabel: string; freeRadiusKm: number; feeOutsideFreeRadiusVnd: number; customerSelectsTimeWindowOnly?: boolean; driverBookedBy?: string };
};

export default function OperationsManager({ initialSettings, canEditBusinessEmail }: { initialSettings: OperationsSettings; canEditBusinessEmail: boolean }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const change = <K extends keyof OperationsSettings>(group: K, key: keyof OperationsSettings[K], value: unknown) => setSettings(current => ({ ...current, [group]: { ...current[group], [key]: value } }));
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    const db = createClient();
    const results = await Promise.all((Object.keys(settings) as (keyof OperationsSettings)[]).map(key => db.from("site_settings").update({ value: settings[key] }).eq("key", key)));
    setSaving(false); setMessage(results.some(result => result.error) ? "Chưa thể lưu toàn bộ cấu hình." : "Đã lưu cấu hình vận hành vào Supabase.");
  }
  return <section className={styles.panel}><div className={styles.panelHeading}><div><p>VẬN HÀNH / SUPABASE</p><h2>Cấu hình công khai</h2></div></div><form className={styles.productForm} onSubmit={save}>
    <label><span>Điện thoại</span><input value={settings.contact.phone} onChange={event => change("contact", "phone", event.target.value)} required /></label>
    <label><span>Email business</span><input type="email" value={settings.contact.email} disabled={!canEditBusinessEmail} onChange={event => change("contact", "email", event.target.value)} required />{!canEditBusinessEmail ? <small>Chỉ Chủ sở hữu được thay đổi email business chính.</small> : null}</label>
    <label className={styles.fullField}><span>Giờ tiếp nhận</span><input value={settings.contact.contactHours} onChange={event => change("contact", "contactHours", event.target.value)} required /></label>
    <label><span>Đặt trước tối thiểu (ngày)</span><input type="number" min="0" max="90" value={settings.order.minimumPreorderDays} onChange={event => change("order", "minimumPreorderDays", Number(event.target.value))} required /></label>
    <label><span>Phản hồi dự kiến (phút)</span><input type="number" min="1" max="1440" value={settings.order.expectedReplyMinutes} onChange={event => change("order", "expectedReplyMinutes", Number(event.target.value))} required /></label>
    <label><span>Báo khung giờ trước (ngày)</span><input type="number" min="0" max="30" value={settings.order.receivingWindowNoticeDays} onChange={event => change("order", "receivingWindowNoticeDays", Number(event.target.value))} required /></label>
    <label><span>Khu vực giao</span><input value={settings.delivery.areaLabel} onChange={event => change("delivery", "areaLabel", event.target.value)} required /></label>
    <label><span>Bán kính miễn phí (km)</span><input type="number" min="0" value={settings.delivery.freeRadiusKm} onChange={event => change("delivery", "freeRadiusKm", Number(event.target.value))} required /></label>
    <label><span>Phí ngoài bán kính (VNĐ)</span><input type="number" min="0" step="1000" value={settings.delivery.feeOutsideFreeRadiusVnd} onChange={event => change("delivery", "feeOutsideFreeRadiusVnd", Number(event.target.value))} required /></label>
    <label className={styles.checkboxField}><input type="checkbox" checked={settings.delivery.enabled} onChange={event => change("delivery", "enabled", event.target.checked)} /><span>Bật giao hàng</span></label>
    <div className={styles.formActions}><button className={styles.primaryAction} type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu cấu hình"}</button>{message && <p aria-live="polite">{message}</p>}</div>
  </form></section>;
}
