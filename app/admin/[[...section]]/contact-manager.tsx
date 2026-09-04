"use client";

import { useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./admin.module.css";
import extras from "./admin-extras.module.css";

export type ContactRecord = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "responded" | "closed" | "spam";
  source: string;
  internal_note: string;
  created_at: string;
  updated_at: string;
};

const statusLabels: Record<ContactRecord["status"], string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  responded: "Đã phản hồi",
  closed: "Đã đóng",
  spam: "Spam",
};

export default function ContactManager({ initialContacts, editable }: { initialContacts: ContactRecord[]; editable: boolean }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedId, setSelectedId] = useState<number | null>(initialContacts[0]?.id ?? null);
  const [filter, setFilter] = useState<"all" | ContactRecord["status"]>("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selected = contacts.find((contact) => contact.id === selectedId) ?? null;
  const visibleContacts = useMemo(() => filter === "all" ? contacts : contacts.filter((contact) => contact.status === filter), [contacts, filter]);

  async function updateContact(fields: Partial<Pick<ContactRecord, "status" | "internal_note">>) {
    if (!editable || !selected) return;
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.from("contact_submissions").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", selected.id).select("*").single();
    setSaving(false);
    if (error || !data) {
      setMessage("Chưa thể cập nhật liên hệ. Hãy kiểm tra đăng nhập và thử lại.");
      return;
    }
    const saved = data as ContactRecord;
    setContacts((current) => current.map((item) => item.id === saved.id ? saved : item));
    setMessage("Đã cập nhật liên hệ.");
  }

  return <div className={extras.contactWorkspace}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>KHÁCH HÀNG / LIÊN HỆ</p><h2>{contacts.filter((item) => item.status === "new").length} liên hệ mới</h2></div><select className={extras.compactSelect} value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Tất cả</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {!editable && <p className={styles.previewNotice}>Dữ liệu khách hàng được bảo vệ và không hiển thị trong chế độ xem trước.</p>}
      {visibleContacts.length === 0 ? <div className={extras.emptyState}><strong>Chưa có liên hệ trong nhóm này</strong><span>Liên hệ gửi từ website sẽ xuất hiện tại đây.</span></div> : <div className={extras.contactList}>{visibleContacts.map((contact) => <button className={selectedId === contact.id ? extras.selected : ""} type="button" key={contact.id} onClick={() => { setSelectedId(contact.id); setMessage(""); }}>
        <span className={`${extras.contactStatus} ${extras[`status_${contact.status}`]}`}>{statusLabels[contact.status]}</span><strong>{contact.name}</strong><small>{contact.subject || "Yêu cầu từ website"}</small><time>{new Date(contact.created_at).toLocaleString("vi-VN")}</time>
      </button>)}</div>}
    </section>

    {selected && <section className={styles.editorPanel}>
      <div className={styles.panelHeading}><div><p>LIÊN HỆ #{selected.id}</p><h2>{selected.name}</h2></div><span className={`${extras.contactStatus} ${extras[`status_${selected.status}`]}`}>{statusLabels[selected.status]}</span></div>
      <div className={extras.contactDetails}>
        <dl><div><dt>Điện thoại</dt><dd>{selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : "Chưa cung cấp"}</dd></div><div><dt>Email</dt><dd>{selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : "Chưa cung cấp"}</dd></div><div><dt>Gửi lúc</dt><dd>{new Date(selected.created_at).toLocaleString("vi-VN")}</dd></div><div><dt>Nguồn</dt><dd>{selected.source}</dd></div></dl>
        <article><span>Nội dung khách gửi</span><h3>{selected.subject || "Yêu cầu liên hệ"}</h3><p>{selected.message}</p></article>
        <label><span>Trạng thái xử lý</span><select value={selected.status} disabled={!editable || saving} onChange={(event) => updateContact({ status: event.target.value as ContactRecord["status"] })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Ghi chú nội bộ</span><textarea rows={6} value={selected.internal_note} disabled={!editable || saving} onChange={(event) => setContacts((current) => current.map((item) => item.id === selected.id ? { ...item, internal_note: event.target.value } : item))} /></label>
        <div className={styles.formActions}><button className={styles.primaryAction} type="button" disabled={!editable || saving} onClick={() => updateContact({ internal_note: selected.internal_note })}>{saving ? "Đang lưu…" : "Lưu ghi chú"}</button>{message && <p aria-live="polite">{message}</p>}</div>
      </div>
    </section>}
  </div>;
}
