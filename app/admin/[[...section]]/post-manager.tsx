"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./admin.module.css";
import extras from "./admin-extras.module.css";

export type PostRecord = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_path: string | null;
  status: "draft" | "review" | "published" | "archived";
  seo_title: string;
  seo_description: string;
  author_email: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type Draft = Omit<PostRecord, "id" | "created_at" | "updated_at">;

const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_path: "",
  status: "draft",
  seo_title: "",
  seo_description: "",
  author_email: null,
  published_at: null,
});

const statusLabels: Record<PostRecord["status"], string> = {
  draft: "Bản nháp",
  review: "Chờ duyệt",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

export default function PostManager({ initialPosts, editable, adminEmail }: { initialPosts: PostRecord[]; editable: boolean; adminEmail: string }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selected = useMemo(() => typeof selectedId === "number" ? posts.find((post) => post.id === selectedId) : null, [posts, selectedId]);

  function edit(post: PostRecord) {
    setSelectedId(post.id);
    setDraft({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      cover_image_path: post.cover_image_path,
      status: post.status,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      author_email: post.author_email,
      published_at: post.published_at,
    });
    setMessage("");
  }

  function createNew() {
    setSelectedId("new");
    setDraft({ ...emptyDraft(), author_email: adminEmail });
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
    if (!draft.title.trim() || !draft.content.trim()) {
      setMessage("Vui lòng nhập tiêu đề và nội dung bài viết.");
      return;
    }

    setSaving(true);
    setMessage("");
    const now = new Date().toISOString();
    const payload = {
      ...draft,
      cover_image_path: draft.cover_image_path?.trim() || null,
      author_email: draft.author_email || adminEmail,
      published_at: draft.status === "published" ? (draft.published_at ?? now) : null,
      updated_at: now,
    };
    const supabase = createClient();
    const query = selectedId === "new"
      ? supabase.from("posts").insert(payload).select("*").single()
      : supabase.from("posts").update(payload).eq("id", selectedId).select("*").single();
    const { data, error } = await query;
    setSaving(false);

    if (error || !data) {
      setMessage(error?.code === "23505" ? "Slug bài viết này đã tồn tại." : "Chưa thể lưu bài viết. Hãy kiểm tra đăng nhập và thử lại.");
      return;
    }

    const saved = data as PostRecord;
    setPosts((current) => selectedId === "new" ? [saved, ...current] : current.map((item) => item.id === saved.id ? saved : item));
    setSelectedId(saved.id);
    setDraft((current) => ({ ...current, published_at: saved.published_at }));
    setMessage(saved.status === "published" ? "Đã lưu và xuất bản bài viết." : "Đã lưu bài viết vào Supabase.");
  }

  return <div className={styles.productManager}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>NỘI DUNG / SUPABASE</p><h2>{posts.length} bài viết</h2></div><button className={styles.primaryAction} type="button" onClick={createNew} disabled={!editable}>Viết bài mới</button></div>
      {!editable && <p className={styles.previewNotice}>Chế độ xem trước không cho phép đọc bản nháp hoặc chỉnh sửa bài viết.</p>}
      {posts.length === 0 ? <div className={extras.emptyState}><strong>Chưa có bài viết</strong><span>Chọn “Viết bài mới” để bắt đầu Nhật ký bếp MYNORA.</span></div> : <div className={extras.contentList}>{posts.map((post) => <button className={selectedId === post.id ? extras.selected : ""} type="button" key={post.id} onClick={() => edit(post)}>
        <span>{statusLabels[post.status]}</span><strong>{post.title}</strong><small>/{post.slug}</small><time>{new Date(post.updated_at).toLocaleDateString("vi-VN")}</time>
      </button>)}</div>}
    </section>

    {selectedId && <section className={styles.editorPanel}>
      <div className={styles.panelHeading}><div><p>{selectedId === "new" ? "BÀI VIẾT MỚI" : `CHỈNH SỬA / ${selected?.slug ?? ""}`}</p><h2>{selectedId === "new" ? "Tạo bài viết" : draft.title}</h2></div><button className={styles.closeEditor} type="button" onClick={() => setSelectedId(null)}>Đóng</button></div>
      <form className={styles.productForm} onSubmit={save}>
        <label className={styles.fullField}><span>Tiêu đề</span><input value={draft.title} maxLength={180} onChange={(event) => setField("title", event.target.value)} required disabled={!editable} /></label>
        <label><span>Slug</span><input value={draft.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase())} required disabled={!editable} /></label>
        <label><span>Trạng thái</span><select value={draft.status} onChange={(event) => setField("status", event.target.value as Draft["status"])} disabled={!editable}><option value="draft">Bản nháp</option><option value="review">Chờ duyệt</option><option value="published">Xuất bản</option><option value="archived">Lưu trữ</option></select></label>
        <label className={styles.fullField}><span>Mô tả ngắn</span><textarea rows={3} maxLength={500} value={draft.excerpt} onChange={(event) => setField("excerpt", event.target.value)} disabled={!editable} /></label>
        <label className={styles.fullField}><span>Nội dung bài viết</span><textarea rows={16} value={draft.content} onChange={(event) => setField("content", event.target.value)} required disabled={!editable} /><small className={extras.fieldHint}>Tách đoạn bằng một dòng trống. Nội dung được hiển thị an toàn dưới dạng văn bản.</small></label>
        <label className={styles.fullField}><span>Đường dẫn ảnh bìa</span><input value={draft.cover_image_path ?? ""} onChange={(event) => setField("cover_image_path", event.target.value)} disabled={!editable} placeholder="/images/..." /></label>
        <label><span>SEO title</span><input value={draft.seo_title} maxLength={180} onChange={(event) => setField("seo_title", event.target.value)} disabled={!editable} /></label>
        <label><span>SEO description</span><textarea rows={3} maxLength={500} value={draft.seo_description} onChange={(event) => setField("seo_description", event.target.value)} disabled={!editable} /></label>
        <div className={styles.formActions}><button className={styles.primaryAction} type="submit" disabled={!editable || saving}>{saving ? "Đang lưu…" : draft.status === "published" ? "Lưu & xuất bản" : "Lưu bài viết"}</button>{message && <p aria-live="polite">{message}</p>}</div>
      </form>
    </section>}
  </div>;
}
