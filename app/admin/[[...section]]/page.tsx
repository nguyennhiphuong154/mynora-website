import Link from "next/link";
import { redirect } from "next/navigation";
import { mynoraSiteSettings, publicOrderFaqs } from "../../data/site-data";
import { createClient } from "../../../lib/supabase/server";
import ProductManager, { type ProductRecord } from "./product-manager";
import PostManager, { type PostRecord } from "./post-manager";
import ContactManager, { type ContactRecord } from "./contact-manager";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

type AdminCategory = { id: number; slug: string; name: string; description: string; sort_order: number; is_active: boolean };
type AdminProduct = ProductRecord;

const sections = [
  { slug: "", label: "Tổng quan", note: "Tình trạng dữ liệu MYNORA" },
  { slug: "san-pham", label: "Sản phẩm", note: "Catalog và trạng thái mở bán" },
  { slug: "bai-viet", label: "Bài viết", note: "Nhật ký bếp và nội dung SEO" },
  { slug: "lien-he", label: "Khách liên hệ", note: "Yêu cầu và trạng thái xử lý" },
  { slug: "danh-muc", label: "Danh mục", note: "Nhóm sản phẩm công khai" },
  { slug: "van-hanh", label: "Vận hành", note: "Đặt trước, giao hàng và liên hệ" },
  { slug: "noi-dung", label: "Nội dung", note: "FAQ và nội dung hướng dẫn" },
] as const;

function Overview({ products, categories, posts, contacts }: { products: AdminProduct[]; categories: AdminCategory[]; posts: PostRecord[]; contacts: ContactRecord[] }) {
  const available = products.filter((product) => product.order_status === "available").length;
  const incomplete = products.filter((product) => product.content_status !== "verified").length;
  const published = posts.filter((post) => post.status === "published").length;
  const newContacts = contacts.filter((contact) => contact.status === "new").length;
  return <>
    <div className={styles.metrics}>
      <article><span>Sản phẩm</span><strong>{products.length}</strong><small>trong Supabase</small></article>
      <article><span>Bài đã xuất bản</span><strong>{published}</strong><small>trong Nhật ký bếp</small></article>
      <article><span>Liên hệ mới</span><strong>{newContacts}</strong><small>cần xử lý</small></article>
      <article><span>Cần hoàn thiện</span><strong>{incomplete}</strong><small>hồ sơ sản phẩm</small></article>
    </div>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>TRẠNG THÁI DỮ LIỆU</p><h2>Dữ liệu đã nối với Supabase</h2></div><Link href="/admin/san-pham">Mở catalog →</Link></div>
      <div className={styles.priorityList}>
        <div><strong>Giá và quy cách</strong><span>Tiếp tục hoàn thiện thông tin cho từng sản phẩm.</span></div>
        <div><strong>Khả năng nhận đơn</strong><span>Chỉ bật mở bán sau khi xác nhận năng lực sản xuất.</span></div>
        <div><strong>Nội dung & khách hàng</strong><span>{categories.length} danh mục · {available} món mở bán · {newContacts} liên hệ mới.</span></div>
      </div>
    </section>
  </>;
}

function Categories({ categories, products }: { categories: AdminCategory[]; products: AdminProduct[] }) {
  return <div className={styles.categoryGrid}>{categories.map((category) => <article key={category.id}>
    <span>{products.filter((product) => product.category_id === category.id).length} món</span><h2>{category.name}</h2><p>{category.description}</p><small>{category.slug}</small>
  </article>)}</div>;
}

function Operations() {
  const { contact, order, delivery } = mynoraSiteSettings;
  const rows = [["Điện thoại", contact.phone], ["Email", contact.email], ["Giờ tiếp nhận", contact.contactHours], ["Đặt trước tối thiểu", `${order.minimumLeadTimeDays} ngày`], ["Phản hồi dự kiến", `${order.expectedReplyMinutes} phút`], ["Khu vực giao", delivery.areaLabel], ["Bán kính miễn phí", `${delivery.freeRadiusKm} km`], ["Phí ngoài bán kính", `${delivery.feeOutsideFreeRadiusVnd.toLocaleString("vi-VN")}đ`]];
  return <section className={styles.panel}><div className={styles.panelHeading}><div><p>VẬN HÀNH</p><h2>Cấu hình đang công khai</h2></div></div><dl className={styles.definitionList}>{rows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function Content() {
  return <section className={styles.panel}><div className={styles.panelHeading}><div><p>NỘI DUNG</p><h2>{publicOrderFaqs.length} câu hỏi thường gặp</h2></div></div><div className={styles.faqList}>{publicOrderFaqs.map((faq, index) => <article key={faq.question}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{faq.question}</h3><p>{faq.answer}</p></div></article>)}</div></section>;
}

export default async function Admin({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section = [] } = await params;
  const current = section[0] ?? "";
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const email = typeof claimData?.claims?.email === "string" ? claimData.claims.email : null;
  if (!email) redirect(`/admin/login?next=${encodeURIComponent(current ? `/admin/${current}` : "/admin")}`);

  const adminUser = (await supabase.from("admin_users").select("email, display_name").eq("email", email).eq("is_active", true).maybeSingle()).data;
  if (!adminUser) redirect("/admin/login?error=not_authorized");

  const [categoryResult, productResult, postResult, contactResult] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description, sort_order, is_active").eq("is_active", true).order("sort_order"),
    supabase.from("products").select("id, slug, category_id, name, display_name, standard_name, description, story, image_path, requirements, content_status, order_status, sort_order, is_featured").order("sort_order"),
    supabase.from("posts").select("id, slug, title, excerpt, content, cover_image_path, status, seo_title, seo_description, author_email, published_at, created_at, updated_at").order("updated_at", { ascending: false }),
    supabase.from("contact_submissions").select("id, name, email, phone, subject, message, status, source, internal_note, created_at, updated_at").order("created_at", { ascending: false }),
  ]);
  if (categoryResult.error || productResult.error || postResult.error || contactResult.error) throw new Error("Không thể tải dữ liệu quản trị từ Supabase.");

  const categories = (categoryResult.data ?? []) as AdminCategory[];
  const products = (productResult.data ?? []) as AdminProduct[];
  const posts = (postResult.data ?? []) as PostRecord[];
  const contacts = (contactResult.data ?? []) as ContactRecord[];
  const active = sections.find((item) => item.slug === current) ?? sections[0];
  const content = current === "san-pham" ? <ProductManager initialProducts={products} categories={categories} editable />
    : current === "bai-viet" ? <PostManager initialPosts={posts} editable adminEmail={adminUser.email} />
    : current === "lien-he" ? <ContactManager initialContacts={contacts} editable />
    : current === "danh-muc" ? <Categories categories={categories} products={products} />
    : current === "van-hanh" ? <Operations />
    : current === "noi-dung" ? <Content />
    : <Overview products={products} categories={categories} posts={posts} contacts={contacts} />;

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/admin"><span>MYNORA</span><small>ADMIN</small></Link>
      <nav>{sections.map((item) => <Link className={item.slug === current ? styles.active : ""} key={item.slug || "overview"} href={item.slug ? `/admin/${item.slug}` : "/admin"}><strong>{item.label}</strong><small>{item.note}</small></Link>)}</nav>
      <div className={styles.account}><small>{adminUser.display_name ?? "Quản trị viên"}</small><span>{adminUser.email}</span><Link href="/admin/signout">Đăng xuất</Link></div>
    </aside>
    <section className={styles.workspace}><header><div><p>MYNORA / {active.label.toUpperCase()}</p><h1>{active.label}</h1></div><div className={styles.readOnly}><span>●</span> Supabase đã kết nối</div></header>{content}</section>
  </main>;
}
