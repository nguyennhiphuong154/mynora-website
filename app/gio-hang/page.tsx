import Link from "next/link";
import { Page, ProductGrid } from "../components/store-shell";
import { catalogProducts } from "../lib/site-data";

export default function Cart() { return <Page tone="transaction" eyebrow="GIỎ HÀNG" title="Giỏ hàng đang chờ món ngọt đầu tiên." intro="Chưa có sản phẩm nào trong giỏ. Hãy chọn một món bánh để bắt đầu."><Link className="store-primary-action" href="/san-pham">Khám phá 8 món bánh <span aria-hidden="true">↗</span></Link><section className="related-products"><p className="inner-eyebrow">GỢI Ý CHO BẠN</p><h2>Khám phá một vài món bánh.</h2><ProductGrid items={catalogProducts.slice(0, 3)} /></section></Page>; }
