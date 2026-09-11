import Link from "next/link";
import type { Metadata } from "next";
import { Page } from "../components/store-shell";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function StoryPage() {
  return <Page tone="editorial" eyebrow="CÂU CHUYỆN MYNORA" title="Làm chậm một chút, ngon hơn một chút." intro="MYNORA là tiệm bánh làm theo đơn tại Đà Nẵng. Mỗi phần bánh được chuẩn bị theo lịch đặt trước, để có đủ thời gian chăm chút trước khi đến với bạn.">
    <section className="product-section"><h2>Một lời hẹn với bếp.</h2><p className="support-note">Bạn chọn món và gửi ngày nhận mong muốn trước ít nhất 5 ngày. MYNORA sẽ trao đổi cùng bạn để xác nhận giá, quy cách và lịch nhận trước khi chốt đơn.</p><p className="support-note">Từ một món ngọt dành cho mình đến phần bánh gửi người thân, MYNORA mong mỗi lời hẹn đều được chuẩn bị chỉn chu.</p></section>
    <Link className="store-primary-action story-cta" href="/san-pham">Quay lại menu <span aria-hidden="true">↗</span></Link>
  </Page>;
}
