import Link from "next/link";
import type { Metadata } from "next";
import { Page } from "../components/store-shell";
import { createClient } from "../../lib/supabase/server";
import styles from "./journal.module.css";

export const metadata: Metadata = {
  title: "Nhật ký bếp | MYNORA Bakery",
  description: "Câu chuyện về những món bánh, nguyên liệu và nhịp làm bánh tại MYNORA.",
};

type PublicPost = { id: number; slug: string; title: string; excerpt: string; published_at: string };

export default async function KitchenJournal() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("id, slug, title, excerpt, published_at").eq("status", "published").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
  if (error) throw new Error("Không thể tải Nhật ký bếp.");
  const posts = (data ?? []) as PublicPost[];

  return <Page tone="editorial" eyebrow="NHẬT KÝ BẾP" title="Những câu chuyện từ gian bếp MYNORA." intro="Nơi MYNORA lưu lại câu chuyện về món bánh, nguyên liệu và những điều đang được hoàn thiện mỗi ngày.">
    {posts.length === 0 ? <section className={styles.empty}><p>NHẬT KÝ ĐANG ĐƯỢC CHUẨN BỊ</p><h2>Bài viết đầu tiên sẽ sớm xuất hiện.</h2><Link className="store-primary-action" href="/san-pham">Xem sản phẩm <span aria-hidden="true">↗</span></Link></section> : <section className={styles.grid} aria-label="Danh sách bài viết">{posts.map((post, index) => <Link key={post.id} href={`/nhat-ky-bep/${post.slug}`} className={styles.card}>
      <span>{String(index + 1).padStart(2, "0")}</span><time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("vi-VN")}</time><h2>{post.title}</h2><p>{post.excerpt || "Đọc câu chuyện mới từ gian bếp MYNORA."}</p><strong>Đọc bài viết →</strong>
    </Link>)}</section>}
  </Page>;
}
