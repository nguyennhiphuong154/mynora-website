/* eslint-disable @next/next/no-img-element -- Product media is locally hosted and content-managed. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page, ProductGrid } from "../../components/store-shell";
import { categories, catalogProducts, getCatalogProduct, mynoraOperationalCopy, mynoraSiteSettings } from "../../lib/site-data";

type ProductPageProps = { params: Promise<{ slug: string }> };
type DetailRow = readonly [string, string];

function InformationBlock({ eyebrow, title, rows }: { eyebrow: string; title: string; rows: readonly DetailRow[] }) {
  return <section className="product-detail-block"><p className="inner-eyebrow">{eyebrow}</p><h2>{title}</h2><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> { const { slug } = await params; const product = getCatalogProduct(slug); return product ? { title: `${product.displayName} | MYNORA Bakery`, description: product.description, robots: { index: false, follow: true } } : {}; }

export default async function Product({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getCatalogProduct(slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category);
  const related = catalogProducts.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);
  const { order } = mynoraSiteSettings;
  return <Page eyebrow={category?.name} title={product.displayName} intro={product.description}>
    <nav className="store-breadcrumb" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href="/san-pham">Sản phẩm</Link><span>/</span>{category && <><Link href={`/danh-muc/${category.slug}`}>{category.name}</Link><span>/</span></>}<span aria-current="page">{product.displayName}</span></nav>
    <section className="product-detail-hero"><div className="product-detail-media"><span>0{catalogProducts.findIndex((item) => item.slug === product.slug) + 1}</span><img src={product.media.card.src} alt={product.media.card.alt} width={product.media.card.width} height={product.media.card.height} /></div><div className="product-detail-summary"><p className="inner-eyebrow">{product.standardName}</p><h2>{product.displayName}</h2><p>{product.story}</p><span className="product-coming-soon">Đang hoàn thiện thông tin mở bán</span><dl className="product-summary-facts"><div><dt>Đặt trước</dt><dd>Ít nhất {order.minimumLeadTimeDays} ngày</dd></div><div><dt>Đơn gấp</dt><dd>MYNORA chưa nhận đơn trong ngày</dd></div><div><dt>Khung giờ nhận</dt><dd>Thông báo trước {order.receivingWindowNoticeDays} ngày</dd></div></dl><Link className="store-primary-action" href="/huong-dan-dat-banh">Xem cách đặt bánh <span aria-hidden="true">↗</span></Link></div></section>
    <div className="product-detail-grid">
      <InformationBlock eyebrow="ĐẶT TRƯỚC" title="Đặt trước & lịch nhận" rows={[["Thời gian đặt trước", `Ít nhất ${order.minimumLeadTimeDays} ngày`], ["Đơn gấp", "MYNORA chưa nhận đơn gấp hoặc đơn trong ngày"], ["Khung giờ nhận", `Thông báo trước ${order.receivingWindowNoticeDays} ngày`], ["Thời gian phản hồi", `Khoảng ${order.expectedReplyMinutes} phút trong khung giờ tiếp nhận`]]} />
      <InformationBlock eyebrow="GIAO HÀNG" title="Giao hàng & nhận bánh" rows={[["Khu vực", mynoraSiteSettings.delivery.areaLabel], ["Trong phạm vi tối đa 5 km", "Miễn phí giao hàng"], ["Trên 5 km", "10.000đ, xác nhận khi chốt đơn"], ["Thời điểm giao", "MYNORA xác nhận theo lịch đơn"]]} />
      <InformationBlock eyebrow="BẢO QUẢN" title="Bảo quản & sử dụng" rows={[["Bảo quản chung", "Ngăn mát tủ lạnh"], ["Thưởng thức", "Dùng sớm sau khi nhận"]]} />
    </div>
    <section className="product-final-cta"><p className="inner-eyebrow">BẢO QUẢN</p><h2>Giữ trọn trải nghiệm của chiếc bánh.</h2><p>{mynoraOperationalCopy.storage}</p><Link className="store-primary-action" href="/huong-dan-dat-banh">Liên hệ MYNORA <span aria-hidden="true">↗</span></Link></section>
    <section className="related-products"><p className="inner-eyebrow">CÙNG BỘ SƯU TẬP</p><h2>Món khác bạn có thể xem.</h2><ProductGrid items={related} /></section>
  </Page>;
}
