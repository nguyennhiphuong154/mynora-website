import Link from "next/link";
import { categories, catalogProducts, guides, mynoraSiteSettings, type CatalogProduct } from "../lib/site-data";
import { CatalogCards } from "./catalog-cards";
import { StoreNavigation } from "./store-navigation";

export function StoreShell({ children, tone = "commerce" }: { children: React.ReactNode; tone?: "editorial" | "commerce" | "transaction" }) {
  const { contact } = mynoraSiteSettings;
  return <div className={`store-shell store-shell--${tone}`}>
    <StoreNavigation />
    {children}
    <footer className="store-footer">
      <div className="store-footer-brand"><p className="store-wordmark">MYNORA <small>BAKERY</small></p><p>Bánh làm theo đơn, được chuẩn bị theo lịch.</p></div>
      <div className="store-footer-links">
        <section><h2>Khám phá</h2><Link href="/san-pham">Sản phẩm</Link><Link href="/cau-chuyen-mynora">Câu chuyện MYNORA</Link><Link href="/nhat-ky-bep">Nhật ký bếp</Link></section>
        <section><h2>Hỗ trợ</h2><Link href="/huong-dan-dat-banh">Cách đặt bánh</Link><Link href="/giao-hang-va-nhan-banh">Giao nhận</Link><Link href="/bao-quan-banh">Bảo quản</Link><Link href="/cau-hoi-thuong-gap">Câu hỏi thường gặp</Link><Link href="/tra-cuu-don-hang">Tra cứu đơn</Link></section>
        <section><h2>Liên hệ</h2><a href={`tel:${contact.phone}`}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><Link href="/lien-he">Xem thông tin liên hệ</Link><Link href="/chinh-sach/quyen-rieng-tu">Quyền riêng tư</Link></section>
      </div>
      <p className="store-footer-copyright">© {new Date().getFullYear()} MYNORA. All rights reserved.</p>
    </footer>
  </div>;
}

export function Page({ eyebrow, title, intro, children, tone = "commerce" }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode; tone?: "editorial" | "commerce" | "transaction" }) {
  return <StoreShell tone={tone}><main className="inner-page"><header className="inner-hero"><p className="inner-eyebrow">{eyebrow ?? "MYNORA BAKERY"}</p><h1>{title}</h1>{intro && <p>{intro}</p>}</header>{children}</main></StoreShell>;
}

export function ProductGrid({ items = catalogProducts }: { items?: readonly CatalogProduct[] }) {
  return <CatalogCards items={items} />;
}

export function InfoCards() { return <div className="content-card-grid">{guides.map(([href, title, text]) => <Link className="content-card" key={href} href={href}><h2>{title}</h2><p>{text}</p><span>Khám phá <i aria-hidden="true">↗</i></span></Link>)}</div>; }

export function DraftNotice({ children }: { children: React.ReactNode }) { return <aside className="store-notice" role="status"><p>MYNORA đang chuẩn bị thông tin</p><div>{children}</div></aside>; }

export { categories };
