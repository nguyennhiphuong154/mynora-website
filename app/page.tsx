/* eslint-disable @next/next/no-img-element -- Product photography is stored as local static assets. */
import Link from "next/link";
import { HomeNavigation } from "./components/home-navigation";
import { HomeHeroSlider } from "./components/home-hero-slider";
import { FeaturedCakesMarquee } from "./components/featured-cakes-marquee";
import { homeProducts, mynoraSiteSettings } from "./lib/site-data";

const marqueeCopy = "MADE TO ORDER • FRESHLY PREPARED • MYNORA BAKERY • ĐẶT TRƯỚC MỖI MẺ •";

export default function Home() {
  const { order } = mynoraSiteSettings;
  return <main className="home-page">
    <HomeNavigation />
    <HomeHeroSlider />
    <FeaturedCakesMarquee />

    <div className="home-marquee" aria-label="MYNORA Bakery làm bánh theo đơn"><div>{marqueeCopy}&nbsp; {marqueeCopy}&nbsp; {marqueeCopy}&nbsp;</div></div>

    <section id="menu" className="home-menu" aria-labelledby="menu-title">
      <div className="home-section-heading"><p className="home-section-label">BỘ SƯU TẬP MYNORA</p><h2 id="menu-title">Những mẻ bánh<br /><em>đang chờ bạn khám phá.</em></h2><Link href="/san-pham" className="home-all-link">Xem toàn bộ menu <span aria-hidden="true">↗</span></Link></div>
      <div className="home-product-grid">{homeProducts.map((product, index) => <Link className={`home-product-card tone-${index % 4}`} href={`/san-pham/${product.slug}`} key={product.slug}><span className="product-index">0{index + 1}</span><div className="home-product-image"><img src={`/images/${product.image}`} alt={product.imageAlt} loading="lazy" /></div><div className="home-product-copy"><p>{product.name}</p><h3>{product.displayName}</h3><span className="product-status">Sắp mở bán</span><b>Xem chi tiết <i aria-hidden="true">↗</i></b></div></Link>)}</div>
      <p className="home-data-note">Giá, quy cách và lịch nhận bánh sẽ được MYNORA xác nhận trên từng sản phẩm trước khi mở nhận đơn.</p>
    </section>

    <section className="home-story-next" aria-labelledby="story-title"><div className="home-story-inner"><div className="story-visual"><img src="/images/hero/gateau-coconut-flan-hero.png" alt="Gâteau Dừa Caramel của MYNORA" loading="lazy" /><span>MYNORA<br />MADE TO ORDER</span></div><div className="story-copy-next"><p className="home-section-label">CÂU CHUYỆN MYNORA</p><h2 id="story-title">Làm chậm một chút,<br /><em>ngon hơn một chút.</em></h2><p>MYNORA chuẩn bị bánh theo lịch đặt trước, để mỗi phần bánh có đủ thời gian cho sự chỉn chu trước khi đến với người nhận.</p><Link className="story-link" href="/cau-chuyen-mynora">Khám phá câu chuyện <span aria-hidden="true">↗</span></Link></div></div></section>

    <section className="home-order-journey" aria-labelledby="order-title"><div className="journey-heading"><p className="home-section-label">ĐẶT BÁNH CÙNG MYNORA</p><h2 id="order-title">Một hành trình<br />rất đơn giản.</h2></div><ol>{[["Chọn món bánh", "Khám phá menu và chọn món phù hợp."],["Gửi yêu cầu trước", `Gửi yêu cầu trước ít nhất ${order.minimumLeadTimeDays} ngày.`],["Nhận xác nhận", "MYNORA xác nhận ngày và khung giờ theo từng đơn."],["Bánh được chuẩn bị", "Bếp chuẩn bị bánh mới theo lịch đã hẹn."]].map(([title, text], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><Link className="journey-link" href="/dat-banh">Xem hướng dẫn đặt bánh <span aria-hidden="true">↗</span></Link></section>

    <section className="home-closing-cta" aria-labelledby="closing-title"><p className="home-section-label">MYNORA BAKERY</p><h2 id="closing-title">Bạn đã chọn được món bánh<br /><em>hôm nay chưa?</em></h2><div><Link className="closing-primary" href="/san-pham">Đặt bánh cùng MYNORA <span aria-hidden="true">↗</span></Link><Link className="closing-secondary" href="/san-pham">Xem toàn bộ menu</Link></div></section>

    <footer className="home-footer"><div className="home-footer-brand"><img src="/images/brand/mynora-logo.png" alt="MYNORA Bakery" /><p>Bánh làm theo đơn, được chuẩn bị theo lịch.</p></div><div className="home-footer-links"><section><h2>Khám phá</h2><Link href="/san-pham">Sản phẩm</Link><Link href="/cau-chuyen-mynora">Câu chuyện MYNORA</Link><Link href="/nhat-ky-bep">Nhật ký bếp</Link></section><section><h2>Hỗ trợ</h2><Link href="/dat-banh">Cách đặt bánh</Link><Link href="/tra-cuu-don-hang">Tra cứu đơn</Link><Link href="/lien-he">Liên hệ</Link></section><section><h2>Chính sách</h2><Link href="/chinh-sach/dat-hang">Đặt hàng</Link><Link href="/chinh-sach/giao-hang">Giao hàng</Link><Link href="/chinh-sach/quyen-rieng-tu">Quyền riêng tư</Link></section></div><p className="home-copyright">© {new Date().getFullYear()} MYNORA. All rights reserved.</p></footer>
  </main>;
}
