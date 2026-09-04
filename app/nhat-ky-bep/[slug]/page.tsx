import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "../../components/store-shell";
import { createClient } from "../../../lib/supabase/server";
import styles from "./post.module.css";

type PostPageProps = { params: Promise<{ slug: string }> };
type PublicPost = { slug: string; title: string; excerpt: string; content: string; seo_title: string; seo_description: string; author_email: string | null; published_at: string; updated_at: string };

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("slug, title, excerpt, content, seo_title, seo_description, author_email, published_at, updated_at").eq("slug", slug).eq("status", "published").lte("published_at", new Date().toISOString()).maybeSingle();
  return data as PublicPost | null;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? { title: post.seo_title || `${post.title} | MYNORA Bakery`, description: post.seo_description || post.excerpt } : {};
}

export default async function JournalPost({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const paragraphs = post.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return <Page tone="editorial" eyebrow="NHẬT KÝ BẾP" title={post.title} intro={post.excerpt}>
    <nav className="store-breadcrumb" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href="/nhat-ky-bep">Nhật ký bếp</Link><span>/</span><span aria-current="page">{post.title}</span></nav>
    <article className={styles.article}>
      <header><div><span>Xuất bản</span><time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("vi-VN")}</time></div><div><span>Cập nhật</span><time dateTime={post.updated_at}>{new Date(post.updated_at).toLocaleDateString("vi-VN")}</time></div><div><span>Thực hiện</span><strong>MYNORA Bakery</strong></div></header>
      <div className={styles.body}>{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}</div>
      <footer><Link href="/nhat-ky-bep">← Trở lại Nhật ký bếp</Link><Link href="/lien-he">Liên hệ MYNORA →</Link></footer>
    </article>
  </Page>;
}
