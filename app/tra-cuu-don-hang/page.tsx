import Link from "next/link";
import { Page } from "../components/store-shell";
export default function View() { return <Page tone="transaction" eyebrow="THEO DÕI YÊU CẦU" title="Liên hệ để cập nhật đơn bánh." intro="Hãy cung cấp mã yêu cầu đã nhận sau khi gửi form khi liên hệ MYNORA để được hỗ trợ."><p className="support-note">Tra cứu tự động chưa được hỗ trợ. MYNORA sẽ kiểm tra thông tin và cập nhật tình trạng yêu cầu trực tiếp với bạn.</p><Link className="store-primary-action" href="/lien-he">Liên hệ MYNORA ↗</Link></Page>; }
