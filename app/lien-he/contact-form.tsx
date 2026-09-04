"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./contact-form.module.css";

export default function ContactForm() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (String(formData.get("website") ?? "").trim()) {
      setSuccess(true);
      setMessage("MYNORA đã nhận được thông tin của bạn.");
      form.reset();
      return;
    }

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const customerMessage = String(formData.get("message") ?? "").trim();
    if (!email && !phone) {
      setSuccess(false);
      setMessage("Vui lòng nhập số điện thoại hoặc email để MYNORA phản hồi.");
      return;
    }

    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email: email || null,
      phone: phone || null,
      subject,
      message: customerMessage,
    });
    setSaving(false);

    if (error) {
      setSuccess(false);
      setMessage("Chưa thể gửi yêu cầu. Vui lòng thử lại hoặc liên hệ MYNORA qua điện thoại.");
      return;
    }

    setSuccess(true);
    setMessage("MYNORA đã nhận được thông tin và sẽ phản hồi trong khung giờ tiếp nhận.");
    form.reset();
  }

  return <section className={styles.wrap} aria-labelledby="contact-form-title">
    <div className={styles.heading}><p>GỬI YÊU CẦU TRỰC TIẾP</p><h2 id="contact-form-title">MYNORA có thể giúp gì cho bạn?</h2><span>Vui lòng để lại ít nhất một kênh liên hệ. Không gửi thông tin thanh toán hoặc dữ liệu nhạy cảm qua biểu mẫu này.</span></div>
    <form className={styles.form} onSubmit={submit}>
      <label><span>Họ và tên</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label><span>Số điện thoại</span><input name="phone" maxLength={40} inputMode="tel" autoComplete="tel" /></label>
      <label><span>Email</span><input name="email" type="email" maxLength={254} autoComplete="email" /></label>
      <label><span>Chủ đề</span><input name="subject" maxLength={180} placeholder="Ví dụ: Hỏi về Coconut Flan" /></label>
      <label className={styles.full}><span>Nội dung</span><textarea name="message" required minLength={5} maxLength={5000} rows={7} placeholder="Cho MYNORA biết món bánh hoặc thông tin bạn cần hỗ trợ." /></label>
      <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className={styles.actions}><button type="submit" disabled={saving}>{saving ? "Đang gửi…" : "Gửi cho MYNORA"}</button>{message && <p className={success ? styles.success : styles.error} role="status">{message}</p>}</div>
    </form>
  </section>;
}
