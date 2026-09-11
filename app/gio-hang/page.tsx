import Link from "next/link";
import { Page } from "../components/store-shell";
export default function View() { return <Page tone="transaction" eyebrow="ĐẶT BÁNH" title="Chọn bánh trong một yêu cầu." intro="MYNORA nhận yêu cầu đặt bánh qua form. Bạn có thể chọn nhiều món và số lượng ngay trong form."><p className="support-note">Giá và lịch nhận được MYNORA xác nhận trước khi chốt đơn. Website hiện chưa hỗ trợ giỏ hàng và thanh toán trực tuyến.</p><Link className="store-primary-action" href="/dat-banh">Gửi yêu cầu đặt bánh ↗</Link></Page>; }
