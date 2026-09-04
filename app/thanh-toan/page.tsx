import Link from "next/link";
import { DraftNotice, Page } from "../components/store-shell";

export default function Checkout() { return <Page tone="transaction" eyebrow="THANH TOÁN" title="Hoàn tất thông tin đặt bánh." intro="MYNORA sẽ xác nhận giá, lịch nhận và phương thức thanh toán trước khi chốt đơn."><DraftNotice>Trang thanh toán sẽ mở khi quy cách, giá và lịch nhận bánh đã được MYNORA xác nhận cho từng sản phẩm.</DraftNotice><Link className="store-primary-action" href="/san-pham">Trở lại bộ sưu tập <span aria-hidden="true">↗</span></Link></Page>; }
