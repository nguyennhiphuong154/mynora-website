import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqAccordion } from "../components/faq-accordion";
import { InfoCards, Page } from "../components/store-shell";
import { getPublicContent } from "../lib/content";
import { getPublicSiteSettings } from "../lib/catalog";

export const dynamic = "force-dynamic";

export default async function Static({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, siteSettings] = await Promise.all([getPublicContent(), getPublicSiteSettings()]);
  const page = content.guides.pages.find(item => item.slug === slug);
  if (!page) notFound();
  const { contact } = siteSettings;
  const faqs = content.faq.items.filter(item => item.isActive && item.question.trim() && item.answer.trim()).sort((a, b) => a.sortOrder - b.sortOrder);
  return <Page eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
    {slug === "cau-hoi-thuong-gap" ? <section className="product-section"><FaqAccordion items={faqs} /></section> : <section className="product-section"><p className="eyebrow">THÔNG TIN ĐÃ XÁC NHẬN</p><h2>{page.sectionTitle}</h2><ul className="check-list">{page.checks.map(item => <li key={item.id}>{item.label}<span>{item.value}</span></li>)}</ul>{page.extraNote && <p className="support-note">{page.extraNote}</p>}</section>}
    {slug === "huong-dan-dat-banh" && <section className="product-section contact-guidance"><p className="eyebrow">LIÊN HỆ MYNORA</p><h2>Gửi yêu cầu trực tiếp.</h2><p>MYNORA tiếp nhận yêu cầu {contact.contactHours}. Bạn có thể gửi yêu cầu bằng form đặt bánh. Sau khi gửi thành công, hãy lưu mã yêu cầu; MYNORA sẽ liên hệ xác nhận giá và lịch nhận trước khi chốt đơn.</p><div className="contact-actions"><Link className="store-primary-action" href="/dat-banh">Gửi yêu cầu đặt bánh ↗</Link><a className="store-primary-action" href={`tel:${contact.phone}`}>Gọi {contact.phone} <span aria-hidden="true">↗</span></a><a className="store-secondary-action" href={`mailto:${contact.email}`}>Gửi email <span aria-hidden="true">↗</span></a></div></section>}
    <section className="related-products"><p className="eyebrow">KHÁM PHÁ THÊM</p><h2>Thông tin liên quan</h2><InfoCards items={content.guides.pages} /><Link className="solid-button story-cta" href="/san-pham">Xem sản phẩm</Link></section>
  </Page>;
}
