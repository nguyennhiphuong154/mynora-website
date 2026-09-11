import Link from "next/link";
import { Page } from "../components/store-shell";
export default function View() { return <Page tone="transaction" eyebrow="THANH TOÁN" title="Thanh toán sau khi xác nhận." intro="MYNORA sẽ xác nhận giá, lịch nhận và phương thức thanh toán trực tiếp với bạn trước khi chốt đơn."><p className="support-note">Website hiện tiếp nhận yêu cầu đặt bánh, chưa thu tiền trực tuyến. Gửi form thành công chưa đồng nghĩa với đơn đã được xác nhận.</p><Link className="store-primary-action" href="/dat-banh">Gửi yêu cầu đặt bánh ↗</Link></Page>; }
