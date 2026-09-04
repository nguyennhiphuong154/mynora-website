import Link from "next/link";
import { DraftNotice, Page } from "../components/store-shell";
import { policies } from "../lib/site-data";

const labels: Record<(typeof policies)[number], string> = { "dat-hang": "Đặt hàng", "giao-hang": "Giao hàng", "doi-huy-hoan-tien": "Đổi, hủy & hoàn tiền", "quyen-rieng-tu": "Quyền riêng tư", "dieu-khoan-su-dung": "Điều khoản sử dụng" };

export default function PoliciesPage() {
  return <Page eyebrow="CHÍNH SÁCH" title="Thông tin cần rõ ràng trước khi đặt bánh" intro="MYNORA sẽ công bố chính sách hoàn chỉnh trước thời điểm mở bán chính thức.">
    <DraftNotice>Các trang chính sách hiện là bản khung. Không có điều khoản, mức phí, thời hạn hoặc cam kết nào có hiệu lực cho đến khi MYNORA xác nhận và xuất bản.</DraftNotice>
    <div className="info-grid">{policies.map((policy) => <Link className="info-card" key={policy} href={`/chinh-sach/${policy}`}><h2>{labels[policy]}</h2><p>Trang dự thảo đang chờ MYNORA hoàn thiện nội dung.</p><span>Xem bản khung →</span></Link>)}</div>
  </Page>;
}
