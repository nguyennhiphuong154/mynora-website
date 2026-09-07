import { getPublicCatalog } from "../lib/catalog";
export const dynamic = "force-dynamic";
import { Page } from "../components/store-shell";
import { mynoraSiteSettings } from "../lib/site-data";
import ContactForm from "./contact-form";

export default async function ContactPage() {
  const { contact } = mynoraSiteSettings;
  return <Page eyebrow="LIÊN HỆ" title="Kết nối cùng MYNORA" intro="Gửi yêu cầu đặt bánh hoặc câu hỏi của bạn qua các kênh chính thức bên dưới.">
    <div className="content-card-grid contact-card-grid"><article className="content-card"><h2>Đặt bánh qua điện thoại</h2><p>{contact.phoneHasZalo ? "Số điện thoại này có dùng Zalo." : "Liên hệ trực tiếp với MYNORA."}</p><a className="store-text-link" href={`tel:${contact.phone}`}>{contact.phone} <span aria-hidden="true">↗</span></a></article><article className="content-card"><h2>Email</h2><p>Gửi thông tin món bánh bạn quan tâm để MYNORA tiếp nhận trong khung giờ làm việc.</p><a className="store-text-link" href={`mailto:${contact.email}`}>{contact.email} <span aria-hidden="true">↗</span></a></article><article className="content-card"><h2>Thời gian tiếp nhận</h2><p>{contact.contactHours}</p><p>Facebook: {contact.facebookLabel}</p></article></div>
    <ContactForm products={await getPublicCatalog()} facebookUrl={process.env.MYNORA_FACEBOOK_URL} instagramUrl={process.env.MYNORA_INSTAGRAM_URL} />
  </Page>;
}
