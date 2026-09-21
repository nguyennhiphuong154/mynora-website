import OrderRequests, { type OrderFilters, type OrderRecord, type OrderStatus } from "./order-requests";
import Link from "next/link";
import { redirect } from "next/navigation";
import { mynoraSiteSettings } from "../../data/site-data";
import { normalizePublicContent } from "../../lib/content";
import { getAdminContext, isOwner, type AdminUser } from "../../../lib/supabase/admin";
import ProductManager, { type ProductRecord } from "./product-manager";
import CategoryManager, { type CategoryRecord } from "./category-manager";
import PostManager, { type PostRecord } from "./post-manager";
import ContactManager, { type ContactRecord } from "./contact-manager";
import OperationsManager, { type OperationsSettings } from "./operations-manager";
import ContentManager from "./content-manager";
import AdminUsersManager from "./admin-users-manager";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

type AdminCategory = CategoryRecord;
type AdminProduct = ProductRecord;

const sections = [
  { slug: "", label: "Tổng quan", note: "Tình trạng dữ liệu MYNORA" },
  { slug: "yeu-cau-dat-banh", label: "Yêu cầu đặt bánh", note: "Lịch sử và trạng thái xử lý" },
  { slug: "san-pham", label: "Sản phẩm", note: "Catalog và trạng thái mở bán" },
  { slug: "bai-viet", label: "Bài viết", note: "Nhật ký bếp và nội dung SEO" },
  { slug: "lien-he", label: "Khách liên hệ", note: "Yêu cầu và trạng thái xử lý" },
  { slug: "danh-muc", label: "Danh mục", note: "Nhóm sản phẩm công khai" },
  { slug: "van-hanh", label: "Vận hành", note: "Đặt trước, giao hàng và liên hệ" },
  { slug: "noi-dung", label: "Nội dung", note: "FAQ và nội dung hướng dẫn" },
  { slug: "quan-tri-vien", label: "Quản trị viên", note: "Tài khoản và phân quyền" },
] as const;

function Overview({ products, categories, posts, contacts, newOrdersToday, openOrders }: { products: AdminProduct[]; categories: AdminCategory[]; posts: PostRecord[]; contacts: ContactRecord[]; newOrdersToday: number; openOrders: number }) {
  const available = products.filter((product) => product.order_status === "available").length;
  const incomplete = products.filter((product) => product.content_status !== "verified").length;
  const published = posts.filter((post) => post.status === "published").length;
  const newContacts = contacts.filter((contact) => contact.status === "new").length;
  return <>
    <div className={styles.metrics}>
      <article><span>Sản phẩm</span><strong>{products.length}</strong><small>trong Supabase</small></article>
      <article><span>Bài đã xuất bản</span><strong>{published}</strong><small>trong Nhật ký bếp</small></article>
      <article><span>Liên hệ mới</span><strong>{newContacts}</strong><small>cần xử lý</small></article>
      <article><span>Yêu cầu mới hôm nay</span><strong>{newOrdersToday}</strong><small>{openOrders} yêu cầu đang chờ xử lý</small></article>
    </div>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>TRẠNG THÁI DỮ LIỆU</p><h2>Dữ liệu đã nối với Supabase</h2></div><Link href="/admin/san-pham">Mở catalog →</Link></div>
      <div className={styles.priorityList}>
        <div><strong>Giá và quy cách</strong><span>Tiếp tục hoàn thiện thông tin cho từng sản phẩm.</span></div>
        <div><strong>Khả năng nhận đơn</strong><span>Chỉ bật mở bán sau khi xác nhận năng lực sản xuất.</span></div>
        <div><strong>Nội dung & khách hàng</strong><span>{categories.length} danh mục · {available} món mở bán · {incomplete} hồ sơ cần hoàn thiện · {newContacts} liên hệ mới.</span></div>
      </div>
    </section>
  </>;
}

export default async function Admin({
  params, searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section = [] } = await params;
  const current = section[0] ?? "";
  const { db: supabase, user, admin: adminUser } = await getAdminContext();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(current ? `/admin/${current}` : "/admin")}`);
  if (!adminUser) redirect("/admin/login?error=not_authorized");

  const [categoryResult, productResult, postResult, contactResult, settingResult, adminsResult] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description, sort_order, is_active").order("sort_order"),
    supabase.from("products").select("id, slug, category_id, name, display_name, standard_name, short_description, description, story, image_path, requirements, content_status, order_status, sort_order, is_featured, base_price, compare_price, preparation_time_days, minimum_order, serving_size, storage_instruction, allergen_info, is_archived, product_variants(id,product_id,name,sku,price,compare_price,preparation_time_days,minimum_order,serving_size,stock_quantity,is_active,sort_order)").order("sort_order"),
    supabase.from("posts").select("id, slug, title, excerpt, content, cover_image_path, status, seo_title, seo_description, author_email, published_at, created_at, updated_at").order("updated_at", { ascending: false }),
    supabase.from("contact_submissions").select("id, name, email, phone, subject, message, status, source, internal_note, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("key,value").in("key", ["contact", "order", "delivery", "content"]),
    supabase.from("admin_users").select("id,email,display_name,is_active,role").order("role").order("email"),
  ]);
  if (categoryResult.error || productResult.error || postResult.error || contactResult.error || settingResult.error || adminsResult.error) throw new Error("Không thể tải dữ liệu quản trị từ Supabase.");

  const categories = (categoryResult.data ?? []) as AdminCategory[];
  const products = (productResult.data ?? []) as AdminProduct[];
  const posts = (postResult.data ?? []) as PostRecord[];
  const contacts = (contactResult.data ?? []) as ContactRecord[];
  const settingValues = Object.fromEntries((settingResult.data ?? []).map(row => [row.key, row.value as Record<string, unknown>]));
  const adminSettings = { contact: { ...mynoraSiteSettings.contact, ...(settingValues.contact ?? {}) }, order: { ...mynoraSiteSettings.order, ...(settingValues.order ?? {}) }, delivery: { ...mynoraSiteSettings.delivery, ...(settingValues.delivery ?? {}) } } as OperationsSettings;
  const publicContent = normalizePublicContent(settingValues.content);
  const admins = (adminsResult.data ?? []) as AdminUser[];
  const active = sections.find((item) => item.slug === current) ?? sections[0];
  const raw = await searchParams;
  const value = (key: string) => typeof raw[key] === "string" ? raw[key] as string : "";
  const allowedStatuses: OrderStatus[] = ["new", "contacted", "confirmed", "completed", "cancelled"];
  const filters: OrderFilters = {
    query: value("q").trim().slice(0, 80),
    status: allowedStatuses.includes(value("status") as OrderStatus) ? value("status") : "all",
    period: ["today", "7d", "30d"].includes(value("period")) ? value("period") : "all",
    sort: ["oldest", "receipt"].includes(value("sort")) ? value("sort") : "newest",
  };
  const page = Math.max(1, Number.parseInt(value("page") || "1", 10) || 1);
  const startToday = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) + "T00:00:00+07:00").toISOString();
  const [newCountResult, newTodayResult, openResult] = await Promise.all([
    supabase.from("cake_order_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    current === "" ? supabase.from("cake_order_requests").select("id", { count: "exact", head: true }).eq("status", "new").gte("created_at", startToday) : Promise.resolve({ count: 0 }),
    current === "" ? supabase.from("cake_order_requests").select("id", { count: "exact", head: true }).in("status", ["new", "contacted", "confirmed"]) : Promise.resolve({ count: 0 }),
  ]);
  let orderData: Array<Record<string, unknown>> = [];
  let orderCount = 0;
  if (current === "yeu-cau-dat-banh") {
    let query = supabase.from("cake_order_requests").select("id,request_code,created_at,updated_at,payload,items,status,admin_note,cake_order_notifications(status,attempts,last_error),cake_order_request_events(id,event_type,from_status,to_status,created_at)", { count: "exact" });
    if (filters.query) {
      const safe = filters.query.replace(/[%_,.()"']/g, " ").trim();
      if (safe) query = query.or(`request_code.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_phone.ilike.%${safe}%`);
    }
    if (filters.status !== "all") query = query.eq("status", filters.status);
    if (filters.period !== "all") {
      const days = filters.period === "today" ? 0 : filters.period === "7d" ? 7 : 30;
      const since = days === 0 ? startToday : new Date(new Date(startToday).getTime() - (days - 1) * 86400000).toISOString();
      query = query.gte("created_at", since);
    }
    query = filters.sort === "receipt" ? query.order("requested_date", { ascending: true }) : query.order("created_at", { ascending: filters.sort === "oldest" });
    const result = await query.range((page - 1) * 20, page * 20 - 1);
    if (result.error) throw new Error("Không thể tải yêu cầu đặt bánh.");
    orderData = (result.data ?? []) as Array<Record<string, unknown>>;
    orderCount = result.count ?? 0;
  }
  const preparedOrders = orderData.map(order => ({ ...order, events: order.cake_order_request_events ?? [] })) as unknown as OrderRecord[];
  const content = current === "yeu-cau-dat-banh" ? <OrderRequests initialOrders={preparedOrders} total={orderCount} page={page} filters={filters} newCount={newCountResult.count ?? 0} /> : current === "san-pham" ? <ProductManager initialProducts={products} categories={categories} editable />
    : current === "bai-viet" ? <PostManager initialPosts={posts} editable adminEmail={adminUser.email} />
    : current === "lien-he" ? <ContactManager initialContacts={contacts} editable />
    : current === "danh-muc" ? <CategoryManager initialCategories={categories} />
    : current === "van-hanh" ? <OperationsManager initialSettings={adminSettings} canEditBusinessEmail={isOwner(adminUser)} />
    : current === "noi-dung" ? <ContentManager initialContent={publicContent} />
    : current === "quan-tri-vien" ? <AdminUsersManager admins={admins} canManage={isOwner(adminUser)} />
    : <Overview products={products} categories={categories} posts={posts} contacts={contacts} newOrdersToday={newTodayResult.count ?? 0} openOrders={openResult.count ?? 0} />;

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/admin"><span>MYNORA</span><small>ADMIN</small></Link>
      <nav>{sections.map((item) => <Link className={item.slug === current ? styles.active : ""} key={item.slug || "overview"} href={item.slug ? `/admin/${item.slug}` : "/admin"}><strong>{item.label}{item.slug === "yeu-cau-dat-banh" && (newCountResult.count ?? 0) > 0 ? <span className={styles.navBadge}>{newCountResult.count}</span> : null}</strong><small>{item.note}</small></Link>)}</nav>
      <div className={styles.account}><strong>MYNORA</strong><small>{adminUser.display_name ?? "Quản trị viên"}</small><span>{adminUser.email}</span><em>{adminUser.role === "owner" ? "Chủ sở hữu" : "Admin kỹ thuật"}</em><form action="/admin/signout" method="post"><button className={styles.signoutButton} type="submit">Đăng xuất</button></form></div>
    </aside>
    <section className={styles.workspace}><header><div><p>MYNORA / {active.label.toUpperCase()}</p><h1>{active.label}</h1></div><div className={styles.readOnly}><span>●</span> Supabase đã kết nối</div></header>{content}</section>
  </main>;
}
