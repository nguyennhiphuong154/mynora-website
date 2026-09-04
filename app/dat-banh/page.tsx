import Link from "next/link";
import { Page } from "../components/store-shell";
import { mynoraOperationalCopy, mynoraSiteSettings } from "../lib/site-data";

export default function OrderGuide() {
  const { contact, order } = mynoraSiteSettings;
  return <Page eyebrow="ĐẶT BÁNH" title="Đặt trước để MYNORA chuẩn bị thật chỉn chu." intro={mynoraOperationalCopy.preorder}>
    <div className="steps order-steps"><div><strong>01</strong><h3>Khám phá menu</h3><p>Xem 8 món bánh và gửi MYNORA món bạn đang quan tâm.</p><Link className="text-link" href="/san-pham">Khám phá menu →</Link></div><div><strong>02</strong><h3>Gửi yêu cầu trước</h3><p>Vui lòng liên hệ trước ít nhất {order.minimumLeadTimeDays} ngày. MYNORA chưa nhận đơn gấp hoặc đơn trong ngày.</p></div><div><strong>03</strong><h3>Nhận xác nhận</h3><p>MYNORA tiếp nhận tin nhắn {contact.contactHours} và dự kiến phản hồi trong khoảng {order.expectedReplyMinutes} phút.</p></div></div>
    <section className="product-section"><p className="eyebrow">GỬI YÊU CẦU</p><h2>Liên hệ trực tiếp cùng MYNORA.</h2><p>Website chưa có hệ thống tiếp nhận đơn trực tuyến được kết nối an toàn. Để yêu cầu không bị thất lạc, bạn hãy gọi hoặc gửi email trực tiếp cho MYNORA.</p><div className="contact-actions"><a className="store-primary-action" href={`tel:${contact.phone}`}>Gọi {contact.phone} <span aria-hidden="true">↗</span></a><a className="store-secondary-action" href={`mailto:${contact.email}`}>Gửi email <span aria-hidden="true">↗</span></a></div></section>
    <section className="product-section"><p className="eyebrow">LƯU Ý</p><h2>Trước khi MYNORA chốt đơn.</h2><div className="info-grid"><article className="info-card"><h2>Lịch nhận bánh</h2><p>{mynoraOperationalCopy.receiving}</p></article><article className="info-card"><h2>Đơn phù hợp</h2><p>Hiện MYNORA chưa nhận bánh sinh nhật, bánh sự kiện hoặc đơn số lượng lớn.</p></article></div></section>
  </Page>;
}
