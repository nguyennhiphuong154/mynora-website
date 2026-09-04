import Link from "next/link";
import { DraftNotice, Page } from "../components/store-shell";

export default function Lookup() { return <Page tone="transaction" eyebrow="TRA CỨU ĐƠN" title="Xem trạng thái đơn bánh." intro="Khi hệ thống nhận đơn sẵn sàng, bạn sẽ có thể tra cứu bằng thông tin xác minh của đơn."><DraftNotice>Tra cứu đơn đang được MYNORA chuẩn bị để bảo đảm thông tin đơn hàng chỉ hiển thị đúng người nhận.</DraftNotice><Link className="store-primary-action" href="/san-pham">Khám phá bộ sưu tập <span aria-hidden="true">↗</span></Link></Page>; }
