import { notFound } from "next/navigation";
import { DraftNotice, Page } from "../../components/store-shell";
import { policies } from "../../lib/site-data";

const content: Record<(typeof policies)[number], { title: string; intro: string; items: readonly string[] }> = {
  "dat-hang": { title: "Chính sách đặt hàng", intro: "Nguyên tắc xác nhận đơn, thời gian đặt trước và thông tin khách cần cung cấp.", items: ["Thời gian đặt trước theo từng sản phẩm", "Điều kiện đơn được xác nhận", "Thông tin cần có khi đặt bánh", "Cách cập nhật thay đổi đơn"] },
  "giao-hang": { title: "Chính sách giao hàng", intro: "Phạm vi phục vụ, hình thức nhận bánh và chi phí liên quan.", items: ["Khu vực giao hàng", "Biểu phí hoặc cách tính phí", "Khung giờ giao và tự đến nhận", "Quy trình bàn giao bánh"] },
  "doi-huy-hoan-tien": { title: "Đổi, hủy & hoàn tiền", intro: "Các trường hợp cần xử lý khi đơn bánh đã được yêu cầu hoặc xác nhận.", items: ["Mốc thời gian đổi hoặc hủy", "Trường hợp được hoàn tiền", "Trường hợp không thể thay đổi", "Cách liên hệ để được hỗ trợ"] },
  "quyen-rieng-tu": { title: "Quyền riêng tư", intro: "Cách MYNORA dự kiến xử lý thông tin liên hệ và thông tin đơn hàng.", items: ["Dữ liệu được thu thập", "Mục đích sử dụng", "Thời gian lưu dữ liệu", "Kênh yêu cầu cập nhật hoặc xóa dữ liệu"] },
  "dieu-khoan-su-dung": { title: "Điều khoản sử dụng", intro: "Điều kiện sử dụng website và các giới hạn cần được công bố rõ ràng.", items: ["Phạm vi thông tin tham khảo", "Quyền thay đổi nội dung", "Giới hạn trách nhiệm", "Cách liên hệ khi có thắc mắc"] },
};

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!policies.includes(slug as (typeof policies)[number])) notFound();
  const policy = content[slug as (typeof policies)[number]];
  return <Page eyebrow="CHÍNH SÁCH" title={policy.title} intro={policy.intro}>
    <DraftNotice>Đây là cấu trúc nội dung, chưa phải chính sách chính thức. MYNORA cần xác nhận toàn bộ điều khoản, thời hạn và quy trình trước khi áp dụng.</DraftNotice>
    <ul className="check-list">{policy.items.map((item) => <li key={item}>{item}<span>Sẽ được cập nhật khi MYNORA công bố.</span></li>)}</ul>
  </Page>;
}
