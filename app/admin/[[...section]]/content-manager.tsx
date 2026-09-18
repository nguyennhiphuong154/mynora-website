"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import type { PublicContentSettings, PublicFaqItem, PublicGuideCheck, PublicGuidePage } from "../../data/site-data";
import styles from "./admin.module.css";

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export default function ContentManager({ initialContent }: { initialContent: PublicContentSettings }) {
  const [content, setContent] = useState(initialContent);
  const [selectedSlug, setSelectedSlug] = useState(initialContent.guides.pages[0]?.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const selectedPage = useMemo(() => content.guides.pages.find(page => page.slug === selectedSlug), [content.guides.pages, selectedSlug]);

  const updateFaq = (id: string, patch: Partial<PublicFaqItem>) => setContent(current => ({ ...current, faq: { items: current.faq.items.map(item => item.id === id ? { ...item, ...patch } : item) } }));
  const updatePage = (patch: Partial<PublicGuidePage>) => setContent(current => ({ ...current, guides: { pages: current.guides.pages.map(page => page.slug === selectedSlug ? { ...page, ...patch } : page) } }));
  const updateCheck = (id: string, patch: Partial<PublicGuideCheck>) => selectedPage && updatePage({ checks: selectedPage.checks.map(item => item.id === id ? { ...item, ...patch } : item) });

  function addFaq() {
    const nextSort = Math.max(0, ...content.faq.items.map(item => item.sortOrder)) + 1;
    setContent(current => ({ ...current, faq: { items: [...current.faq.items, { id: newId("faq"), question: "", answer: "", isActive: false, sortOrder: nextSort }] } }));
  }

  function removeFaq(id: string) {
    setContent(current => ({ ...current, faq: { items: current.faq.items.filter(item => item.id !== id) } }));
  }

  function addCheck() {
    if (!selectedPage) return;
    updatePage({ checks: [...selectedPage.checks, { id: newId("check"), label: "", value: "" }] });
  }

  function removeCheck(id: string) {
    if (!selectedPage) return;
    updatePage({ checks: selectedPage.checks.filter(item => item.id !== id) });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const invalidFaq = content.faq.items.some(item => item.isActive && (!item.question.trim() || !item.answer.trim()));
    const invalidPage = content.guides.pages.some(page => !page.eyebrow.trim() || !page.title.trim() || !page.intro.trim() || !page.cardTitle.trim() || !page.cardDescription.trim() || page.checks.some(item => !item.label.trim() || !item.value.trim()));
    if (invalidFaq || invalidPage) {
      setMessage("Hãy điền đủ nội dung đang hiển thị trước khi lưu.");
      return;
    }
    setSaving(true);
    setMessage("");
    const db = createClient();
    const { data, error } = await db.from("site_settings").update({ value: content }).eq("key", "content").select("key").single();
    setSaving(false);
    if (error || !data) {
      setMessage("Chưa thể lưu nội dung. Hãy kiểm tra phiên đăng nhập và thử lại.");
      return;
    }
    setMessage("Đã lưu. Website công khai nhận nội dung mới ngay, không cần deploy lại.");
    router.refresh();
  }

  return <form className={styles.contentManager} onSubmit={save}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>NỘI DUNG / SUPABASE</p><h2>Câu hỏi thường gặp</h2></div><div className={styles.contentActions}><Link href="/cau-hoi-thuong-gap" target="_blank">Xem trên website ↗</Link><button className={styles.closeEditor} type="button" onClick={addFaq}>Thêm câu hỏi</button></div></div>
      <p className={styles.previewNotice}>Bật “Hiển thị” để đưa câu hỏi lên website. Câu hỏi mới mặc định được ẩn cho đến khi bạn hoàn thiện.</p>
      <div className={styles.faqEditorList}>{content.faq.items.slice().sort((a, b) => a.sortOrder - b.sortOrder).map(item => <article className={styles.faqEditorRow} key={item.id}>
        <label className={styles.fullField}><span>Câu hỏi</span><input value={item.question} onChange={event => updateFaq(item.id, { question: event.target.value })} /></label>
        <label className={styles.fullField}><span>Câu trả lời</span><textarea rows={3} value={item.answer} onChange={event => updateFaq(item.id, { answer: event.target.value })} /></label>
        <label><span>Thứ tự</span><input type="number" min="0" value={item.sortOrder} onChange={event => updateFaq(item.id, { sortOrder: Number(event.target.value) })} /></label>
        <label className={styles.checkboxField}><input type="checkbox" checked={item.isActive} onChange={event => updateFaq(item.id, { isActive: event.target.checked })} /><span>Hiển thị</span></label>
        <button className={styles.removeAction} type="button" onClick={() => removeFaq(item.id)}>Xóa khỏi danh sách</button>
      </article>)}</div>
    </section>

    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>TRANG HƯỚNG DẪN</p><h2>Nội dung công khai</h2></div><Link href={`/${selectedSlug}`} target="_blank">Xem trang đang chọn ↗</Link></div>
      <div className={styles.contentTabs}>{content.guides.pages.map(page => <button type="button" className={page.slug === selectedSlug ? styles.activeContentTab : ""} key={page.slug} onClick={() => setSelectedSlug(page.slug)}>{page.cardTitle}</button>)}</div>
      {selectedPage && <div className={styles.productForm}>
        <label><span>Nhãn nhỏ</span><input value={selectedPage.eyebrow} onChange={event => updatePage({ eyebrow: event.target.value })} /></label>
        <label><span>Tiêu đề trang</span><input value={selectedPage.title} onChange={event => updatePage({ title: event.target.value })} /></label>
        <label className={styles.fullField}><span>Đoạn giới thiệu</span><textarea rows={4} value={selectedPage.intro} onChange={event => updatePage({ intro: event.target.value })} /></label>
        <label><span>Tên trên thẻ liên quan</span><input value={selectedPage.cardTitle} onChange={event => updatePage({ cardTitle: event.target.value })} /></label>
        <label><span>Mô tả trên thẻ liên quan</span><input value={selectedPage.cardDescription} onChange={event => updatePage({ cardDescription: event.target.value })} /></label>
        {selectedPage.slug !== "cau-hoi-thuong-gap" && <>
          <label className={styles.fullField}><span>Tiêu đề khối thông tin</span><input value={selectedPage.sectionTitle} onChange={event => updatePage({ sectionTitle: event.target.value })} /></label>
          <div className={`${styles.fullField} ${styles.guideChecks}`}><div className={styles.panelHeading}><div><p>CÁC DÒNG THÔNG TIN</p></div><button className={styles.closeEditor} type="button" onClick={addCheck}>Thêm dòng</button></div>{selectedPage.checks.map(item => <div className={styles.guideCheckRow} key={item.id}><label><span>Nhãn</span><input value={item.label} onChange={event => updateCheck(item.id, { label: event.target.value })} /></label><label><span>Nội dung</span><input value={item.value} onChange={event => updateCheck(item.id, { value: event.target.value })} /></label><button className={styles.removeAction} type="button" onClick={() => removeCheck(item.id)}>Xóa</button></div>)}</div>
          <label className={styles.fullField}><span>Ghi chú thêm</span><textarea rows={3} value={selectedPage.extraNote} onChange={event => updatePage({ extraNote: event.target.value })} /></label>
        </>}
      </div>}
    </section>

    <div className={styles.contentSaveBar}><button className={styles.primaryAction} type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu và cập nhật website"}</button>{message && <p aria-live="polite">{message}</p>}</div>
  </form>;
}
