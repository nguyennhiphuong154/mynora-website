import { getPublicCatalog } from "../lib/catalog";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { CatalogBrowser } from "../components/catalog-browser";
import { Page } from "../components/store-shell";

export const metadata: Metadata = { title: "Sản phẩm | MYNORA Bakery", description: "Khám phá tám món bánh của MYNORA và xem thông tin từng món trước khi đặt.", robots: { index: false, follow: true } };

export default async function Products() {
 const products = await getPublicCatalog();
  return <Page eyebrow="BỘ SƯU TẬP MYNORA" title="Những món ngọt cho ngày vui." intro="Chọn một món để khám phá. Thông tin vận hành chỉ xuất hiện khi MYNORA đã xác nhận đầy đủ.">
    <CatalogBrowser products={products} />
    <section className="store-callout"><p className="inner-eyebrow">BÁNH LÀM THEO ĐƠN</p><h2>Chọn món. MYNORA làm mới.</h2><p>Lịch nhận bánh sẽ được xác nhận theo từng đơn, để mỗi mẻ có đủ thời gian được chuẩn bị chỉn chu.</p><Link className="store-primary-action" href="/dat-banh">Xem cách đặt bánh <span aria-hidden="true">↗</span></Link></section>
  </Page>;
}
