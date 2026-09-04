import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqAccordion } from "../components/faq-accordion";
import { InfoCards, Page } from "../components/store-shell";
import { mynoraOperationalCopy, mynoraSiteSettings, publicOrderFaqs } from "../lib/site-data";

const pages: Record<string, { eyebrow: string; title: string; intro: string; checks: readonly [string, string][] }> = {
  "huong-dan-dat-banh": { eyebrow: "HƯỚNG DẪN", title: "Đặt bánh cùng MYNORA", intro: mynoraOperationalCopy.preorder, checks: [["Đặt trước", "Ít nhất 5 ngày"], ["Đơn gấp", "MYNORA chưa nhận đơn trong ngày"], ["Xác nhận", "Qua điện thoại hoặc Facebook"], ["Khung giờ nhận", "Thông báo trước 2 ngày"]] },
  "giao-hang-va-nhan-banh": { eyebrow: "GIAO HÀNG", title: "Giao hàng & nhận bánh", intro: mynoraOperationalCopy.delivery, checks: [["Khu vực phục vụ", "Đà Nẵng"], ["Trong phạm vi tối đa 5 km", "Miễn phí giao hàng"], ["Trên 5 km", "10.000đ, xác nhận khi chốt đơn"], ["Khung giờ", "Khách chọn khung giờ, MYNORA xác nhận thời điểm cụ thể"]] },
  "bao-quan-banh": { eyebrow: "HƯỚNG DẪN", title: "Bảo quản bánh", intro: mynoraOperationalCopy.storage, checks: [["Bảo quản chung", "Ngăn mát tủ lạnh"], ["Thưởng thức", "Dùng sớm sau khi nhận"], ["Hạn dùng", "MYNORA sẽ bổ sung theo từng món"], ["Lưu ý", "Kiểm tra hướng dẫn riêng khi sản phẩm được hoàn thiện"]] },
  "cau-hoi-thuong-gap": { eyebrow: "HỖ TRỢ", title: "Câu hỏi thường gặp", intro: "Những thông tin MYNORA đã xác nhận trước khi bạn gửi yêu cầu đặt bánh.", checks: [] },
};

export default async function Static({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  const { contact } = mynoraSiteSettings;
  return <Page eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
    {slug === "cau-hoi-thuong-gap" ? <section className="product-section"><FaqAccordion items={publicOrderFaqs} /></section> : <section className="product-section"><p className="eyebrow">THÔNG TIN ĐÃ XÁC NHẬN</p><h2>Trước khi gửi yêu cầu.</h2><ul className="check-list">{page.checks.map(([label, value]) => <li key={label}>{label}<span>{value}</span></li>)}</ul>{slug === "giao-hang-va-nhan-banh" && <p className="support-note">{mynoraOperationalCopy.issue}</p>}</section>}
    {slug === "huong-dan-dat-banh" && <section className="product-section contact-guidance"><p className="eyebrow">LIÊN HỆ MYNORA</p><h2>Gửi yêu cầu trực tiếp.</h2><p>MYNORA tiếp nhận yêu cầu {contact.contactHours}. Website chưa có form được kết nối với hệ thống nhận đơn, vì vậy bạn có thể gọi hoặc gửi email để yêu cầu không bị thất lạc.</p><div className="contact-actions"><a className="store-primary-action" href={`tel:${contact.phone}`}>Gọi {contact.phone} <span aria-hidden="true">↗</span></a><a className="store-secondary-action" href={`mailto:${contact.email}`}>Gửi email <span aria-hidden="true">↗</span></a></div></section>}
    <section className="related-products"><p className="eyebrow">KHÁM PHÁ THÊM</p><h2>Thông tin liên quan</h2><InfoCards /><Link className="solid-button story-cta" href="/san-pham">Xem sản phẩm</Link></section>
  </Page>;
}
